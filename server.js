const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/verify", async (req, res) => {

    const { gameUrl, powershell } = req.body;

    if (!gameUrl || !powershell) {
        return res.json({ success: false });
    }

    // تحقق بسيط
    const urlMatch = powershell.match(/\/games\/(\d+)/);
    const gameIdInput = gameUrl.match(/\/games\/(\d+)/);

    if (!urlMatch || !gameIdInput || urlMatch[1] !== gameIdInput[1]) {
        return res.json({ success: false });
    }

    // مثال ويبهوك
    const webhookURL = process.env.WEBHOOK;

    await fetch(webhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content: `New Valid Submission\nGame ID: ${urlMatch[1]}`
        })
    });

    res.json({ success: true });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running...");
});