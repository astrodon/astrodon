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

export const isSupportedGitPlatform = (templateUrl: string): boolean => templateUrl.startsWith("https://github.com") ||
templateUrl.startsWith("http://github.com") ||
templateUrl.startsWith("https://gitlab.com") ||
templateUrl.startsWith("http://gitlab.com") ||
templateUrl.startsWith("https://bitbucket.com") ||
templateUrl.startsWith("http://bitbucket.com")

export const generateRandomHashByTime = (): string => {
  const date = new Date();
  const time = date.getTime();
  return time.toString(36);
}