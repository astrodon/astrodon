import { build } from "https://raw.githubusercontent.com/denoland/eszip/main/lib/mod.ts";
import { writeAll } from "https://deno.land/std@0.128.0/streams/conversion.ts";
import { AppBuildOptions, AppConfig, AppInfo } from "../astrodon/mod.ts";
import { Installer } from "https://deno.land/x/installer@0.1.0/mod.ts";
import { fileFormat, getBinaryPath, OSNames } from "../astrodon-manager/mod.ts";
import { join } from "https://deno.land/std@0.122.0/path/win32.ts";
import { Logger } from "../astrodon-manager/deps.ts";

const exec = async (cmd: string) => {
  const p = Deno.run({
    cmd: cmd.split(" "),
  });

  await p.status();
};

export class Develop {
  private info: AppInfo;

  constructor(private config: AppConfig, private logger = new Logger("run")) {
    this.info = config.info;
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
  private info: AppInfo;
  private finalBinPath: string;

  constructor(
    private config: AppConfig,
    private logger = new Logger("build"),
    private os: OSNames = Deno.build.os,
  ) {
    this.info = config.info;
    
    const binName = join(this.config.dist, this.info.name);
    
    // Put the OS name as sufix, this prevents overwriting between the darwin and linux builds
    const binSufix = this.config?.build?.targets?.[this.os]?.sufix ?? this.os;
    
    // Simply add .exe on the Windows build
    const binExtension = fileFormat(this.os);
      
    this.finalBinPath = `${binName}_${binSufix}${binExtension}`;
  }

  /**
   * Like `deno compile` but for our custom runtime
   */

  async compile() {
    const binPath = await getBinaryPath("standalone", this.logger, this.os);

    const entrypoint = new URL(`file://${this.config.entry}`).href;

    // Bundle the soure code
    const eszip = await build([entrypoint]);

    // Get the base runtime
    const originalBin = await Deno.readFile(binPath);

    // Create the dist folder
    Deno.mkdir(this.config.dist, { recursive: true });

    // Prepare the final executable

    const finalBin = await Deno.create(this.finalBinPath);

    const eszipPos = original_bin.length;
    const metadataPos = eszip_pos + eszip.length;

    const trailer = new Uint8Array([
      ...new TextEncoder().encode("4str0d0n"),
      ...numberToByteArray(eszipPos),
      ...numberToByteArray(metadataPos),
    ]);

    const metadata = {
      entrypoint,
      info: this.info,
    };

    // Put it all together into the final executable
    await writeAll(finalBin, originalBin);
    await writeAll(finalBin, eszip);
    await writeAll(
      finalBin,
      new TextEncoder().encode(JSON.stringify(metadata)),
    );
    await writeAll(finalBin, trailer);

    await finalBin.close();
  }

  /**
   * Create an installer for the compiled executable
   */
  async makeInstaller() {
    
    const out_path = join(this.config.dist, "installer");

    const installer = new Installer({
      out_path,
      src_path: this.finalBinPath,
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
