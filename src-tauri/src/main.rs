// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod modules;

use modules::files::{collect_file_entries, get_fs_metadata};
use modules::seed::base::{
    collect_seed_base_groups, collect_seed_base_manifests, get_seed_base, write_seed_base,
};
use modules::seed::def::{read_seed_def, write_seed_def};
use modules::browser::open_browser;

use std::env;

use specta_typescript::Typescript;
use tauri_specta::{collect_commands, Builder};

fn main() {
    env::set_var("RUST_LOG", "debug");
    env_logger::init();

    let builder = Builder::<tauri::Wry>::new().commands(collect_commands![
        collect_file_entries,
        get_fs_metadata,
        write_seed_def,
        read_seed_def,
        write_seed_base,
        get_seed_base,
        collect_seed_base_groups,
        collect_seed_base_manifests,
        open_browser,
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
