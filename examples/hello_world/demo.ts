import { AppWindow } from "../../modules/astrodon/mod.ts";
import { getAllBreeds } from "https://deno.land/x/dog@1.0.0/mod.ts";

const breeds = Object.keys(await getAllBreeds()).map((breed) =>
  `<li>${breed}</li>`
).join("");

const html = `
    <html>
        <body>
            <p>Send to Deno:</p>
            <input id="input"></input>
            <p>Received from Deno:</p>
            <b id="output">Output: ...</b>
            <p>Also... here u have some doggos breeds:<p>
            <ul>
                ${breeds}
            </ul>
        </body>
        <script>
            window.addEventListener("from-deno", (ev) => {
                document.getElementById("output").innerText = ev.detail.input;
            })

            document.getElementById("input").addEventListener("keyup", async (ev) => {
                console.log(ev.target.value)
                await window.sendToDeno("to-deno", { input: ev.target.value});
            })

        </script>
    </html>
`;

const win = new AppWindow("Window A");

// win.setUrl("https://google.com") can also be used!

win.setHtml(html);

await win.run();

for await (const msg of await win.listen("to-deno")) {
  win.send("from-deno", msg);
}
