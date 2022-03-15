import {
  dirname,
  fromFileUrl,
  join,
} from "https://deno.land/std@0.122.0/path/mod.ts";
import type { AppConfig } from "../../modules/astrodon/mod.ts";

const __dirname = dirname(fromFileUrl(import.meta.url));

export default <AppConfig> {
  entry: join(__dirname, "demo.ts"),
  dist: join(__dirname, "dist"),
  info: {
    name: "superapp",
    id: "my.superapp",
    version: "0.1.0",
    author: "Marc Espín",
    shortDescription: "Some description",
    longDescription: "Moooore description!!",
    homepage: "google.com",
    copyright: "2022",
    icon: [],
    resources: [],
  },
};
