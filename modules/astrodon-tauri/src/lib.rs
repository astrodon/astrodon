#![feature(map_try_insert)]
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use custom_extension::RunWindowMessage;
use custom_extension::SentToWindowMessage;
use custom_extension::WindowContent;
use deno_core::ModuleLoader;
use deno_core::error::AnyError;
use deno_core::futures::executor::block_on;
use deno_core::located_script_name;
use deno_core::serde_json;
use deno_core::v8_set_flags;
use deno_runtime::deno_broadcast_channel::InMemoryBroadcastChannel;
use deno_runtime::deno_web::BlobStore;
use deno_runtime::permissions::Permissions;
use deno_runtime::worker::MainWorker;
use deno_runtime::worker::WorkerOptions;
use deno_runtime::BootstrapOptions;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::iter::once;
use std::rc::Rc;
use std::sync::Arc;
use tokio::sync::mpsc;
use tokio::sync::mpsc::Sender;
use tokio::sync::Mutex;
use wry::webview::WebContext;
use wry::{
    application::{
        event::{Event, WindowEvent},
        event_loop::{ControlFlow, EventLoop, EventLoopWindowTarget},
        window::{Window, WindowBuilder, WindowId},
    },
    webview::{WebView, WebViewBuilder},
};
use directories::ProjectDirs;

pub use deno_core;

mod custom_extension;
mod metadata;

pub use metadata::{AppInfo, Metadata};

fn get_error_class_name(e: &AnyError) -> &'static str {
    deno_runtime::errors::get_error_class_name(e).unwrap_or("Error")
}

#[derive(Debug)]
pub enum AstrodonMessage {
    SentToWindowMessage(SentToWindowMessage),
    RunWindowMessage(RunWindowMessage),
    SentToDenoMessage(String, String),
}

#[derive(Debug)]
enum WryEvent {
    RunScript(String, String),
    NewWindow(RunWindowMessage),
}


