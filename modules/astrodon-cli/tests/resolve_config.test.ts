import { DEFAULT_CONFIG, resolveConfiguration } from "../commands/run.ts";
import { serve } from "https://deno.land/std@0.137.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.137.0/http/file_server.ts";
import { assertEquals } from "https://deno.land/std@0.137.0/testing/asserts.ts";
import {
  dirname,
  fromFileUrl,
} from "https://deno.land/std@0.137.0/path/mod.ts";
const __dirname = dirname(fromFileUrl(import.meta.url));

const port = 3000;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const handler = async (req: Request) => {
  return await serveDir(req, { fsRoot: __dirname });
};

Deno.test("Resolve remote configuration", async () => {
  const controller = new AbortController();
  serve(handler, { port, signal: controller.signal });
  await delay(3000);
  const options = {
    config: `http://localhost:${port}/astrodon.config.ts`,
  };
  const config = await resolveConfiguration(options);
  controller.abort();
  assertEquals(config?.name, DEFAULT_CONFIG.name);
});

Deno.test({
  name: "Resolve local configuration",
  fn: async () => {
    const options = {
      config: "./modules/astrodon-cli/tests/astrodon.config.ts",
    };
    const config = await resolveConfiguration(options);
    assertEquals(config?.name, DEFAULT_CONFIG.name);
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
