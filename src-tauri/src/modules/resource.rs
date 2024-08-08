use log::info;
use std::path::PathBuf;
use tauri::path::BaseDirectory;
use tauri::Manager;

pub fn resolve_resources_path(
    handle: tauri::AppHandle,
    path_buf: PathBuf,
) -> tauri::Result<PathBuf> {
    info!("Resolving path: {}", path_buf.display());

    let relative_path = PathBuf::from("resources").join(path_buf.clone());
    let resolved_path = handle
        .path()
        .resolve(relative_path, BaseDirectory::Resource)?;

    if resolved_path.exists() {
        return Ok(resolved_path.clone());
    } else {
        return Err(tauri::Error::AssetNotFound(path_buf.display().to_string()));
    }
}
