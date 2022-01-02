struct App;
struct TauriState;

impl App {
  pub fn run(){

    let context = tauri::generate_context!("tauri.conf.json");

    tauri::Builder::default()
        .manage(TauriState)
        .run(context)
        .expect("failed to run tauri application");
  }
}

#[no_mangle]
pub extern "C" fn print_something() {
  println!("something");
}
