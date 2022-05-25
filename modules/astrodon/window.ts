// deno-lint-ignore-file no-explicit-any

export class AppWindow {
  id = crypto.randomUUID();
  title: string;
  url?: string;
  html?: string;
  // constructor for the window class, takes a title as a parameter
  constructor(title: string) {
    this.title = title;
  }
  // this is a helper method for creating a window with a url
  setUrl(url: string) {
    this.url = url;
  }
  // this is a helper method for creating a window with html
  setHtml(html: string) {
    this.html = html;
  }
  // run method for the window class
  run() {
    return (Deno as any).core.opAsync("run_window", {
      id: this.id,
      title: this.title,
      content: this.url != null
        ? {
          _type: "Url",
          url: this.url,
        }
        : {
          _type: "Html",
          html: this.html,
        },
    });
  }
  // sends a message from the window to the app's frontend
  send(event: string, content: any) {
    return (Deno as any).core.opAsync("send_to_window", {
      id: this.id,
      event,
      content: JSON.stringify(content),
    });
  }

  // Is an infinite while a good idea ? Not sure
  listen = async function* (name: string) {
    while (true) {
      yield await (Deno as any).core.opAsync("listen_event", { name });
    }
  };
  // method used to close the window
  close() {
    return (Deno as any).core.opAsync("close_window", {
      id: this.id,
    });
  }
}
