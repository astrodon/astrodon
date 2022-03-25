import { AppWindow } from "../../astrodon/mod.ts";
import messages from "./messages.ts";

const html = `
    <html>
        <body>
            <h1 id="message">Waiting....</h1>
        </body>
        <script>
            window.addEventListener("deno-ready", (ev) => {
                console.log(ev)
                document.getElementById("message").innerText = ev.detail.input;
                window.sendToDeno("success", { input: "${messages.success}" });
            })

            window.sendToDeno("window-ready", { input: "Window Ready" });

        </script>
    </html>
`;

const win = new AppWindow("Test Window");

const listener = async (ev: string, cb: (msg: string) => void) => {
  for await (const msg of win.listen(ev)) {
    cb(msg);
  }
};

win.setHtml(html);

await win.run();

const validationTimeout = setTimeout(() => {
  console.log(messages.error);
  win.close();
}, 10000);

listener("window-ready", (msg) => {
  console.log(msg);
  win.send("deno-ready", '{"input": "Deno Ready"}');
});

listener("success", (msg) => {
  console.log(JSON.parse(msg).input);
  clearTimeout(validationTimeout);
  win.close();
});
