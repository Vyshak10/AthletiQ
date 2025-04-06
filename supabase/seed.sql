-- Example Football Tournament
INSERT INTO tournaments (name, sport, format, start_date, end_date, status, created_by, description)
VALUES (
    'Premier League 2024',
    'football',
    '11s',
    '2024-06-01',
    '2024-08-31',
    'published',
    auth.uid(),
    'Professional football league tournament'
);

-- Football Tournament Settings
INSERT INTO tournament_settings (tournament_id, settings)
SELECT 
    id,
    jsonb_build_object(
        'max_players_per_team', 11,
        'min_players_per_team', 7,
        'max_substitutes', 3,
        'match_duration', 90,
        'half_time_duration', 15,
        'extra_time_duration', 30,
        'penalty_shootout', true,
        'offside_rule', true,
        'var_system', true,
        'points_for_win', 3,
        'points_for_draw', 1,
        'points_for_loss', 0
    )
FROM tournaments
WHERE name = 'Premier League 2024';

-- Football Teams
WITH tournament AS (SELECT id FROM tournaments WHERE name = 'Premier League 2024')
INSERT INTO tournament_teams (tournament_id, name, players)
SELECT 
    tournament.id,
    team_name,
    '[]'::jsonb
FROM tournament,
(VALUES 
    ('Manchester United'),
    ('Liverpool FC'),
    ('Chelsea FC'),
    ('Arsenal FC')
) AS teams(team_name);

-- Example Cricket Tournament
INSERT INTO tournaments (name, sport, format, start_date, end_date, status, created_by, description)
VALUES (
    'IPL 2024',
    'cricket',
    't20',
    '2024-07-01',
    '2024-07-31',
    'published',
    auth.uid(),
    'T20 Cricket Championship'
);

-- Cricket Tournament Settings
INSERT INTO tournament_settings (tournament_id, settings)
SELECT 
    id,
    jsonb_build_object(
        'max_players_per_team', 11,
        'min_players_per_team', 11,
        'max_substitutes', 4,
        'overs_per_innings', 20,
        'super_over', true,
        'power_play_overs', 6,
        'drs_reviews', 2,
        'wide_ball_rule', true,
        'no_ball_rule', true,
        'points_for_win', 2,
        'points_for_tie', 1,
        'points_for_loss', 0,
        'bonus_points', true
    )
FROM tournaments
WHERE name = 'IPL 2024';

-- Cricket Teams
WITH tournament AS (SELECT id FROM tournaments WHERE name = 'IPL 2024')
INSERT INTO tournament_teams (tournament_id, name, players)
SELECT 
    tournament.id,
    team_name,
    '[]'::jsonb
FROM tournament,
(VALUES 
    ('Mumbai Indians'),
    ('Chennai Super Kings'),
    ('Royal Challengers'),
    ('Delhi Capitals')
) AS teams(team_name);

-- Initialize Stats for Football Teams
INSERT INTO tournament_stats (tournament_id, team_id, stats)
SELECT 
    t.tournament_id,
    t.id AS team_id,
    jsonb_build_object(
        'matches_played', 0,
        'wins', 0,
        'draws', 0,
        'losses', 0,
        'goals_for', 0,
        'goals_against', 0,
        'goal_difference', 0,
        'points', 0,
        'position', 0
    ) AS stats
FROM tournament_teams t
JOIN tournaments trn ON t.tournament_id = trn.id
WHERE trn.sport = 'football';

-- Initialize Stats for Cricket Teams
INSERT INTO tournament_stats (tournament_id, team_id, stats)
SELECT 
    t.tournament_id,
    t.id AS team_id,
    jsonb_build_object(
        'matches_played', 0,
        'wins', 0,
        'losses', 0,
        'no_results', 0,
        'points', 0,
        'net_run_rate', 0.0,
        'runs_scored', 0,
        'runs_conceded', 0,
        'overs_bowled', 0,
        'overs_faced', 0,
        'position', 0
    ) AS stats
FROM tournament_teams t
JOIN tournaments trn ON t.tournament_id = trn.id
WHERE trn.sport = 'cricket';

-- Create some example matches for Football
WITH tournament AS (
    SELECT id, (SELECT id FROM tournament_teams WHERE name = 'Manchester United' AND tournament_id = tournaments.id) as team1,
    (SELECT id FROM tournament_teams WHERE name = 'Liverpool FC' AND tournament_id = tournaments.id) as team2
    FROM tournaments WHERE name = 'Premier League 2024'
)
INSERT INTO tournament_matches (tournament_id, home_team_id, away_team_id, match_date, status, score)
SELECT 
    id,
    team1,
    team2,
    '2024-06-01 15:00:00'::timestamptz,
    'scheduled',
    jsonb_build_object(
        'home_score', 0,
        'away_score', 0,
        'period', 'not_started'
    )
FROM tournament;

-- Create some example matches for Cricket
WITH tournament AS (
    SELECT id, (SELECT id FROM tournament_teams WHERE name = 'Mumbai Indians' AND tournament_id = tournaments.id) as team1,
    (SELECT id FROM tournament_teams WHERE name = 'Chennai Super Kings' AND tournament_id = tournaments.id) as team2
    FROM tournaments WHERE name = 'IPL 2024'
)
INSERT INTO tournament_matches (tournament_id, home_team_id, away_team_id, match_date, status, score)
SELECT 
    id,
    team1,
    team2,
    '2024-07-01 14:00:00'::timestamptz,
    'scheduled',
    jsonb_build_object(
        'first_innings', jsonb_build_object(
            'runs', 0,
            'wickets', 0,
            'overs', 0.0
        ),
        'second_innings', jsonb_build_object(
            'runs', 0,
            'wickets', 0,
            'overs', 0.0
        ),
        'status', 'not_started'
    )
FROM tournament; 