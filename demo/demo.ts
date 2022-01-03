import { App } from "../mod.ts";

const windows = [
  { title: "ok", url: "https://google.com" },
];

const app = await App.withWindows(windows);

app.run();
