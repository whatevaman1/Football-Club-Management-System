const mysql = require('mysql2');

// Configure your MySQL credentials here
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root', // Change this to your local MySQL password
    database: 'FootballClubDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();
