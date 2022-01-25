import axiod from "https://deno.land/x/axiod/mod.ts";
import { exec } from "https://deno.land/x/exec/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import { exists } from "https://deno.land/std/fs/mod.ts";
import { Logger } from "../utils.ts";
import "https://deno.land/x/dotenv/load.ts";

// List of official templates

const availableTemplates = {
  default: 'https://github.com/astrodon/astrodon-default-template',
  vue: 'https://github.com/astrodon/astrodon-vue-template',
  react: 'https://github.com/astrodon/astrodon-react-template',
  svelte: 'https://github.com/astrodon/astrodon-svelte-template',
}

interface InitOptions {
  template: keyof typeof availableTemplates;
  name: string;
}

const directory = Deno.cwd();

const initLogger = new Logger("init");

export const init = async (options: InitOptions) => {
  const { template: templateUrl, name } = options;
  const endPath = join(directory, name);

  // We check if the directory exists before cloning to handle with our own error
  if (await exists(endPath)) return initLogger.log(`Directory ${endPath} already exists.`, "error");

  // Check if template is from a remote unofficial repository
  if (templateUrl.startsWith("http")) {
    try {
      const formattedUrl = templateUrl.endsWith("/")
        ? templateUrl.slice(0, -1)
        : templateUrl;
      const { data: templateManifest } = await axiod.get(
        `${formattedUrl}/raw/main/template_manifest.json`,
        // deno-lint-ignore no-explicit-any
      ) as any;      

      // Checks if the template is has a valid manifest
      if (!(templateManifest.type === "astrodon")) return initLogger.log(
          `The url provided is not an astrodon template.`,
          "error",
        );
      // start cloning
      initLogger.log("Astrodon template detected on supported Git platform, starting download...");
      await executeClone(templateUrl, endPath);
      return success(name)
    } catch (_e) {
      // Ends the process if the template is not from a supported Git platform
      return initLogger.log(
        "This is not a valid repo for an Astrodon template, aborting...",
        "error",
      );
    }
  }

  // If the template is from the official registry:

  if (!(templateUrl in availableTemplates)) return initLogger.log(
    `${templateUrl} is not an official astrodon template.`,
    "error",
  );

  const template = availableTemplates[templateUrl];

  try {
    await executeClone(template, endPath);
  } catch (_e) {
    return initLogger.log(
      "This is not a valid repo for an Astrodon template, aborting...",
      "error",
    );
  }
  success(name);
};

// Clone execution: by now we depend on git

const executeClone = async (templateUrl: string, endPath: string) => {
  await exec(`git clone ${templateUrl} ${endPath}`);
  await Deno.remove(join(endPath, "template_manifest.json"));
}

const success = (name: string) => {
  initLogger.log("Template initialization succeed.", "success");
  initLogger.log(`\ncd ${name} \ndeno run -A --unstable mod.ts`);
};