import { ensureDir, exists } from 'https://deno.land/std/fs/mod.ts'
import { join } from 'https://deno.land/std/path/mod.ts'
import "https://deno.land/x/dotenv/load.ts";

const libUrls = {
  linux: {
    url: Deno.env.get("DEV") == 'true' ? './linux.binary.b.ts' : 'https://x.nest.land/degui2@1.0.1-alpha/linux.binary.b.ts',
    name: 'libdegui.so'
  },
  windows: {
    url: Deno.env.get("DEV") == 'true' ? './windows.binary.b.ts' : 'https://x.nest.land/degui2@1.0.1-alpha/windows.binary.b.ts',
    name: 'degui.dll'
  },
}

export const writeBinary = async (dir: string) => {
  const libDir = join(dir, 'lib');
  const installed = await exists(libDir)
  if (installed) return;
  const binary = Deno.build.os === 'windows' ? (await import(libUrls.windows.url)).default : (await import(libUrls.linux.url)).default
  await ensureDir(libDir)
  await Deno.writeFile(join(libDir, Deno.build.os === 'windows' ? libUrls.windows.name : libUrls.linux.name), binary)
  return libDir
}