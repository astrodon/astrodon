import { App } from "../../mod.ts";

const getIndex = async () => {
  const isDev = Deno.env.get("DEV") == "true";

  if (isDev) {
    return `file://${await Deno.realPath(
      "./examples/compiled_hello_world/index.html",
    )}`;
  } else {
    return "https://rawcdn.githack.com/astrodon/astrodon/fdf9523e44f78c40290141f0288e0e1b468dc075/demo/index.html";
  }
};

const indexPath = await getIndex();

const app = await App.new();

app.registerWindow({ title: "spaghettis > ravioli", url: indexPath });

setInterval(() => {
  app.send(`Hello Tauri: ${Math.random()}`);
}, 500);

app.run();
