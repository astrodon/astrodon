import { App } from "../../mod.ts";

export const getIndex = async () => {
  const isDev = Deno.env.get("DEV") == "true";
 
  //deno-lint-ignore no-explicit-any
  const isProd = (globalThis as any).astrodonProduction

  if (isDev || isProd) {
    return `file://${ await Deno.realPath('./renderer/index.html')}`;
  } else {
    return `https://raw.githack.com/astrodon/astrodon/dev/examples/hello_world/renderer/index.html` //"<your_remote_html>";
  }
};

const indexPath = await getIndex();

const app = await App.new();

await app.registerWindow({ title: "spaghettis > ravioli", url: indexPath });

setInterval(() => {
  app.send(`Hello Tauri: ${Math.random()}`);
}, 500);

app.run();
