//Bundling for distribution
import { bundle } from "../../bundler.ts";
import { dirname, fromFileUrl, join } from "https://deno.land/std/path/mod.ts";
const __dirname = dirname(fromFileUrl(import.meta.url));

console.log("Packaging front-end");
await Deno.mkdir("./dist", { recursive: true });
await bundle(join(__dirname, "src"), join(__dirname, "dist/snapshot.b.ts"));
