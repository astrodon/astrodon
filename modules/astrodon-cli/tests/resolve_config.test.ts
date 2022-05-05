import { DEFAULT_CONFIG, resolveConfiguration } from "../commands/run.ts";
import { serve } from "https://deno.land/std@0.137.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.137.0/http/file_server.ts";
import { assertEquals } from "https://deno.land/std@0.137.0/testing/asserts.ts";

const PORT = 3000;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const handler = async (req: Request) => {
  return await serveDir(req, { fsRoot: Deno.cwd() });
};

Deno.test("Resolve remote configuration", async () => {
  const controller = new AbortController();
  serve(handler, { port: PORT, signal: controller.signal });
  await delay(1000);
  const options = {
    config: `http://localhost:${PORT}/modules/astrodon-cli/tests/astrodon.config.ts`,
  };
  const config = await resolveConfiguration(options);
  controller.abort();
  assertEquals(config?.name, DEFAULT_CONFIG.name);
  await delay(2000);
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
