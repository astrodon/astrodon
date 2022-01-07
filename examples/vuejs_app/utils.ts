export const flat = (obj = {}, res = {}, extraKey = "") => {
  for (const key in obj) {
    if (typeof obj[key] !== "object" || obj[key] instanceof Uint8Array) {
      res[extraKey + key] = obj[key];
    } else {
      flat(obj[key], res, `${extraKey}${key}/`);
    }
  }
  return res;
};