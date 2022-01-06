import { ensureDir, exists, join } from "./deps.ts";

interface LibConfig {
  target: string;
  url: string;
  name: string;
}

const isDev = Deno.env.get("DEV") == "true";
const usePrebuiltBinaries = Deno.env.get("USE_PREBUILT_BINARIES") == "true";

const libConfigs: Record<string, Partial<LibConfig>> = {
  linux: {
    target: "./target/release/libastrodon.so",
    url: isDev && usePrebuiltBinaries || !isDev
      ? "https://x.nest.land/astrodon@0.1.0-alpha/dist/linux.binary.b.ts"
      : "./dist/linux.binary.b.ts",
    name: "libastrodon.so",
  },
  windows: {
    target: "./target/debug/astrodon.dll",
    url: isDev && usePrebuiltBinaries || !isDev
      ? "https://x.nest.land/astrodon@0.1.0-alpha/dist/windows.binary.b.ts"
      : "./dist/linux.binary.b.ts",
    name: "astrodon.dll",
  },
  darwin: {},
};

/*
 * Uncompress the shared library if it's not uncompressed yet
 */
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

/*
 * Retrieve the Shared Library location
 * Also uncompress if it's on production
 */
export const getLibraryLocation = async (): Promise<string> => {
  const name = "astrodon";
  const dir = join(
    Deno.env.get("APPDATA") || Deno.env.get("HOME") || Deno.cwd(),
    name,
  );

  // Use remote binaries in production
  if (!isDev) return await writeBinary(dir);

  // Use remote binaries in development and with USE_PREBUILT_BINARIES option,
  // this is handy if you don't want to compile the shared library yourself while still be able to develop on the Deno side
  if (usePrebuiltBinaries) return await writeBinary(dir);

  // Use the local version if you are in development without USE_PREBUILT_BINARIES option
  const libConfig = libConfigs[Deno.build.os] as LibConfig;
  return await Deno.realPath(libConfig.target);
};
