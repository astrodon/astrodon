export { AppWindow } from "./window.ts";

export type OSNames = "windows" | "darwin" | "linux";

export interface PermissionsOptions {
  allow_env?: string[];
  allow_hrtime: boolean;
  allow_net?: string[];
  allow_ffi?: string[];
  allow_read?: string[];
  allow_run?: string[];
  allow_write?: string[];
  prompt: boolean;
}
export interface AppInfo {
  name: string;
  id: string;
  copyright: string;
  version: string;
  author: string;
  shortDescription: string;
  longDescription: string;
  homepage: string;
  icon: string[];
  resources: string[];
  permissions?: PermissionsOptions;
  unstable?: boolean;
}

export interface AppBuildOptions {
  targets?: {
    [key in OSNames]?: {
      suffix?: string;
    };
  };
}

export interface AppConfig {
  entry: string;
  dist: string;
  info: AppInfo;
  build?: AppBuildOptions;
}
