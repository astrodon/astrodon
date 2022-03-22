// Wait for the trigger event to be fired
await Deno.core.opAsync("listenEvent", { name: "to-deno" });

// Send response to Rust
await Deno.core.opAsync("sendToWindow", {
    id: "window-id",
    event: "to-rust",
    content: JSON.stringify({
        "astrodon": "nice"
    })
})

// Create window
await Deno.core.opAsync("runWindow", {
    id: "window-id",
    title: "Astrodon",
    content: {
        _type: "Url",
        url: "https://github.com/astrodon/astrodon",
    }
});

await Deno.core.opAsync("closeWindow", {
    id: "window-id",
})