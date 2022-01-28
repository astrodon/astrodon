import { AppOptions } from "./mod.ts";

/*
 * These global variables are statically injected when using astrodon-build's Builder.preBundle()
 * They are only used when the app is packaged into an executable
 * In the future we should crete a global for astrodon dev mode
 */
declare global {
  interface Window {
    astrodonAppConfig: AppOptions;
    // deno-lint-ignore no-explicit-any
    astrodonBin: any;
    // deno-lint-ignore no-explicit-any
    astrodonAssets: any;
    astrodonProduction?: boolean;
    astrodonOrigin?: string;
    astrodonAssetsOrigin?: string;
  }
}
