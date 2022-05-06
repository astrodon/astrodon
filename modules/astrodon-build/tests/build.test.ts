import { Builder } from "../mod.ts";
import { OSNames } from "../../astrodon/mod.ts";
import { fileFormat } from "../../astrodon-manager/mod.ts";
import { assertEquals } from "https://deno.land/std@0.131.0/testing/asserts.ts";
import { join } from "https://deno.land/std@0.131.0/path/mod.ts";
import { config, driver } from "./develop.test.ts";

const platforms: OSNames[] = ["windows", "linux", "darwin"];

Deno.test({
  name: "Cross-compiling using remote binaries",
  fn: async (t) => {
    await t.step("Emit file", async (t) => {
      for (const os of platforms) {
        await t.step(os, async () => {
          const binName = `${config.name}_${os}${fileFormat(os)}`;
          const binPath = join(config.build?.output || "./dist", binName);
          const builder = new Builder({ config, os, useCwd: false });
          await builder.compile();
          const exists = await Deno.stat(binPath);
          assertEquals(exists.isFile, true);
        });
      }
    });
    const os = Deno.build.os;
    await t.step(`Check app health for OS ${os}`, async (t) => {
      await t.step(os, async () => {
        const binName = `${config.name}_${os}${fileFormat(os)}`;
        const binPath = join(config.build?.output || "./dist", binName);
        if (Deno.build.os != "windows") {
          await Deno.chmod(binPath, 0o755);
        }
        const process = Deno.run({
          cmd: [binPath],
        });
        process.status();
        await driver();
        process?.kill("SIGTERM");
        process?.close();
      });
    });
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
