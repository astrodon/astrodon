import { AppWindow } from "../../astrodon/mod.ts";
import messages from "./messages.ts";
import { serve } from "https://deno.land/std/http/mod.ts";

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

const cliets: WebSocket[] = [];
let readySatatus = false;
let errorStatus = false;

function reqHandler(req: Request) {
  if (req.headers.get("upgrade") != "websocket") {
    return new Response(null, { status: 501 });
  }
  const { socket: ws, response } = Deno.upgradeWebSocket(req);
  ws.onopen = () => {
    if (readySatatus) ws.send(messages.success);
    cliets.push(ws);
  }
  return response;
}
serve(reqHandler, { port: 8000 });

const win = new AppWindow("Test Window");

const listener = async (ev: string, cb: (msg: string) => void) => {
  for await (const msg of win.listen(ev)) {
    cb(msg);
  }
};

win.setHtml(html);

await win.run();

const validationTimeout = setTimeout(() => {
if (!readySatatus) errorStatus = true;
  cliets.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(messages.error);
  });
  console.log(messages.error);
  win.close();
}, 10000);

listener("window-ready", (msg) => {
  console.log(msg);
  win.send("deno-ready", '{"input": "Deno Ready"}');
});

listener("success", (msg) => {
  console.log(JSON.parse(msg).input);
  readySatatus = true;
  clearTimeout(validationTimeout);
  cliets.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(messages.success);
  });
  win.close();
});
