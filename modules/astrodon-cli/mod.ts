import { Command, CompletionsCommand, HelpCommand } from "./deps.ts";
import meta from "../../astrodon.meta.ts";
import { build } from "./commands/build.ts";
import { init } from "./commands/init.ts";
import { run, RunOptions } from "./commands/run.ts";

const value = (value: undefined | string[]) => Array.isArray(value) && value.length > 0 ? value : [];

await new Command()
  .name(meta.name)
  .version(meta.version)
  .global()
  .description(`Manage Astrodon projects`)
  .command("help", new HelpCommand().global())
  .command("completions", new CompletionsCommand())
  .command(
    "run",
    new Command()
      .description("Run the app.")
      .option("-c, --config [type:string]", "Configuration file")
      .option("-A, --allow-all", "Allow all permissions")
      .option("-p, --prompt", "Prompt for permissions")
      .option("-a, --allow-env [permissionString:string[]]", "Allow environment variables", {
        value,
      })
      .option("-b, --allow-hrtime", "Allow hrtime")
      .option("-n, --allow-net [permissionString:string[]]", "Allow network connections", {
        value,
      })
      .option("-f, --allow-ffi [permissionString:string[]]", "Allow FFI", {
        value,
      })
      .option("-r, --allow-read [permissionString:string[]]", "Allow read", {
        value,
      })
      .option("-w, --allow-write [permissionString:string[]]", "Allow write", {
        value,
      })
      .option('-r, --allow-run [permissionString:string[]]', 'Allow run', {
        value,
      })
      .arguments("[file]")
      .action(async (options: RunOptions, file?: string) => {
        await run(options, file);
      }),
  )
  .command(
    "build",
    new Command()
      .description("Build the app.")
      .option("-c, --config [type:string]", "Configuration file")
      .option("-t, --target [type:string]", "Target os")
      .action(async (options) => await build(options)),
  )
  .command(
    "init",
    new Command()
      .description("Initialize a new project.")
      .allowEmpty(false)
      .option("-y, --yes [type:boolean]", "Skip prompts", {
        default: false,
      })
      .option("-t, --template [type:string]", "Template to use.", {
        default: "default",
      })
      .option("-n, --name [type:string]", "Name of the project.", {
        default: "my-astrodon-app",
      })
      .action(async (options) => await init(options)),
  )
  .parse(Deno.args);