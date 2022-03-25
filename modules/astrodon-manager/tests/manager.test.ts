import { buildModes, getBinaryInfo, getBinaryPath } from "../mod.ts";
import { OSNames } from "../../astrodon/mod.ts";
import { assertEquals } from "https://deno.land/std@0.131.0/testing/asserts.ts";

const osArray: OSNames[] = ["windows", "darwin", "linux"];
const modes: buildModes[] = ["standalone", "development"];

Deno.test("Remote binary existence", async (t) => {
  for (const os of osArray) {
    await t.step(os, async (t) => {
      for (const mode of modes) {
        await t.step(mode, async () => {
          const [url] = getBinaryInfo(os, mode);
          const { status, body } = await fetch(url);
          await body?.cancel();
          assertEquals(status, 200);
        });
      }
    });
  }
});

Deno.test("Local binary existence", async (t) => {
  for (const os of osArray) {
    await t.step(os, async (t) => {
      for (const mode of modes) {
        await t.step(mode, async () => {
          const binaryPath = await getBinaryPath(mode, undefined, os);
          const exists = await Deno.stat(binaryPath);
          assertEquals(exists.isFile, true);
          if (exists.isFile) await Deno.remove(binaryPath);
        });
      }
    });
  }
});
