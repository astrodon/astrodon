import { Builder } from "../../astrodon-build/mod.ts";
import { Logger } from "../utils.ts";
import { AppConfig, OSNames } from "../../astrodon/mod.ts";
import { resolve } from "https://deno.land/std@0.122.0/path/mod.ts";

interface BuildOptions {
  config: string;
  target?: OSNames;
}

const buildLogger = new Logger("build");

export async function build(options: BuildOptions) {
  const configPath =
    new URL(`file://${resolve(Deno.cwd(), options.config)}`).href;
  const { default: projectInfo }: { default: AppConfig } = await import(
    configPath
  );
  const builder = new Builder(projectInfo, buildLogger, options.target);
  buildLogger.info(
    `Compiling ${projectInfo.info.name} v${projectInfo.info.version}...`,
  );
  await builder.compile();
  buildLogger.log("Compiled successfully!");
}
