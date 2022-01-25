import { dirname, join, fromFileUrl} from "https://deno.land/std/path/mod.ts";
const __dirname = dirname(fromFileUrl(import.meta.url));

export const getIndex = () => {
  const isDev = Deno.env.get("DEV") == "true";

  if (!isDev) {
    return `file://${join(__dirname, './renderer/dist/index.html')}`;
  } else {
    return `https://github.com/denyncrawford/astrodon/raw/main/examples/vuejs_app/src/index.html` //"<your_remote_html>";
  }
};