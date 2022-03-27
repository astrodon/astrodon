import { Builder } from "../mod.ts";
import { OSNames } from "../../astrodon/mod.ts";
import { fileFormat } from "../../astrodon-manager/mod.ts";
import { assertEquals } from "https://deno.land/std@0.131.0/testing/asserts.ts";
import { join } from "https://deno.land/std@0.131.0/path/mod.ts";
import { config, driver } from "./develop.test.ts";

const platforms: OSNames[] = ["windows", "linux", "darwin"];
Deno.test({
  name: "Compile",
  fn: async (t) => {
    await t.step("Emit file", async (t) => {
      for (const os of platforms) {
        await t.step(os, async () => {
          const binName = `${config.info.name}_${os}${fileFormat(os)}`;
          console.log(join(config.dist, binName));
          const builder = new Builder(config, undefined, os);
          await builder.compile();
          const exists = await Deno.stat(join(config.dist, binName));
          assertEquals(exists.isFile, true);
        });
      }
    });
    await t.step("Check app health", async (t) => {
      const os = Deno.build.os;
      if (platforms.includes(os)) {
        await t.step(os, async () => {
          const binName = `${config.info.name}_${os}${fileFormat(os)}`;
          const process = Deno.run({
            cmd: [join(config.dist, binName)],
          });
          process.status();
          await driver();
          process?.kill("SIGTERM");
          process?.close();
        });
      }
    });
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
