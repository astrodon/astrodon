import { DEFAULT_CONFIG, resolveConfiguration } from "../commands/run.ts";
import { serve } from "https://deno.land/std@0.137.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.137.0/http/file_server.ts";
import { assertEquals } from "https://deno.land/std@0.137.0/testing/asserts.ts";
import { join } from "../deps.ts";
import {
  afterAll,
  beforeAll,
  describe,
  it,
} from "https://deno.land/std@0.138.0/testing/bdd.ts";

const PORT = 3000;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const handler = async (req: Request) => {
  return await serveDir(req, { fsRoot: Deno.cwd() });
};

describe("Remote configuration", () => {

  const controller = new AbortController();
  
  beforeAll(async () => {
    serve(handler, { port: PORT, signal: controller.signal });
    await delay(1000);
  })

  it({
    name: "Resolve configuration with remote config", 
    fn: async () => {
      const options = {
        config: `http://localhost:${PORT}/modules/astrodon-cli/tests/astrodon.config.ts`,
      };

      const config = await resolveConfiguration(options);
      assertEquals(config?.name, DEFAULT_CONFIG.name);
    },
    sanitizeResources: false,
    sanitizeOps: false,
  });
  
  it({
    name: "Resolve configuration with remote file", 
    fn: async () => {
      const file = `http://localhost:${PORT}/modules/astrodon-cli/tests/doesnt_exist.ts`;

      const config = await resolveConfiguration({}, file);
      assertEquals(config?.main, file);
    },
    sanitizeResources: false,
    sanitizeOps: false,
  });

  afterAll(async () => {
    controller.abort();
    await delay(1000);
  })

})

describe("Local configuration", () => {
  it({
    name: "Resolve local configuration without file",
    fn: async () => {
      const options = {
        config: "./modules/astrodon-cli/tests/astrodon.config.ts",
      };

      const config = await resolveConfiguration(options);
      assertEquals(config?.main, join(Deno.cwd(), "./modules/astrodon-cli/tests/doesnt_exist.ts"));
    },
    sanitizeResources: false,
    sanitizeOps: false,
  });
    
  it({
    name: "Resolve local configuration with config and file",
    fn: async () => {
      const options = {
        config: "./modules/astrodon-cli/tests/astrodon.config.ts",
      };

      const config = await resolveConfiguration(options,  "./modules/astrodon-cli/tests/hello_world.ts");
      assertEquals(config?.main, join(Deno.cwd(), "./modules/astrodon-cli/tests/hello_world.ts"));
    },
    sanitizeResources: false,
    sanitizeOps: false,
  });
  
  
  it({
    name: "Resolve local configuration with only the file",
    fn: async () => {
      const config = await resolveConfiguration({}, "./modules/astrodon-cli/tests/hello_world.ts");
      assertEquals(config?.main, join(Deno.cwd(), "./modules/astrodon-cli/tests/hello_world.ts"));
    },
    sanitizeResources: false,
    sanitizeOps: false,
  });

  it({
    name: "Not resolve configuration without config or file",
    fn: async () => {
      const config = await resolveConfiguration({});
      assertEquals(config, null);
    },
    sanitizeResources: false,
    sanitizeOps: false,
  });
})

