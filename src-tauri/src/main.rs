// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod routes;

use routes::files::show_files;

fn main() {
    let invoke_handler = {
        let builder =
            tauri_specta::ts::builder().commands(tauri_specta::collect_commands![show_files,]);

        #[cfg(debug_assertions)]
        let builder = builder.path("../src/types/bindings.ts");

        builder.build().unwrap()
    };

    tauri::Builder::default()
        .invoke_handler(invoke_handler)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
