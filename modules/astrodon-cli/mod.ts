import {
  Command,
  CompletionsCommand,
  HelpCommand,
} from "https://deno.land/x/cliffy@v0.20.1/mod.ts";

await new Command()
  .name("astrodon-cli")
  .version("0.1.0-alpha")
  .description(`Project manager for Astrodon`)
  .command("help", new HelpCommand().global())
  .command("completions", new CompletionsCommand())
  .parse(Deno.args);
