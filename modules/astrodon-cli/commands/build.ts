import { Builder } from "../../astrodon-build/mod.ts";
import { DenoPermissions, Logger, mergeDenoPermissions } from "../utils.ts";
import { IAppConfig, OSNames } from "../../astrodon/mod.ts";
import { resolve } from "https://deno.land/std@0.122.0/path/mod.ts";
import { dirname } from "../deps.ts";

export type BuildOptions = DenoPermissions & {
  config: string;
  target?: OSNames;
};

const buildLogger = new Logger("build");

// Add file logic to the build command

export async function build(options: BuildOptions) {
  const configPath = resolve(Deno.cwd(), options.config);
  const configUrl = new URL(`file://${configPath}`).href;

  const { default: config }: { default: IAppConfig } = await import(configUrl);

  // Resolve the entry file to the configuration file
  config.main = resolve(dirname(configPath), config.main);

  // CLI permissions have priority over the config-defined ones
  config.permissions = mergeDenoPermissions(options, config.permissions);

  const builder = new Builder({
    config: config,
    logger: buildLogger,
    os: options.target,
    useCwd: false,
  });

  buildLogger.info(
    `Compiling ${config.name} v${config.version}...`,
  );
  await builder.compile();
  buildLogger.log("Compiled successfully!");
}
