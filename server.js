const express = require('express'); // Import the Express library
const bodyParser = require('body-parser'); // Import the body-parser middleware for parsing JSON requests
const { Sequelize, DataTypes } = require('sequelize'); // Import Sequelize and DataTypes for database interaction
const path = require('path'); // Import path module to handle file paths

const app = express(); // Create an Express application
const port = process.env.PORT || 3000; // Define the port for the server to listen on

// Set up the SQLite database using Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite' // Specify the storage location for the SQLite database file
});

// Define the FavoritePair model representing the favorite currency pairs table in the database
const FavoritePair = sequelize.define('FavoritePair', {
  baseCurrency: {
    type: DataTypes.STRING, // Define a string column for the base currency
    allowNull: false, // Make this field required
  },
  targetCurrency: {
    type: DataTypes.STRING, // Define a string column for the target currency
    allowNull: false, // Make this field required
  },
}, {
  indexes: [
    {
      unique: true, // Ensure that each base-target currency pair is unique
      fields: ['baseCurrency', 'targetCurrency']
    }
  ]
});

app.use(bodyParser.json()); // Use body-parser middleware to parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

// Sync the database, creating the table if it doesn't exist
sequelize.sync();

// API endpoint to get all favorite pairs
app.get('/api/favorites', async (req, res) => {
  const favorites = await FavoritePair.findAll(); // Fetch all favorite pairs from the database
  res.json(favorites); // Respond with the fetched favorite pairs in JSON format
});

// API endpoint to add a new favorite pair
app.post('/api/favorites', async (req, res) => {
  try {
    const { baseCurrency, targetCurrency } = req.body; // Extract base and target currencies from the request body
    const favorite = await FavoritePair.create({ baseCurrency, targetCurrency }); // Create a new favorite pair in the database
    res.json(favorite); // Respond with the created favorite pair in JSON format
  } catch (error) {
    res.status(400).json({ error: error.message }); // Handle errors and respond with a 400 status code and error message
  }
});

// API endpoint to delete a favorite pair
app.delete('/api/favorites', async (req, res) => {
  try {
    const { baseCurrency, targetCurrency } = req.body; // Extract base and target currencies from the request body
    const result = await FavoritePair.destroy({
      where: {
        baseCurrency,
        targetCurrency
      }
    });
    if (result) {
      res.json({ message: 'Favorite pair deleted' }); // Respond with a success message if the pair was deleted
    } else {
      res.status(404).json({ error: 'Favorite pair not found' }); // Respond with a 404 status code if the pair was not found
    }
  } catch (error) {
    res.status(400).json({ error: error.message }); // Handle errors and respond with a 400 status code and error message
  }
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
