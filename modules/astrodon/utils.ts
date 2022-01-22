import { dirname, ensureDir, exists, join, semver } from "./deps.ts";
import { unpackAssets } from "../astrodon-build/mod.ts";
import { AppContext, AppOptions } from "./mod.ts";
import meta from "../../astrodon.meta.ts";

/**
 * Checks if version is a valid semver
 * Also cleans the version before usage
 */

const { version } = meta;

if (!semver.valid(version)) {
  throw Error("You're not using a valid semver version, please correct");
}
const cleanVersion = semver.clean(version);

// LobConfigs

interface LibConfig {
  url: string;
  libName: string;
  binName: string;
}

export const libConfigs: Record<string, Partial<LibConfig>> = {
  linux: {
    url: `https://x.nest.land/astrodon@${cleanVersion}/dist/linux.binary.b.ts`,
    libName: "libastrodon.so",
  },
  windows: {
    url:
      `https://x.nest.land/astrodon@${cleanVersion}/dist/windows.binary.b.ts`,
    libName: "astrodon.dll",
  },
  darwin: {},
};

/*
 * Retrieve the Shared Library location
 * Also uncompress if it's on production
 */
export const getLibraryLocation = async (
  context: AppContext,
): Promise<string> => {
  // Using a custom binary
  const customBinary = Deno.env.get("CUSTOM_BINARY");
  if (customBinary) return customBinary;

  // Usingi installed binary
  const dir = getAppPathByContext(context);
  const libConfig = libConfigs[Deno.build.os] as LibConfig;
  const libDir = join(dir, "lib");
  const isInstalled = await exists(libDir);

  if (isInstalled) return libDir;

  // Using the remote binary
  const libDist = join(libDir, libConfig.libName);

  if (!context.bin) {
    await ensureDir(libDir);
    const currentOS = Deno.build.os;
    const currentBin = libConfigs[currentOS].url;
    if (currentBin) {
      const { default: binary } = await import(currentBin);
      context.bin = binary;
    }
  }

  await ensureDir(libDir);
  await Deno.writeFile(libDist, context.bin as any);

  return libDir;
};

export const getAppOptions = async (): Promise<AppOptions> => {
  const globalConfig = window.astrodonAppConfig;
  if (globalConfig) return globalConfig;
  const entry = Deno.mainModule;
  const dir = dirname(entry);
  const configFile = join(dir, "astrodon.config.ts");
  try {
    const { default: options } = await import(configFile);
    return options;
  } catch (_e) {
    return {};
  }
};

export const prepareUrl = async  (url: string, context: AppContext) => {
  if (url.startsWith("http")) return url;  
  const production = window.astrodonProduction;  
  const preventUnpack = window?.astrodonAppConfig?.preventUnpack;
  if (!production || production && preventUnpack) return url;  
  const assets = window.astrodonAssets;
  if (!assets) return url;
  const dir = getAppPathByContext(context);
  const assetsFolder = join(dir, "../../assets");
  const existFolder = await exists(assetsFolder);
  if (!existFolder) {
    await ensureDir(assetsFolder);
    await unpackAssets(assets, assetsFolder);
  }  
  return `file://${join(assetsFolder, url.split("/").pop() as string)}`;
}

const getAppPathByContext = (context: AppContext) => join(
  Deno.env.get("APPDATA") || Deno.env.get("HOME") || Deno.cwd(),
  context?.options?.name || "",
  context.options?.version || "",
  window.astrodonProduction && !context?.options?.name ? `astrodon_unsigned_builds/${dirname(Deno.mainModule)}` : '', 
  meta.name,
  cleanVersion || version,
);
  