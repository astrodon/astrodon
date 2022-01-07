
// implemented by @trgwii

type bundle = Uint8Array | { [k: string]: bundle };

export const flat = (obj: bundle, path = ''): { [k: string]: Uint8Array } => {
  if (obj instanceof Uint8Array) {
    return { [path]: obj };
  }
  return Object.fromEntries(Object.entries(obj).flatMap(([k, v]) => {
    return Object.entries(flat(v,`${path}/${k}`));
  }))
}
