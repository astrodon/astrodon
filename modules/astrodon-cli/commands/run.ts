import { Develop } from "../../astrodon-build/mod.ts";
import { IAppConfig } from "../../astrodon/mod.ts";
import { DenoPermissions, Logger, mergeDenoPermissions } from "../utils.ts";
import { dirname, fromFileUrl, isAbsolute, join, resolve } from "../deps.ts";

export type RunOptions = DenoPermissions & {
  config?: string;
};

// TODO(marc2332): The default config could inherit some env values such as: user -> author, year -> year
const DEFAULT_CONFIG: IAppConfig = {
  name: "Astrodon",
  id: "Astrodon",
  main: "",
  copyright: "2022",
  version: "0.0.0",
  author: "",
  shortDescription: "",
  longDescription: "",
  homepage: "",
  permissions: {
    allow_hrtime: false,
    prompt: false,
  },
  unstable: false,
  build: {
    output: "",
    icons: [],
    resources: [],
  },
};

const runLogger = new Logger("run");

async function resolveConfiguration(
  options: RunOptions,
  file?: string,
): Promise<IAppConfig | null> {
  // Default Local path config
  let configFile = `file://${
    resolve(Deno.cwd(), dirname(file || ""), "astrodon.config.ts")
  }`;

  // Check if the user has provided a config file which is a local path
  // And if it isn't an absolute path we will resolve it
  if (file && !file?.startsWith("http")) {
    file = isAbsolute(file) ? file : resolve(Deno.cwd(), file);
  }

  if (options.config?.startsWith("http")) {
    // Custom HTTP path config
    configFile = options.config;
  } else if (file?.startsWith("http")) {
    // Default HTTP path config
    const fileUrl = new URL(file);
    const { origin, pathname } = fileUrl;
    const remoteDirname = dirname(pathname);
    configFile = `${origin}${remoteDirname}/astrodon.config.ts`;
  } else if (options.config) {
    // Custom Local path config
    configFile = `file://${
      resolve(Deno.cwd(), dirname(file || ""), options.config)
    }`;
  }

  const { href: configPath } = new URL(configFile);

  try {
    // Fetch the configuration file
    const { default: projectInfo }: { default: IAppConfig } = await import(
      configPath
    );

    if (file) {
      // Use the custom file if specified
      return {
        ...projectInfo,
        main: file,
      };
    } else if (configFile.startsWith("http")) {
      // Use the relative entry file of the HTTP path config

      const remoteUrl = new URL(configFile);
      const remoteDirname = dirname(remoteUrl.pathname);
      const remoteFile = join(remoteDirname, projectInfo.main);

      remoteUrl.pathname = remoteFile;
      projectInfo.main = remoteUrl.toString();

      return projectInfo;
    } else {
      // Use the relative entry file of the Local path config
      const configPath = fromFileUrl(configFile);

      file = isAbsolute(configPath)
        ? options.config
        : resolve(Deno.cwd(), configPath);

      const localDirname = dirname(configPath);
      projectInfo.main = resolve(localDirname, projectInfo.main);

      return projectInfo;
    } 
  } catch (_e) {
    if (file) {
      // Use the default config if no file is found
      runLogger.info(
        `Could not find a valid configuration file, using default.`,
      );
      return {
        ...DEFAULT_CONFIG,
        main: file,
      };
    }
    // Throw error when neither a config file or a run file are found
    runLogger.error(`Configuration file <astrodon.config.ts> not found.`);
    return null;
  }
}

export async function run(options: RunOptions, file?: string) {
  const config = await resolveConfiguration(options, file);

  if (config != null) {
    // CLI permissions have priority over the config-defined ones
    config.permissions = mergeDenoPermissions(options, config.permissions);

    const dev = new Develop({
      config,
      logger: runLogger,
      useCwd: false,
    });

    await dev.run();
  }
}
