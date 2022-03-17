import { Develop } from "../../astrodon-build/mod.ts";
import { AppConfig } from "../../astrodon/mod.ts";
import { resolve } from "https://deno.land/std@0.122.0/path/mod.ts";
import { Logger } from "../utils.ts";

interface RunOptions {
  config: string;
}

const runLogger = new Logger("run");

export async function run(options: RunOptions) {
  const configPath =
    new URL(`file://${resolve(Deno.cwd(), options.config)}`).href;
  const { default: projectInfo }: { default: AppConfig } = await import(
    configPath
  );
  const dev = new Develop(projectInfo, runLogger);
  await dev.run();
}
