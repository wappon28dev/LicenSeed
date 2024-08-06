use std::path::Path;

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

fn read_directory(base_path: &Path, current_path: &Path, depth: usize) -> Vec<FileEntry> {
    std::fs::read_dir(current_path)
        .unwrap()
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let path = entry.path();
            let is_dir = path.is_dir();
            let name = entry.file_name().into_string().ok()?;
            let relative_path = path.strip_prefix(base_path).ok()?.to_str()?.to_string();

            let children = if is_dir && depth < 3 {
                Some(read_directory(base_path, &path, depth + 1))
            } else {
                None
            };

            Some(FileEntry {
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
pub fn show_files(input: String) -> Vec<FileEntry> {
    let target_path = Path::new(&input);
    println!("Reading files from: {:?}", target_path);

    read_directory(target_path, target_path, 0)
}
