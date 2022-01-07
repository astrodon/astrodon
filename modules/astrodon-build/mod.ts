import { download } from "https://deno.land/x/download/mod.ts";
import { exec } from "https://deno.land/x/exec/mod.ts";
import {
  ast,
  compress,
  join,
  PassThrough,
  tsBundle,
} from "../astrodon/deps.ts";
import { libConfigs } from "../astrodon/utils.ts";

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
    // download bin

    await Deno.mkdir(this.dist, { recursive: true });
    const currentOS = Deno.build.os;
    const currentBin = libConfigs[currentOS].url;
    if (currentBin) {
      await download(currentBin, {
        dir: this.dist,
      });
    }

    // Create /dist/mod.ts

    const modTSContent = await Deno.readTextFile(join(this.root, entry));

    const template = `
        import bin from "${binUrl}";
        (globalThis as any).astrodonBin = bin;
        ${modTSContent}
    `.trim();

    const modTSDist = join(this.dist, "mod.b.ts");
    await Deno.writeTextFile(modTSDist, template);
  }

  /*
   * Turn the dist file into an executable
   */
  public async compile(output: string = Deno.cwd()) {
    const modTSDist = join(this.dist, "mod.b.ts");
    const modTSDistTemp = join(this.root, "dist_mod.ts");

    await Deno.copyFile(modTSDist, modTSDistTemp);

    await exec(
      `deno compile -A --unstable --output ${output} ${modTSDistTemp} `,
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
