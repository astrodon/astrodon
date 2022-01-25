import axiod from "https://deno.land/x/axiod/mod.ts";
import { unpackAssets } from "../../astrodon-build/mod.ts";
import { exec } from "https://deno.land/x/exec/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import { ensureDir, exists } from "https://deno.land/std/fs/mod.ts";
import {
  generateRandomHashByTime,
  isSupportedGitPlatform,
  Logger,
} from "../utils.ts";
import meta from "../../../astrodon.meta.ts";
import "https://deno.land/x/dotenv/load.ts";

const homepage = Deno.env.get("CUSTOM_HOMEPAGE") || meta.homepage;
const directory = Deno.cwd();

const initLogger = new Logger("init");

export const init = async (options: Record<string, string>) => {
  const { template: templateUrl, name } = options;
  const endPath = join(directory, name);
  if (await exists(endPath)) {
    initLogger.log(`${name} folder already exists, aborting.`, "error");
    return;
  }
  initLogger.log(`Initializing template from ${templateUrl}`);
  if (templateUrl.endsWith(".template.b.ts")) {
    try {
      await exec(`deno cache --reload=${templateUrl}`);
      const { default: template } = await import(
        `${templateUrl}#${generateRandomHashByTime()}`
      );
      await ensureDir(endPath);
      await unpackAssets(template, endPath);
      const templateName = templateUrl.split("/").pop() as string;
      await Deno.remove(join(endPath, templateName));
    } catch (_e) {
      initLogger.log(
        `Failed to fetch template from template url, are you sure this template exists?`,
        "error",
      );
      return;
    }
  }
  if (
    !templateUrl.endsWith(".template.b.ts") &&
    isSupportedGitPlatform(templateUrl)
  ) {
    try {
      const formattedUrl = templateUrl.endsWith("/")
        ? templateUrl.slice(0, -1)
        : templateUrl;
      const templateManifest = await axiod.get(
        `${formattedUrl}/raw/main/template_manifest.json`,
      // deno-lint-ignore no-explicit-any
      ) as any;
      if (templateManifest.type == "astrodon") {
        return initLogger.log(
          "Astrodon template detected on supported Git platform, starting download...",
        );
      }
      await exec(`git clone ${templateUrl} ${endPath}`);
      const templateName = `${templateManifest.name}.template.b.ts`;
      await Deno.remove(join(endPath, templateName));
    } catch (_e) {
      initLogger.log(
        "This is not a valid repo for an Astrodon template, aborting...",
        "error",
      );
      return;
    }
  }
  if (
    !templateUrl.startsWith("http") && !templateUrl.endsWith(".template.b.ts")
  ) {
    const templateInMonorepo =
      `${homepage}/raw/main/modules/astrodon-templates/${templateUrl}/${templateUrl}.template.b.ts#${generateRandomHashByTime()}`;
    try {
      await exec(`deno cache --reload=${templateInMonorepo}`);
      const { default: template } = await import(templateInMonorepo);
      await ensureDir(endPath);
      await unpackAssets(template, endPath);
      await Deno.remove(join(endPath, `${templateUrl}.template.b.ts`));
    } catch (_e) {
      initLogger.log(
        `Failed to fetch template from the official template registry, aborting...`,
        "error",
      );
      return;
    }
  }
  await Deno.remove(join(endPath, "template_manifest.json"));
  initLogger.log("Template initialization succeed.", "success");
  initLogger.log(`
cd ${name}
deno run -A --unstable mod.ts`);
};
