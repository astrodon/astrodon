import bin from "https://x.nest.land/astrodon@0.1.0-alpha/dist/windows.binary.b.ts";
          import appConfig from "./astrodon.config.ts"
          import { default as assets } from "./dist/snapshot.b.ts";
          (globalThis as any).astrodonBin = bin;
          (globalThis as any).astrodonAppConfig = appConfig;
          (globalThis as any).astrodonProduction = true;
          (globalThis as any).astrodonAssets = assets          
          import { App as Astrodon } from "../../mod.ts";
import { dirname, fromFileUrl, join } from "https://deno.land/std/path/mod.ts";
const __dirname = dirname(fromFileUrl(import.meta.url));


const astrodonApp = await Astrodon.new();

await astrodonApp.registerWindow({
  title: "Vue Example",
  url: new URL(`file:///${join(__dirname,'./renderer/src/index.html')}`).href as string,
});

astrodonApp.run();