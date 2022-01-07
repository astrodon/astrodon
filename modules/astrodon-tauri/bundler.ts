import { Builder } from "../astrodon-build/mod.ts";
import { ensureDir, exists } from "../astrodon/deps.ts";

const binaries = [
  {
    input: "./target/debug/astrodon.dll",
    output: "./dist/windows.binary.b.ts",
  },
  {
    input: "./target/release/libastrodon.so",
    output: "./dist/linux.binary.b.ts",
  },
];

await ensureDir("./dist");

await Promise.all(binaries.map(async (e) => {
  if (await exists(e.input)) {
    await Builder.packageAssets(e.input, e.output);
  }
}));
