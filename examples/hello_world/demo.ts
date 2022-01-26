import { App } from "../../mod.ts";
import { join, dirname, fromFileUrl } from "https://deno.land/std/path/mod.ts";
const __dirname = dirname(fromFileUrl(import.meta.url));

export const getIndex = () => {
  const isDev = Deno.env.get("DEV") == "true";
 
  //deno-lint-ignore no-explicit-any
  const isProd = (globalThis as any).astrodonProduction

  if (isDev || isProd) {
    return `file://${join(__dirname, './renderer/index.html')}`;
  } else {
    return `https://raw.githack.com/denyncrawford/astrodon/main/examples/hello_world/renderer/index.html` //"<your_remote_html>";
  }
};

const indexPath = await getIndex();

const app = await App.new();

await app.registerWindow({ title: "spaghettis > ravioli", url: indexPath });

setInterval(() => {
  app.send(`Hello Tauri: ${Math.random()}`);
}, 500);

app.run();
