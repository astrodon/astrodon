import { Builder } from "../../modules/astrodon-build/mod.ts";
import manifest from "./astrodon.config.ts";

const builder = new Builder(manifest);

await builder.compile();

await builder.makeInstaller();