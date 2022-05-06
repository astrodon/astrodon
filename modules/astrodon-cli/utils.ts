import {
  bgBlack,
  bgBrightGreen,
  bgRed,
  bgYellow,
  black,
} from "https://deno.land/std@0.125.0/fmt/colors.ts";
import { IPermissionsOptions } from "../astrodon/mod.ts";

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
}

export interface DenoPermissions {
  allowAll?: boolean;
  allowEnv?: string[];
  allowHrtime?: boolean;
  allowNet?: string[];
  allowFFI?: string[];
  allowRead?: string[];
  allowWrite?: string[];
  allowRun?: string[];
  prompt?: boolean;
}

export function mergeDenoPermissions(
  permissions: DenoPermissions,
  configPermissions?: IPermissionsOptions,
): IPermissionsOptions {
  // Set to an empty array (true), otherwise set it to false
  const allowAll = permissions.allowAll ? [] : false;

  return Object.assign(
    configPermissions || {},
    {
      allow_env: allowAll ||
        (!permissions.allowEnv
          ? configPermissions?.allow_env
          : permissions.allowEnv),
      allow_net: allowAll ||
        (!permissions.allowNet
          ? configPermissions?.allow_net
          : permissions.allowNet),
      allow_ffi: allowAll ||
        (!permissions.allowFFI
          ? configPermissions?.allow_ffi
          : permissions.allowFFI),
      allow_read: allowAll ||
        (!permissions.allowRead
          ? configPermissions?.allow_read
          : permissions.allowRead),
      allow_run: allowAll ||
        (!permissions.allowRun
          ? configPermissions?.allow_run
          : permissions.allowRun),
      allow_write: allowAll ||
        (!permissions.allowWrite
          ? configPermissions?.allow_write
          : permissions.allowWrite),
      prompt: Boolean(permissions.allowAll) || !permissions.prompt
        ? Boolean(configPermissions?.prompt)
        : Boolean(permissions.prompt),
      allow_hrtime: Boolean(permissions.allowAll) || !permissions.allowHrtime
        ? Boolean(configPermissions?.allow_hrtime)
        : Boolean(permissions.allowHrtime),
    },
  );
}
