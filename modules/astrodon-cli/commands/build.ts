import { dirname, join, toFileUrl } from "https://deno.land/std/path/mod.ts";
import { Builder } from "../../astrodon-build/mod.ts";
import { Logger } from "../utils.ts";

interface BuildOptions {
  name: string;
  entry: string;
  assets?: string;
  out: string;
}

const buildLogger = new Logger("build");

export const build = async (options: BuildOptions) => {
  options = Object.assign(options, await getBuidOptions());

  buildLogger.log(`Building ${options.name} with this configurations:`, "info");

  const formattedOptions = Object.entries(options).map(([key, value]) => {
    return `${key}: ${value}`;
  });

  formattedOptions.forEach((option) => {
    buildLogger.log(option, "info");
  });

  const entry = Deno.realPathSync(options.entry);
  const customAssetsPath = options.assets;

  const builder = new Builder(dirname(entry));
  const assetsPath = customAssetsPath
    ? customAssetsPath
    : join(dirname(entry), "renderer", "src");

  buildLogger.log("Packaging assets...");

  await Builder.packageAssets(assetsPath, join(options.out, "snapshot.b.ts"));

  buildLogger.log("Creating temporal entry file...");

  await builder.preBundle("mod.ts");

  buildLogger.log("Compiling...");

  await builder.compile(join(options.out, options.name), {
    noCheck: true,
  });

  buildLogger.log("🎉 Build process was successful!");
};

const getBuidOptions = async (): Promise<BuildOptions> => {
  try {
    const { default: configFile } = await import(
      toFileUrl(join(Deno.cwd(), "./astrodon.config.ts")).href
    );
    return { ...configFile.build, name: configFile.name };
  } catch (_) {
    return {} as BuildOptions;
  }
};
