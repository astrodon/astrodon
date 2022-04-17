import { OSNames } from "../astrodon/mod.ts";
import {
  copy,
  exists,
  getHomeDir,
  join,
  Logger,
  meta,
  readerFromStreamReader,
  readZip,
} from "./deps.ts";

export const fileFormat = (os: string) => os === "windows" ? ".exe" : "";

export type buildModes = "standalone" | "development";

export const getBinaryInfo = (os: OSNames, mode: buildModes, isDev = false) => {
  // Exemple: astrodon-tauri-standalone-windows.exe
  const binName = `astrodon-tauri-${mode}${isDev ? "" : `-${os}`}`;
  return [
    `https://github.com/marc2332/astrodon/releases/download/${meta.version}/${binName}.zip`,
    `${binName}${fileFormat(os)}`,
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
  os: OSNames = Deno.build.os,
  useLocalBinaries = false,
): Promise<string> => {
  // Return the local runtime if running in development mode
  if (useLocalBinaries) {
    const [_, binaryName] = getBinaryInfo(os, mode, true);
    return join(Deno.cwd(), "target", "debug", binaryName);
  }

  const homeDir = getHomeDir() as string;
  const outputDir = join(homeDir, `.${meta.name}`, meta.version);

  const [binaryZipURL, binaryName, binaryRawName] = getBinaryInfo(os, mode);
  const binaryPath = join(outputDir, binaryName);

  // Return the binary's location if it is already downloaded
  if (await exists(binaryPath)) {
    return binaryPath;
  }

  const binaryRawPath = join(outputDir, binaryRawName);
  const binaryZipPath = `${binaryRawPath}.zip`;

  try {
    await Deno.remove(binaryZipPath, { recursive: true });
  } catch {
    // File might or not exist, both are ok
  }

  await Deno.mkdir(outputDir, { recursive: true });

  const response = await fetch(binaryZipURL);
  if (logger) {
    logger.log(
      `Downloading Astrodon runtime v${meta.version} (${os}) [${mode}]`,
    );
  }
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const reader = response?.body?.getReader();
  if (!reader) throw new Error("Failed when download Astrodon runtime");

  const zippedFile = await Deno.open(binaryZipPath, {
    create: true,
    write: true,
    truncate: true,
  });

  await copy(readerFromStreamReader(reader), zippedFile);

  zippedFile.close();

  const zip = await readZip(binaryZipPath);

  await zip.unzip(outputDir);

  //Make the runtime executable on Linux and MacOS
  if (Deno.build.os != "windows") {
    await Deno.chmod(binaryPath, 0o755);
  }

  await Deno.remove(binaryZipPath);

  return binaryPath;
};
