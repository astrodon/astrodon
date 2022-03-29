import { Builder } from "../../modules/astrodon-build/mod.ts";
import config from "./astrodon.config.ts";

const builder = new Builder({ config });

await builder.compile();

await builder.makeInstaller();
