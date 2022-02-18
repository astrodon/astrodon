import { brightGreen, red, yellow } from "https://deno.land/std/fmt/colors.ts";

interface AcceptedModules {
  init: string;
  build: string;
  upgrade: string;
}

interface States {
  success: string;
  error: string;
  info: string;
}

// Logger is an agnostic logger that can be used in any module of the CLI to show messages with different states.

export class Logger {
  constructor(private readonly module: keyof AcceptedModules) {}

  states = {
    success: brightGreen(`✅`),
    error: red(`❌`),
    info: yellow(`🔅`),
  };

  public log = (...args: unknown[]) => {
    console.log(
      `${this.states.success} ${
        brightGreen(`[astrodon ${this.module}]:`)
      } ${args.join(" ")}`,
    );
  };

  public error = (...args: unknown[]) => {
    console.error(
      `${this.states.error} ${
        red(`[astrodon ${this.module}]:`)
      } ${args.join(" ")}`,
    );
  }

  public info = (...args: unknown[]) => {
    console.info(
      `${this.states.info} ${
        yellow(`[astrodon ${this.module}]:`)
      } ${args.join(" ")}`,
    );
  }
}
