-- Clean up existing tables and types
DROP TABLE IF EXISTS match_lineups CASCADE;
DROP TABLE IF EXISTS match_events CASCADE;
DROP TABLE IF EXISTS match_stats CASCADE;
DROP TABLE IF EXISTS tournament_matches CASCADE;
DROP TABLE IF EXISTS team_players CASCADE;
DROP TABLE IF EXISTS team_managers CASCADE;
DROP TABLE IF EXISTS tournament_teams CASCADE;
DROP TABLE IF EXISTS tournament_stats CASCADE;
DROP TABLE IF EXISTS tournament_settings CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TYPE IF EXISTS sport_type CASCADE;
DROP TYPE IF EXISTS tournament_status CASCADE;
DROP TYPE IF EXISTS match_status CASCADE;
DROP TYPE IF EXISTS player_position CASCADE;
DROP TYPE IF EXISTS event_type CASCADE;

-- Create enum types
CREATE TYPE sport_type AS ENUM (
    'football',
    'cricket',
    'basketball',
    'volleyball',
    'tennis'
);

CREATE TYPE tournament_status AS ENUM (
    'draft',
    'published',
    'in_progress',
    'completed',
    'cancelled'
);

CREATE TYPE match_status AS ENUM (
    'scheduled',
    'lineup_submitted',
    'in_progress',
    'completed',
    'cancelled'
);

CREATE TYPE player_position AS ENUM (
    -- Football positions
    'goalkeeper',
    'defender',
    'midfielder',
    'forward',
    -- Cricket positions
    'batsman',
    'bowler',
    'all_rounder',
    'wicket_keeper',
    -- Basketball positions
    'point_guard',
    'shooting_guard',
    'small_forward',
    'power_forward',
    'center',
    -- Volleyball positions
    'setter',
    'outside_hitter',
    'opposite_hitter',
    'middle_blocker',
    'libero'
);

CREATE TYPE event_type AS ENUM (
    -- Football events
    'goal',
    'assist',
    'yellow_card',
    'red_card',
    'substitution',
    -- Cricket events
    'runs',
    'wicket',
    'over_complete',
    'boundary',
    'six',
    -- Basketball events
    'points',
    'rebound',
    'assist',
    'block',
    'steal',
    -- Volleyball events
    'point',
    'serve',
    'block',
    'spike',
    'dig'
);

-- Create base tournaments table
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sport sport_type NOT NULL,
    format TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status tournament_status NOT NULL DEFAULT 'draft',
    created_by UUID NOT NULL REFERENCES auth.users(id),
    description TEXT,
    rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    sport_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Create tournament settings table
CREATE TABLE tournament_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_tournament_settings UNIQUE (tournament_id)
);

-- Create tournament teams table
CREATE TABLE tournament_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo_url TEXT,
    team_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_team_name_per_tournament UNIQUE (tournament_id, name)
);

-- Create team managers table
CREATE TABLE team_managers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES tournament_teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    role TEXT NOT NULL,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_manager_per_team UNIQUE (team_id, user_id)
);

-- Create team players table
CREATE TABLE team_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES tournament_teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    jersey_number INTEGER,
    position player_position NOT NULL,
    stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_jersey_number_per_team UNIQUE (team_id, jersey_number)
);

-- Create tournament matches table
CREATE TABLE tournament_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    home_team_id UUID NOT NULL REFERENCES tournament_teams(id),
    away_team_id UUID NOT NULL REFERENCES tournament_teams(id),
    match_date TIMESTAMPTZ NOT NULL,
    venue TEXT,
    status match_status NOT NULL DEFAULT 'scheduled',
    score JSONB NOT NULL DEFAULT '{}'::jsonb,
    match_stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);

-- Create match lineups table
CREATE TABLE match_lineups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES tournament_matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES tournament_teams(id),
    player_id UUID NOT NULL REFERENCES team_players(id),
    position player_position NOT NULL,
    is_starter BOOLEAN NOT NULL DEFAULT false,
    substitution_time INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_player_per_match UNIQUE (match_id, player_id)
);

-- Create match events table
CREATE TABLE match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES tournament_matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES tournament_teams(id),
    player_id UUID REFERENCES team_players(id),
    event_type event_type NOT NULL,
    event_time INTEGER NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create match stats table
CREATE TABLE match_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES tournament_matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES tournament_teams(id),
    player_id UUID REFERENCES team_players(id),
    stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_player_stats_per_match UNIQUE (match_id, team_id, player_id)
);

-- Create indexes
CREATE INDEX idx_tournaments_sport ON tournaments(sport);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_created_by ON tournaments(created_by);
CREATE INDEX idx_tournament_teams_tournament ON tournament_teams(tournament_id);
CREATE INDEX idx_team_managers_team ON team_managers(team_id);
CREATE INDEX idx_team_managers_user ON team_managers(user_id);
CREATE INDEX idx_team_players_team ON team_players(team_id);
CREATE INDEX idx_tournament_matches_tournament ON tournament_matches(tournament_id);
CREATE INDEX idx_tournament_matches_teams ON tournament_matches(home_team_id, away_team_id);
CREATE INDEX idx_tournament_matches_date ON tournament_matches(match_date);
CREATE INDEX idx_match_lineups_match ON match_lineups(match_id);
CREATE INDEX idx_match_lineups_team ON match_lineups(team_id);
CREATE INDEX idx_match_events_match ON match_events(match_id);
CREATE INDEX idx_match_events_team ON match_events(team_id);
CREATE INDEX idx_match_events_player ON match_events(player_id);
CREATE INDEX idx_match_stats_match ON match_stats(match_id);
CREATE INDEX idx_match_stats_team ON match_stats(team_id);
CREATE INDEX idx_match_stats_player ON match_stats(player_id);

