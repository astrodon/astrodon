import { App } from "../mod.ts";

const indexPath = await Deno.realPath("./demo/index.html");

const windows = [
  { title: "spaghettis > ravioli", url: `file://${indexPath}` },
];

const app = await App.withWindows(windows);

setInterval(() => {
  app.send(`Hello Tauri: ${Math.random()}`);
}, 500);

app.run();
