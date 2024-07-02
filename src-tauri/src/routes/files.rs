use serde::Serialize;
use specta::Type;

#[derive(Serialize, Type)]
pub struct FileEntry {
    pub path: String,
    pub is_dir: bool,
}

#[tauri::command]
#[specta::specta]
pub fn show_files(input: String) -> Vec<FileEntry> {
    let path = std::path::Path::new(&input);
    let mut files = Vec::new();

    println!("Reading files from: {:?}", path);

    for entry in std::fs::read_dir(path).unwrap() {
        let entry = entry.unwrap();
        let path = entry.path();
        let is_dir = path.is_dir();
        let path = path.to_str().unwrap().to_string();
        files.push(FileEntry { path, is_dir });
    }

    return files;
}
