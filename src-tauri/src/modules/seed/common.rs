use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(tag = "type", rename_all = "SCREAMING_SNAKE_CASE")]
#[allow(dead_code)]
pub enum SummaryEntry {
    Term { value: String },
    Markdown { value: String },
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct Summary {
    permissions: Vec<SummaryEntry>,
    limitations: Vec<SummaryEntry>,
    conditions: Vec<SummaryEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct Sower {
    name: String,
}
