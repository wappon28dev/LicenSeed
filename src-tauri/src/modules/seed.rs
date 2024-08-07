use log::{debug, error, info};
use serde::{Deserialize, Serialize};
use serde_yml;
use specta::Type;
use std::fs;

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
struct Sower {
    name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
struct Base {
    id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
// ref: https://qiita.com/aobat/items/6f0c6a3aa4f1b9b303de
#[serde(tag = "type")]
#[allow(dead_code)]
enum SeedData {
    CUSTOM {},
    CROSSBREED { ids: Vec<String> },
    FORK { base: Base, diff: String },
    REUSE { id: String },
}
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
struct Summary {
    permissions: String,
    limitations: String,
    conditions: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
struct Seed {
    sower: Sower,
    territory: Vec<String>,
    data: SeedData,
    summary: Summary,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct SeedFile {
    version: String,
    seeds: Vec<Seed>,
    license_hash: String,
}

#[tauri::command]
#[specta::specta]
pub fn write_seed_file(target_path: &str, seed_file: SeedFile) -> Result<(), String> {
    info!("Writing seed file to {}", target_path);
    debug!("-> Seed file: {:?}", seed_file);

    let file = fs::File::create(target_path).map_err(|e| {
        error!("Failed to create file: {}", e);
        return format!("Failed to create file: {}", e);
    })?;

    serde_yml::to_writer(file, &seed_file).map_err(|e| {
        error!("Failed to write seed file: {}", e);
        return format!("Failed to write seed file: {}", e);
    })?;

    info!("Seed file written successfully");
    return Ok(());
}

#[tauri::command]
#[specta::specta]
pub fn read_seed_file(target_path: &str) -> Result<SeedFile, String> {
    info!("Reading seed file from {}", target_path);

    let file = fs::File::open(target_path).map_err(|e| {
        error!("Failed to open file: {}", e);
        return format!("Failed to open file: {}", e);
    })?;

    let seed_file: SeedFile = serde_yml::from_reader(file).map_err(|e| {
        error!("Failed to read seed file: {}", e);
        return format!("Failed to read seed file: {}", e);
    })?;

    info!("Seed file read successfully");
    debug!("-> Seed file: {:?}", seed_file);
    return Ok(seed_file);
}
