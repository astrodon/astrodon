import { App } from "../../mod.ts";

let indexPath = "";
const isDev = Deno.env.get("DEV") == "true";

if (isDev) {
  indexPath = `file://${await Deno.realPath("./demo/index.html")}`;
} else {
  indexPath =
    "https://rawcdn.githack.com/astrodon/astrodon/fdf9523e44f78c40290141f0288e0e1b468dc075/demo/index.html";
}

const windows = [
  { title: "spaghettis > ravioli", url: indexPath },
];

const app = await App.withWindows(windows);

setInterval(() => {
  app.send(`Hello Tauri: ${Math.random()}`);
}, 500);

app.run();
