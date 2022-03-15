import { axiod, exec, exists, join } from "../deps.ts";
import { Logger } from "../utils.ts";

// List of official templates

const availableTemplates = {
  default: "https://github.com/astrodon/astrodon-default-template",
  vue: "https://github.com/astrodon/astrodon-vue-template",
  react: "https://github.com/astrodon/astrodon-react-template",
  svelte: "https://github.com/astrodon/astrodon-svelte-template",
};

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
  if (await exists(endPath)) {
    return initLogger.error(`Directory ${endPath} already exists.`);
  }

  // Check if template is from a remote unofficial repository
  if (templateUrl.startsWith("http")) {
    try {
      const formattedUrl = templateUrl.endsWith("/")
        ? templateUrl.slice(0, -1)
        : templateUrl;

      // For checking if the template is valid we pre-fetch the manifest to prevent cloning from untrusted repositories
      const { data: templateManifest } = await axiod.get(
        `${formattedUrl}/raw/main/template_manifest.json`,
        // deno-lint-ignore no-explicit-any
      ) as any;

      // Checks if the template is has a valid manifest
      if (!(templateManifest.type === "astrodon")) {
        return initLogger.error(
          `The url provided is not an astrodon template.`,
        );
      }
      // start cloning
      initLogger.log(
        "Astrodon template detected on supported Git platform, starting download...",
      );
      await executeClone(templateUrl, endPath);
      return success(name);
    } catch (_e) {
      // Ends the process if the template is not from a supported Git platform
      return initLogger.error(
        "This is not a valid repo for an Astrodon template, aborting...",
      );
    }
  }

  // If the template is from the official registry:

  if (!(templateUrl in availableTemplates)) {
    return initLogger.error(
      `${templateUrl} is not an official astrodon template.`,
    );
  }

  const template = availableTemplates[templateUrl];

  try {
    await executeClone(template, endPath);
  } catch (_e) {
    return initLogger.error(
      "This is not a valid repo for an Astrodon template, aborting...",
    );
  }
  success(name);
};

// Clone execution: by now we depend on git

const executeClone = async (templateUrl: string, endPath: string) => {
  await exec(`git clone ${templateUrl} ${endPath}`);
  await Deno.remove(join(endPath, "template_manifest.json"));
};

const success = (name: string) => {
  initLogger.log("Template initialization succeed.");
  initLogger.log(`\ncd ${name} \ndeno run -A --unstable mod.ts`);
};
