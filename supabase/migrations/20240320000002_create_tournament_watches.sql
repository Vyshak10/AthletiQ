-- Create the tournament_watches table
CREATE TABLE tournament_watches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    last_watched TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, tournament_id)
);

-- Create indexes for faster querying
CREATE INDEX tournament_watches_user_id_idx ON tournament_watches(user_id);
CREATE INDEX tournament_watches_tournament_id_idx ON tournament_watches(tournament_id);

-- Enable Row Level Security (RLS)
ALTER TABLE tournament_watches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own watched tournaments"
    ON tournament_watches FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watched tournaments"
    ON tournament_watches FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watched tournaments"
    ON tournament_watches FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watched tournaments"
    ON tournament_watches FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create a function to update the last_watched timestamp
CREATE OR REPLACE FUNCTION update_tournament_watch_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_watched = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the last_watched timestamp
CREATE TRIGGER update_tournament_watch_timestamp
    BEFORE UPDATE ON tournament_watches
    FOR EACH ROW
    EXECUTE FUNCTION update_tournament_watch_timestamp(); 