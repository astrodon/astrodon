// Wait for the trigger event to be fired
await Deno.core.opAsync("listen_event", { name: "to-deno" });

// Send response to Rust
await Deno.core.opAsync("send_to_window", {
  id: "window-id",
  event: "to-rust",
  content: JSON.stringify({
    "astrodon": "nice",
  }),
});

// Create window
await Deno.core.opAsync("run_window", {
  id: "window-id",
  title: "Astrodon",
  content: {
    _type: "Url",
    url: "https://github.com/astrodon/astrodon",
  },
});

// Close window
await Deno.core.opAsync("close_window", {
  id: "window-id",
});
