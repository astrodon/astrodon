use std::{env::current_dir, thread, time::Duration};

use astrodon_tauri::{
    deno_runtime::DenoRuntime,
    events_manager::EventsManager,
    messages::{AstrodonMessage, SentToWindowMessage},
    AppInfo, Metadata,
};
use deno_core::{FsModuleLoader, ModuleSpecifier};
use tokio::{runtime::Runtime, sync::mpsc, time::sleep};

#[tokio::test]
async fn deno_ops() {
    let entrypoint = ModuleSpecifier::from_file_path(
        current_dir()
            .unwrap()
            .join("tests/test.js")
            .to_str()
            .unwrap(),
    )
    .unwrap();

    let (deno_sender, mut deno_receiver) = mpsc::channel::<AstrodonMessage>(1);

    let events_manager = EventsManager::new();

    let deno_runtime = DenoRuntime {
        metadata: Metadata {
            entrypoint,
            info: AppInfo::default(),
        },
        deno_sender,
        events_manager: events_manager.clone(),
    };

    thread::spawn(move || {
        Runtime::new()
            .unwrap()
            .block_on(deno_runtime.run_deno(FsModuleLoader));
    });

    tokio::spawn(async move {
        sleep(Duration::from_millis(500)).await;
        events_manager
            .send("to-deno".to_string(), "{\"astrodon\":\"nice\"}".to_string())
            .await
            .unwrap();
    });

    let res = deno_receiver.recv().await.unwrap();

    assert_eq!(
        res,
        AstrodonMessage::SentToWindow(SentToWindowMessage {
            id: "window-id".to_string(),
            event: "to-rust".to_string(),
            content: "{\"astrodon\":\"nice\"}".to_string()
        })
    );
}
