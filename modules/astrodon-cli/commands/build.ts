import { dirname, join } from "https://deno.land/std/path/mod.ts";
import { Builder } from "../../astrodon-build/mod.ts";
import { green } from "https://deno.land/std/fmt/colors.ts";

export const build = async (options: Record<string, unknown>) => {

  const entry = Deno.realPathSync(options.entry as string)

  const builder = new Builder(dirname(entry));
  const assetsPath = join(dirname(entry), "renderer", "src");
  console.log(assetsPath);
  

  await Builder.packageAssets(assetsPath, join(options.out as string || dirname(entry) , 'dist', "snapshot.b.ts"));

  await builder.preBundle('mod.ts');

  await builder.compile(options.out as string || entry, {
    noCheck: true,
  });

  console.log(green(`Build complete! 🎉`));

};
