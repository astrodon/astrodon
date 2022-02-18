import { dirname, join, toFileUrl, basename } from "../deps.ts";
import { Builder } from "../../astrodon-build/mod.ts";
import { Logger } from "../utils.ts";

// Build options are located in the astrodon.config.ts file and can be passed to the cli build command

interface BuildOptions {
  name: string; // default: "my-astrodon-app"
  entry: string; // default: join(Deno.cwd(), 'mod.ts')
  assets: string; // default: join(Deno.cwd(), 'renderer/src')
  out: string; // default: join(Deno.cwd(), 'dist')
}

const buildLogger = new Logger("build");

// Builds astrodon projects from CLI

export const build = async (options: BuildOptions) => {

  // Getting options and filling in default values

  options = Object.assign(options, await getBuildOptions());

  buildLogger.log(`Building ${options.name} with this configurations:`);

  const formattedOptions = Object.entries(options).map(([key, value]) => {
    return `${key}: ${value}`;
  });

  formattedOptions.forEach((option) => {
    buildLogger.info(option);
  });

  // Entry file is the main file of the project

  const entry = options.entry;
  const assetsPath = options.assets
  const output = options.out;

  // Initializing the builder from @astrodon-builder

  const builder = new Builder(dirname(entry));

  // Package assets into a TypeScript bundle

  buildLogger.log("Packaging assets...");

  await Builder.packageAssets(assetsPath, join(output, "snapshot.b.ts"), undefined, buildLogger.info);

  // Pre-bundling code generation

  buildLogger.log("Creating temporal entry file...");

  await builder.preBundle(basename(entry));

  // Compiling the project into an executable

  buildLogger.log("Compiling...");

  await builder.compile(join(output, options.name.replaceAll(" ", "_")), {
    noCheck: true,
  });

  buildLogger.log("🎉 Build process was successful!");
};

// Handler for getting the build options

const getBuildOptions = async (): Promise<BuildOptions> => {
  try {
    const { default: configFile } = await import(
      toFileUrl(join(Deno.cwd(), "./astrodon.config.ts")).href
    );
    
    return { ...configFile.build, name: configFile.name };
  } catch (_) {
    return {} as BuildOptions;
  }
};