use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(tag = "type", rename_all = "SCREAMING_SNAKE_CASE")]
#[allow(dead_code)]
pub enum SummaryEntry {
    Term { key: String },
    Markdown { title: String, body: String },
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct Summary {
    permissions: Vec<SummaryEntry>,
    limitations: Vec<SummaryEntry>,
    conditions: Vec<SummaryEntry>,
    notes: Option<Vec<SummaryEntry>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct Sower {
    name: String,
}
