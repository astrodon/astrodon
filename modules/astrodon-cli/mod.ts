import { Command, CompletionsCommand, HelpCommand } from "./deps.ts";
import meta from "../../astrodon.meta.ts";
import { build, BuildOptions } from "./commands/build.ts";
import { init, InitOptions } from "./commands/init.ts";
import { run, RunOptions } from "./commands/run.ts";

const value = (value: true | string[]) => Array.isArray(value) && value.length > 0 ? value : [];

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
      .option("-a, --allow-env=[env:string[]]", "Allow environment variables", {
        value,
      })
      .option("-b, --allow-hrtime", "Allow hrtime")
      .option("-n, --allow-net=[net:string[]]", "Allow network connections", {
        value,
      })
      .option("-f, --allow-ffi=[ffi:string[]]", "Allow FFI", {
        value,
      })
      .option("-r, --allow-read=[read:string[]]", "Allow read", {
        value,
      })
      .option("-w, --allow-write=[write:string[]]", "Allow write", {
        value,
      })
      .option('-r, --allow-run=[run:string[]]', 'Allow run', {
        value,
      })
      .arguments("[file]")
      .action(async (options, file?: string) => {
        // Improve types (Dani)
        await run(options as RunOptions, file);
      }),
  )
  .command(
    "build",
    new Command()
      .description("Build the app.")
      .option("-c, --config [type:string]", "Configuration file", {
        default: "astrodon.config.ts"
      })
      .option("-t, --target [type:string]", "Target os")
      .option("-A, --allow-all", "Allow all permissions")
      .option("-p, --prompt", "Prompt for permissions")
      .option("-a, --allow-env=[env:string[]]", "Allow environment variables", {
        value,
      })
      .option("-b, --allow-hrtime", "Allow hrtime")
      .option("-n, --allow-net=[net:string[]]", "Allow network connections", {
        value,
      })
      .option("-f, --allow-ffi=[ffi:string[]]", "Allow FFI", {
        value,
      })
      .option("-r, --allow-read=[read:string[]]", "Allow read", {
        value,
      })
      .option("-w, --allow-write=[write:string[]]", "Allow write", {
        value,
      })
      .option('-r, --allow-run=[run:string[]]', 'Allow run', {
        value,
      })
      // Improve types (Dani)
      .action(async (options) => await build(options as BuildOptions)),
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
      // Improve types (Dani)
      .action(async (options) => await init(options as InitOptions)),
  )
  .parse(Deno.args);