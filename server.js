const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./database'); // Import the database

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); // To parse JSON bodies

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to save a favorite currency pair
app.post('/api/favorites', (req, res) => {
    const { baseCurrency, targetCurrency } = req.body;
    db.run("INSERT INTO favorites (base_currency, target_currency) VALUES (?, ?)", [baseCurrency, targetCurrency], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// API endpoint to get all favorite currency pairs
app.get('/api/favorites', (req, res) => {
    db.all("SELECT * FROM favorites", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
