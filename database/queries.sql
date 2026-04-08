USE FootballClubDB;

-- 1. Fetch player details with club (INNER JOIN)
SELECT p.PlayerID, p.Name AS PlayerName, p.Position, p.Nationality, c.Name AS ClubName
FROM Player p
LEFT JOIN Contract cont ON p.PlayerID = cont.PlayerID
LEFT JOIN Club c ON cont.ClubID = c.ClubID;

-- 2. Salary history of a player
SELECT p.Name AS PlayerName, ps.Amount, ps.DatePaid
FROM PlayerSalary ps
INNER JOIN Player p ON ps.PlayerID = p.PlayerID
ORDER BY ps.DatePaid DESC;

-- 3. Loaned players list (INNER JOIN with aliases)
SELECT 
    p.Name AS PlayerName, 
    c1.Name AS ParentClub, 
    c2.Name AS LoanClub, 
    ld.StartDate, 
    ld.EndDate
FROM LoanDetail ld
INNER JOIN Player p ON ld.PlayerID = p.PlayerID
INNER JOIN Club c1 ON ld.ParentClubID = c1.ClubID
INNER JOIN Club c2 ON ld.LoanClubID = c2.ClubID;

-- 4. Top performers (Goals + Assists) using Aggregate/Subquery (View)
CREATE OR REPLACE VIEW TopPerformers AS
SELECT p.Name AS PlayerName, perf.Season, perf.MatchesPlayed, perf.Goals, perf.Assists, (perf.Goals + perf.Assists) AS TotalInvolvements
FROM Performance perf
INNER JOIN Player p ON perf.PlayerID = p.PlayerID
ORDER BY TotalInvolvements DESC;

SELECT * FROM TopPerformers;

-- 5. Total wages spent by each club (Aggregate & JOIN)
SELECT c.Name AS ClubName, SUM(cont.WeeklyWage) AS TotalWeeklyWage
FROM Contract cont
INNER JOIN Club c ON cont.ClubID = c.ClubID
GROUP BY c.ClubID
ORDER BY TotalWeeklyWage DESC;

-- 6. Players who earn more than the average wage (Subquery)
SELECT p.Name, c.WeeklyWage 
FROM Contract c
INNER JOIN Player p ON c.PlayerID = p.PlayerID
WHERE c.WeeklyWage > (SELECT AVG(WeeklyWage) FROM Contract);

-- 7. Stored Procedure: Get players by Club Name
CREATE PROCEDURE GetPlayersByClub(IN club_name VARCHAR(100))
BEGIN
    SELECT p.Name, p.Position, p.Nationality
    FROM Player p
    INNER JOIN Contract cont ON p.PlayerID = cont.PlayerID
    INNER JOIN Club c ON cont.ClubID = c.ClubID
    WHERE c.Name = club_name;
END;

-- Calling the procedure:
-- CALL GetPlayersByClub('Real Madrid CF');

-- 8. Trigger: Prevent adding a contract with end date before start date
CREATE TRIGGER Before_Contract_Insert
BEFORE INSERT ON Contract
FOR EACH ROW
BEGIN
    IF NEW.EndDate <= NEW.StartDate THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'End Date must be after Start Date';
    END IF;
END;

-- 9. Free Agents View
CREATE OR REPLACE VIEW FreeAgents AS
SELECT * FROM Player
WHERE PlayerID NOT IN (SELECT PlayerID FROM Contract);

-- 10. Update Operations (Performance Example)
UPDATE Performance SET Goals = Goals + 1, Assists = Assists + 1 WHERE PlayerID = 1 AND Season = '2023-2024';

-- 11. Value for money analysis (Cost per goal)
SELECT p.Name, c.WeeklyWage, perf.Goals, (c.WeeklyWage * 52 / NULLIF(perf.Goals, 0)) AS CostPerGoal
FROM Contract c
JOIN Player p ON c.PlayerID = p.PlayerID
JOIN Performance perf ON p.PlayerID = perf.PlayerID AND perf.Season = '2023-2024';

