import { App } from "https://deno.land/x/astrodon/mod.ts";
import { dirname, join, fromFileUrl, toFileUrl } from "https://deno.land/std/path/mod.ts";
const __dirname = dirname(fromFileUrl(import.meta.url));


const getIndex = () => {
  const isDev = Deno.env.get("DEV") == "true";

  if (isDev) {
    return toFileUrl(`${join(__dirname, './renderer/src/index.html')}`).href;
  } else {
    return "<your_remote_html>";
  }
};

const indexPath = getIndex();

const app = await App.new();

await app.registerWindow({ title: "spaghettis > ravioli", url: indexPath });

setInterval(() => {
  app.send(`Hello Tauri: ${Math.random()}`);
}, 500);

app.run();
