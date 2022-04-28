import { Develop } from "../../astrodon-build/mod.ts";
import { AppConfig } from "../../astrodon/mod.ts";
import { resolve } from "https://deno.land/std@0.122.0/path/mod.ts";
import { Logger } from "../utils.ts";
import { exists } from "../deps.ts";

export interface RunOptions {
  config: string;
  allowAll?: boolean;
  allowEnv?: string[];
  allowHrtime?: boolean;
  allowNet?: string[];
  allowFFI?: string[];
  allowRead?: string[];
  allowWrite?: string[];
  allowRun?: string[];
  prompt?: boolean;
}

const runLogger = new Logger("run");

export async function run(options: RunOptions, file?: string) {
  let projectInfo: AppConfig = {
    entry: "",
    dist: "",
    info: {
      name: "Astrodon",
      id: "Astrodon",
      copyright: "2022",
      version: "0.0.0",
      author: "",
      shortDescription: "",
      longDescription: "",
      homepage: "",
      icon: [],
      resources: [],
      permissions: {
        allow_hrtime: true,
        prompt: false,
      },
      unstable: false,
    },
  };

  if (file && !(await exists(options.config))) {
    // check in the future if we can fetch the config from remote
    projectInfo.entry = file;
  } else {
    // Assign url checking if it is local or remote
    const filePath = options.config.startsWith("http")
      ? options.config
      : `file://${resolve(Deno.cwd(), options.config)}`;

    // Get the config file path
    const configPath = new URL(filePath).href;

    // Try to import the config file
    try {
      const { default: loadedProjectInfo }: { default: AppConfig } =
        await import(
          configPath
        );

      projectInfo = loadedProjectInfo;
      projectInfo.entry = file ? file : projectInfo.entry;
    } catch (_e) {
      runLogger.error(`Could not find ${options.config}`);
      return;
    }
  }

  // if it isn't undefined or false, we return an empty array to set the permissions to true

  const placeAllowAll = options.allowAll ? [] : false;

  /* 
  * Set the permissions:
  * If the permissions are defined in the config file, we overwrite them because cli hierachy is higher
  */

  projectInfo.info.permissions = Object.assign(
    projectInfo.info.permissions || {},
    {
      allow_env: placeAllowAll || options.allowEnv,
      allow_net: placeAllowAll || options.allowNet,
      allow_ffi: placeAllowAll || options.allowFFI,
      allow_read: placeAllowAll || options.allowRead,
      allow_run: placeAllowAll || options.allowRun,
      allow_write: placeAllowAll || options.allowWrite,
      prompt: Boolean(options.allowAll) || Boolean(options.prompt),
      allow_hrtime: Boolean(options.allowAll) || Boolean(options.allowHrtime),
    },
  );

  const dev = new Develop({
    config: projectInfo,
    logger: runLogger,
  });

  await dev.run();
}
