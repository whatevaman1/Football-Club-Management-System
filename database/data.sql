USE FootballClubDB;

-- Insert Clubs
INSERT INTO Club (Name, FoundedYear, Stadium, City) VALUES
('Real Madrid CF', 1902, 'Santiago Bernabéu', 'Madrid'),
('FC Barcelona', 1899, 'Camp Nou', 'Barcelona'),
('Manchester United', 1878, 'Old Trafford', 'Manchester'),
('Arsenal FC', 1886, 'Emirates Stadium', 'London'),
('Bayern Munich', 1900, 'Allianz Arena', 'Munich'),
('Juventus FC', 1897, 'Allianz Stadium', 'Turin'),
('AC Milan', 1899, 'San Siro', 'Milan'),
('Paris Saint-Germain', 1970, 'Parc des Princes', 'Paris');

-- Insert Managers
INSERT INTO Manager (Name, ClubID) VALUES
('Carlo Ancelotti', 1),
('Xavi Hernandez', 2),
('Erik ten Hag', 3),
('Mikel Arteta', 4),
('Thomas Tuchel', 5),
('Massimiliano Allegri', 6),
('Stefano Pioli', 7),
('Luis Enrique', 8);

-- Insert Players
INSERT INTO Player (Name, DateOfBirth, Nationality, Position, ShirtNumber) VALUES
('Vinicius Junior', '2000-07-12', 'Brazil', 'Forward', 7),
('Jude Bellingham', '2003-06-29', 'England', 'Midfielder', 5),
('Robert Lewandowski', '1988-08-21', 'Poland', 'Forward', 9),
('Pedri', '2002-11-25', 'Spain', 'Midfielder', 8),
('Bruno Fernandes', '1994-09-08', 'Portugal', 'Midfielder', 8),
('Marcus Rashford', '1997-10-31', 'England', 'Forward', 10),
('Bukayo Saka', '2001-09-05', 'England', 'Forward', 7),
('Martin Odegaard', '1998-12-17', 'Norway', 'Midfielder', 8),
('Harry Kane', '1993-07-28', 'England', 'Forward', 9),
('Kylian Mbappe', '1998-12-20', 'France', 'Forward', 7);

-- Insert Coaches
INSERT INTO Coach (Name, Role, ClubID) VALUES
('Davide Ancelotti', 'Assistant Coach', 1),
('Oscar Hernandez', 'Assistant Coach', 2),
('Mitchell van der Gaag', 'Assistant Coach', 3),
('Albert Stuivenberg', 'Assistant Coach', 4),
('Zsolt Low', 'Assistant Coach', 5),
('Marco Landucci', 'Assistant Coach', 6),
('Giacomo Murelli', 'Assistant Coach', 7),
('Aitor Karanka', 'Defensive Coach', 8);

-- Insert Contracts
INSERT INTO Contract (PlayerID, ClubID, StartDate, EndDate, WeeklyWage) VALUES
(1, 1, '2023-01-01', '2027-06-30', 350000.00),
(2, 1, '2023-07-01', '2029-06-30', 250000.00),
(3, 2, '2022-07-01', '2026-06-30', 400000.00),
(4, 2, '2021-01-01', '2026-06-30', 150000.00),
(5, 3, '2020-01-01', '2026-06-30', 240000.00),
(6, 3, '2023-07-01', '2028-06-30', 300000.00),
(7, 4, '2023-05-01', '2027-06-30', 195000.00),
(8, 4, '2021-08-01', '2025-06-30', 115000.00),
(9, 5, '2023-08-01', '2027-06-30', 450000.00),
(10, 8, '2018-07-01', '2024-06-30', 600000.00);

-- Insert Player Salaries
INSERT INTO PlayerSalary (PlayerID, Amount, DatePaid) VALUES
(1, 350000.00, '2023-10-01'),
(1, 350000.00, '2023-11-01'),
(2, 250000.00, '2023-10-01'),
(3, 400000.00, '2023-10-01'),
(5, 240000.00, '2023-10-01');

-- Insert Loan Details (Assuming a fictional scenario where some players were loaned)
INSERT INTO LoanDetail (PlayerID, ParentClubID, LoanClubID, StartDate, EndDate) VALUES
(4, 2, 7, '2020-08-01', '2021-06-30'), -- Pedri loaned to Milan briefly (fictional for testing)
(6, 3, 4, '2018-08-01', '2019-06-30'); -- Rashford loaned to Arsenal briefly

-- Insert Performances
INSERT INTO Performance (PlayerID, Season, MatchesPlayed, Goals, Assists, YellowCards, RedCards) VALUES
(1, '2023-2024', 38, 15, 8, 3, 0),
(2, '2023-2024', 35, 20, 10, 5, 0),
(3, '2023-2024', 36, 18, 5, 2, 1),
(4, '2023-2024', 30, 5, 12, 1, 0),
(5, '2023-2024', 38, 10, 15, 6, 0),
(6, '2023-2024', 33, 12, 4, 2, 0),
(7, '2023-2024', 38, 16, 11, 4, 0),
(8, '2023-2024', 36, 8, 14, 2, 0),
(9, '2023-2024', 32, 36, 10, 1, 0),
(10, '2023-2024', 34, 28, 7, 3, 0);

-- Insert PlayerCoach Mapping
INSERT INTO PlayerCoach (PlayerID, CoachID) VALUES
(1, 1),
(2, 1),
(3, 2),
(4, 2),
(5, 3),
(6, 3),
(7, 4),
(8, 4),
(9, 5),
(10, 8);
