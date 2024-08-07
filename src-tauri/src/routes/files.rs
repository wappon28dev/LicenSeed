use std::{fs, io, path};

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

fn read_directory(
    base_path: &path::Path,
    current_path: &path::Path,
    depth: usize,
) -> io::Result<Vec<FileEntry>> {
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
pub fn show_files(input: String) -> Result<Vec<FileEntry>, String> {
    let target_path = path::Path::new(&input);
    println!("Reading files from: {:?}", target_path);

    return read_directory(target_path, target_path, 0)
        .map_err(|e| format!("Failed to read directory: {}", e));
}
