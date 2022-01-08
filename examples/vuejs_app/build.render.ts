import { dirname, fromFileUrl, join } from "https://deno.land/std/path/mod.ts";
const __dirname = dirname(fromFileUrl(import.meta.url));
import { Builder } from "../../mod.ts";

const { packageAssets } = Builder

console.log("Packaging front-end");

await packageAssets(
  join(__dirname, "src"),
  join(__dirname, "dist/snapshot.b.ts"),
);
