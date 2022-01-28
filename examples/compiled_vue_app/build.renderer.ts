
import { dirname, join, fromFileUrl, basename } from 'https://deno.land/std/path/mod.ts';
const __dirname = dirname(fromFileUrl(import.meta.url));
import { copy } from 'https://deno.land/std/fs/copy.ts';
import { ensureDir } from 'https://deno.land/std/fs/mod.ts';
import { rollup } from "https://deno.land/x/drollup@2.58.0+0.20.0/mod.ts";
import { css } from "https://deno.land/x/drollup@2.58.0+0.20.0/plugins/css/mod.ts";

//copy index.html and main.css to renderers dist folder

const assets = [
  join(__dirname, './renderer/src/index.html'),
];

await Promise.all(
  assets.map(async (asset) => {
    const dest = join(__dirname, './renderer/dist', Deno.build.os == 'windows' ? asset.split('\\').pop() as string : asset.split('/').pop() as string);  
    await ensureDir(dirname(dest));
    if (!basename(asset).includes('.html')) return await copy(asset, dest, {
      overwrite: true,
    });
    const assetContents = await Deno.readTextFile(asset);
    await Deno.writeTextFile(dest, assetContents.replaceAll('type="module"', ''));
  })
);

const options = {
  input: "./renderer/src/main.js",
  output: {
    dir: "./renderer/dist",
    format: "iife" as const,
  },
  plugins: [
    css({
      output: 'main.css',
    }),  
  ],
};

const bundle = await rollup(options);
await bundle.write(options.output);
await bundle.close();

