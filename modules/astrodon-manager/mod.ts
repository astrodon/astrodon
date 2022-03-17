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
    `https://github.com/marc2332/astrodon/releases/download/${meta.version}/${binName}`,
    binName,
  ];
};

/**
 * Return the path to the runtime for this version and OS
 * Cache the mathching runtime binary, if not done yet
 */
export const getBinaryPath = async (
  mode: "standalone" | "development",
  logger?: Logger,
): Promise<string> => {
  // Return the local runtime if running in development mode
  if (Deno.env.get("DEV") === "true") {
    const [_, binaryName] = getBinaryInfo(Deno.build.os, mode, true);
    return join(Deno.cwd(), "target", "release", binaryName);
  }

  const homeDir = getHomeDir() as string;
  const outputDir = join(homeDir, `.${meta.name}`, meta.version);

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
