use std::{env::current_dir, thread, time::Duration};

use astrodon_tauri::{
    deno_runtime::DenoRuntime,
    events_manager::EventsManager,
    messages::{
        AstrodonMessage, CloseWindowMessage, SentToWindowMessage, WindowConfig, WindowContent,
    },
    AppConfig, Metadata,
};
use deno_core::{FsModuleLoader, ModuleSpecifier};
use tokio::{runtime::Runtime, sync::mpsc, time::sleep};

#[tokio::test]
async fn deno_ops() {
    let entrypoint = ModuleSpecifier::from_file_path(
        current_dir()
            .unwrap()
            .join("tests/deno_ops.js")
            .to_str()
            .unwrap(),
    )
    .unwrap();

    let (deno_sender, mut deno_receiver) = mpsc::channel::<AstrodonMessage>(1);

    let events_manager = EventsManager::new();

    let deno_runtime = DenoRuntime::new(
        Metadata {
            entrypoint,
            config: AppConfig::default(),
        },
        deno_sender,
        events_manager.clone(),
    );

    thread::spawn(move || {
        Runtime::new()
            .unwrap()
            .block_on(deno_runtime.run_deno(FsModuleLoader));
    });

    // Send a message to Deno
    tokio::spawn(async move {
        sleep(Duration::from_millis(500)).await;
        events_manager
            .send("to-deno".to_string(), "{\"astrodon\":\"nice\"}".to_string())
            .await
            .unwrap();
    });

    // Wait for Deno's response
    let res = deno_receiver.recv().await.unwrap();

    assert_eq!(
        res,
        AstrodonMessage::SentToWindow(SentToWindowMessage {
            id: "window-id".to_string(),
            event: "to-rust".to_string(),
            content: "{\"astrodon\":\"nice\"}".to_string()
        })
    );

    // Wait for Window creation message
    let res = deno_receiver.recv().await.unwrap();

    assert_eq!(
        res,
        AstrodonMessage::RunWindow(WindowConfig {
            id: "window-id".to_string(),
            title: "Astrodon".to_string(),
            content: WindowContent::Url {
                url: "https://github.com/astrodon/astrodon".to_string()
            }
        })
    );

    // Wait for Window closing message
    let res = deno_receiver.recv().await.unwrap();

    assert_eq!(
        res,
        AstrodonMessage::CloseWindow(CloseWindowMessage {
            id: "window-id".to_string()
        })
    );
}
