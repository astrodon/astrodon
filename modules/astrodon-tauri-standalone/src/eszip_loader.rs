use std::pin::Pin;

use astrodon_tauri::deno_core::{
    self,
    error::{type_error, AnyError},
    futures::FutureExt,
    ModuleLoader, ModuleSpecifier,
};

pub struct EszipModuleLoader {
    pub eszip: eszip::EszipV2,
}

impl EszipModuleLoader {
    pub fn new(eszip: eszip::EszipV2) -> Self {
        Self { eszip }
    }
}

impl ModuleLoader for EszipModuleLoader {
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
        let module = self
            .eszip
            .get_module(module_specifier.as_str())
            .ok_or_else(|| type_error("Module not found"));

        async move {
            let module = module?;

            let code = module.source().await;

            let code = std::str::from_utf8(&code)
                .map_err(|_| type_error("Module source is not utf-8"))?
                .to_owned();

            Ok(deno_core::ModuleSource {
                code,
                module_type: match module.kind {
                    eszip::ModuleKind::JavaScript => deno_core::ModuleType::JavaScript,
                    eszip::ModuleKind::Json => deno_core::ModuleType::Json,
                },
                module_url_specified: module_specifier.to_string(),
                module_url_found: module_specifier.to_string(),
            })
        }
        .boxed_local()
    }
}
