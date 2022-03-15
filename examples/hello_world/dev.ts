import { Develop } from "../../modules/astrodon-build/mod.ts";
import manifest from "./astrodon.config.ts";

const develop = new Develop(manifest);

await develop.run();
