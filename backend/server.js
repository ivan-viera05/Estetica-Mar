require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS
app.use((req, res, next) => {
    const allowedOrigins = [
        'https://estetica-mar.vercel.app', // Agrega tu dominio final de Vercel
        'https://estetica-4tv31g5tr-ivan-viera05s-projects.vercel.app',
        'http://localhost:3000'
    ];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '..')));

// API endpoint
app.get('/api/calendly-data', async (req, res) => {
    const { url } = req.query;
    try {
        if (!process.env.CALENDLY_API_TOKEN) {
            throw new Error('Calendly API token no configurado');
        }

        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${process.env.CALENDLY_API_TOKEN}`,
                "Content-Type": "application/json"
            }
        });
        
        if (!response.ok) {
            throw new Error(`Calendly respondió con status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: "Error fetching Calendly data",
            details: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});