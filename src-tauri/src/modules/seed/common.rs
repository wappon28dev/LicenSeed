use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct Summary {
    permissions: String,
    limitations: String,
    conditions: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct Sower {
    name: String,
}
