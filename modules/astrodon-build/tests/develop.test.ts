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

// Issue: There's no way to test the runtime because it blocks the process, ideally we should be able to get at least the output of the execution.

Deno.test("develop", async () => {
  const develop = new Develop(config);
  develop.run().then(() => console.log("running"));
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const ws = new WebSocket("ws://localhost:8000");
  ws.onmessage = (ev) => {
    const msg = ev.data.toString();
    console.log(msg);
    if (msg === messages.success) {
      ws.close();
    }
  }
});
