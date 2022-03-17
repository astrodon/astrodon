#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{env, thread};

use astrodon_tauri::{deno_core::ModuleSpecifier, AppInfo, Metadata};

mod typescript_loader;

use tokio::runtime::Runtime;
use typescript_loader::TypescriptModuleLoader;

#[tokio::main]
async fn main() {
    let (metadata, module_loader) = get_data_and_loader_from_args().await;
    let (deno_runtime, wry_runtime) = astrodon_tauri::prepare(metadata);
    thread::spawn(move || {
        Runtime::new()
            .unwrap()
            .block_on(deno_runtime.run_deno(module_loader));
    });
    wry_runtime.run_wry().await;
}

async fn get_data_and_loader_from_args() -> (Metadata, TypescriptModuleLoader) {
    let mut args = env::args();
    args.next();
    let file_path = args.next().unwrap();
    let entrypoint = ModuleSpecifier::from_file_path(file_path).unwrap();
    (
        Metadata {
            entrypoint,
            info: AppInfo {
                // TODO: This is wip
                name: "Development".to_string(),
                author: "Development".to_string(),
                id: "Development".to_string(),
                copyright: "Development".to_string(),
                version: "Development".to_string(),
                short_description: "Development".to_string(),
                long_description: "Development".to_string(),
                homepage: "Development".to_string(),
                icon: vec![],
                resources: vec![],
            },
        },
        TypescriptModuleLoader::new(),
    )
}
