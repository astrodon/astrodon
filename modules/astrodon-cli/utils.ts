import {
  bgBlack,
  bgBrightGreen,
  bgRed,
  bgYellow,
  black,
} from "https://deno.land/std@0.125.0/fmt/colors.ts";

interface AcceptedModules {
  init: string;
  build: string;
  run: string;
}

/**
 * Agnostic logger that can be used in any module of the CLI to show messages with different states.
 */
export class Logger {
  constructor(private readonly module: keyof AcceptedModules) {}

  public log = (...args: unknown[]) => {
    console.log(
      `${bgBlack(" astrodon ")}${bgBrightGreen(black(` ${this.module} `))} ${
        args.join(" ")
      }`,
    );
  };

  public error = (...args: unknown[]) => {
    console.error(
      `${bgBlack(" astrodon ")}${bgRed(black(` ${this.module} `))} ${
        args.join(" ")
      }`,
    );
  };

  public info = (...args: unknown[]) => {
    console.info(
      `${bgBlack(" astrodon ")}${bgYellow(black(` ${this.module} `))} ${
        args.join(" ")
      }`,
    );
  };

  public warn = (...args: unknown[]) => {
    console.info(
      `${bgYellow(" astrodon ")}${bgYellow(black(` ${this.module} `))} ${
        args.join(" ")
      }`,
    );
  };
}
