-- Create the team_stats table
CREATE TABLE team_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id UUID NOT NULL,
    team_name TEXT NOT NULL,
    played INTEGER NOT NULL DEFAULT 0,
    won INTEGER NOT NULL DEFAULT 0,
    lost INTEGER NOT NULL DEFAULT 0,
    drawn INTEGER NOT NULL DEFAULT 0,
    goals_for INTEGER NOT NULL DEFAULT 0,
    goals_against INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(tournament_id, team_id)
);

-- Create an index on the tournament_id field for faster filtering
CREATE INDEX team_stats_tournament_id_idx ON team_stats(tournament_id);

-- Create an index on the team_id field for faster filtering
CREATE INDEX team_stats_team_id_idx ON team_stats(team_id);

-- Enable Row Level Security (RLS)
ALTER TABLE team_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view team stats for all tournaments"
    ON team_stats FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update team stats for their own tournaments"
    ON team_stats FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tournaments
            WHERE tournaments.id = team_stats.tournament_id
            AND tournaments.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tournaments
            WHERE tournaments.id = team_stats.tournament_id
            AND tournaments.created_by = auth.uid()
        )
    );

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_stats_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_team_stats_updated_at
    BEFORE UPDATE ON team_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_team_stats_updated_at_column();

-- Create a function to calculate points
CREATE OR REPLACE FUNCTION calculate_team_points()
RETURNS TRIGGER AS $$
BEGIN
    NEW.points = (NEW.won * 3) + NEW.drawn;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically calculate points
CREATE TRIGGER calculate_team_points_trigger
    BEFORE INSERT OR UPDATE ON team_stats
    FOR EACH ROW
    EXECUTE FUNCTION calculate_team_points();

-- Create a function to update team positions
CREATE OR REPLACE FUNCTION update_team_positions()
RETURNS TRIGGER AS $$
BEGIN
    WITH ranked_teams AS (
        SELECT 
            id,
            tournament_id,
            ROW_NUMBER() OVER (
                PARTITION BY tournament_id 
                ORDER BY points DESC, (goals_for - goals_against) DESC, goals_for DESC
            ) as new_position
        FROM team_stats
    )
    UPDATE team_stats
    SET position = ranked_teams.new_position
    FROM ranked_teams
    WHERE team_stats.id = ranked_teams.id
    AND team_stats.tournament_id = ranked_teams.tournament_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update team positions
CREATE TRIGGER update_team_positions_trigger
    AFTER INSERT OR UPDATE ON team_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_team_positions(); 