pub async fn run(metadata: Metadata, module_loader: impl ModuleLoader + Send + 'static)  {
    let (snd, mut rev) = mpsc::channel::<AstrodonMessage>(1);
    let subs = Arc::new(Mutex::new(HashMap::new()));

    let deno_sender = snd.clone();
    let deno_subs = subs.clone();

    std::thread::spawn(move || {
        let r = tokio::runtime::Runtime::new().unwrap();

        // Kinda ugly to run a whole separated tokio runtime just for deno, might improve this eventually
        r.block_on(async move {
            let module_loader = Rc::new(module_loader);
            let create_web_worker_cb = Arc::new(|_| {
                todo!("Web workers are not supported in the example");
            });

            let web_worker_preload_module_cb = Arc::new(|_| {
                todo!("Web workers are not supported in the example");
            });

            v8_set_flags(
                once("UNUSED_BUT_NECESSARY_ARG0".to_owned())
                    .chain(Vec::new().iter().cloned())
                    .collect::<Vec<_>>(),
            );

            let options = WorkerOptions {
                bootstrap: BootstrapOptions {
                    apply_source_maps: false,
                    args: vec![],
                    is_tty: false,
                    cpu_count: 1,
                    debug_flag: false,
                    enable_testing_features: false,
                    location: None,
                    no_color: false,
                    runtime_version: "0".to_string(),
                    ts_version: "0".to_string(),
                    unstable: true,
                },
                extensions: vec![custom_extension::new(deno_sender, deno_subs.clone())],
                unsafely_ignore_certificate_errors: None,
                root_cert_store: None,
                user_agent: "astrodon".to_string(),
                seed: None,
                js_error_create_fn: None,
                create_web_worker_cb,
                web_worker_preload_module_cb,
                maybe_inspector_server: None,
                should_break_on_first_statement: false,
                module_loader,
                get_error_class_fn: Some(&get_error_class_name),
                origin_storage_dir: None,
                blob_store: BlobStore::default(),
                broadcast_channel: InMemoryBroadcastChannel::default(),
                shared_array_buffer_store: None,
                compiled_wasm_module_store: None,
            };

            let permissions = Permissions::allow_all();

            let mut worker = MainWorker::bootstrap_from_options(
                metadata.entrypoint.clone(),
                permissions,
                options,
            );

            worker.js_runtime.sync_ops_cache();

            worker
                .execute_main_module(&metadata.entrypoint)
                .await
                .expect("Could not run the application.");

            worker.dispatch_load_event(&located_script_name!()).unwrap();

            worker
                .run_event_loop(true)
                .await
                .expect("Could not run the application.");

            worker.dispatch_load_event(&located_script_name!()).unwrap();

            std::process::exit(0);
        });
    });

    let event_loop = EventLoop::<WryEvent>::with_user_event();
    let mut webviews: HashMap<WindowId, WebView> = HashMap::new();
    let mut custom_id_mapper: HashMap<String, WindowId> = HashMap::new();

    let proxy = event_loop.create_proxy();

    // custom event loop - this basically process and forwards events to the wry event loop
    tokio::task::spawn(async move {
        loop {
            match rev.recv().await.unwrap() {
                AstrodonMessage::SentToWindowMessage(msg) => {
                    proxy.send_event(WryEvent::RunScript(
                        msg.id,
                        format!(
                            "window.dispatchEvent(new CustomEvent('{}', {{detail: JSON.parse({})}}));",
                            msg.event, msg.content
                        ),
                    )).expect("Could not dispatch event");
                }
                AstrodonMessage::RunWindowMessage(msg) => {
                    proxy
                        .send_event(WryEvent::NewWindow(msg))
                        .expect("Could not open a new window");
                }
                AstrodonMessage::SentToDenoMessage(name, content) => {
                    let events = subs.lock().await;
                    let subs = events.get(&name);
                    if let Some(subs) = subs {
                        for sub in subs.values() {
                            sub.send(content.clone()).await.unwrap();
                        }
                    }
                }
            }
        }
    });

    let mut web_context = get_web_context(metadata.info);

    // Run the wry event loop
    event_loop.run(move |event, event_loop, control_flow| {
        *control_flow = ControlFlow::Wait;

        match event {
            Event::WindowEvent {
                event, window_id, ..
            } => match event {
                WindowEvent::CloseRequested => {
                    webviews.remove(&window_id);
                    custom_id_mapper.retain(|_, v| *v != window_id);

                    if webviews.is_empty() {
                        *control_flow = ControlFlow::Exit
                    }
                }
                WindowEvent::Resized(_) => {
                    let _ = webviews[&window_id].resize();
                }
                _ => (),
            },
            Event::UserEvent(WryEvent::RunScript(window_id, content)) => {
                let id = custom_id_mapper.get(&window_id);
                if let Some(id) = id {
                    webviews
                        .get(id)
                        .unwrap()
                        .evaluate_script(&content)
                        .expect("Could not run the script");
                }
            }
            Event::UserEvent(WryEvent::NewWindow(msg)) => {
                let new_window = block_on(create_new_window(
                    msg.title,
                    msg.content,
                    event_loop,
                    snd.clone(),
                    &mut web_context,
                ));
                custom_id_mapper.insert(msg.id, new_window.0);
                webviews.insert(new_window.0, new_window.1);
            }
            _ => (),
        }
    });
}

fn get_web_context(info: AppInfo) -> WebContext {
    let bundle_path = ProjectDirs::from("", &info.author, &info.name).unwrap();
    WebContext::new(Some(bundle_path.config_dir().to_path_buf()))
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
enum IpcMessage {
    SendEvent { name: String, content: String },
}

async fn create_new_window(
    title: String,
    content: WindowContent,
    event_loop: &EventLoopWindowTarget<WryEvent>,
    snd: Sender<AstrodonMessage>,
    web_context: &mut WebContext,
) -> (WindowId, WebView) {
    let window = WindowBuilder::new()
        .with_title(title)
        .build(event_loop)
        .unwrap();

    let window_id = window.id();

    let handler = move |_: &Window, req: String| {
        let message: IpcMessage = serde_json::from_str(&req).unwrap();
        let snd = snd.clone();

        match message {
            IpcMessage::SendEvent { name, content } => {
                tokio::spawn(async move {
                    snd.send(AstrodonMessage::SentToDenoMessage(name, content))
                        .await
                        .unwrap();
                });
            }
        }
    };

    let mut webview = WebViewBuilder::new(window)
        .unwrap()
        .with_initialization_script("
        globalThis.sendToDeno = (name, content) => {
            window.ipc.postMessage(JSON.stringify({type:'SendEvent', name, content: JSON.stringify(content) }));
        }
         ")
        .with_ipc_handler(handler)
        .with_dev_tool(true)
        .with_web_context(web_context);

    webview = match content {
        WindowContent::Url { url } => webview.with_url(&url).unwrap(),
        WindowContent::Html { html } => webview.with_html(html).unwrap(),
    };

    let webview = webview.build().unwrap();

    (window_id, webview)
}

