
<p align="center">
	<img align="center" src="https://avatars.githubusercontent.com/u/97196209?s=200&v=4"  />
	<br>
    <h1 align="center">🦕 Astrodon  </h1>
    <p align="center">Desktop App Framework (not there yet!) for Deno, based in Tauri</p>
</p>

[![Discord Server](https://discordapp.com/api/guilds/928673465882513430/widget.png)](https://discord.gg/adYYqHHDBA)

---

**Note**: Only Windows and Linux is supported at the moment. Feel free to open an issue if you have any trouble!

### 😎 Features
- Create webview windows with your own title and URL
- Send messages from Deno -> Webview

A lot is still missing, but we will get there!

### 🎁 Demo 
Easily run the demo:
```
deno run -A --unstable --reload https://raw.githubusercontent.com/astrodon/astrodon/main/demo/demo.ts
```

### 📜 To-do 
- [ ] Port more features from Tauri
- [ ] Create a Tauri context on the fly instead of relying in `tauri.conf.json`
- [ ] An optional cli to create and manage Astrodon projects
- [ ] Support MacOS
- [ ] Support Webview -> Deno messages 
- [ ] Fix https://github.com/tauri-apps/tauri/issues/3172 instead of relying in a fork

### 👩‍💻 Development
Install the dependencies as indicated in [Tauri's Guide](https://tauri.studio/en/docs/getting-started/intro).

Run the demo locally:
```
cargo build
deno run -A --unstable demo/demo.ts
```



MIT License
