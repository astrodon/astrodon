import { App } from "../../mod.ts";
import { getIndex } from "./utils.ts";

/**
 * Get index is a function that returns the path to the index.html file depending on the environment.
 * The url in this case is the url of the index.html file in the template directory.
 * Please feel free to change this to your own url or set the DEV environment variable to true to use the local index.html file.
 */

const indexPath = await getIndex();

const app = await App.new();

await app.registerWindow({ title: "Compile example", url: indexPath });

console.log(await app.getDataPath());

setInterval(() => {
  app.send(`Hello Tauri: ${Math.random()}`);
}, 500);

app.run();
