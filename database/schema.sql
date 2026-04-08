DROP DATABASE IF EXISTS FootballClubDB;
CREATE DATABASE FootballClubDB;
USE FootballClubDB;

-- 1. Club Table
CREATE TABLE Club (
    ClubID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    FoundedYear INT,
    Stadium VARCHAR(100),
    City VARCHAR(50)
);

-- 2. Manager Table
CREATE TABLE Manager (
    ManagerID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    ClubID INT UNIQUE,
    FOREIGN KEY (ClubID) REFERENCES Club(ClubID) ON DELETE SET NULL
);

-- 3. Player Table
CREATE TABLE Player (
    PlayerID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    DateOfBirth DATE,
    Nationality VARCHAR(50),
    Position VARCHAR(30),
    ShirtNumber INT
);

-- 4. Coach Table
CREATE TABLE Coach (
    CoachID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Role VARCHAR(50),
    ClubID INT,
    FOREIGN KEY (ClubID) REFERENCES Club(ClubID) ON DELETE CASCADE
);

-- 5. Contract Table
CREATE TABLE Contract (
    ContractID INT AUTO_INCREMENT PRIMARY KEY,
    PlayerID INT,
    ClubID INT,
    StartDate DATE,
    EndDate DATE,
    WeeklyWage DECIMAL(10,2),
    FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID) ON DELETE CASCADE,
    FOREIGN KEY (ClubID) REFERENCES Club(ClubID) ON DELETE CASCADE
);

-- 6. PlayerSalary Table (Salary History)
CREATE TABLE PlayerSalary (
    SalaryID INT AUTO_INCREMENT PRIMARY KEY,
    PlayerID INT,
    Amount DECIMAL(10,2),
    DatePaid DATE,
    FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID) ON DELETE CASCADE
);

-- 7. LoanDetail Table
CREATE TABLE LoanDetail (
    LoanID INT AUTO_INCREMENT PRIMARY KEY,
    PlayerID INT,
    ParentClubID INT,
    LoanClubID INT,
    StartDate DATE,
    EndDate DATE,
    FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID) ON DELETE CASCADE,
    FOREIGN KEY (ParentClubID) REFERENCES Club(ClubID) ON DELETE CASCADE,
    FOREIGN KEY (LoanClubID) REFERENCES Club(ClubID) ON DELETE CASCADE
);

-- 8. Performance Table
CREATE TABLE Performance (
    PerformanceID INT AUTO_INCREMENT PRIMARY KEY,
    PlayerID INT,
    Season VARCHAR(10),
    MatchesPlayed INT DEFAULT 0,
    Goals INT DEFAULT 0,
    Assists INT DEFAULT 0,
    YellowCards INT DEFAULT 0,
    RedCards INT DEFAULT 0,
    FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID) ON DELETE CASCADE
);

-- 9. PlayerCoach Table (Many-to-Many)
CREATE TABLE PlayerCoach (
    PlayerID INT,
    CoachID INT,
    PRIMARY KEY (PlayerID, CoachID),
    FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID) ON DELETE CASCADE,
    FOREIGN KEY (CoachID) REFERENCES Coach(CoachID) ON DELETE CASCADE
);

-- 10. TransferHistory Table
CREATE TABLE TransferHistory (
    TransferID INT AUTO_INCREMENT PRIMARY KEY,
    PlayerID INT,
    FromClubID INT,
    ToClubID INT,
    TransferDate DATE,
    TransferFee DECIMAL(15,2),
    FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID) ON DELETE CASCADE,
    FOREIGN KEY (FromClubID) REFERENCES Club(ClubID) ON DELETE SET NULL,
    FOREIGN KEY (ToClubID) REFERENCES Club(ClubID) ON DELETE SET NULL
);

-- Trigger: check_contract_expiry
CREATE TRIGGER check_contract_expiry
BEFORE UPDATE ON Contract
FOR EACH ROW
BEGIN
    IF NEW.EndDate < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Contract expired';
    END IF;
END;

