use std::path::Path;

use serde::Serialize;
use specta::Type;

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct FileEntry {
    pub base_path: String,
    pub name: String,
    pub is_dir: bool,
    pub children: Option<Vec<FileEntry>>,
}

fn read_directory(input: String, depth: usize) -> Vec<FileEntry> {
    let target_path = Path::new(&input);

    std::fs::read_dir(target_path)
        .unwrap()
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let path = entry.path();
            let is_dir = path.is_dir();
            let name = entry.file_name().into_string().ok()?;

            let children = if is_dir && depth < 3 {
                Some(read_directory(path.to_str()?.to_string(), depth + 1))
            } else {
                None
            };

            Some(FileEntry {
                base_path: input.clone(),
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

    return read_directory(input, 0);
}
