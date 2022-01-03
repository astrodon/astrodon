use std::sync::{Arc, Mutex};

use serde::Deserialize;
use tauri::WindowBuilder;

#[allow(improper_ctypes_definitions)]
type AppPtr = Arc<Mutex<App>>;

struct TauriState;

#[repr(C)]
#[derive(Default)]
pub struct App {
    config: AppConfig,
}

impl App {
    pub fn new(config: AppConfig) -> Self {
        App { config }
    }

    pub fn run(&mut self) {
        // it should probably create the context on the fly
        let context = tauri::generate_context!("./tauri.conf.json");

        let mut app_builder = tauri::Builder::default().manage(TauriState);

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

        app_builder
            .run(context)
            .expect("failed to run tauri application");
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
pub extern "C" fn run_app(app: AppPtr) {
    app.lock().unwrap().run();
}
