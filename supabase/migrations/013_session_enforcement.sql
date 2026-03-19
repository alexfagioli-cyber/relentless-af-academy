-- Session enforcement — allows up to 2 concurrent sessions (mobile + desktop).
-- Third login replaces the oldest session, kicking that device out.
ALTER TABLE learner_profiles ADD COLUMN IF NOT EXISTS active_session_ids TEXT[] DEFAULT '{}';
ALTER TABLE learner_profiles DROP COLUMN IF EXISTS active_session_id;
