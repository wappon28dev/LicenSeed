use serde::Serialize;
use specta::Type;

#[derive(Serialize, Type)]
pub struct FileEntry {
    pub name: String,
    pub is_dir: bool,
}

#[tauri::command]
#[specta::specta]
pub fn show_files(input: String) -> Vec<FileEntry> {
    let path = std::path::Path::new(&input);
    println!("Reading files from: {:?}", path);

    return std::fs::read_dir(path)
        .unwrap()
        .map(|entry| {
            let entry = entry.unwrap();
            let path = entry.path();
            let is_dir = path.is_dir();
            let name = entry.file_name().into_string().unwrap();

            FileEntry { name, is_dir }
        })
        .collect();
}
