const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite' // This will create a file-based SQLite database
});

// Define the Favorite model
const Favorite = sequelize.define('Favorite', {
    baseCurrency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    targetCurrency: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

async function initializeDatabase() {
    await sequelize.sync(); // Sync all models with the database
    console.log('Database & tables created!');
}

module.exports = { Favorite, initializeDatabase, sequelize };
