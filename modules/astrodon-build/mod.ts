import { build } from "https://raw.githubusercontent.com/denoland/eszip/main/lib/mod.ts";
import { writeAll } from "https://deno.land/std@0.128.0/streams/conversion.ts";
import { IAppConfig, IPermissionsOptions, OSNames } from "../astrodon/mod.ts";
import { Installer } from "https://deno.land/x/installer@0.1.1/mod.ts";
import { fileFormat, getBinaryPath } from "../astrodon-manager/mod.ts";
import { join } from "https://deno.land/std@0.122.0/path/mod.ts";
import { Logger } from "../astrodon-manager/deps.ts";

const exec = async (cmd: string, args: string[] = []) => {
  const p = Deno.run({
    cmd: cmd.split(" ").concat(args).filter(Boolean),
  });

  await p.status();
  p.close();
};

const DEFAULT_PERMISSIONS = <IPermissionsOptions> {
  allow_hrtime: false,
  prompt: false,
};

const getSanitizedConfig = (
  config: IAppConfig,
): IAppConfig => {
  // Apply default permissions if not specified
  config.permissions = Object.assign(
    DEFAULT_PERMISSIONS,
    config.permissions,
  );

  // Disable unstable mode by default
  config.unstable = config.unstable ?? false;

  return config;
};

interface Metadata {
  entrypoint: string;
  // Please provide a correction for this to work with the new interface on rust side, once it is done we can
  // provide the correct data to this interface
  info: AppInfo;
}

interface DevelopOptions {
  config: IAppConfig;
  logger?: Logger;
  useLocalBinaries?: boolean;
}

export class Develop {
  private config: IAppConfig;
  private logger: Logger;
  private process: Deno.Process<Deno.RunOptions> | undefined;
  private useLocalBinaries: boolean;

  constructor(
    { config, logger = new Logger("run"), useLocalBinaries = false }:
      DevelopOptions,
  ) {
    this.config = config;
    this.logger = logger;
    this.config.id = `${this.config.id}-dev`;
    this.useLocalBinaries = useLocalBinaries;

    // Sanitize config
    this.config = getSanitizedConfig(this.config);
  }

  async run() {
    // Cache modules
    await exec(
      `${Deno.execPath()} cache ${
        this.config?.unstable ? "--unstable" : ""
      } ${this.config.main}`,
    );

    // Launch the runtime
    const binPath = await getBinaryPath(
      "development",
      this.logger,
      Deno.build.os,
      this.useLocalBinaries,
    );

    // Assume it's a local file by default
    let entrypoint = `file://${this.config.main}`;

    if (this.config.main.startsWith("http")) {
      entrypoint = this.config.main;
    }

    const metadata = <Metadata> {
      entrypoint,
      // Please provide a correction for this to work with the new interface on rust side, once it is done we can
      // provide the correct data to this interface
      info: this.config.info,
    };

    const metadata_json = JSON.stringify(metadata);

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

interface BuilderOptions {
  config: IAppConfig;
  logger?: Logger;
  os?: OSNames;
  useLocalBinaries?: boolean;
}

export class Builder {
  private config: IAppConfig;
  private finalBinPath: string;
  private os: OSNames;
  private logger: Logger;
  private useLocalBinaries: boolean;

  constructor(
    {
      config,
      logger = new Logger("build"),
      os = Deno.build.os,
      useLocalBinaries = false,
    }: BuilderOptions,
  ) {
    this.config = config;
    this.logger = logger;
    this.os = os;
    this.useLocalBinaries = useLocalBinaries;

    // Sanitize config
    this.config = getSanitizedConfig(this.config);
    // Make this prettier for now it is hardcoded
    const binName = join(
      this.config.build?.output || "./dist",
      this.config.name,
    );

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
    const binPath = await getBinaryPath(
      "standalone",
      this.logger,
      this.os,
      this.useLocalBinaries,
    );

    const entrypoint = new URL(`file://${this.config.main}`).href;

    // Bundle the soure code
    const eszip = await build([entrypoint]);

    // Get the base runtime
    const originalBin = await Deno.readFile(binPath);

    // Create the dist folder
    await Deno.mkdir(this.config.build?.output || "./dist", {
      recursive: true,
    });

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
      // Please provide a correction for this to work with the new interface on rust side, once it is done we can
      // provide the correct data to this interface
      info: this.config.info,
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
    const out_path = join(this.config.build?.output || "./dist", "installer");
    // Please provide a correction for this to work with the new interface on rust side, once it is done we can
    // provide the correct data to this variable
    const info = this.config.info;

    const installer = new Installer({
      out_path,
      src_path: this.finalBinPath,
      package: {
        product_name: info.name,
        version: info.version,
        description: info.shortDescription,
        homepage: info.homepage,
        authors: [info.author],
        default_run: info.name,
      },
      bundle: {
        identifier: info.id,
        icon: info.icon,
        resources: info.resources,
        copyright: info.copyright,
        short_description: info.shortDescription,
        long_description: info.longDescription,
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
