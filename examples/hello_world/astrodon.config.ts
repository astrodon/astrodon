import {
  dirname,
  fromFileUrl,
  join,
} from "https://deno.land/std@0.122.0/path/mod.ts";
import type { IAppConfig } from "../../modules/astrodon/mod.ts";

const __dirname = dirname(fromFileUrl(import.meta.url));

export default <IAppConfig> {
  name: "superapp",
  id: "my.superapp",
  version: "0.1.0",
  main: join(__dirname, "demo.ts"),
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
    output: join(__dirname, "dist"),
    resources: [],
    icons: [],
  },
};
