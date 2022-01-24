import { unpackAssets } from "../../astrodon-build/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import { green, red, yellow } from "https://deno.land/std/fmt/colors.ts";
import { ensureDir } from "https://deno.land/std/fs/mod.ts";
import meta from "../../../astrodon.meta.ts";
import "https://deno.land/x/dotenv/load.ts";

interface States {
  success: string;
  error: string;
}

const homepage = Deno.env.get("CUSTOM_HOMEPAGE") || meta.homepage;
const directory = Deno.cwd();

const logger = (message: string, type: keyof States = "success") => {
  const states = {
    success: green(`✔`),
    error: red(`✖`),
  };
  console.log(`${states[type]} ${yellow("[astrodon init]:")} ${message}`);
};

export const init = async (options: Record<string, string>) => {
  const { template: templateUrl, name } = options;
  logger(`Initializing template from ${templateUrl}`);
  if (templateUrl.endsWith(".template.b.ts")) {
    try {
      const { default: template } = await import(templateUrl);
      const endPath = join(directory, name);
      await ensureDir(endPath);
      await unpackAssets(template, endPath);
    } catch (_e) {
      logger(
        `Failed to fetch template from template url, are you sure this template exists?`,
        "error",
      );
    }
  }
  if (
    templateUrl.startsWith("https://github.com") ||
    templateUrl.startsWith("http://github.com") ||
    templateUrl.startsWith("https://gitlab.com") ||
    templateUrl.startsWith("http://gitlab.com") ||
    templateUrl.startsWith("https://bitbucket.com") ||
    templateUrl.startsWith("http://bitbucket.com")
  ) {
    try {
      const { json } = await fetch(
        new URL("/raw/main/template_manifest.json", templateUrl).href,
      );
      const templateManifest = await json();
      if (templateManifest.type === "astrodon") {
        return logger(
          "Astrodon template detected on supported Git platform, starting download...",
        );
      }
      Deno.run({
        cmd: ["git", "clone", templateUrl, name],
        cwd: directory,
      });
    } catch (_e) {
      logger("This is not a valid Astrodon template, aborting", "error");
      return;
    }
  }
  if (
    !templateUrl.startsWith("http") && !templateUrl.endsWith(".template.b.ts")
  ) {
    const templateInMonorepo =
      `${homepage}/raw/main/modules/astrodon-templates/${templateUrl}/${templateUrl}.template.b.ts`;
    try {
      const { default: template } = await import(templateInMonorepo);
      const endPath = join(directory, name);
      await ensureDir(endPath);
      await unpackAssets(template, endPath);
    } catch (_e) {
      logger(
        `Failed to fetch template from the official template registry, this?`,
        "error",
      );
      return;
    }
  }
  logger("Template initialized successfully", "success");
};
