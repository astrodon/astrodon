use deno_core::serde_json;
use directories::ProjectDirs;
use serde::Deserialize;
use serde::Serialize;
use std::collections::HashMap;
use tokio::sync::mpsc::Receiver;
use tokio::sync::mpsc::Sender;
use wry::{
    application::{
        event::{Event, WindowEvent},
        event_loop::{ControlFlow, EventLoop, EventLoopWindowTarget},
        window::{Window, WindowBuilder, WindowId},
    },
    webview::{WebContext, WebView, WebViewBuilder},
};

use crate::events_manager::EventsManager;
use crate::{
    messages::{WindowContent, WryEvent},
    AppInfo, AstrodonMessage, Metadata,
};

pub struct WryRuntime {
    pub deno_receiver: Receiver<AstrodonMessage>,
    pub metadata: Metadata,
    pub deno_sender: Sender<AstrodonMessage>,
    pub events_manager: EventsManager,
}

impl WryRuntime {
    pub async fn run_wry(mut self) {
        let event_loop = EventLoop::<WryEvent>::with_user_event();
        let mut webviews: HashMap<WindowId, WebView> = HashMap::new();
        let mut custom_id_mapper: HashMap<String, WindowId> = HashMap::new();

        let proxy = event_loop.create_proxy();

        // Handle messages emitted from the Deno runtime
        tokio::task::spawn(async move {
            loop {
                match self.deno_receiver.recv().await.unwrap() {
                    AstrodonMessage::SentToWindow(msg) => {
                        proxy.send_event(WryEvent::RunScript(
                            msg.id,
                            format!(
                                "window.dispatchEvent(new CustomEvent('{}', {{detail: JSON.parse({})}}));",
                                msg.event, msg.content
                            ),
                        )).expect("Could not dispatch event");
                    }
                    AstrodonMessage::RunWindow(msg) => {
                        proxy
                            .send_event(WryEvent::NewWindow(msg))
                            .expect("Could not open a new window");
                    }
                    AstrodonMessage::SentToDeno(name, content) => self
                        .events_manager
                        .send(name, content.clone())
                        .await
                        .unwrap(),
                }
            }
        });

        let mut web_context = get_web_context(self.metadata.info);

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
                    let new_window = create_new_window(
                        msg.title,
                        msg.content,
                        event_loop,
                        self.deno_sender.clone(),
                        &mut web_context,
                    );
                    custom_id_mapper.insert(msg.id, new_window.0);
                    webviews.insert(new_window.0, new_window.1);
                }
                _ => (),
            }
        });
    }
}

/**
 * Specifying a custom directly rather than using the same as the installation prevents a permission error in Windows.
 */
fn get_web_context(info: AppInfo) -> WebContext {
    let bundle_path = ProjectDirs::from("", &info.author, &info.name).unwrap();
    WebContext::new(Some(bundle_path.config_dir().to_path_buf()))
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
enum IpcMessage {
    SendEvent { name: String, content: String },
}

fn create_new_window(
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
        let message = serde_json::from_str(&req);
        
        let snd = snd.clone();

        // Handle the events emitted from the webview
        match message {
            Ok(IpcMessage::SendEvent { name, content }) => {
                tokio::spawn(async move {
                    snd.send(AstrodonMessage::SentToDeno(name, content))
                        .await
                        .unwrap();
                });
            }
            Err(_) => {}
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
