import { compress } from "https://raw.githubusercontent.com/trgwii/bundler/ebddf1f8fdb933d7b69bb44920bcba48853a7039/compress.ts";
import { tsBundle } from "https://raw.githubusercontent.com/trgwii/bundler/ebddf1f8fdb933d7b69bb44920bcba48853a7039/tsBundle.ts";
import { ast } from "https://raw.githubusercontent.com/trgwii/bundler/ebddf1f8fdb933d7b69bb44920bcba48853a7039/ast.ts";
import { PassThrough } from "https://raw.githubusercontent.com/trgwii/bundler/ebddf1f8fdb933d7b69bb44920bcba48853a7039/passthrough.ts";

const outOptions: Deno.OpenOptions = {
  create: true,
  write: true,
  truncate: true,
};

const bundle = async (input: string, output: string) => {
  const ps = new PassThrough();
  const compressor = compress(input, ps, console.log);
  const outFile = await Deno.open(output, outOptions);
  const bundler = tsBundle(ps, outFile, await ast(input));
  await compressor;
  ps.close();
  await bundler;
  outFile.close();
};

const binaries = [
  { input: './target/debug/degui.dll', output:  'windows.binary.b.ts' },
  { input: './target/release/libdegui.so', output:  'linux.binary.b.ts' }
]

await Promise.all(binaries.map(e => {
  bundle(e.input, e.output)
}))