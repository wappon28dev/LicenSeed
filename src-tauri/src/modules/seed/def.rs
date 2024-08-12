use log::{debug, error, info};
use serde::{Deserialize, Serialize};
use serde_yml;
use specta::Type;
use std::fs;

use super::common::{Sower, Summary};

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
struct Base {
    id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
// ref: https://qiita.com/aobat/items/6f0c6a3aa4f1b9b303de
#[serde(tag = "type", rename_all = "SCREAMING_SNAKE_CASE")]
#[allow(dead_code)]
enum SeedData {
    Custom {},
    Crossbreed { ids: Vec<String> },
    Fork { base: Base, diff: String },
    Reuse { id: String },
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
struct SeedDef {
    sower: Sower,
    territory: Vec<String>,
    data: SeedData,
    summary: Summary,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct SeedDefFile {
    version: String,
    seeds: Vec<SeedDef>,
    license_hash: String,
}

#[tauri::command]
#[specta::specta]
pub fn read_seed_def(target_path: &str) -> Result<SeedDefFile, String> {
    info!("Reading seed file from {}", target_path);

    let file = fs::File::open(target_path).map_err(|e| {
        error!("Failed to open file: {}", e);
        e.to_string()
    })?;

    let seed_file = serde_yml::from_reader(file).map_err(|e| {
        error!("Failed to read seed file: {}", e);
        e.to_string()
    })?;

    info!("Seed file read successfully");
    debug!("-> Seed file: {:?}", seed_file);
    Ok(seed_file)
}

#[tauri::command]
#[specta::specta]
pub fn write_seed_def(target_path: &str, seed_file: SeedDefFile) -> Result<(), String> {
    info!("Writing seed file to {}", target_path);
    debug!("-> Seed file: {:?}", seed_file);

    let file = fs::File::create(target_path).map_err(|e| {
        error!("Failed to create file: {}", e);
        e.to_string()
    })?;

    serde_yml::to_writer(file, &seed_file).map_err(|e| {
        error!("Failed to write seed file: {}", e);
        e.to_string()
    })?;

    info!("Seed file written successfully");
    Ok(())
}
