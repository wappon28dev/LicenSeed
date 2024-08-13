use std::{
    fs,
    path::{self, PathBuf},
};

use log::{debug, error, info};
use serde::{Deserialize, Serialize};
use specta::Type;

use super::common::Summary;
use crate::modules::resource::resolve_res_path;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
struct Variable {
    key: String,
    description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
struct TermEntry {
    description: String,
    label: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
struct Terms {
    permissions: HashMap<String, TermEntry>,
    conditions: HashMap<String, TermEntry>,
    limitations: HashMap<String, TermEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct SeedBase {
    id: String,
    name: String,
    description: String,
    summary: Summary,
    variables: Vec<Variable>,
    body: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct SeedBaseGroupManifest {
    group: String,
    name: String,
    description: String,
    terms: Terms,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct SeedBaseGroup {
    manifest: SeedBaseGroupManifest,
    bases: Vec<SeedBase>,
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

    match e {
        tauri::Error::AssetNotFound(_) => GetSeedBaseErrors::NotFound,
        _ => GetSeedBaseErrors::ReadingError {
            error: e.to_string(),
        },
    }
}

fn get_seed_base_path(handle: tauri::AppHandle, id: String) -> tauri::Result<PathBuf> {
    let file_name = format!("{}.yml", id);
    let path_buf = path::Path::new("seeds").join("bases").join(file_name);

    resolve_res_path(handle, path_buf)
}

#[tauri::command]
#[specta::specta]
pub fn get_seed_base(handle: tauri::AppHandle, id: String) -> Result<SeedBase, GetSeedBaseErrors> {
    info!("Getting seed base: {}", id);

    let res_path = get_seed_base_path(handle, id).map_err(handle_asset_error)?;
    debug!("-> Resolved path: {:?}", res_path);

    let file = fs::File::open(res_path).map_err(|e| {
        error!("Failed to open file: {}", e);
        GetSeedBaseErrors::ReadingError {
            error: e.to_string(),
        }
    })?;

    // NOTE:
    // ここを型推論に任せた状態で `return seed_base` としてはならない.  `return Ok(seed_base)` とするべきである.
    // `return seed_base` とすると, `seed_base` は `Result<SeedBase, GetSeedBaseErrors>` として推論される.
    // このとき, `from_reader` がエラーを起こすと `map_err` によって `GetSeedBaseErrors` に変換される.
    // つまり, エラーメッセージが YAML として Deserialize されてしまう.
    let seed_base = serde_yml::from_reader(file).map_err(|e| {
        error!("Failed to read seed file: {}", e);
        GetSeedBaseErrors::ReadingError {
            error: e.to_string(),
        }
    })?;

    debug!("-> Seed base: {:?}", seed_base);

    Ok(seed_base)
}

#[tauri::command]
#[specta::specta]
pub fn collect_seed_base_manifests(
    handle: tauri::AppHandle,
) -> Result<Vec<SeedBaseGroupManifest>, GetSeedBaseErrors> {
    info!("Collecting seed base manifests");

    let glob_cwd = resolve_res_path(handle, path::Path::new("seeds").to_path_buf())
        .map_err(handle_asset_error)?;
    let files = globmatch::Builder::new("bases/**/_manifest.yml")
        .build(glob_cwd)
        .unwrap()
        .into_iter()
        .flatten()
        .collect::<Vec<_>>();

    let groups = files
        .iter()
        .map(|f| {
            let file = fs::File::open(f).map_err(|e| {
                error!("Failed to open file: {}", e);
                GetSeedBaseErrors::ReadingError {
                    error: e.to_string(),
                }
            })?;

            let manifest = serde_yml::from_reader(file).map_err(|e| {
                error!("Failed to read seed file: {}", e);
                GetSeedBaseErrors::ReadingError {
                    error: e.to_string(),
                }
            })?;

            Ok(manifest)
        })
        .collect::<Result<Vec<_>, _>>()?;

    debug!("-> Groups: {:?}", &groups);

    Ok(groups)
}

#[tauri::command]
#[specta::specta]
pub fn collect_seed_base_groups(
    handle: tauri::AppHandle,
) -> Result<Vec<SeedBaseGroup>, GetSeedBaseErrors> {
    info!("Collecting seed bases");

    let manifests = collect_seed_base_manifests(handle.clone())?;
    let mut groups: Vec<SeedBaseGroup> = Vec::new();

    for manifest in &manifests {
        let group = &manifest.group;
        let glob_cwd = resolve_res_path(
            handle.clone(),
            path::Path::new("seeds").join("bases").join(group),
        )
        .map_err(handle_asset_error)?;
        let files = globmatch::Builder::new("*.yml")
            .build(glob_cwd)
            .unwrap()
            .into_iter()
            .flatten()
            .collect::<Vec<_>>();

        let entries = files.iter().filter(|f| {
            !f.components()
                .last()
                .unwrap()
                .as_os_str()
                .to_str()
                .unwrap()
                .starts_with('_')
        });

        let mut bases: Vec<SeedBase> = Vec::new();
        for entry in entries {
            let name: String = entry
                .components()
                .last()
                .unwrap()
                .as_os_str()
                .to_str()
                .unwrap()
                .strip_suffix(".yml")
                .unwrap()
                .to_string();
            let id = format!("{}/{}", group, name);
            let base = get_seed_base(handle.clone(), id)?;

            bases.push(base);
        }

        groups.push(SeedBaseGroup {
            manifest: manifest.clone(),
            bases,
        });
    }

    debug!("-> Groups: {:?}", &groups);

    Ok(groups)
}

#[tauri::command]
#[specta::specta]
pub fn write_seed_base(_handle: tauri::AppHandle, seed_base: SeedBase) -> Result<(), String> {
    info!("Writing seed base: {:?}", seed_base);

    let file = fs::File::create("hoge.yml").map_err(|e| {
        error!("Failed to create file: {}", e);
        e.to_string()
    })?;

    serde_yml::to_writer(file, &seed_base).map_err(|e| {
        error!("Failed to write seed file: {}", e);
        e.to_string()
    })?;

    info!("Seed file written successfully");
    Ok(())
}
