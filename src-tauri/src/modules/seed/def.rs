use log::{debug, error, info};
use serde::{Deserialize, Serialize};
use serde_yml;
use specta::Type;
use std::{fs, path};

use super::common::{Sower, Summary};

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
struct Base {
    id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
struct VariableWithValue {
    key: String,
    value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
// ref: https://qiita.com/aobat/items/6f0c6a3aa4f1b9b303de
#[serde(tag = "type", rename_all = "SCREAMING_SNAKE_CASE")]
#[allow(dead_code)]
enum SeedData {
    Custom {
        body: String,
    },
    Fork {
        base: Base,
        notes: String,
        variables: Vec<VariableWithValue>,
    },
    Reuse {
        base: Base,
        variables: Vec<VariableWithValue>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
struct SeedDef {
    title: String,
    sower: Sower,
    territory: Vec<String>,
    data: SeedData,
    summary: Summary,
    group: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
struct SeedDefFileMetadata {
    title: String,
    sow_date: String,
    version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct SeedDefFile {
    metadata: SeedDefFileMetadata,
    seeds: Vec<SeedDef>,
    license_hash: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct SeedDefFileKit {
    #[serde(flatten)]
    seed_file: SeedDefFile,
    license_body: String,
}

#[tauri::command]
#[specta::specta]
pub fn read_seed_def(base_path: &str) -> Result<SeedDefFileKit, String> {
    info!("Reading seed file from {}", base_path);

    let seed_fs =
        fs::File::open(path::Path::new(base_path).join("LICENSEED.yml")).map_err(|e| {
            error!("Failed to open file: {}", e);
            e.to_string()
        })?;

    let seed_file = serde_yml::from_reader(seed_fs).map_err(|e| {
        error!("Failed to read seed file: {}", e);
        e.to_string()
    })?;

    let license_body =
        fs::read_to_string(path::Path::new(base_path).join("LICENSE")).map_err(|e| {
            error!("Failed to read license file: {}", e);
            e.to_string()
        })?;

    info!("Seed file read successfully");
    debug!("-> Seed file: {:?}", seed_file);
    debug!("-> License body: {:?}", license_body);
    Ok(SeedDefFileKit {
        seed_file,
        license_body,
    })
}

#[tauri::command]
#[specta::specta]
pub fn write_seed_def(
    base_path: &str,
    seed_file: SeedDefFile,
    license_body: String,
) -> Result<(), String> {
    info!("Writing seed file to {}", base_path);
    debug!("-> Seed file: {:?}", seed_file);
    debug!("-> License body: {:?}", license_body);

    let seed_fs =
        fs::File::create(path::Path::new(base_path).join("LICENSEED.yml")).map_err(|e| {
            error!("Failed to create file: {}", e);
            e.to_string()
        })?;

    serde_yml::to_writer(seed_fs, &seed_file).map_err(|e| {
        error!("Failed to write seed file: {}", e);
        e.to_string()
    })?;

    fs::write(path::Path::new(base_path).join("LICENSE"), license_body).map_err(|e| {
        error!("Failed to write license file: {}", e);
        e.to_string()
    })?;

    info!("Seed file written successfully");
    Ok(())
}
