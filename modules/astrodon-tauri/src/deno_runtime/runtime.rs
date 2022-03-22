use crate::events_manager::EventsManager;
use crate::AstrodonMessage;
use crate::Metadata;
use deno_core::error::AnyError;
use deno_core::located_script_name;
use deno_core::v8_set_flags;
use deno_core::ModuleLoader;
use deno_runtime::deno_broadcast_channel::InMemoryBroadcastChannel;
use deno_runtime::deno_web::BlobStore;
use deno_runtime::permissions::Permissions;
use deno_runtime::worker::MainWorker;
use deno_runtime::worker::WorkerOptions;
use deno_runtime::BootstrapOptions;
use std::iter::once;
use std::rc::Rc;
use std::sync::Arc;
use tokio::sync::mpsc::Sender;

use super::ops;

pub struct DenoRuntime {
    pub metadata: Metadata,
    pub deno_sender: Sender<AstrodonMessage>,
    pub events_manager: EventsManager,
}

impl DenoRuntime {
    pub async fn run_deno(&self, module_loader: impl ModuleLoader + 'static) {
        let module_loader = Rc::new(module_loader);
        let create_web_worker_cb = Arc::new(|_| {
            todo!("Web workers are not supported in the example");
        });

        let web_worker_preload_module_cb = Arc::new(|_| {
            todo!("Web workers are not supported in the example");
        });

        v8_set_flags(
            once("UNUSED_BUT_NECESSARY_ARG0".to_owned())
                .chain(Vec::new().iter().cloned())
                .collect::<Vec<_>>(),
        );

        let options = WorkerOptions {
            bootstrap: BootstrapOptions {
                apply_source_maps: false,
                args: vec![],
                is_tty: false,
                cpu_count: 1,
                debug_flag: false,
                enable_testing_features: false,
                location: None,
                no_color: false,
                runtime_version: "0".to_string(),
                ts_version: "0".to_string(),
                unstable: true,
            },
            extensions: vec![ops::new(
                self.deno_sender.clone(),
                self.events_manager.clone(),
            )],
            unsafely_ignore_certificate_errors: None,
            root_cert_store: None,
            user_agent: "astrodon".to_string(),
            seed: None,
            js_error_create_fn: None,
            create_web_worker_cb,
            web_worker_preload_module_cb,
            maybe_inspector_server: None,
            should_break_on_first_statement: false,
            module_loader,
            get_error_class_fn: Some(&get_error_class_name),
            origin_storage_dir: None,
            blob_store: BlobStore::default(),
            broadcast_channel: InMemoryBroadcastChannel::default(),
            shared_array_buffer_store: None,
            compiled_wasm_module_store: None,
        };

        let permissions = Permissions::allow_all();

        let mut worker = MainWorker::bootstrap_from_options(
            self.metadata.entrypoint.clone(),
            permissions,
            options,
        );

        worker.js_runtime.sync_ops_cache();

        let error_handler = |err| {
            // TO-DO: Also display a small window with the error when running in astrodon-tauri-standalone
            println!("{err}");
            std::process::exit(1);
        };

        worker
            .execute_main_module(&self.metadata.entrypoint)
            .await
            .unwrap_or_else(error_handler);

        worker
            .dispatch_load_event(&located_script_name!())
            .unwrap_or_else(error_handler);

        worker
            .run_event_loop(true)
            .await
            .unwrap_or_else(error_handler);

        worker
            .dispatch_load_event(&located_script_name!())
            .unwrap_or_else(error_handler);
    }
}

fn get_error_class_name(e: &AnyError) -> &'static str {
    deno_runtime::errors::get_error_class_name(e).unwrap_or("Error")
}
