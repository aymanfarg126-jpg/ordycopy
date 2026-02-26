const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 ربط الـ Game IDs بالملفات
const fileMap = {
    "109983668079237": "1b1GnSdi7l7Mv53UEKtjNKdlC9IG2fFIq", // Steal A Brainrot
    "131623223084840": "1D4KEFjunZZfh_ZAwxZwSFuG8LRFytlpa", // Escape Tsunami
    "119987266683883": "1WM9DzJRZsfVmb_MKP-EWrukLAKraJRUY", // Survive LAVA
    "72845937010155": "1cBQbIRkIsSuRDqvnt1IkHB26cp40P-Gv", // Gear Slap
    "119865329453489": "1wQrQR7Svd3-ps7HWpoHAktxWzmFESZaI", // Skaters Of Hell
    "16518256559": "1eX-5pbCmfccZHPtEAcsxXmqJAASzwmDm", // Mega Obby
    "139766023909499": "1xjV7kfAKCszuzEasOezWocmxtklly5B-", // Slap DUELS
    "000": "1A1UHkQct18ZeK9qXWm7uynNIPPP5xUzM" // الملف الافتراضي
};

app.post("/verify", (req, res) => {

    const { projectName } = req.body;

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

    res.json({ download: downloadLink });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running...");
});