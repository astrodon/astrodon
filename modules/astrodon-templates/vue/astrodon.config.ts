
import { dirname, join, fromFileUrl } from 'https://deno.land/std/path/mod.ts';
const __dirname = dirname(fromFileUrl(import.meta.url));

export default {
  name: 'default_example',
  version: '0.0.1',
  description: '',
  build: {
    out: join(__dirname, 'dist'),
    entry: join(__dirname, 'mod.ts'),
    assets: join(__dirname, 'renderer', 'dist')
  },
}