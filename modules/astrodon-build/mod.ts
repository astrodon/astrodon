import { exec } from "https://deno.land/x/exec/mod.ts";
import { yellow } from "https://deno.land/std/fmt/colors.ts";
import { normalize } from "https://deno.land/std/path/mod.ts"
import {
  ast,
  compress,
  join,
  PassThrough,
  tsBundle,
} from "../astrodon/deps.ts";
import { libConfigs } from "../astrodon/utils.ts";

interface CompileOptions {
  noCheck?: boolean;
}

export class Builder {
  private dist: string;
  private root: string;

  constructor(root: string) {
    this.root = root;
    this.dist = join(root, "dist");
  }

  /*
   * Download if not done yet, the necessary binary for your OS
   * And inject a small script into the entry file to statically import the downloaded binary
   */
  public async preBundle(
    entry: string,
    binUrl: string = libConfigs[Deno.build.os].url as string,
  ) {

    await Deno.mkdir(this.dist, { recursive: true });

    // Create /dist/mod.ts

    const modTSContent = await Deno.readTextFile(join(this.root, entry));
    const modTSDist = join(this.dist, "mod.b.ts");
    const configFile = join(this.root, "astrodon.config.ts")

    let template = ``;

    try {
      await Deno.stat(configFile);      
      template = `
          import bin from "${binUrl}";
          import appConfig from "./astrodon.config.ts"
          (globalThis as any).astrodonBin = bin;
          (globalThis as any).astrodonAppConfig = appConfig
          ${modTSContent}
      `.trim();
    } catch (_e) {
      console.log(
        `${
          yellow("WARNING:")
        } astrodon.config.ts not found, apps is building with default settings.`,
      );
      template = `
          import bin from "${binUrl}";
          (globalThis as any).astrodonBin = bin;
          ${modTSContent}
      `.trim();
    }
    await Deno.writeTextFile(modTSDist, template);
  }

  /*
   * Turn the dist file into an executable
   */
  public async compile(
    output: string = Deno.cwd(),
    options: CompileOptions = {},
  ) {
    const modTSDist = join(this.dist, "mod.b.ts");
    const modTSDistTemp = join(this.root, "dist_mod.ts");

    await Deno.copyFile(modTSDist, modTSDistTemp);

    await exec(
      `deno compile -A --unstable ${
        options.noCheck ? "--no-check" : ""
      } --output ${output} ${modTSDistTemp} `,
    );

    await Deno.remove(modTSDistTemp);
  }

  /*
   * Package assets into TypeScript files
   *
   * From .so to .b.ts
   */
  public static async packageAssets(
    input: string,
    output: string,
    outOptions: Deno.OpenOptions = {
      create: true,
      write: true,
      truncate: true,
    },
  ) {
    const ps = new PassThrough();
    const compressor = compress(input, ps, console.log);
    const outFile = await Deno.open(output, outOptions);
    const bundler = tsBundle(ps, outFile, await ast(input));
    await compressor;
    ps.close();
    await bundler;
    outFile.close();
  }
}
