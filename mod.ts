import { Plug } from "https://deno.land/x/plug/mod.ts";

const libPath = await Deno.realPath("./target/debug/");


// Backwards compatibility with deno-plugin-prepare
const options: Plug.Options = {
  name: "deno_gui",
  url: libPath
};

// Drop-in replacement for `Deno.dlopen`
const library = await Plug.prepare(options, {
    print_something: { parameters: [], result: "void" },
});

library.symbols.print_something();
