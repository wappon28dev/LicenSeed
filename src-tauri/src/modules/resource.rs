use log::{debug, error, info};
use std::path::{self, PathBuf};
use tauri::path::BaseDirectory;
use tauri::Manager;

#[tauri::command]
#[specta::specta]
pub fn resolve_resources_path(handle: tauri::AppHandle, path: &str) -> Result<PathBuf, String> {
    info!("Resolving path: {}", path);

    let relative_path = PathBuf::from("resources").join(path::Path::new(path));
    let resolved_path = handle
        .path()
        .resolve(relative_path, BaseDirectory::Resource)
        .map_err(|e| {
            error!("Failed to resolve path: {}", e);
            format!("Failed to resolve path: {}", e)
        });

    debug!("Resolved path: {:?}", resolved_path);
    return resolved_path;
}
