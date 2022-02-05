import {
  dirname,
  ensureDir,
  exists,
  fromFileUrl,
  join,
  semver,
  basename
} from "./deps.ts";
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

  // Using installed binary
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
  // deno-lint-ignore no-explicit-any
  await Deno.writeFile(libDist, context.bin as any);
  return libDir;
};

// Retrieve the App Options

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

// Note: This is creating file at runtime, maybe we can use it the build process?

/**
 * Gets the path of the entry url
 * Also uncompress assets if it's on production
 * Uncompress isn't (by now) part of the build process but it's a good idea to move it when we have an installer
 */

export const prepareUrl = async (
  url: string,
  context: AppContext,
): Promise<string> => {
  // Checks if url is remote and returns it
  if (url.startsWith("http")) return url;
  // If url is local, checks if is in production or explicitly set to prevent unpack on instance configurations
  const production = window.astrodonProduction;
  const preventUnpack = window?.astrodonAppConfig?.build?.preventUnpack;
  if (!production || production && preventUnpack) return url;
  // If url is local, checks if assets are already in memory
  const assets = window.astrodonAssets;
  // If custom assets folder isn't set, astrodon assumes the assets are relative to the entry url
  if (!assets) return url;
  // Gets binary directory from binary location
  const dir = getAppPathByContext(context);
  // assets are always located two levels up from the binary
  const assetsFolder = join(dir, "../../assets");
  const existFolder = await exists(assetsFolder);

  // If assets folder doesn't exist, we create it and uncompress assets

  if (!existFolder) {
    await ensureDir(assetsFolder);
    await unpackAssets(assets, assetsFolder);
  }

  // Parse url is built int executable so it won't change on execution, because this we can map it to the assets folder

  const parseUrl = fromFileUrl(url).replaceAll('\\', '/');

  const originFolder = window.astrodonOrigin as string;
  const customAssetFolder = window.astrodonAppConfig?.build?.assets || dirname(parseUrl.replace(originFolder, ''));

  // If customAssetFolder is relative, it's assumed to be relative to the origin folder

  const assetFolder = isRelative(customAssetFolder)
    ? join(originFolder, customAssetFolder)
    : customAssetFolder.replaceAll('\\', '/');
  
  // We map the original url to the new one with the assets folder
  
  const assetUrl = parseUrl.replace(assetFolder.replaceAll("\\", "/"), assetsFolder);

  return `file://${assetUrl}`;
};

/**
 * Retrieve the binary path, this is placed outside to be used in other modules
 * This is defines where the binary is located by the context of the app
 * This is intentionally dynamic, so we can run app both locally or remotely
 */

export const getAppPathByContext = (context: AppContext) =>
  join(
    Deno.env.get("APPDATA") || Deno.env.get("HOME") || Deno.cwd(),
    context?.options?.name || "",
    context.options?.version || "",
    window.astrodonProduction &&
      !context?.options?.name
      ? `astrodon_unsigned_builds/${ basename(window.astrodonOrigin as string) || basename(Deno.mainModule)}`
      : "",
    meta.name,
    cleanVersion || version,
  );

const isRelative = (url: string) => {
  return url.startsWith(".") || url.startsWith("/");
};
