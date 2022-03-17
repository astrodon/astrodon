use std::{collections::HashMap, sync::Arc};

use tokio::sync::{
    mpsc::{error::SendError, Sender},
    Mutex,
};
use uuid::Uuid;

type EventsListeners = HashMap<Uuid, Sender<String>>;

/**
 * Manages the events bridge from Deno to Wry
 */
#[derive(Clone, Default)]
pub struct EventsManager {
    listeners: Arc<Mutex<HashMap<String, EventsListeners>>>,
}

impl EventsManager {
    pub fn new() -> Self {
        Self::default()
    }

    /**
     * Listen on an event emitted by Wry
     */
    pub async fn listen_on(&self, name: String, listener_id: Uuid, listener: Sender<String>) {
        // Add event group if doesn't exist
        self.listeners
            .lock()
            .await
            .try_insert(name.clone(), HashMap::new())
            .ok();

        self.listeners
            .lock()
            .await
            .get_mut(&name)
            .unwrap()
            .insert(listener_id, listener.clone());
    }

    /**
     * Remove listener by it's id
     */
    pub async fn unlisten_from(&self, name: String, listener_id: Uuid) {
        self.listeners
            .lock()
            .await
            .get_mut(&name)
            .unwrap()
            .remove(&listener_id);
    }

    /**
     * Send an event from Deno to Wry
     */
    pub async fn send(&self, name: String, content: String) -> Result<(), SendError<String>> {
        let all_listeners = self.listeners.lock().await;
        let listeners = all_listeners.get(&name);
        if let Some(listeners) = listeners {
            for listener in listeners.values() {
                listener.send(content.clone()).await?;
            }
        }
        Ok(())
    }
}
