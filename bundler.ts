import { ast, compress, exists, PassThrough, tsBundle } from "./deps.ts";

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

const outOptions: Deno.OpenOptions = {
  create: true,
  write: true,
  truncate: true,
};

/*
 * Compress the shared libraries
 */
export const bundle = async (input: string, output: string) => {
  const ps = new PassThrough();
  const compressor = compress(input, ps, console.log);
  const outFile = await Deno.open(output, outOptions);
  const bundler = tsBundle(ps, outFile, await ast(input));
  await compressor;
  ps.close();
  await bundler;
  outFile.close();
};

await Deno.mkdir("./dist", { recursive: true });

await Promise.all(binaries.map(async (e) => {
  if (await exists(e.input)) {
    await bundle(e.input, e.output);
  }
}));
