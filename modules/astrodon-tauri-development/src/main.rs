use std::{env, thread};

use astrodon_tauri::{deno_core::serde_json, Metadata};

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
    let metadata_json = args.next().unwrap();
    let metadata: Metadata = serde_json::from_str(&metadata_json).unwrap();
    (metadata, TypescriptModuleLoader::new())
}
