
type snapshot = Record<string, Uint8Array | unknown>;

export const flat = (obj: snapshot, res?: snapshot, extraKey = "") => {
  if (!res) res = {};
  for (const key in obj) {
    if (typeof obj[key] !== "object" || obj[key] instanceof Uint8Array) {
      res[extraKey + key] = obj[key];
    } else {
      //@ts-ignore: ts still supposes obj[key] can be an instanceof Uint8Array but it is impossible
      flat(obj[key], res, `${extraKey}${key}/`);
    }
  }
  return res;
};
