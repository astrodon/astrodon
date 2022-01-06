import { ensureDir, exists } from "https://deno.land/std/fs/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import "https://deno.land/x/dotenv/load.ts";

interface LibConfig {
  url: string;
  name: string;
}

const isDev = Deno.env.get("DEV") == "true";
const isWriteTest = Deno.env.get("WRITE") == "true";

const libConfigs: Record<string, Partial<LibConfig>> = {
  linux: {
    url: isWriteTest ? "./dist/linux.binary.b.ts" : "https://x.nest.land/astrodon@0.1.0-alpha/dist/linux.binary.b.ts",
    name: "libastrodon.so",
  },
  windows: {
    url: isWriteTest ? "./dist/linux.binary.b.ts" : "https://x.nest.land/astrodon@0.1.0-alpha/dist/windows.binary.b.ts",
    name: "astrodon.dll",
  },
  darwin: {},
};

export const writeBinary = async (dir: string): Promise<string> => {
  const libDir = join(dir, "lib");
  const isInstalled = await exists(libDir);
  if (isInstalled) return libDir;

  const libConfig = libConfigs[Deno.build.os] as LibConfig;
  const { default: binary } = await import(libConfig.url);
  await ensureDir(libDir);
  await Deno.writeFile(join(libDir, libConfig.name), binary);
  return libDir;
};

export const getLibraryLocation = async (): Promise<string> => {
  const name = "astrodon";
  const dir = join(
    Deno.env.get("APPDATA") || Deno.env.get("HOME") || Deno.cwd(),
    name,
  );
  if (!isDev) return await writeBinary(dir);
  return await Deno.realPath("./target/debug/")
};
