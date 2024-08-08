// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod modules;

use modules::files::{collect_file_entries, get_fs_metadata};
use modules::resource::resolve_resources_path;
use modules::seed::{read_seed_file, write_seed_file};
use std::env;

use specta_typescript::Typescript;
use tauri_specta::{collect_commands, Builder};

fn main() {
    env::set_var("RUST_LOG", "debug");
    env_logger::init();

    let builder = Builder::<tauri::Wry>::new().commands(collect_commands![
        collect_file_entries,
        get_fs_metadata,
        write_seed_file,
        read_seed_file,
        resolve_resources_path
    ]);

    #[cfg(debug_assertions)]
    builder
        .export(Typescript::default(), "../src/types/bindings.ts")
        .expect("Failed to export typescript bindings");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(builder.invoke_handler())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
