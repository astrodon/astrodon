import { App } from "https://github.com/astrodon/astrodon/raw/main/mod.ts";
import { dirname, join, fromFileUrl, toFileUrl } from "https://deno.land/std/path/mod.ts";
const __dirname = dirname(fromFileUrl(import.meta.url));

/**
 * Get index is a function that returns the path to the index.html file depending on the environment.
 * The url in this case is the url of the index.html file in the template directory.
 * Please feel free to change this to your own url or set the DEV environment variable to true to use the local index.html file.
 */

const getIndex = () => {
  const isDev = Deno.env.get("DEV") == "true";

  if (isDev) {
    return toFileUrl(`${join(__dirname, './renderer/src/index.html')}`).href;
  } else {
    return 'https://raw.githack.com/denyncrawford/astrodon-template-demo/main/renderer/index.html' //"<your_remote_html>";
  }
};

const indexPath = getIndex();

const app = await App.new();

await app.registerWindow({ title: "spaghettis > ravioli", url: indexPath });

setInterval(() => {
  app.send(`Hello Tauri: ${Math.random()}`);
}, 500);

app.run();
