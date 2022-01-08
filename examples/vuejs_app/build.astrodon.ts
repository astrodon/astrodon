import { dirname, fromFileUrl, join } from "https://deno.land/std/path/mod.ts";
const __dirname = dirname(fromFileUrl(import.meta.url));
import { Builder } from "../../mod.ts";

const builder = new Builder(__dirname);

await builder.preBundle("mod.ts");

await builder.compile(join(__dirname, "vuejs"), {
  noCheck: true,
});