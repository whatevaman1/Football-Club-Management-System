-- Agent 2: Database Queries & Views
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
DELIMITER //
CREATE PROCEDURE GetPlayersByClub(IN club_name VARCHAR(100))
BEGIN
    SELECT p.Name, p.Position, p.Nationality
    FROM Player p
    INNER JOIN Contract cont ON p.PlayerID = cont.PlayerID
    INNER JOIN Club c ON cont.ClubID = c.ClubID
    WHERE c.Name = club_name;
END //
DELIMITER ;

-- Calling the procedure:
-- CALL GetPlayersByClub('Real Madrid CF');

-- 8. Trigger: Prevent adding a contract with end date before start date
DELIMITER //
CREATE TRIGGER Before_Contract_Insert
BEFORE INSERT ON Contract
FOR EACH ROW
BEGIN
    IF NEW.EndDate <= NEW.StartDate THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'End Date must be after Start Date';
    END IF;
END //
DELIMITER ;
