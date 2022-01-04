import { Plug } from "https://deno.land/x/plug/mod.ts";
import { join } from 'https://deno.land/std/path/mod.ts'
import { ensureDir, exists } from 'https://deno.land/std/fs/mod.ts'
import binary from './binary.b.ts'

const writeBinary = async (dir: string) => {
  const libDir = join(dir, 'lib');
  const installed = await exists(libDir)
  if (installed) return;
  await ensureDir(libDir)
  await Deno.writeFile(join(libDir, 'degui.dll'), binary)
  return libDir
}

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
    const name = 'degui';
    const dir = join(Deno.env.get('APPDATA') || Deno.cwd(), `/${name}`)
    await writeBinary(dir)
    const libPath = await Deno.realPath(join(dir, 'lib'));

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
