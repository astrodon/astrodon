import { AppOptions } from "./mod.ts";

/*
 * These global variables are statically inyected when using astrodon-build's Builder.preBundle()
 * They are only used when the app is packaged into an executable
 */
declare global {
  interface Window {
    astrodonAppConfig: AppOptions;
    // deno-lint-ignore no-explicit-any
    astrodonBin: any;
    // deno-lint-ignore no-explicit-any
    astrodonAssets: any;
    astrodonProduction?: boolean;
  }
}
