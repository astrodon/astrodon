import { Develop } from "../../astrodon-build/mod.ts";
import { AppConfig } from "../../astrodon/mod.ts";
import { resolve } from "https://deno.land/std@0.122.0/path/mod.ts";
import { Logger } from "../utils.ts";

export interface RunOptions {
  config: string;
}

const runLogger = new Logger("run");

export async function run(options?: RunOptions, file?: string) {

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

  if (file) {
    projectInfo.entry = file;
  } else if (options) {

    // Assume it's a local file by default
    let filePath = `file://${resolve(Deno.cwd(), options.config)}`;

    if(options.config.startsWith("http")){
      filePath = options.config;
    }

    const configPath = new URL(filePath).href;

    try {
      const { default: loadedProjectInfo }: { default: AppConfig } = await import(
        configPath
      );
  
      projectInfo = loadedProjectInfo;
    } catch(_e){
      runLogger.error(`Could not find ${options.config}`)
      return;
    }
  }

  const dev = new Develop({
    config: projectInfo,
    logger: runLogger,
  });

  await dev.run();
}
