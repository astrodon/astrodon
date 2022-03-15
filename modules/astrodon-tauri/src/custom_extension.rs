use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;
use std::sync::Arc;

use deno_core::anyhow::Error;
use deno_core::error::AnyError;
use deno_core::op_async;
use deno_core::serde::Deserialize;
use deno_core::serde::Serialize;
use deno_core::Extension;
use deno_core::OpState;
use tokio::sync::mpsc;
use tokio::sync::mpsc::Sender;
use tokio::sync::Mutex;
use uuid::Uuid;

use crate::AstrodonMessage;

#[derive(Serialize, Deserialize, Debug)]
struct EventListen {
    name: String,
}

async fn listen_event(
    state: Rc<RefCell<OpState>>,
    sett: EventListen,
    _: (),
) -> Result<String, Error> {
    let (s, mut r) = mpsc::channel(1);
    let s_id = Uuid::new_v4();

    let subs: Arc<Mutex<HashMap<String, HashMap<Uuid, Sender<String>>>>> = {
        let state = state.try_borrow()?;

        state
            .try_borrow::<Arc<Mutex<HashMap<String, HashMap<Uuid, Sender<String>>>>>>()
            .unwrap()
            .clone()
    };

    subs.lock()
        .await
        .try_insert(sett.name.clone(), HashMap::new())
        .ok();
    subs.lock()
        .await
        .get_mut(&sett.name)
        .unwrap()
        .insert(s_id, s.clone());

    let event = r.recv().await;

    subs.lock().await.get_mut(&sett.name).unwrap().remove(&s_id);

    // TODO, remove the event hashmap if no more senders are on it

    Ok(event.unwrap())
}

pub fn new(
    sender: Sender<AstrodonMessage>,
    subs: Arc<Mutex<HashMap<String, HashMap<Uuid, Sender<String>>>>>,
) -> Extension {
    Extension::builder()
        .ops(vec![
            ("runWindow", op_async(run_window)),
            ("sendToWindow", op_async(send_to_window)),
            ("listenEvent", op_async(listen_event)),
        ])
        .state(move |s| {
            s.put(sender.clone());
            s.put(subs.clone());
            Ok(())
        })
        .build()
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "_type")]
pub enum WindowContent {
    Url { url: String },
    Html { html: String },
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RunWindowMessage {
    pub id: String,
    pub title: String,
    pub content: WindowContent,
}

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

    sender
        .send(AstrodonMessage::RunWindowMessage(args))
        .await
        .unwrap();

    Ok(())
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SentToWindowMessage {
    pub id: String,
    pub event: String,
    pub content: String,
}

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
        .send(AstrodonMessage::SentToWindowMessage(args))
        .await
        .unwrap();

    Ok(())
}
