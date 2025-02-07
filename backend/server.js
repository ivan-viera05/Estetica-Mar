require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '..')));

app.get('/api/calendly-data', async (req, res) => {
    const { url } = req.query;
    try {
        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${process.env.CALENDLY_API_TOKEN}`,
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: "Error fetching Calendly data" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});