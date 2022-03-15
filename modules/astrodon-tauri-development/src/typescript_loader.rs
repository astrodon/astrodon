use astrodon_tauri::deno_core;
use crypto::digest::Digest;
use crypto::sha2::Sha256;
use deno_ast::parse_module;
use deno_ast::EmitOptions;
use deno_ast::MediaType;
use deno_ast::ParseParams;
use deno_ast::SourceTextInfo;
use directories::BaseDirs;
use std::env;
use std::path::PathBuf;
use std::pin::Pin;
use std::sync::Arc;

use astrodon_tauri::deno_core::{
    error::{AnyError},
    futures::FutureExt,
    ModuleLoader, ModuleSpecifier,
};
use tokio::fs;

pub struct TypescriptModuleLoader;

impl TypescriptModuleLoader {
    pub fn new() -> Self {
        Self
    }
}

impl ModuleLoader for TypescriptModuleLoader {
    fn resolve(
        &self,
        specifier: &str,
        base: &str,
        _is_main: bool,
    ) -> Result<ModuleSpecifier, AnyError> {
        let resolve = deno_core::resolve_import(specifier, base)?;
        Ok(resolve)
    }

    fn load(
        &self,
        module_specifier: &ModuleSpecifier,
        _maybe_referrer: Option<ModuleSpecifier>,
        _is_dynamic: bool,
    ) -> Pin<Box<deno_core::ModuleSourceFuture>> {
        let module_specifier = module_specifier.clone();

        async move {
            let protocol = module_specifier.scheme();

            let code = match protocol {
                "http" | "https" => {
                    let path = module_specifier.path();
                    let search = if let Some(search) = module_specifier.query() {
                        search
                    } else {
                        ""
                    };
                    let url = format!("{path}{search}");

                    // create a SHA3-256 object
                    let mut hasher = Sha256::new();

                    // write input message
                    hasher.input_str(&url);

                    // read hash digest
                    let str_url = hasher.result_str();

                    let file_path = get_cached_path(
                        &str_url,
                        module_specifier.scheme(),
                        module_specifier.domain().unwrap(),
                    );

                    fs::read_to_string(file_path).await?
                }
                _ => fs::read_to_string(module_specifier.to_file_path().unwrap()).await?,
            };

            let source_text = Arc::new(code);

            let source_text_info = SourceTextInfo::new(source_text);

            let parsed_source = parse_module(ParseParams {
                specifier: module_specifier.as_str().to_string(),
                media_type: MediaType::TypeScript,
                source: source_text_info,
                capture_tokens: true,
                maybe_syntax: None,
                scope_analysis: false,
            })?;

            let output = parsed_source.transpile(&EmitOptions::default())?;

            Ok(deno_core::ModuleSource {
                code: output.text,
                module_type: deno_core::ModuleType::JavaScript,
                module_url_specified: module_specifier.to_string(),
                module_url_found: module_specifier.to_string(),
            })
        }
        .boxed_local()
    }
}

/**
 * Looks for the cached version of the module
 * Following the cache paths as described in https://deno.land/manual@v1.19.3/linking_to_external_code.md
 */
fn get_cached_path(hashed_url: &str, scheme: &str, domain: &str) -> PathBuf {
    let deno_dir = {
        let var_dir = env::var("DENO_DIR");
        if let Ok(var_dir) = var_dir {
            PathBuf::from(var_dir)
        } else if let Some(base_dirs) = BaseDirs::new() {
            base_dirs.cache_dir().join("deno")
        } else {
            let home = env::var("HOME").unwrap();
            PathBuf::from(home).join(".deno")
        }
    };

    deno_dir
        .join("deps")
        .join(scheme)
        .join(domain)
        .join(hashed_url)
}
