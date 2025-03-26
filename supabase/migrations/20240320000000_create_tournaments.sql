-- Create enum types for sport and format
CREATE TYPE sport_type AS ENUM ('football', 'basketball', 'volleyball', 'cricket', 'tennis');
CREATE TYPE tournament_status AS ENUM ('draft', 'active', 'completed', 'cancelled');

-- Create the tournaments table
CREATE TABLE tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    sport sport_type NOT NULL,
    format TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status tournament_status NOT NULL DEFAULT 'draft',
    created_by UUID NOT NULL REFERENCES auth.users(id),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Football specific fields
    max_players_per_team INTEGER,
    min_players_per_team INTEGER,
    max_substitutes INTEGER,
    match_duration INTEGER,
    half_time_duration INTEGER,
    extra_time_duration INTEGER,
    penalty_shootout BOOLEAN,
    offside_rule BOOLEAN,
    throw_in_rule BOOLEAN,
    corner_kick_rule BOOLEAN,
    free_kick_rule BOOLEAN,
    -- Basketball specific fields
    quarter_duration INTEGER,
    break_duration INTEGER,
    overtime_duration INTEGER,
    shot_clock INTEGER,
    three_point_line BOOLEAN,
    free_throw_line BOOLEAN,
    -- Volleyball specific fields
    sets_to_win INTEGER,
    points_per_set INTEGER,
    points_to_win_set INTEGER,
    points_to_win_tiebreak INTEGER,
    libero_allowed BOOLEAN,
    rotation_rule BOOLEAN,
    -- Cricket specific fields
    overs_per_innings INTEGER,
    super_over BOOLEAN,
    power_play BOOLEAN,
    drs BOOLEAN,
    no_ball_rule BOOLEAN,
    wide_ball_rule BOOLEAN,
    -- Tennis specific fields
    games_per_set INTEGER,
    tiebreak_at INTEGER,
    super_tiebreak BOOLEAN,
    let_rule BOOLEAN,
    advantage_rule BOOLEAN
);

-- Create an index on the sport field for faster filtering
CREATE INDEX tournaments_sport_idx ON tournaments(sport);

-- Create an index on the status field for faster filtering
CREATE INDEX tournaments_status_idx ON tournaments(status);

-- Create an index on the created_by field for faster filtering
CREATE INDEX tournaments_created_by_idx ON tournaments(created_by);

-- Enable Row Level Security (RLS)
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all tournaments"
    ON tournaments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create their own tournaments"
    ON tournaments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tournaments"
    ON tournaments FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tournaments"
    ON tournaments FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 