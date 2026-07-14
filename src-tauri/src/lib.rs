use std::path::Path;
use std::process::Command;

#[tauri::command]
fn move_to_recycle_bin(path: String) -> Result<(), String> {
  trash::delete(Path::new(&path)).map_err(|error| error.to_string())
}

#[tauri::command]
fn reveal_in_explorer(path: String) -> Result<(), String> {
  #[cfg(target_os = "windows")]
  let status = Command::new("explorer")
    .arg(format!("/select,{}", path))
    .status();

  #[cfg(target_os = "macos")]
  let status = Command::new("open").arg("-R").arg(&path).status();

  #[cfg(target_os = "linux")]
  let status = Command::new("xdg-open")
    .arg(Path::new(&path).parent().unwrap_or_else(|| Path::new(&path)))
    .status();

  status
    .map_err(|error| error.to_string())?
    .success()
    .then_some(())
    .ok_or_else(|| "系统文件管理器未能打开目标路径".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![move_to_recycle_bin, reveal_in_explorer])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
