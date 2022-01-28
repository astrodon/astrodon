import { dirname, join, fromFileUrl} from "https://deno.land/std/path/mod.ts";
const __dirname = dirname(fromFileUrl(import.meta.url));

export const getIndex = () => {
  const isDev = Deno.env.get("DEV") == "true";
  //deno-lint-ignore no-explicit-any
  const isProd = (globalThis as any).astrodonProduction

  if (isDev || isProd) {
    return `file://${join(__dirname, './renderer/dist/index.html')}`;
  } else {
    return `https://raw.githack.com/denyncrawford/astrodon/main/examples/compiled_vuejs_app/renderer/src/index.html` //"<your_remote_html>";
  }
};