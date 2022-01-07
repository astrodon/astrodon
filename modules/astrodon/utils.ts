import { ensureDir, exists, join } from "./deps.ts";
import { AppOptions } from "./mod.ts";

interface LibConfig {
  url: string;
  libName: string;
  binName: string;
}

export const libConfigs: Record<string, Partial<LibConfig>> = {
  linux: {
    url: "https://x.nest.land/astrodon@0.1.0-alpha/dist/linux.binary.b.ts",
    libName: "libastrodon.so",
  },
  windows: {
    url: "https://x.nest.land/astrodon@0.1.0-alpha/dist/windows.binary.b.ts",
    libName: "astrodon.dll",
  },
  darwin: {},
};

/*
 * Retrieve the Shared Library location
 * Also uncompress if it's on production
 */
export const getLibraryLocation = async (
  options: AppOptions,
): Promise<string> => {
  // Using a custom binary
  const customBinary = Deno.env.get("CUSTOM_BINARY");
  if (customBinary) return customBinary;

  // Usingi installed binary
  const name = "astrodon";
  const dir = join(
    Deno.env.get("APPDATA") || Deno.env.get("HOME") || Deno.cwd(),
    name,
  );
  const libConfig = libConfigs[Deno.build.os] as LibConfig;
  const libDir = join(dir, "lib");
  const isInstalled = await exists(libDir);

  if (isInstalled) return libDir;

  // Using the remote binary
  const libDist = join(libDir, libConfig.libName);

  if (!options.bin) {
    await ensureDir(libDir);
    const currentOS = Deno.build.os;
    const currentBin = libConfigs[currentOS].url;
    if (currentBin) {
      const { default: binary } = await import(currentBin);
      options.bin = binary;
    }
  }

  await ensureDir(libDir);
  await Deno.writeFile(libDist, options.bin as any);

  return libDir;
};
