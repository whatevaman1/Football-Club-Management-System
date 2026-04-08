const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// TASK 1: Fix Existing APIs (Normalize Joins) & TASK 3: Filtering/Search
// ============================================

// 1. Get all Players (Joined via Contract) + Filters
app.get('/api/players', async (req, res) => {
    try {
        const { club, position, search } = req.query;
        let query = `
            SELECT p.PlayerID, p.Name, p.Position, p.ShirtNumber, p.Nationality, cl.Name AS ClubName
            FROM Player p
            LEFT JOIN Contract c ON p.PlayerID = c.PlayerID
            LEFT JOIN Club cl ON c.ClubID = cl.ClubID
            WHERE 1=1
        `;
        const params = [];

        if (club) {
            query += ` AND cl.Name = ?`;
            params.push(club);
        }
        if (position) {
            query += ` AND p.Position = ?`;
            params.push(position);
        }
        if (search) {
            query += ` AND p.Name LIKE ?`;
            params.push(`%${search}%`);
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Get Performance (Joined via Contract) + Filters
app.get('/api/performance', async (req, res) => {
    try {
        const { club } = req.query;
        let query = `
            SELECT p.Name AS PlayerName, cl.Name AS ClubName, perf.Season, perf.MatchesPlayed, perf.Goals, perf.Assists, (perf.Goals + perf.Assists) AS TotalInvolvements
            FROM Performance perf
            INNER JOIN Player p ON perf.PlayerID = p.PlayerID
            LEFT JOIN Contract c ON p.PlayerID = c.PlayerID
            LEFT JOIN Club cl ON c.ClubID = cl.ClubID
            WHERE 1=1
        `;
        const params = [];

        if (club) {
            query += ` AND cl.Name = ?`;
            params.push(club);
        }

        query += ` ORDER BY TotalInvolvements DESC`;

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// TASK 2: Missing Core APIs
// ============================================

// 1. Fetch all contracts
app.get('/api/contracts', async (req, res) => {
    try {
        const query = `
            SELECT c.ContractID, p.Name AS PlayerName, cl.Name AS ClubName, c.StartDate, c.EndDate, c.WeeklyWage
            FROM Contract c
            INNER JOIN Player p ON c.PlayerID = p.PlayerID
            INNER JOIN Club cl ON c.ClubID = cl.ClubID
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Add Contract
app.post('/api/contracts', async (req, res) => {
    try {
        const { playerId, clubId, startDate, endDate, weeklyWage } = req.body;
        const result = await db.query(
            `INSERT INTO Contract (PlayerID, ClubID, StartDate, EndDate, WeeklyWage) VALUES (?, ?, ?, ?, ?)`,
            [playerId, clubId, startDate, endDate, weeklyWage || 0]
        );
        res.json({ message: 'Contract added successfully', id: result[0].insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Free Agents API
app.get('/api/free_agents', async (req, res) => {
    try {
        const query = `
            SELECT p.PlayerID, p.Name, p.Position, p.Nationality
            FROM Player p
            LEFT JOIN Contract c ON p.PlayerID = c.PlayerID
            WHERE c.ContractID IS NULL
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Player Profile API
app.get('/api/player/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [[player]] = await db.query(`
            SELECT p.*, cl.Name AS CurrentClub
            FROM Player p
            LEFT JOIN Contract c ON p.PlayerID = c.PlayerID
            LEFT JOIN Club cl ON c.ClubID = cl.ClubID
            WHERE p.PlayerID = ?
        `, [id]);
        
        const [performance] = await db.query(`SELECT * FROM Performance WHERE PlayerID = ?`, [id]);
        const [salaries] = await db.query(`SELECT Amount, DatePaid FROM PlayerSalary WHERE PlayerID = ? ORDER BY DatePaid DESC`, [id]);

        if (!player) return res.status(404).json({ message: 'Player not found' });

        res.json({
            details: player,
            performance: performance,
            salaries: salaries
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add Player (Modified to not include ClubID directly in Player table)
app.post('/api/players', async (req, res) => {
    try {
        const { name, dob, nationality, position, shirtNumber, clubId } = req.body;
        
        // 1. Insert Player
        const result = await db.query(
            `INSERT INTO Player (Name, DateOfBirth, Nationality, Position, ShirtNumber) VALUES (?, ?, ?, ?, ?)`,
            [name, dob || null, nationality || null, position || null, shirtNumber || null]
        );
        
        const playerId = result[0].insertId;

        // 2. Insert Contract if clubId provided
        if (clubId) {
            await db.query(
                `INSERT INTO Contract (PlayerID, ClubID, StartDate, EndDate, WeeklyWage) VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 YEAR), 50000)`,
                [playerId, clubId]
            );
        }

        res.json({ message: 'Player added successfully', id: playerId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// TASK 4: Advanced Features
// ============================================

// 1. Top Scorers API
app.get('/api/top_scorers', async (req, res) => {
    try {
        const query = `
            SELECT p.Name, perf.Goals 
            FROM Performance perf
            INNER JOIN Player p ON perf.PlayerID = p.PlayerID
            ORDER BY perf.Goals DESC 
            LIMIT 5
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Contract Expiry Alert
app.get('/api/expiring_contracts', async (req, res) => {
    try {
        const query = `
            SELECT p.Name, cl.Name AS Club, c.EndDate
            FROM Contract c
            INNER JOIN Player p ON c.PlayerID = p.PlayerID
            INNER JOIN Club cl ON c.ClubID = cl.ClubID
            WHERE c.EndDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 6 MONTH)
            ORDER BY c.EndDate ASC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Player Comparison API
app.get('/api/compare', async (req, res) => {
    try {
        const { player1, player2 } = req.query;
        if (!player1 || !player2) return res.status(400).json({ message: 'Please provide player1 and player2 IDs' });

        const query = `
            SELECT p.PlayerID, p.Name, perf.MatchesPlayed, perf.Goals, perf.Assists
            FROM Player p
            LEFT JOIN Performance perf ON p.PlayerID = perf.PlayerID
            WHERE p.PlayerID IN (?, ?)
        `;
        const [rows] = await db.query(query, [player1, player2]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Enhanced Dashboard Stats
app.get('/api/dashboard', async (req, res) => {
    try {
        const [[{ totalPlayers }]] = await db.query(`SELECT COUNT(*) AS totalPlayers FROM Player`);
        const [[{ totalClubs }]] = await db.query(`SELECT COUNT(*) AS totalClubs FROM Club`);
        const [[{ loanedPlayers }]] = await db.query(`SELECT COUNT(*) AS loanedPlayers FROM LoanDetail`);
        
        const [[topScorer]] = await db.query(`
            SELECT p.Name, perf.Goals FROM Performance perf 
            JOIN Player p ON perf.PlayerID = p.PlayerID 
            ORDER BY perf.Goals DESC LIMIT 1
        `);
        
        const [[topAssistProvider]] = await db.query(`
            SELECT p.Name, perf.Assists FROM Performance perf 
            JOIN Player p ON perf.PlayerID = p.PlayerID 
            ORDER BY perf.Assists DESC LIMIT 1
        `);
        
        const [[mostActivePlayer]] = await db.query(`
            SELECT p.Name, perf.MatchesPlayed FROM Performance perf 
            JOIN Player p ON perf.PlayerID = p.PlayerID 
            ORDER BY perf.MatchesPlayed DESC LIMIT 1
        `);
        
        res.json({
            totalPlayers,
            totalClubs,
            loanedPlayers,
            topScorer: topScorer ? topScorer.Name : 'N/A',
            topAssistProvider: topAssistProvider ? topAssistProvider.Name : 'N/A',
            mostActivePlayer: mostActivePlayer ? mostActivePlayer.Name : 'N/A'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// Other Existing Endpoints (Clubs, Loans, Salary)
// ============================================

app.get('/api/clubs', async (req, res) => {
    try {
        const query = `
            SELECT 
                c.*, 
                m.Name AS ManagerName,
                GROUP_CONCAT(co.Name SEPARATOR ', ') AS Coaches
            FROM Club c
            LEFT JOIN Manager m ON c.ClubID = m.ClubID
            LEFT JOIN Coach co ON c.ClubID = co.ClubID
            GROUP BY c.ClubID
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/loaned', async (req, res) => {
    try {
        const query = `
            SELECT p.Name AS PlayerName, c1.Name AS ParentClub, c2.Name AS LoanClub, ld.StartDate, ld.EndDate
            FROM LoanDetail ld
            INNER JOIN Player p ON ld.PlayerID = p.PlayerID
            INNER JOIN Club c1 ON ld.ParentClubID = c1.ClubID
            INNER JOIN Club c2 ON ld.LoanClubID = c2.ClubID
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/salaries', async (req, res) => {
    try {
        const query = `
            SELECT p.Name AS PlayerName, ps.Amount, ps.DatePaid 
            FROM PlayerSalary ps
            JOIN Player p ON ps.PlayerID = p.PlayerID
            ORDER BY ps.DatePaid DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/players/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(`DELETE FROM Player WHERE PlayerID = ?`, [id]);
        res.json({ message: 'Player deleted successfully' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
