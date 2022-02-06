/*
Thanks to https://github.com/sunsetkookaburra for this code!
Source: https://github.com/denoland/deno/discussions/11638
This is implemented for run apps on background to prevent showing console on app start.
It deprecates the use of the old hacky method.
*/

async function readN(r: Deno.Reader, n: number): Promise<Uint8Array | null> {
  const buf = new Uint8Array(n);
  let nRead = 0;
  while (nRead < n) {
    nRead += await r.read(buf.subarray(nRead)) ?? NaN;
  }
  return isNaN(nRead) ? null : buf;
}

async function writeAll(w: Deno.Writer, buf: ArrayBufferView): Promise<void> {
  const bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  let nWritten = 0;
  while (nWritten < bytes.byteLength) {
    nWritten += await w.write(bytes.subarray(nWritten));
  }
}

function view(buf: ArrayBufferView) {
  return new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
}


export async function change_subsystem(PATH_TO_BINARY: string){

  const bin = await Deno.open(PATH_TO_BINARY, { read: true, write: true });

  await bin.seek(0, Deno.SeekMode.Start);
  const magicBytes = await readN(bin, 2);
  if (magicBytes == null) {
    console.log("Encountered EOF at magicBytes");
    Deno.exit(1);
  }
  const binMagic = new TextDecoder().decode(magicBytes);

  if ("MZ" != binMagic) {
    console.log(`exe not found at ${PATH_TO_BINARY}`);
    Deno.exit(1);
  }

  const PE_ADDRESS_OFFSET = 0x3C;
  await bin.seek(PE_ADDRESS_OFFSET, Deno.SeekMode.Start);
  const peHeaderPointerBytes = await readN(bin, 4);
  if (peHeaderPointerBytes == null) {
    console.log("Encountered EOF at peHeaderPointerBytes");
    Deno.exit(1);
  }
  const peHeaderPointer = view(peHeaderPointerBytes).getUint32(0, true);

  await bin.seek(peHeaderPointer + 92, Deno.SeekMode.Start);

  const SUBSYSTEM_WINDOWS = 2;
  const SUBSYSTEM_CONSOLE = 3;

  const subsystemBytes = await readN(bin, 2);
  if (subsystemBytes == null) {
    console.log("Encountered EOF at subsystemBytes");
    Deno.exit(1);
  }
  const subsystem = view(subsystemBytes).getUint16(0, true);
  if (!(SUBSYSTEM_WINDOWS == subsystem || SUBSYSTEM_CONSOLE == subsystem)) {
    console.log("Oops! The subsystem is not WINDOWS=2 or CONSOLE=3.");
    console.log("We might be editing the wrong field,");
    console.log("  _or_ the EXE uses a different subsystem.");
    Deno.exit(1);
  }

  const newSubsystemData = new Uint16Array(1);
  view(newSubsystemData).setUint16(0, SUBSYSTEM_WINDOWS, true);
  await bin.seek(peHeaderPointer + 92, Deno.SeekMode.Start);
  await writeAll(bin, newSubsystemData);

  const newSubsystemValue = view(newSubsystemData).getUint16(0, true);
  if (SUBSYSTEM_WINDOWS == newSubsystemValue) {
    console.log(`Done! Changed ${PATH_TO_BINARY} subsystem=2, WINDOWS.`);
  }
  else if (SUBSYSTEM_CONSOLE == newSubsystemValue) {
    console.log(`Done! Changed ${PATH_TO_BINARY} subsystem=3, CONSOLE.`);
  }
}