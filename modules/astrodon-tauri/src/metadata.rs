use deno_core::ModuleSpecifier;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AppInfo {
    pub name: String,
    pub id: String,
    pub copyright: String,
    pub version: String,
    pub author: String,
    pub shortDescription: String,
    pub longDescription: String,
    pub homepage: String,
    pub icon: Vec<String>,
    pub resources: Vec<String>
}

// Inspired by https://github.com/denoland/deno/blob/8b2989c417db9090913f1cb6074ae961f4c14d5e/cli/standalone.rs#L46
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Metadata {
    pub entrypoint: ModuleSpecifier,
    pub info: AppInfo,
}
