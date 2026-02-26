const express = require("express");
const app = express();

app.use(express.json());

app.post("/verify", (req, res) => {
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Running on", PORT);
});