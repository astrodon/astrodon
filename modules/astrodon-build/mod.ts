import { build } from "https://raw.githubusercontent.com/denoland/eszip/main/lib/mod.ts";
import { writeAll } from "https://deno.land/std@0.128.0/streams/conversion.ts";
import {
  AppConfig,
  AppInfo,
  OSNames,
  PermissionsOptions,
} from "../astrodon/mod.ts";
import { Installer } from "https://deno.land/x/installer@0.1.1/mod.ts";
import { fileFormat, getBinaryPath } from "../astrodon-manager/mod.ts";
import { join } from "https://deno.land/std@0.122.0/path/mod.ts";
import { Logger } from "../astrodon-manager/deps.ts";

const exec = async (cmd: string, args: string[] = []) => {
  const p = Deno.run({
    cmd: cmd.split(" ").concat(args),
  });

  await p.status();
  p.close();
};

const DEFAULT_PERMISSIONS = <PermissionsOptions> {
  allow_hrtime: false,
  prompt: false,
};

const getSanitizedPermissions = (
  perms: PermissionsOptions | undefined,
): PermissionsOptions => {
  return Object.assign(DEFAULT_PERMISSIONS, perms);
};

interface Metadata {
  entrypoint: string;
  info: AppInfo;
}

export class Develop {
  private info: AppInfo;
  private process: Deno.Process<Deno.RunOptions> | undefined;

  constructor(private config: AppConfig, private logger = new Logger("run")) {
    this.info = config.info;
    this.info.id = `${this.info.id}-dev`;

    // Apply the default permissions if not specified
    this.info.permissions = getSanitizedPermissions(this.info.permissions);
  }

  async run() {
    // Cache modules
    await exec(`${Deno.execPath()} cache ${this.config.entry}`);

    // Launch the runtime
    const binPath = await getBinaryPath("development", this.logger);

    const entrypoint = new URL(`file://${this.config.entry}`).href;

    const metadata = <Metadata> {
      entrypoint,
      info: this.info,
    };

    const metadata_json = JSON.stringify(metadata);

    console.log(binPath);

    this.process = Deno.run({
      cmd: [binPath, metadata_json],
    });
    this.process.status();
  }

  close() {
    this.process?.kill("SIGTERM");
    this.process?.close();
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

    // Apply the default permissions if not specified
    this.info.permissions = getSanitizedPermissions(this.info.permissions);

    const binName = join(this.config.dist, this.info.name);

    // Put the OS name as sufix, this prevents overwriting between the darwin and linux builds
    const binSuffix = this.config?.build?.targets?.[this.os]?.suffix ?? this.os;

    // Simply add .exe on the Windows build
    const binExtension = fileFormat(this.os);

    this.finalBinPath = `${binName}_${binSuffix}${binExtension}`;
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

    const eszipPos = originalBin.length;
    const metadataPos = eszipPos + eszip.length;

    const trailer = new Uint8Array([
      ...new TextEncoder().encode("4str0d0n"),
      ...numberToByteArray(eszipPos),
      ...numberToByteArray(metadataPos),
    ]);

    const metadata = <Metadata> {
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
