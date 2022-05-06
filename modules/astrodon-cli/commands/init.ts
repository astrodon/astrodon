import {
  axiod,
  Confirm,
  exec,
  exists,
  Input,
  join,
  prompt,
  Select,
} from "../deps.ts";
import { Logger } from "../utils.ts";
import { IAppConfig } from "../../astrodon/mod.ts";

// List of official templates

const availableTemplates = {
  default: "https://github.com/astrodon/astrodon-default-template",
  vue: "https://github.com/astrodon/astrodon-vue-template",
  react: "https://github.com/astrodon/astrodon-react-template",
  svelte: "https://github.com/astrodon/astrodon-svelte-template",
};

export interface InitOptions {
  template: keyof typeof availableTemplates;
  name: string;
  yes: boolean;
}

const directory = Deno.cwd();

const initLogger = new Logger("init");

export const init = async (options: InitOptions) => {
  const promptResponse = !options.yes
    ? await prompt([{
      name: "name",
      message: "app name",
      type: Input,
      default: options.name,
    }, {
      name: "version",
      message: "version",
      type: Input,
      default: "1.0.0",
    }, {
      name: "short_description",
      message: "description",
      type: Input,
    }, {
      name: "template",
      message: "Select a template",
      type: Select,
      options: [...Object.keys(availableTemplates)],
      before: async (value, next) => {
        if (options.template && !availableTemplates[options.template]) {
          value.template = options.template;
          return await next("main");
        }
        await next();
      },
    }, {
      name: "main",
      message: "main entry point",
      type: Input,
      default: "mod.ts",
    }, {
      name: "homepage",
      message: "homepage",
      type: Input,
    }, {
      name: "author",
      message: "author",
      type: Input,
    }, {
      name: "copyright",
      message: "license",
      type: Select,
      options: ["MIT", "Apache-2.0", "BSD-3-Clause", "GPL-3.0", "LGPL-3.0"],
      default: "MIT",
    }, {
      name: "confirm",
      message: "Is this ok?",
      type: Confirm,
      before: async (value: Record<string, string | boolean>, next) => {
        initLogger.info(
          `about to write to ${
            join(directory, options.name, "astrodon.config.ts")
          }`,
        );
        initLogger.info(`Using ${value.template} template`);
        console.log(getAstrodonConfig(value as Record<string, string>));
        await next();
      },
      after: async ({ confirm }, next) => { // executed after like prompt
        if (confirm) {
          await next(); // run age prompt
        } else {
          Deno.exit(0);
        }
      },
    }])
    : getDefaultResponse(options);

  const { template: templateUri, name } = promptResponse;
  const endPath = join(directory, name as string);
  const templateUrl = templateUri as string;

  // If options.yes is true, we don't need to ask for confirmation

  if (options.yes) {
    initLogger
      .info(
        `about to write to ${
          join(directory, name as string, "astrodon.config.ts")
        }`,
      );
    initLogger.info(`Using ${templateUri} template`);
    console.log(getAstrodonConfig(promptResponse as Record<string, string>));
  }

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
      await writeConfig(
        getAstrodonConfig(promptResponse as Record<string, string>),
      );
      return success(name as string);
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

  const template =
    availableTemplates[templateUrl as keyof typeof availableTemplates];

  try {
    await executeClone(template, endPath);
    await writeConfig(
      getAstrodonConfig(promptResponse as Record<string, string>),
    );
  } catch (_e) {
    return initLogger.error(
      "This is not a valid repo for an Astrodon template, aborting...",
    );
  }
  success(name as string);
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

// Get astrodon.config.ts from template

const getAstrodonConfig = (
  value: Record<string, string>,
): IAppConfig => ({
  name: value.name,
  id: `com.${value.name.toLowerCase()}.astrodon`,
  main: value.main,
  version: value.version,
  shortDescription: value.short_description,
  longDescription: "",
  homepage: value.homepage,
  author: value.author,
  copyright: value.copyright,
  build: {
    output: join(value.name, "dist"),
    icons: [],
    resources: [],
  },
});

// Default response: if no options are provided

const getDefaultResponse = (options: InitOptions): Record<string, string> => ({
  name: options.name,
  version: "1.0.0",
  short_description: "",
  template: options.template,
  main: "mod.ts",
  homepage: "",
  author: "",
  copyright: "MIT",
});

//

const writeConfig = async (config: IAppConfig) => {
  const configFile = new TextEncoder().encode(
    `export default ${JSON.stringify(config, null, 2)}`,
  );
  await Deno.writeFile(
    join(directory, config.name, "astrodon.config.ts"),
    configFile,
  );
};
