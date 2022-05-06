import type { IAppConfig } from "../../modules/astrodon/mod.ts";

export default <IAppConfig> {
  name: "superapp",
  id: "my.superapp",
  version: "0.1.0",
  main: "./demo.ts",
  author: "Marc Espín",
  shortDescription: "Some description",
  longDescription: "Moooore description!!",
  homepage: "google.com",
  copyright: "2022",
  permissions: {
    allow_hrtime: true,
    prompt: true,
    allow_net: [],
  },
  build: {
    output: "./dist",
    resources: [],
    icons: [],
  },
};
