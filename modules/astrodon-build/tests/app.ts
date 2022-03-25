import { AppWindow } from "../../astrodon/mod.ts";
import messages from "./messages.ts";

const html = `
    <html>
        <body>
            <h1 id="message">Waiting....</h1>
        </body>
        <script>
            window.addEventListener("deno-ready", (ev) => {
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

listener("window-ready", () => {
  win.send("deno-ready", '{"input": "Deno Ready"}');
});

listener("success", () => {
  const socket = new WebSocket("ws://localhost:8000");

  socket.onopen = () => {
    socket.send(messages.success);
  };

  win.close();
});
