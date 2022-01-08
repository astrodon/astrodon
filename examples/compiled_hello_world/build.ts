import { Builder } from "../../mod.ts";
import { dirname, fromFileUrl, join } from "https://deno.land/std/path/mod.ts";
const __dirname = dirname(fromFileUrl(import.meta.url));

const builder = new Builder(__dirname);

await builder.preBundle("demo.ts");

await builder.compile(join(__dirname, "superapp"));
