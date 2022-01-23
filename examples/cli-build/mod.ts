import { App } from "../../mod.ts";

const getIndex = async () => {
  const isDev = Deno.env.get("DEV") == "true";
  if (isDev) {
    return `file://${await Deno.realPath("./examples/cli-build/renderer/src/index.html")}`;
  } else {
    return "https://rawcdn.githack.com/astrodon/astrodon/fdf9523e44f78c40290141f0288e0e1b468dc075/demo/index.html";
  }
};

const indexPath = await getIndex();

const app = await App.new();

await app.registerWindow({ title: "Fua", url: indexPath });

app.run();
