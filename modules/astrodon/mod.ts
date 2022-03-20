export { AppWindow } from "./window.ts";

export type OSNames = "windows" | "darwin" | "linux";

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
}

export interface AppBuildOptions {
  targets?: {
    [key in OSNames]?: {
      suffix?: string;
    };
  }
}

export interface AppConfig {
  entry: string;
  dist: string;
  info: AppInfo;
  build?: AppBuildOptions;
}
