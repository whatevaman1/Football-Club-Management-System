const mysql = require('mysql2');

// Configure your MySQL credentials here
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'YOUR_PASSWORD_HERE', // Add your local MySQL password here
    database: 'FootballClubDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();
