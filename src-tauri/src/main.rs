// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rspc::Router;
mod routes;

fn router() -> Router<()> {
    <Router>::new()
        .config(rspc::Config::new().export_ts_bindings("../src/types/bindings.d.ts"))
        .query("version", |t| {
            t(|_ctx, _input: ()| env!("CARGO_PKG_VERSION"))
        })
        .query("show_files", |t| {
            t(|_ctx, input: String| {
                return routes::files::show_files(input);
            })
        })
        .query("hello", |t| t(|_ctx, _input: ()| "Hello, World!"))
        .build()
}

#[tokio::main]
async fn main() {
    let router = router();

    tauri::Builder::default()
        .plugin(rspc_tauri::plugin(router.arced(), |_app_handle| ()))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
