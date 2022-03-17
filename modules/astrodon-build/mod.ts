import { build } from "https://raw.githubusercontent.com/denoland/eszip/main/lib/mod.ts";
import { writeAll } from "https://deno.land/std@0.128.0/streams/conversion.ts";
import { AppConfig, AppInfo } from "../astrodon/mod.ts";
import { Installer } from "https://deno.land/x/installer@0.1.0/mod.ts";
import { getBinaryPath } from "../astrodon-manager/mod.ts";
import { join } from "https://deno.land/std@0.122.0/path/win32.ts";
import { Logger } from "../astrodon-manager/deps.ts";

const exec = async (cmd: string) => {
  const p = Deno.run({
    cmd: cmd.split(" "),
  });

  await p.status();
};

export class Develop {
  private config: AppConfig;
  private info: AppInfo;
  private logger: Logger;

  constructor(config: AppConfig, logger = new Logger("run")) {
    this.config = config;
    this.info = config.info;
    this.logger = logger;
  }

  async run() {
    // Cache modules
    await exec(`${Deno.execPath()} cache ${this.config.entry}`);

    // Launch the runtime
    const binPath = await getBinaryPath("development", this.logger);
    await exec(`${binPath} ${this.config.entry}`);
  }
}

export class Builder {
  private config: AppConfig;
  private info: AppInfo;
  private logger: Logger;

  constructor(config: AppConfig, logger = new Logger("build")) {
    this.config = config;
    this.info = config.info;
    this.logger = logger;
  }

  /**
   * Like `deno compile` but for our custom runtime
   */
  async compile() {
    const binPath = await getBinaryPath("standalone", this.logger);

    const entrypoint = new URL(`file://${this.config.entry}`).href;

    // Bundle the soure code
    const eszip = await build([entrypoint]);

    // Get the base runtime
    const original_bin = await Deno.readFile(binPath);

    // Create the dist folder
    Deno.mkdir(this.config.dist, { recursive: true });

    // Preatere the final executable
    const final_bin_path = `${join(this.config.dist, this.info.name)}${Deno.build.os === "windows" ? ".exe" : ""}`;
    const final_bin = await Deno.create(final_bin_path);

    const eszip_pos = original_bin.length;
    const metadata_pos = eszip_pos + eszip.length;

    const trailer = new Uint8Array([
      ...new TextEncoder().encode("4str0d0n"),
      ...numberToByteArray(eszip_pos),
      ...numberToByteArray(metadata_pos),
    ]);

    const metadata = {
      entrypoint,
      info: this.info,
    };

    // Put it all together into the final executable
    await writeAll(final_bin, original_bin);
    await writeAll(final_bin, eszip);
    await writeAll(
      final_bin,
      new TextEncoder().encode(JSON.stringify(metadata)),
    );
    await writeAll(final_bin, trailer);

    await final_bin.close();
  }

  /**
   * Create an installer for the compiled executable
   */
  async makeInstaller() {
    const src_path = `${join(this.config.dist, this.info.name)}${Deno.build.os === "windows" ? ".exe" : ""}`;
    const out_path = join(this.config.dist, "installer");

    const installer = new Installer({
      out_path,
      src_path,
      package: {
        product_name: this.info.name,
        version: this.info.version,
        description: this.info.shortDescription,
        homepage: this.info.homepage,
        authors: [this.info.author],
        default_run: this.info.name,
      },
      bundle: {
        identifier: this.info.id,
        icon: this.info.icon,
        resources: this.info.resources,
        copyright: this.info.copyright,
        short_description: this.info.shortDescription,
        long_description: this.info.longDescription,
      },
    });

    await installer.createInstaller();
  }
}

const numberToByteArray = (x: number) => {
  const y = Math.floor(x / 2 ** 32);
  return [y, y << 8, y << 16, y << 24, x, x << 8, x << 16, x << 24].map((z) =>
    z >>> 24
  );
};
