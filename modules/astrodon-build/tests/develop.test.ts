import { Develop } from "../mod.ts";
import { AppConfig } from "../../astrodon/mod.ts";
import {
  dirname,
  fromFileUrl,
  join,
} from "https://deno.land/std@0.131.0/path/mod.ts";
import { assertEquals } from "https://deno.land/std@0.131.0/testing/asserts.ts";

import { readline } from "https://deno.land/x/readline@v1.1.0/mod.ts";
import messages from "./messages.ts";
const __dirname = dirname(fromFileUrl(import.meta.url));

const config: AppConfig = {
  entry: join(__dirname, "./mod.ts"),
  dist: join(__dirname, "./dist"),
  info: {
    name: "astrodon-build",
    version: "0.0.1",
    id: "astrodon-build",
    longDescription: "Astrodon Build",
    shortDescription: "Astrodon Build",
    copyright: "",
    author: "",
    homepage: "",
    icon: [],
    resources: [],
  },
};

Deno.test("develop", async () => {
  const develop = new Develop(config);
  await develop.run();
});
