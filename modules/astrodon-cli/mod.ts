import { Command, CompletionsCommand, HelpCommand } from "./deps.ts";
import meta from "../../astrodon.meta.ts";
import { build } from "./commands/build.ts";
import { init } from "./commands/init.ts";
import { run } from "./commands/run.ts";

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
      .allowEmpty(false)
      .option("-c, --config [type:string]", "Configuration file", {
        default: "./astrodon.config.ts",
      })
      .action(async (options) => await run(options)),
  )
  .command(
    "build",
    new Command()
      .description("Build the app.")
      .allowEmpty(false)
      .option("-c, --config [type:string]", "Configuration file", {
        default: "./astrodon.config.ts",
      })
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
