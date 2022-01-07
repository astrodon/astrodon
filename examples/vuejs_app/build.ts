import { dirname, fromFileUrl, join } from "https://deno.land/std/path/mod.ts";
const __dirname = dirname(fromFileUrl(import.meta.url));
import { Builder } from "../../mod.ts";

console.log("Packaging front-end");

const builder = new Builder(__dirname);

await builder.preBundle("mod.ts");

await Builder.packageAssets(
  join(__dirname, "src"),
  join(__dirname, "dist/snapshot.b.ts"),
);

await builder.compile(join(__dirname, "vuejs"), {
  noCheck: true,
});
