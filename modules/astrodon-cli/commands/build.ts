import { dirname, join, toFileUrl } from "https://deno.land/std/path/mod.ts";
import { Builder } from "../../astrodon-build/mod.ts";
import { Logger } from "../utils.ts";

// Build options are located in the astrodon.config.ts file and can be passed to the cli build command

interface BuildOptions {
  name: string;
  entry: string;
  assets?: string;
  out: string;
}

const buildLogger = new Logger("build");

// Builds astrodon projects from CLI

export const build = async (options: BuildOptions) => {

  // Getting options and filling in default values

  options = Object.assign(options, await getBuidOptions());

  buildLogger.log(`Building ${options.name} with this configurations:`, "info");

  const formattedOptions = Object.entries(options).map(([key, value]) => {
    return `${key}: ${value}`;
  });

  formattedOptions.forEach((option) => {
    buildLogger.log(option, "info");
  });

  // Entry file is the main file of the project

  const entry = Deno.realPathSync(options.entry);
  const customAssetsPath = options.assets;

  // Initializing the builder from @astrodon-builder

  const builder = new Builder(dirname(entry));
  const assetsPath = customAssetsPath
    ? customAssetsPath
    : join(dirname(entry), "renderer", "src");

  // Package assets into a TypeScript bundle

  buildLogger.log("Packaging assets...");

  await Builder.packageAssets(assetsPath, join(options.out, "snapshot.b.ts"));

  // Pre-bundling code generation

  buildLogger.log("Creating temporal entry file...");

  await builder.preBundle("mod.ts");

  // Compiling the project into an executable

  buildLogger.log("Compiling...");

  await builder.compile(join(options.out, options.name), {
    noCheck: true,
  });

  buildLogger.log("🎉 Build process was successful!");
};

// Handler for getting the build options

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
