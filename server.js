const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 👇 لو رابط الديسكورد متحطوط في Railway Variables
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

// 🔥 ربط الـ Game IDs بالملفات
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

app.post("/verify", async (req, res) => {

    const { projectName, licenseKey } = req.body;

    if (!projectName) {
        return res.json({ error: "No ID sent" });
    }

    let fileId = fileMap[projectName];

    // ✅ لو مش موجود يحمل 000 تلقائي
    if (!fileId) {
        fileId = fileMap["000"];
    }

    const downloadLink =
        "https://drive.google.com/uc?export=download&id=" + fileId;

    // 🔥 بعد التحقق القديم مباشرة نبعث للديسكورد
    try {
        if (WEBHOOK_URL) {

            const message =
`New Download

Game ID:
${projectName}

License Key:
${licenseKey || "Not Provided"}

File ID:
${fileId}

Time:
${new Date().toLocaleString()}

IP:
${req.headers["x-forwarded-for"] || req.socket.remoteAddress}
`;

            await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: "```txt\n" + message + "\n```"
                })
            });
        }
    } catch (err) {
        console.log("Discord error:", err.message);
    }

    res.json({ download: downloadLink });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running...");
});