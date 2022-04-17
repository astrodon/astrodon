use deno_core::ModuleSpecifier;
use deno_runtime::permissions::PermissionsOptions;
use serde::{Deserialize, Serialize};

/**
 * Information primarily used for deno_installer (tauri-bundler)
 */
#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct AppInfo {
    pub name: String,
    pub id: String,
    pub copyright: String,
    pub version: String,
    pub author: String,
    #[serde(rename = "shortDescription")]
    pub short_description: String,
    #[serde(rename = "longDescription")]
    pub long_description: String,
    pub homepage: String,
    pub icon: Vec<String>,
    pub resources: Vec<String>,
    pub permissions: PermissionsOptions,
    pub unstable: bool
}

// Inspired by https://github.com/denoland/deno/blob/8b2989c417db9090913f1cb6074ae961f4c14d5e/cli/standalone.rs#L46
#[derive(Serialize, Deserialize, Clone)]
pub struct Metadata {
    pub entrypoint: ModuleSpecifier,
    pub info: AppInfo,
}
