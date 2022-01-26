
import type { AppOptions } from "../../mod.ts";

export default <AppOptions> {
  name: "superapp",
  build: {
    entry: "./demo.ts",
    assets: "./renderer"
  },
};