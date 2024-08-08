use std::{
    fs,
    path::{self, PathBuf},
};

use log::{debug, error, info};
use serde::{Deserialize, Serialize};
use specta::Type;

use super::common::Summary;
use crate::modules::resource::resolve_resources_path;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
struct Variable {
    key: String,
    description: String,
    value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct SeedBase {
    id: String,
    description: String,
    summary: Summary,
    variables: Vec<Variable>,
    body: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(tag = "type", rename_all = "SCREAMING_SNAKE_CASE")]
#[allow(dead_code)]
pub enum GetSeedBaseErrors {
    NotFound,
    ReadingError { error: String },
}

fn handle_asset_error(e: tauri::Error) -> GetSeedBaseErrors {
    error!("Failed to get seed base: {}", e);

    return match e {
        tauri::Error::AssetNotFound(_) => GetSeedBaseErrors::NotFound,
        _ => GetSeedBaseErrors::ReadingError {
            error: e.to_string(),
        },
    };
}

fn get_seed_base_res_path(handle: tauri::AppHandle, id: String) -> tauri::Result<PathBuf> {
    let file_name = format!("{}.yml", id);
    let path_buf = path::Path::new("seeds").join("base").join(file_name);

    resolve_resources_path(handle, path_buf)
}

#[tauri::command]
#[specta::specta]
pub fn get_seed_base(handle: tauri::AppHandle, id: String) -> Result<SeedBase, GetSeedBaseErrors> {
    info!("Getting seed base: {}", id);

    let res_path = get_seed_base_res_path(handle, id).map_err(handle_asset_error)?;
    debug!("-> Resolved path: {:?}", res_path);

    let file = fs::File::open(res_path).map_err(|e| {
        error!("Failed to open file: {}", e);
        return GetSeedBaseErrors::ReadingError {
            error: e.to_string(),
        };
    })?;

    let seed_base = serde_yml::from_reader(file).map_err(|e| {
        error!("Failed to read seed file: {}", e);
        return GetSeedBaseErrors::ReadingError {
            error: e.to_string(),
        };
    })?;

    debug!("-> Seed base: {:?}", seed_base);
    return seed_base;
}

#[tauri::command]
#[specta::specta]
pub fn write_seed_base(handle: tauri::AppHandle, seed_base: SeedBase) -> Result<(), String> {
    info!("Writing seed base: {:?}", seed_base);

    let file = fs::File::create("hoge.yml").map_err(|e| {
        error!("Failed to create file: {}", e);
        return e.to_string();
    })?;

    serde_yml::to_writer(file, &seed_base).map_err(|e| {
        error!("Failed to write seed file: {}", e);
        return e.to_string();
    })?;

    info!("Seed file written successfully");
    return Ok(());
}

#[tauri::command]
#[specta::specta]
pub fn collect_seed_bases(
    handle: tauri::AppHandle,
) -> Result<HashMap<String, Vec<SeedBase>>, GetSeedBaseErrors> {
    let base_path_buf =
        resolve_resources_path(handle.clone(), path::Path::new("seeds").join("base"))
            .map_err(handle_asset_error)?;

    let groups: Vec<String> = fs::read_dir(base_path_buf.clone())
        .map_err(|e| {
            error!("Failed to read directory: {}", e);
            return GetSeedBaseErrors::ReadingError {
                error: e.to_string(),
            };
        })?
        .filter_map(|entry| {
            let path = entry.unwrap().path(); // FIXME: handle error
            let name = path.file_name().unwrap().to_str().unwrap().to_string();

            if path.is_dir() {
                return Some(name.to_string());
            } else {
                return None;
            }
        })
        .collect();

    debug!("-> Groups: {:?}", &groups);
    debug!("-> Base path: {:?}", base_path_buf);
    debug!(
        "-> {:?}",
        base_path_buf.clone().join("**/*.yml").to_str().unwrap()
    );

    let mut seed_bases: HashMap<String, Vec<SeedBase>> = HashMap::new();

    for group in &groups {
        let entries = fs::read_dir(path::Path::join(&base_path_buf, group))
            .map_err(|e| {
                error!("Failed to read directory: {}", e);
                return GetSeedBaseErrors::ReadingError {
                    error: e.to_string(),
                };
            })?
            .collect::<Vec<_>>();

        let mut bases: Vec<SeedBase> = Vec::new();
        for entry in &entries {
            let entry = entry.as_ref().unwrap(); // FIXME: handle error
            let path = entry.path();
            let id = path
                .strip_prefix(&base_path_buf)
                .unwrap()
                .to_str()
                .unwrap()
                .strip_suffix(".yml")
                .unwrap()
                .to_string();

            let base = get_seed_base(handle.clone(), id.clone())?;
            bases.push(base);
        }
        seed_bases.insert(group.clone(), bases);
    }

    return Ok(seed_bases);
}
