import { dirname, join } from "https://deno.land/std/path/mod.ts";
import { Builder } from "../../astrodon-build/mod.ts";
import { green } from "https://deno.land/std/fmt/colors.ts";
import { Logger } from "../utils.ts";

const buildLogger = new Logger("build");

export const build = async (options: Record<string, unknown>) => {

  const entry = Deno.realPathSync(options.entry as string)

  const builder = new Builder(dirname(entry));
  const assetsPath = join(dirname(entry), "renderer", "src");
  
  buildLogger.log('Packaging assets...');

  await Builder.packageAssets(assetsPath, join(options.out as string || dirname(entry) , 'dist', "snapshot.b.ts"));

  buildLogger.log('Creating temporal entry file...');

  await builder.preBundle('mod.ts');

  buildLogger.log('Compiling...');

  await builder.compile(options.out as string || entry, {
    noCheck: true,
  });

  buildLogger.log('🎉 Build process was successful!');
};
