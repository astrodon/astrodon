import { Builder } from "../../modules/astrodon-build/mod.ts";
import manifest from "./astrodon.config.ts";

const builder = new Builder(manifest);

await builder.compile();

// Icons are missing :)
// await builder.makeInstaller();
