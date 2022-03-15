use std::{env::current_exe, io::SeekFrom};
use astrodon_tauri::{
    Metadata, deno_core::{error::AnyError, anyhow::Context, serde_json},
};

use tokio::io::{AsyncSeekExt, AsyncReadExt};

mod eszip_loader;

use eszip_loader::EszipModuleLoader;

#[tokio::main]
async fn main() {
    if let Ok(Some((metadata, eszip))) = extract_standalone().await {
        let module_loader = EszipModuleLoader::new(eszip);
        astrodon_tauri::run(metadata, module_loader).await;
    }
}


fn u64_from_bytes(arr: &[u8]) -> Result<u64, AnyError> {
    let fixed_arr: &[u8; 8] = arr
        .try_into()
        .context("Failed to convert the buffer into a fixed-size array")?;
    Ok(u64::from_be_bytes(*fixed_arr))
}

const MAGIC_TRAILER: &[u8; 8] = b"4str0d0n";

async fn extract_standalone() -> Result<Option<(Metadata, eszip::EszipV2)>, AnyError> {
    let current_exe_path = current_exe()?;

    let file = tokio::fs::File::open(&current_exe_path).await?;

    let mut bufreader = tokio::io::BufReader::new(file);

    let trailer_pos = bufreader.seek(SeekFrom::End(-24)).await?;

    let mut trailer = [0; 24];

    bufreader.read_exact(&mut trailer).await?;

    let (magic_trailer, rest) = trailer.split_at(8);

    if magic_trailer != MAGIC_TRAILER {
        return Ok(None);
    }

    let (eszip_archive_pos, metadata_pos) = rest.split_at(8);

    let eszip_archive_pos = u64_from_bytes(eszip_archive_pos)?;
    let metadata_pos = u64_from_bytes(metadata_pos)?;

    let metadata_len = trailer_pos - metadata_pos;

    bufreader.seek(SeekFrom::Start(eszip_archive_pos)).await?;

    let (eszip, loader) = eszip::EszipV2::parse(bufreader)
        .await
        .context("Failed to parse eszip header")?;

    let mut bufreader = loader.await.context("Failed to parse eszip archive")?;

    bufreader.seek(SeekFrom::Start(metadata_pos)).await?;

    let mut metadata = String::new();

    bufreader
        .take(metadata_len)
        .read_to_string(&mut metadata)
        .await
        .context("Failed to read metadata from the current executable")?;

    let metadata: Metadata = serde_json::from_str(&metadata).unwrap();

    Ok(Some((metadata, eszip)))
}