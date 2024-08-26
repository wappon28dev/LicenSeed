use webbrowser;

#[tauri::command]
#[specta::specta]
pub fn open_browser(url: &str) -> Result<(), String> {
    webbrowser::open(url).map_err(|e| e.to_string())
}
