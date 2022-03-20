<p align="center">
	<img align="center" src="https://avatars.githubusercontent.com/u/97196209?s=200&v=4"  />
	<br>
    <h1 align="center">🦕 Astrodon  </h1>
    <p align="center">Desktop App Framework (not there yet!) for Deno, based on <a href="https://tauri.studio/">Tauri</a></p>
</p>

[![Discord Server](https://discordapp.com/api/guilds/928673465882513430/widget.png)](https://discord.gg/adYYqHHDBA)
[![deno module](https://shield.deno.dev/x/astrodon)](https://deno.land/x/astrodon)
![deno compatibility](https://shield.deno.dev/deno/^1.17)

---

### !!! Important !!!

- Only Windows and Linux are supported at the moment.
- Even some older versions of Windows and old builds of Windows 10 might not come with Webview2 support.
  - A solution to this is to install [Webview2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section) manually on the user's PC. This is a major issue if you are targeting users with "outdated" Windows, this **may** be solved by an installer that installs the webview2 and the app. We are open to suggestions.

### 😎 Features

- Create webview windows with your own title and URL
- Send messages from Deno -> Webview
- Compile your apps as executables

A lot is still missing, but we will get there!

### 🎁 Demo

**Note**: Only Windows and Linux are supported, macOS isn't supported **yet** (see https://github.com/astrodon/astrodon/issues/11)

Easily run the demo:

```
deno run -A --unstable --reload https://deno.land/x/astrodon@0.1.0-alpha.2/examples/hello_world/demo.ts
```

> This snippet always contains the most stable latest version of Astrodon, but you can always use the unstable versions by using github raw URLs on `dev` branch.

### 📜 To-do

- [ ] Port more features from Tauri
- [ ] Create a Tauri context on the fly instead of relying in `tauri.conf.json`
- [ ] An optional cli to create and manage Astrodon projects
- [ ] Support macOS
- [ ] Support Webview -> Deno messages (waiting for https://github.com/denoland/deno/pull/13162)
- [ ] Fix https://github.com/tauri-apps/tauri/issues/3172 instead of relying on a fork

### 👩‍💻 Development

Requisites:

- If you want to compile the binaries yourself: install the dependencies as
  indicated in
  [Tauri's Guide](https://tauri.studio/en/docs/getting-started/intro).
- Create a `.env` file, use `examples/.env.example` as a template.

Run the demo locally:

```
cargo build
deno run -A --unstable examples/hello_world/demo.ts
```

MIT License
