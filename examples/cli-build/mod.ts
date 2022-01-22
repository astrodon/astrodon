import { App as Astrodon } from "../../mod.ts";
import { dirname, fromFileUrl, join } from "https://deno.land/std/path/mod.ts";
const __dirname = dirname(fromFileUrl(import.meta.url));


const astrodonApp = await Astrodon.new();


await astrodonApp.registerWindow({
  title: "Vue Example",
  url: `file://${join(__dirname,'./renderer/src/index.html')}`,
});

astrodonApp.run();
