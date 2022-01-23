import { App } from "../../mod.ts";
import { dirname, join, fromFileUrl } from "https://deno.land/std/path/mod.ts";
const __dirname = dirname(fromFileUrl(import.meta.url));

const getIndex = () => {
  const isDev = Deno.env.get("DEV") == "true";
  if (isDev) {
    return `file://${join(__dirname, './renderer/src/index.html')}`;
  } else {
    return "https://rawcdn.githack.com/astrodon/astrodon/fdf9523e44f78c40290141f0288e0e1b468dc075/demo/index.html";
  }
};

const indexPath = getIndex();

console.log(indexPath);


const app = await App.new();

await app.registerWindow({ title: "Fua", url: indexPath });

app.run();
