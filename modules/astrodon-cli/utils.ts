import { green, red, yellow } from "https://deno.land/std/fmt/colors.ts";

interface AcceptedModules {
  init: string;
  build: string;
}

interface States {
  success: string;
  error: string;
  info: string;
}

export class Logger {
  constructor(private readonly module: keyof AcceptedModules) {}

  public log(message: string, type: keyof States = "success") {
    const states = {
      success: green(`✅`),
      error: red(`❌`),
      info: yellow(`ℹ`),
    };
    console.log(`${states[type]} ${yellow(`[astrodon ${this.module}]:`)} ${message}`);
  }
  
}