
export default {
  $schema: "https://x.nest.land/eggs@0.3.10/src/schema.json",
  name: "astrodon",
  entry: "./mod.ts",
  description: "Desktop App Framework for Deno, based in Tauri",
  homepage: "https://github.com/astrodon/astrodon",
  version: "0.1.0-alpha-2",
  releaseType: null,
  unstable: true,
  unlisted: false,
  files: [
    "./dist/windows.binary.b.ts",
    "./dist/linux.binary.b.ts"
  ],
  ignore: [],
  checkFormat: false,
  checkTests: false,
  checkInstallation: false,
  check: true
}
