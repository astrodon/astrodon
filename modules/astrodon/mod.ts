export { AppWindow } from "./window.ts";
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

export interface AppConfig {
  entry: string;
  dist: string;
  info: AppInfo;
}
