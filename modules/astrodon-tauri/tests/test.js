Deno.core.opAsync("listenEvent", { name: "to-deno" }).then(() => {
    Deno.core.opAsync("sendToWindow", {
        id: "window-id",
        event: "to-rust",
        content: JSON.stringify({
            "astrodon": "nice"
        })
    })
})