-- 12. Loan status tracking (Days remaining)
SELECT p.Name, DATEDIFF(ld.EndDate, CURDATE()) AS DaysRemaining
FROM LoanDetail ld
JOIN Player p ON ld.PlayerID = p.PlayerID;

-- 13. Coach workload (Player count per coach)
SELECT c.Name AS CoachName, COUNT(pc.PlayerID) AS PlayerCount
FROM Coach c
LEFT JOIN PlayerCoach pc ON c.CoachID = pc.CoachID
GROUP BY c.CoachID;

-- 14. Discipline risk categorization (CASE statement example using cards if existed - fallback to matches played)
SELECT Name, 
CASE 
    WHEN MatchesPlayed < 10 THEN 'Low Experience'
    WHEN MatchesPlayed BETWEEN 10 AND 25 THEN 'Regular Starter'
    ELSE 'Key Player'
END AS Category
FROM Player p
JOIN Performance perf ON p.PlayerID = perf.PlayerID;

-- 15. Age-based filtering
SELECT Name, DateOfBirth, TIMESTAMPDIFF(YEAR, DateOfBirth, CURDATE()) AS Age 
FROM Player
WHERE TIMESTAMPDIFF(YEAR, DateOfBirth, CURDATE()) > 30;

-- 16. Performance efficiency (Matches per contribution)
SELECT p.Name, (perf.MatchesPlayed / NULLIF(perf.Goals + perf.Assists, 0)) AS MatchesPerContribution
FROM Performance perf
JOIN Player p ON perf.PlayerID = p.PlayerID;

-- 17. Club-level aggregation (Team goals, averages)
SELECT c.Name AS ClubName, SUM(perf.Goals) AS TotalGoals, AVG(perf.Assists) AS AvgAssists
FROM Club c
JOIN Contract cont ON c.ClubID = cont.ClubID
JOIN Performance perf ON cont.PlayerID = perf.PlayerID
GROUP BY c.ClubID;

-- 18. Bonus percentage calculation (10% bonus on Weekly Wage)
SELECT p.Name, (cont.WeeklyWage * 0.10) AS BonusAmount
FROM Contract cont
JOIN Player p ON cont.PlayerID = p.PlayerID;

-- 19. Salary aggregation per club (MAX, MIN, AVG)
SELECT c.Name AS ClubName, MAX(cont.WeeklyWage) AS MaxWage, MIN(cont.WeeklyWage) AS MinWage, AVG(cont.WeeklyWage) AS AvgWage
FROM Contract cont
JOIN Club c ON cont.ClubID = c.ClubID
GROUP BY c.ClubID;

-- 20. Subquery using EXISTS (Clubs with loaned players)
SELECT Name FROM Club c
WHERE EXISTS (SELECT 1 FROM LoanDetail ld WHERE ld.ParentClubID = c.ClubID);

-- 21. UNION operation (Player status combination)
SELECT Name, 'Contracted' AS Status FROM Player p JOIN Contract c ON p.PlayerID = c.PlayerID
UNION
SELECT Name, 'Free Agent' AS Status FROM Player p WHERE p.PlayerID NOT IN (SELECT PlayerID FROM Contract);

-- 22. UNION with sorting (Oldest and Youngest Players)
(SELECT Name, DateOfBirth, 'Oldest' AS Category FROM Player ORDER BY DateOfBirth ASC LIMIT 1)
UNION
(SELECT Name, DateOfBirth, 'Youngest' AS Category FROM Player ORDER BY DateOfBirth DESC LIMIT 1);

-- 23. Aggregation across groups (Goals by nationality)
SELECT p.Nationality, SUM(perf.Goals) AS TotalNationalGoals
FROM Player p
JOIN Performance perf ON p.PlayerID = perf.PlayerID
GROUP BY p.Nationality;
