-- Add status column if it doesn't exist
ALTER TABLE signatures ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_parent';

-- Add unique constraint to prevent duplicate applications
ALTER TABLE signatures ADD CONSTRAINT unique_user_club UNIQUE (user_id, club_id);
