export const getIndex = async () => {
  const isDev = Deno.env.get("DEV") == "true";
  //deno-lint-ignore no-explicit-any
  const isProd = (globalThis as any).astrodonProduction

  if (isDev || isProd) {
    return `file://${await Deno.realPath('./renderer/dist/index.html')}`;
  } else {
    return `https://raw.githack.com/denyncrawford/astrodon/main/examples/compiled_vuejs_app/renderer/src/index.html` //"<your_remote_html>";
  }
};