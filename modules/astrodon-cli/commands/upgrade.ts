
import { exec, OutputMode } from "../deps.ts";
import { Logger } from "../utils.ts";

const latestToolChains = {
  stable: 'https://deno.land/x/astrodon',
  unstable: 'https://github.com/astrodon/astrodon/raw/main',
  dev: 'https://github.com/astrodon/astrodon/raw/dev',
}

interface upgradeOptions {
  toolchain: keyof typeof latestToolChains;
}

const upgradeLogger = new Logger("upgrade");

export const upgrade = async (options: upgradeOptions) => {
  const { toolchain } = options;
  const toolchainUrl = latestToolChains[toolchain];
  const { default: meta } = await import(`${toolchainUrl}/astrodon.meta.ts`);
  upgradeLogger.log(`Upgrading to ${ meta.version } - ${ toolchain}...`);
  upgradeLogger.log(`Reloading cache...`);
  await exec(`deno cache --reload=${toolchainUrl}/mod.ts`, { output: OutputMode.StdOut });
  upgradeLogger.log(`Installing astrodon CLI...`);
  await exec(`deno install -A --unstable -n astrodon -f --reload ${toolchainUrl}/modules/astrodon-cli/mod.ts`);
  upgradeLogger.log(`Done! 🎉 astrodon CLI version is now ${ meta.version } - ${ toolchain }`);
}