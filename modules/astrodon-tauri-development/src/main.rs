use std::env;

use astrodon_tauri::{Metadata, deno_core::ModuleSpecifier, AppInfo};

mod typescript_loader;

use typescript_loader::TypescriptModuleLoader;

#[tokio::main]
async fn main() {
    let (metadata, module_loader) = get_data_and_loader_from_args().await;
    astrodon_tauri::run(metadata, module_loader).await;
}

async fn get_data_and_loader_from_args() -> (Metadata, TypescriptModuleLoader) {
    let mut args = env::args();
    args.next();
    let file_path = args.next().unwrap();
    let entrypoint = ModuleSpecifier::from_file_path(file_path).unwrap();
    (
        Metadata {
            entrypoint: entrypoint,
            info: AppInfo {
                // TODO: This data should also be passed as argument
                name: "Development".to_string(),
                author: "Development".to_string(),
                id:"Development".to_string(),
                copyright:"Development".to_string(),
                version: "Development".to_string(),
                shortDescription: "Development".to_string(),
                longDescription: "Development".to_string(),
                homepage: "Development".to_string(),
                icon: vec![],
                resources: vec![],
            },
        },
        TypescriptModuleLoader::new(),
    )
}