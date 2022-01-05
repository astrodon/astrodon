import { ensureDir, exists } from "https://deno.land/std/fs/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import "https://deno.land/x/dotenv/load.ts";

interface LibConfig {
  url: string;
  name: string;
}

const isDev = Deno.env.get("DEV") == "true";

const libConfigs: Record<string, Partial<LibConfig>> = {
  linux: {
    url: isDev
      ? "./linux.binary.b.ts"
      : "https://x.nest.land/astrodon@0.1.0-alpha/linux.binary.b.ts",
    name: "libastrodon.so",
  },
  windows: {
    url: isDev ? "./windows.binary.b.ts"
    : "https://x.nest.land/astrodon@0.1.0-alpha/windows.binary.b.ts",
    name: "astrodon.dll",
  },
  darwin: {},
};

export const writeBinary = async (dir: string) => {
  const libDir = join(dir, "lib");
  const isInstalled = await exists(libDir);
  if (isInstalled) return libDir;

  const libConfig = libConfigs[Deno.build.os] as LibConfig;
  const { default: binary } = await import(libConfig.url);
  await ensureDir(libDir);
  await Deno.writeFile(join(libDir, libConfig.name), binary);
  return libDir;
};
