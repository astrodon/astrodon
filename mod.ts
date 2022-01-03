import { Plug } from "https://deno.land/x/plug/mod.ts";

interface WindowConfig {
  title: string;
  url: string;
}

interface AppConfig {
  windows: WindowConfig[];
}

export class App<S extends Record<string, Deno.ForeignFunction>> {
  private windows: WindowConfig[];
  private lib: Deno.DynamicLibrary<S>;

  constructor(lib: Deno.DynamicLibrary<S>, windows: WindowConfig[]) {
    this.windows = windows;
    this.lib = lib;
  }

  public static async withWindows(windows: WindowConfig[]) {
    const libPath = await Deno.realPath("./target/debug/");

    const options: Plug.Options = {
      name: "degui",
      url: libPath,
      policy: Plug.CachePolicy.NONE,
    };

    const library = await Plug.prepare(options, {
      create_app: { parameters: ["pointer", "usize"], result: "pointer" },
      run_app: { parameters: ["pointer"], result: "void" },
    });

    return new App(library, windows);
  }

  public run(): void {
    let config: AppConfig = {
      windows: this.windows,
    };

    let p = this.lib.symbols.create_app(...encode(config));
    this.lib.symbols.run_app(p);
  }
}

function encode(val: object): [Uint8Array, number] {
  let objectStr = JSON.stringify(val);
  let buf = new TextEncoder().encode(objectStr);
  return [buf, buf.length];
}
