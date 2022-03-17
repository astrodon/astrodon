use std::cell::RefCell;
use std::rc::Rc;

use deno_core::anyhow::Error;
use deno_core::error::AnyError;
use deno_core::op_async;
use deno_core::serde::Deserialize;
use deno_core::serde::Serialize;
use deno_core::Extension;
use deno_core::OpState;
use tokio::sync::mpsc;
use tokio::sync::mpsc::Sender;
use uuid::Uuid;

use crate::events_manager::EventsManager;
use crate::messages::RunWindowMessage;
use crate::messages::SentToWindowMessage;
use crate::AstrodonMessage;

/**
 * Create the extension
 */
pub fn new(sender: Sender<AstrodonMessage>, events_manager: EventsManager) -> Extension {
    Extension::builder()
        .ops(vec![
            ("runWindow", op_async(run_window)),
            ("sendToWindow", op_async(send_to_window)),
            ("listenEvent", op_async(listen_event)),
        ])
        .state(move |s| {
            s.put(sender.clone());
            s.put(events_manager.clone());
            Ok(())
        })
        .build()
}

#[derive(Serialize, Deserialize, Debug)]
struct EventListen {
    name: String,
}

/**
 * Listen from an event emitted from the webview
 */
async fn listen_event(
    state: Rc<RefCell<OpState>>,
    event: EventListen,
    _: (),
) -> Result<String, Error> {
    let (listener, mut receiver) = mpsc::channel(1);
    let listener_id = Uuid::new_v4();

    let events_manager: EventsManager = {
        let state = state.try_borrow()?;

        state.try_borrow::<EventsManager>().unwrap().clone()
    };

    events_manager
        .listen_on(event.name.clone(), listener_id, listener)
        .await;

    let event_response = receiver.recv().await;

    events_manager.unlisten_from(event.name, listener_id).await;

    Ok(event_response.unwrap())
}

/**
 * Create a webview window
 */
async fn run_window(
    state: Rc<RefCell<OpState>>,
    args: RunWindowMessage,
    _: (),
) -> Result<(), AnyError> {
    let sender: Sender<AstrodonMessage> = {
        let state = state.borrow();
        state
            .try_borrow::<Sender<AstrodonMessage>>()
            .unwrap()
            .clone()
    };

    sender.send(AstrodonMessage::RunWindow(args)).await.unwrap();

    Ok(())
}

/**
 * Emit an event to a webview window
 */
async fn send_to_window(
    state: Rc<RefCell<OpState>>,
    args: SentToWindowMessage,
    _: (),
) -> Result<(), AnyError> {
    let sender: Sender<AstrodonMessage> = {
        let state = state.try_borrow()?;
        state
            .try_borrow::<Sender<AstrodonMessage>>()
            .unwrap()
            .clone()
    };

    sender
        .send(AstrodonMessage::SentToWindow(args))
        .await
        .unwrap();

    Ok(())
}
