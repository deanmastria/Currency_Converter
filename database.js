const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); // You can use a file-based database by specifying a file name

db.serialize(() => {
    // Create a table for favorite currency pairs
    db.run("CREATE TABLE IF NOT EXISTS favorites (id INTEGER PRIMARY KEY AUTOINCREMENT, base_currency TEXT, target_currency TEXT)");
});

module.exports = db;
