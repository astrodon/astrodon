import { Builder } from "../../astrodon-build/mod.ts";
import { Logger } from "../utils.ts";
import { IAppConfig, OSNames } from "../../astrodon/mod.ts";
import { resolve } from "https://deno.land/std@0.122.0/path/mod.ts";

interface BuildOptions {
  config: string;
  target?: OSNames;
}

const buildLogger = new Logger("build");

// Add file logic to the build command

export async function build(options: BuildOptions) {
  const configPath =
    new URL(`file://${resolve(Deno.cwd(), options.config)}`).href;
  const { default: projectInfo }: { default: IAppConfig } = await import(
    configPath
  );
  const builder = new Builder({
    config: projectInfo,
    logger: buildLogger,
    os: options.target,
  });
  buildLogger.info(
    `Compiling ${projectInfo.name} v${projectInfo.version}...`,
  );
  await builder.compile();
  buildLogger.log("Compiled successfully!");
}
