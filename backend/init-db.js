const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

async function importDatabase() {
    const dbConfig = {
        host: '127.0.0.1',
        user: 'root',
        password: 'root', // confirmed earlier
        multipleStatements: true 
    };

    console.log("Connecting to MySQL to recreate normalized schema...");
    try {
        const connection = await mysql.createConnection(dbConfig);

        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        await connection.query(schemaSQL);
        console.log("✅ schema.sql executed successfully.");

        const dataPath = path.join(__dirname, '../database/data.sql');
        const dataSQL = fs.readFileSync(dataPath, 'utf8');
        await connection.query(dataSQL);
        console.log("✅ data.sql executed successfully.");

        const queriesPath = path.join(__dirname, '../database/queries.sql');
        const queriesSQL = readQueries(fs.readFileSync(queriesPath, 'utf8'));
        for (const query of queriesSQL) {
            if(query.trim()) await connection.query(query);
        }
        console.log("✅ queries.sql executed successfully.");

        await connection.end();
    } catch (err) {
        console.error("❌ Error executing SQL:", err.message);
    }
}

function readQueries(sqlContent) {
    const queries = [];
    sqlContent = sqlContent.replace(/DELIMITER \/\//g, '').replace(/DELIMITER ;/g, '');
    let chunks = sqlContent.split('//');
    const topPart = chunks[0].split(';');
    topPart.forEach(p => queries.push(p));
    if (chunks.length > 1) {
        queries.push(chunks[1]); // Procedure
        queries.push(chunks[2]); // Trigger
    }
    return queries;
}

importDatabase();
