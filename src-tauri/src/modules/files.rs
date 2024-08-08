use log::{debug, error, info};
use std::{fs, io, path, time};

use serde::Serialize;
use specta::Type;

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct FileEntry {
    pub relative_path: String,
    pub name: String,
    pub is_dir: bool,
    pub children: Option<Vec<FileEntry>>,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct FsMetaData {
    is_dir: bool,
    is_file: bool,
    len: i32,
    readonly: bool,
    modified: Option<i32>,
    created: Option<i32>,
}

fn system_time_to_unix_time(time: time::SystemTime) -> Option<i32> {
    time.duration_since(time::UNIX_EPOCH)
        .ok()
        .map(|d| d.as_secs() as i32)
}

impl From<fs::Metadata> for FsMetaData {
    fn from(metadata: fs::Metadata) -> Self {
        FsMetaData {
            is_dir: metadata.is_dir(),
            is_file: metadata.is_file(),
            len: metadata.len() as i32,
            readonly: metadata.permissions().readonly(),
            modified: metadata.modified().ok().and_then(system_time_to_unix_time),
            created: metadata.created().ok().and_then(system_time_to_unix_time),
        }
    }
}

fn read_directory(
    base_path: &path::Path,
    current_path: &path::Path,
    depth: usize,
) -> io::Result<Vec<FileEntry>> {
    debug!("-> Reading directory: {:?}", current_path);

    fs::read_dir(current_path)?
        .map(|entry_result| {
            let entry = entry_result?;
            let path = entry.path();
            let is_dir = path.is_dir();
            let name = entry.file_name().into_string().unwrap_or_default();
            let relative_path = path
                .strip_prefix(base_path)
                .unwrap_or(&path)
                .to_str()
                .unwrap_or("")
                .to_string();

            let children = if is_dir && depth < 3 {
                Some(read_directory(base_path, &path, depth + 1)?)
            } else {
                None
            };

            Ok(FileEntry {
                relative_path,
                name,
                is_dir,
                children,
            })
        })
        .collect()
}

#[tauri::command]
#[specta::specta]
pub fn collect_file_entries(input: String) -> Result<Vec<FileEntry>, String> {
    info!("Reading directory: {}", input);

    let target_path = path::Path::new(&input);
    return read_directory(target_path, target_path, 0).map_err(|e| {
        error!("Failed to read directory: {}", e);
        return e.to_string();
    });
}

#[tauri::command]
#[specta::specta]
pub fn get_fs_metadata(input: String) -> Result<FsMetaData, String> {
    info!("Reading metadata from: {}", input);

    let target_path = path::Path::new(&input);
    let metadata = fs::metadata(target_path).map_err(|e| {
        error!("Failed to read metadata: {}", e);
        return e.to_string();
    })?;

    debug!("Metadata: {:?}", metadata);
    return Ok(metadata.into());
}
