// deno-lint-ignore-file no-explicit-any

export class AppWindow {
  id: string = Math.random().toString();
  title: string;
  url?: string;
  html?: string;
  constructor(title: string) {
    this.title = title;
  }

  setUrl(url: string) {
    this.url = url;
  }

  setHtml(html: string) {
    this.html = html;
  }

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

  close() {
    return (Deno as any).core.opAsync("close_window", {
      id: this.id,
    });
  }
}
