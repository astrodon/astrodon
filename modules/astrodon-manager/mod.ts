import {
  copy,
  exists,
  getHomeDir,
  join,
  Logger,
  meta,
  readerFromStreamReader,
} from "./deps.ts";

const fileFormat = (os: string) => os === "windows" ? ".exe" : "";

type OSNames = "windows" | "darwin" | "linux";
type buildModes = "standalone" | "development";

const getBinaryInfo = (os: OSNames, mode: buildModes, isDev = false) => {
  // Exemple: astrodon-tauri-standalone-windows.exe
  const binName = `astrodon-tauri-${mode}${isDev ? "" : `-${os}`}${
    fileFormat(os)
  }`;
  return [
    `https://github.com/astrodon/astrodon/releases/download/${meta.version}/${binName}`,
    binName,
  ];
};

export const getAstrodonPath = (): string => {
  return join(
    Deno.env.get("APPDATA") || Deno.env.get("HOME") || Deno.cwd(),
    `.${meta.name}`,
  );
};

/**
 * Return the path to the runtime for this version and OS
 * Cache the mathching runtime binary, if not done yet
 */
export const getBinaryPath = async (
  mode: "standalone" | "development",
): Promise<string> => {
  const logger = new Logger("upgrade");

  // Return the local runtime if running in development mode
  if (Deno.env.get("DEV") === "true") {
    const [_, binaryName] = getBinaryInfo(Deno.build.os, mode, true);
    return join(Deno.cwd(), "target", "release", binaryName);
  }

  const homeDir = getHomeDir() as string;
  const outputDir = join(homeDir, "astrodon", meta.version);

  const [binaryURL, binaryName] = getBinaryInfo(Deno.build.os, mode);
  const binaryPath = join(outputDir, binaryName);

  // Return the binary's location if it is already downloaded
  if (await exists(binaryPath)) {
    return binaryPath;
  }

  await Deno.mkdir(outputDir, { recursive: true });

  const response = await fetch(binaryURL);
  if (logger) {
    logger.log(`Downloading Astrodon runtime v${meta.version} [${mode}]`);
  }
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const reader = response?.body?.getReader();
  if (!reader) throw new Error("Failed when download Astrodon runtime");

  const file = await Deno.open(binaryPath, {
    create: true,
    write: true,
    truncate: true,
  });

  await copy(readerFromStreamReader(reader), file);

  file.close();

  return binaryPath;
};
