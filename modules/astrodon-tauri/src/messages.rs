use serde::{Deserialize, Serialize};

#[derive(Debug)]
pub enum AstrodonMessage {
    SentToWindow(SentToWindowMessage),
    RunWindow(RunWindowMessage),
    CloseWindow(CloseWindowMessage),
    SentToDeno(String, String),
}

#[derive(Debug)]
pub enum WryEvent {
    RunScript(String, String),
    NewWindow(RunWindowMessage),
    CloseWindow(CloseWindowMessage),
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

#[derive(Serialize, Deserialize, Debug)]
pub struct CloseWindowMessage {
    pub id: String
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum IpcMessage {
    SendEvent { name: String, content: String },
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SentToWindowMessage {
    pub id: String,
    pub event: String,
    pub content: String,
}
