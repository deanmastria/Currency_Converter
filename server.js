const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Set up the database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const FavoritePair = sequelize.define('FavoritePair', {
  baseCurrency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetCurrency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['baseCurrency', 'targetCurrency']
    }
  ]
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create the database table
sequelize.sync();

// API to get favorite pairs
app.get('/api/favorites', async (req, res) => {
  const favorites = await FavoritePair.findAll();
  res.json(favorites);
});

// API to add a favorite pair
app.post('/api/favorites', async (req, res) => {
  try {
    const { baseCurrency, targetCurrency } = req.body;
    const favorite = await FavoritePair.create({ baseCurrency, targetCurrency });
    res.json(favorite);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API to delete a favorite pair
app.delete('/api/favorites', async (req, res) => {
  try {
    const { baseCurrency, targetCurrency } = req.body;
    const result = await FavoritePair.destroy({
      where: {
        baseCurrency,
        targetCurrency
      }
    });
    if (result) {
      res.json({ message: 'Favorite pair deleted' });
    } else {
      res.status(404).json({ error: 'Favorite pair not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
