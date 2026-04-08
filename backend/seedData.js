const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root', // as confirmed by user
    database: 'FootballClubDB',
});

const firstNames = ['James', 'David', 'Chris', 'George', 'Ronald', 'John', 'Robert', 'Michael', 'William', 'Thomas', 'Daniel', 'Paul', 'Mark', 'Donald', 'Steven', 'Kevin', 'Brian', 'Edward', 'Jason', 'Matthew', 'Gary', 'Timothy', 'Jose', 'Larry', 'Jeffrey', 'Frank', 'Scott', 'Eric', 'Stephen', 'Andrew', 'Raymond', 'Gregory', 'Joshua', 'Jerry', 'Dennis', 'Walter', 'Patrick', 'Peter', 'Harold', 'Douglas'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'];
const nationalities = ['England', 'Spain', 'Germany', 'France', 'Italy', 'Brazil', 'Argentina', 'Portugal', 'Netherlands', 'Belgium', 'Uruguay', 'Croatia'];
const positions = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedDatabase() {
    try {
        console.log("Seeding large database...");
        
        // 1. Add extra clubs
        const newClubs = [
            ['Chelsea FC', 1905, 'Stamford Bridge', 'London'],
            ['Manchester City', 1880, 'Etihad Stadium', 'Manchester'],
            ['Liverpool FC', 1892, 'Anfield', 'Liverpool'],
            ['Inter Milan', 1908, 'San Siro', 'Milan']
        ];
        
        for (const club of newClubs) {
            // Only add if not exists
            const [rows] = await pool.query('SELECT ClubID FROM Club WHERE Name = ?', [club[0]]);
            if (rows.length === 0) {
                await pool.query('INSERT INTO Club (Name, FoundedYear, Stadium, City) VALUES (?, ?, ?, ?)', club);
            }
        }
        
        // 2. Fetch all clubs
        const [clubs] = await pool.query('SELECT ClubID FROM Club');
        const clubIds = clubs.map(c => c.ClubID);
        
        console.log(`Found ${clubIds.length} clubs.`);
        
        // 3. Generate 100 Players
        let playersAdded = 0;
        
        for (let i = 0; i < 100; i++) {
            const name = `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
            const nationality = getRandomItem(nationalities);
            const position = getRandomItem(positions);
            const shirtNumber = getRandomInt(1, 99);
            const clubId = getRandomItem(clubIds);
            
            // Random birth date
            const year = getRandomInt(1985, 2005);
            const month = getRandomInt(1, 12);
            const day = getRandomInt(1, 28);
            const dob = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            
            const [result] = await pool.query(
                'INSERT INTO Player (Name, DateOfBirth, Nationality, Position, ShirtNumber) VALUES (?, ?, ?, ?, ?)',
                [name, dob, nationality, position, shirtNumber]
            );
            
            const playerId = result.insertId;
            
            // Generate Performance
            const matches = getRandomInt(10, 38);
            let goals = 0; let assists = 0;
            if (position === 'Forward') { goals = getRandomInt(5, 30); assists = getRandomInt(2, 15); }
            else if (position === 'Midfielder') { goals = getRandomInt(1, 15); assists = getRandomInt(5, 20); }
            else if (position === 'Defender') { goals = getRandomInt(0, 5); assists = getRandomInt(0, 8); }
            else { goals = 0; assists = getRandomInt(0, 2); }
            
            const yc = getRandomInt(0, 10);
            const rc = getRandomInt(0, 2);
            
            await pool.query(
                `INSERT INTO Performance (PlayerID, Season, MatchesPlayed, Goals, Assists, YellowCards, RedCards) 
                 VALUES (?, '2023-2024', ?, ?, ?, ?, ?)`,
                [playerId, matches, goals, assists, yc, rc]
            );
            
            // Generate Contract & Salary History
            const startYear = getRandomInt(2018, 2023);
            const wage = getRandomInt(10000, 300000);
            
            await pool.query(
                'INSERT INTO Contract (PlayerID, ClubID, StartDate, EndDate, WeeklyWage) VALUES (?, ?, ?, ?, ?)',
                [playerId, clubId, `${startYear}-07-01`, `2026-06-30`, wage]
            );
            
            await pool.query(
                'INSERT INTO PlayerSalary (PlayerID, Amount, DatePaid) VALUES (?, ?, ?)',
                [playerId, wage, '2023-11-01']
            );
            
            playersAdded++;
            if (playersAdded % 25 === 0) console.log(`Generated ${playersAdded} players...`);
        }
        
        console.log("✅ Successfully seeded 100 random players, contracts, and performance data!");
        process.exit(0);
        
    } catch (err) {
        console.error("Error setting up DB:", err);
        process.exit(1);
    }
}

seedDatabase();
