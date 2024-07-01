use serde::Deserialize;
use specta::Type;

#[derive(Type, Deserialize)]
pub struct FileEntry {
    pub path: String,
    pub is_dir: bool,
}

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
