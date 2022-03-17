#![feature(map_try_insert)]
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use crate::deno_runtime::DenoRuntime;
use events_manager::EventsManager;
use messages::AstrodonMessage;
use tokio::sync::mpsc;

pub use deno_core;

mod deno_runtime;
mod events_manager;
mod messages;
mod metadata;
mod wry_runtime;

pub use metadata::{AppInfo, Metadata};
use wry_runtime::WryRuntime;

/**
 * Prepare both runtimes for Deno and Wry
 * The invoker must ensure their execution
 */
pub fn prepare(metadata: Metadata) -> (DenoRuntime, WryRuntime) {
    let (deno_sender, deno_receiver) = mpsc::channel::<AstrodonMessage>(1);
    let events_manager = EventsManager::new();

    (
        DenoRuntime {
            metadata: metadata.clone(),
            deno_sender: deno_sender.clone(),
            events_manager: events_manager.clone(),
        },
        WryRuntime {
            events_manager,
            deno_sender,
            metadata,
            deno_receiver,
        },
    )
}
