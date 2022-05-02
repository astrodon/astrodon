export { AppWindow } from "./window.ts";

export type OSNames = "windows" | "darwin" | "linux";

export interface IPermissionsOptions {
  allow_env?: string[];
  allow_hrtime: boolean;
  allow_net?: string[];
  allow_ffi?: string[];
  allow_read?: string[];
  allow_run?: string[];
  allow_write?: string[];
  prompt?: boolean;
}

export interface IAppBuildOptions {
  output?: string;
  icons?: string[];
  resources?: string[];
  targets?: {
    [key in OSNames]?: {
      name: string;
      suffix?: string;
    };
  };
}

export interface IAppConfig {
  name: string;
  id: string;
  main: string;
  copyright?: string;
  version: string;
  author: string;
  shortDescription?: string;
  longDescription?: string;
  homepage?: string;
  permissions?: IPermissionsOptions;
  unstable?: boolean;
  build?: IAppBuildOptions;
}
