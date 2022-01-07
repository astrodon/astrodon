use serde::Deserialize;
use std::sync::mpsc::{channel, Receiver, Sender};
use std::{
    sync::{Arc, Mutex},
    thread,
};
use tauri::{Window, WindowBuilder};

#[tauri::command]
fn init_listener(window: Window, state: tauri::State<TauriState>) {
    let receiver = state.forward_from_deno_to_tauri.clone();

    thread::spawn(move || {
        let receiver = receiver.lock().unwrap();

        loop {
            if let Ok(msg) = receiver.recv() {
                window.emit("fromDeno", msg).unwrap();
            }
        }
    });
}

#[allow(improper_ctypes_definitions)]
type AppPtr = Arc<Mutex<App>>;

struct TauriState {
    forward_from_deno_to_tauri: Arc<Mutex<Receiver<String>>>,
}

#[repr(C)]
#[derive(Default)]
pub struct App {
    config: AppConfig,
    deno_to_tauri_sender: Option<Sender<String>>,
}

impl App {
    pub fn new(config: AppConfig) -> Self {
        App {
            config,
            deno_to_tauri_sender: None,
        }
    }

    pub fn run(&mut self) {
        let (sender, receiver) = channel::<String>();

        self.deno_to_tauri_sender = Some(sender);

        let context = tauri::generate_context!("./tauri.conf.json");

        let mut app_builder = tauri::Builder::default()
            .manage(TauriState {
                forward_from_deno_to_tauri: Arc::new(Mutex::new(receiver)),
            })
            .invoke_handler(tauri::generate_handler![init_listener]);

        for window in &self.config.windows {
            app_builder = app_builder.create_window(
                window.title.clone(),
                tauri::WindowUrl::App(window.url.clone().into()),
                |window_builder, webview_attributes| {
                    (
                        window_builder.title(window.title.clone()),
                        webview_attributes,
                    )
                },
            );
        }

        thread::spawn(move || {
            app_builder.run(context).unwrap();
        });
    }

    pub fn send(&self, message: &str) {
        if let Some(sender) = &self.deno_to_tauri_sender {
            sender.send(message.to_string()).unwrap();
        }
    }
}

#[repr(C)]
#[derive(Default, Deserialize)]
pub struct WindowConfig {
    title: String,
    url: String,
}

#[repr(C)]
#[derive(Default, Deserialize)]
pub struct AppConfig {
    windows: Vec<WindowConfig>,
}

// Shortcut to decode a message
fn decode<'a, T: Deserialize<'a>>(ptr: *const u8, len: usize) -> T {
    let buf = unsafe { std::slice::from_raw_parts(ptr, len) };
    let buf_str = std::str::from_utf8(buf).unwrap();
    serde_json::from_str::<'a, T>(buf_str).unwrap() as T
}

#[allow(improper_ctypes_definitions)]
#[no_mangle]
pub extern "C" fn create_app(ptr: *const u8, len: usize) -> AppPtr {
    let app_config = decode::<AppConfig>(ptr, len);
    Arc::new(Mutex::new(App::new(app_config)))
}

#[allow(improper_ctypes_definitions)]
#[no_mangle]
pub extern "C" fn run_app(app: AppPtr) -> AppPtr {
    app.lock().unwrap().run();
    app
}

#[allow(clippy::not_unsafe_ptr_arg_deref)]
#[allow(improper_ctypes_definitions)]
#[no_mangle]
pub extern "C" fn send_message(ptr: *const u8, len: usize, app: AppPtr) -> AppPtr {
    let buf = unsafe { std::slice::from_raw_parts(ptr, len) };
    let buf_str = std::str::from_utf8(buf).unwrap();
    app.lock().unwrap().send(buf_str);
    app
}