-- Enable Row Level Security
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Anyone can view tournaments"
    ON tournaments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create tournaments"
    ON tournaments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Only creator can update tournaments"
    ON tournaments FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Only creator can delete tournaments"
    ON tournaments FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);

-- Tournament teams policies
CREATE POLICY "Anyone can view tournament teams"
    ON tournament_teams FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only tournament creator can manage teams"
    ON tournament_teams FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tournaments
            WHERE tournaments.id = tournament_teams.tournament_id
            AND tournaments.created_by = auth.uid()
        )
    );

-- Team managers policies
CREATE POLICY "Anyone can view team managers"
    ON team_managers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only tournament creator and team managers can manage team"
    ON team_managers FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tournaments t
            JOIN tournament_teams tt ON tt.tournament_id = t.id
            WHERE tt.id = team_managers.team_id
            AND (t.created_by = auth.uid() OR EXISTS (
                SELECT 1 FROM team_managers tm
                WHERE tm.team_id = team_managers.team_id
                AND tm.user_id = auth.uid()
            ))
        )
    );

-- Team players policies
CREATE POLICY "Anyone can view team players"
    ON team_players FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only tournament creator and team managers can manage players"
    ON team_players FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tournaments t
            JOIN tournament_teams tt ON tt.tournament_id = t.id
            WHERE tt.id = team_players.team_id
            AND (t.created_by = auth.uid() OR EXISTS (
                SELECT 1 FROM team_managers tm
                WHERE tm.team_id = team_players.team_id
                AND tm.user_id = auth.uid()
            ))
        )
    );

-- Match policies
CREATE POLICY "Anyone can view matches"
    ON tournament_matches FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only tournament creator and team managers can manage matches"
    ON tournament_matches FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tournaments t
            WHERE t.id = tournament_matches.tournament_id
            AND (t.created_by = auth.uid() OR EXISTS (
                SELECT 1 FROM team_managers tm
                WHERE (tm.team_id = tournament_matches.home_team_id OR tm.team_id = tournament_matches.away_team_id)
                AND tm.user_id = auth.uid()
            ))
        )
    );

-- Match lineups policies
CREATE POLICY "Anyone can view match lineups"
    ON match_lineups FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only tournament creator and team managers can manage lineups"
    ON match_lineups FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tournament_matches m
            JOIN tournaments t ON t.id = m.tournament_id
            WHERE m.id = match_lineups.match_id
            AND (t.created_by = auth.uid() OR EXISTS (
                SELECT 1 FROM team_managers tm
                WHERE tm.team_id = match_lineups.team_id
                AND tm.user_id = auth.uid()
            ))
        )
    );

-- Match events policies
CREATE POLICY "Anyone can view match events"
    ON match_events FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only tournament creator and team managers can manage events"
    ON match_events FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tournament_matches m
            JOIN tournaments t ON t.id = m.tournament_id
            WHERE m.id = match_events.match_id
            AND (t.created_by = auth.uid() OR EXISTS (
                SELECT 1 FROM team_managers tm
                WHERE tm.team_id = match_events.team_id
                AND tm.user_id = auth.uid()
            ))
        )
    );

-- Match stats policies
CREATE POLICY "Anyone can view match stats"
    ON match_stats FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only tournament creator and team managers can manage stats"
    ON match_stats FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tournament_matches m
            JOIN tournaments t ON t.id = m.tournament_id
            WHERE m.id = match_stats.match_id
            AND (t.created_by = auth.uid() OR EXISTS (
                SELECT 1 FROM team_managers tm
                WHERE tm.team_id = match_stats.team_id
                AND tm.user_id = auth.uid()
            ))
        )
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournament_settings_updated_at
    BEFORE UPDATE ON tournament_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournament_teams_updated_at
    BEFORE UPDATE ON tournament_teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_managers_updated_at
    BEFORE UPDATE ON team_managers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_players_updated_at
    BEFORE UPDATE ON team_players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournament_matches_updated_at
    BEFORE UPDATE ON tournament_matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_lineups_updated_at
    BEFORE UPDATE ON match_lineups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_events_updated_at
    BEFORE UPDATE ON match_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_stats_updated_at
    BEFORE UPDATE ON match_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE tournament_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE tournament_teams;
ALTER PUBLICATION supabase_realtime ADD TABLE team_managers;
ALTER PUBLICATION supabase_realtime ADD TABLE team_players;
ALTER PUBLICATION supabase_realtime ADD TABLE tournament_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE match_lineups;
ALTER PUBLICATION supabase_realtime ADD TABLE match_events;
ALTER PUBLICATION supabase_realtime ADD TABLE match_stats;

-- Force schema cache refresh
SELECT pg_notify('pgrst', 'reload schema'); 