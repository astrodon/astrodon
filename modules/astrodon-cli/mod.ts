import {
  Command,
  CompletionsCommand,
  HelpCommand,
  join, 
  basename
} from "./deps.ts";
import meta from "../../astrodon.meta.ts";
import { build } from "./commands/build.ts";
import { init } from "./commands/init.ts";

// CLI configuration

await new Command()
  .name(meta.name)
  .version(meta.version)
  .global()
  .description(`Project manager for Astrodon`)
  .command("help", new HelpCommand().global())
  .command("completions", new CompletionsCommand())
  // Start of CLI commands
  .command(
    "build",
    new Command()
      //Build command
      .description("Build the app.")
      .allowEmpty(false)
      .option("-i, --entry [type:string]", "Entry point for the app.", {
        default: join(Deno.cwd(), './mod.ts'),
      })
      .option("-d, --out [type:string]", "Output directory.", {
        default: join(Deno.cwd(), './dist')
      })
      .option("-n, --name [type:string]", "Custom name for build.", {
        default: basename(Deno.cwd())
      })
      .option("-a, --assets [type:string]", "Custom assets path.",{
        default: join(Deno.cwd(), './renderer/src')
       })
      .action(async (options) => await build(options)),
  )
  .command(
    "init",
    new Command()
      //Init command
      .description("Initialize a new project.")
      .allowEmpty(false)
      .option("-t, --template [type:string]", "Template to use.", {
        default: "default",
      })
      .option("-n, --name [type:string]", "Name of the project.", {
        default: "my-astrodon-app",
      })
      .action(async (options) => await init(options))
  )
  .parse(Deno.args);
