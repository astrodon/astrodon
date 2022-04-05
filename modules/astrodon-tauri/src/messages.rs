use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq)]
pub enum AstrodonMessage {
    SentToWindow(SentToWindowMessage),
    RunWindow(WindowConfig),
    CloseWindow(CloseWindowMessage),
    SentToDeno(String, String),
}

#[derive(Debug)]
pub enum WryEvent {
    RunScript(String, String),
    NewWindow(WindowConfig),
    CloseWindow(CloseWindowMessage),
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct CloseWindowMessage {
    pub id: String,
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
#[serde(tag = "_type")]
pub enum WindowContent {
    Url { url: String },
    Html { html: String },
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct WindowConfig {
    pub id: String,
    pub title: String,
    pub content: WindowContent,
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct SentToWindowMessage {
    pub id: String,
    pub event: String,
    pub content: String,
}
