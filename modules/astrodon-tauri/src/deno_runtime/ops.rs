use std::cell::RefCell;
use std::rc::Rc;

use deno_core::anyhow::Error;
use deno_core::error::AnyError;
use deno_core::op;
use deno_core::serde::Deserialize;
use deno_core::serde::Serialize;
use deno_core::Extension;
use deno_core::OpState;
use tokio::sync::mpsc;
use tokio::sync::mpsc::Sender;
use uuid::Uuid;

use crate::events_manager::EventsManager;
use crate::messages::CloseWindowMessage;
use crate::messages::SentToWindowMessage;
use crate::messages::WindowConfig;
use crate::AstrodonMessage;

/**
 * Create the extension
 */
pub fn new(sender: Sender<AstrodonMessage>, events_manager: EventsManager) -> Extension {
    Extension::builder()
        .ops(vec![
            run_window::decl(),
            send_to_window::decl(),
            listen_event::decl(),
            close_window::decl(),
        ])
        .state(move |s| {
            s.put(sender.clone());
            s.put(events_manager.clone());
            Ok(())
        })
        .build()
}

/**
 * Close a webview window
 */
#[op]
async fn close_window(
    state: Rc<RefCell<OpState>>,
    args: CloseWindowMessage,
    _: (),
) -> Result<(), AnyError> {
    let sender: Sender<AstrodonMessage> = {
        let state = state.borrow();
        state
            .try_borrow::<Sender<AstrodonMessage>>()
            .unwrap()
            .clone()
    };

    sender.send(AstrodonMessage::CloseWindow(args)).await?;

    Ok(())
}

#[derive(Serialize, Deserialize, Debug)]
struct EventListen {
    name: String,
}

/**
 * Listen from an event emitted from the webview
 */
#[op]
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
#[op]
async fn run_window(
    state: Rc<RefCell<OpState>>,
    args: WindowConfig,
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
#[op]
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
