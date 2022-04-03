import { Develop } from "../../modules/astrodon-build/mod.ts";
import config from "./astrodon.config.ts";

const develop = new Develop({ config });

await develop.run();
