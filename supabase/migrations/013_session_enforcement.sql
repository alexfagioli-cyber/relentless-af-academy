-- Single concurrent session enforcement
-- Each login generates a unique session ID stored in the profile.
-- Middleware checks the cookie against this value — mismatch = kicked out.
ALTER TABLE learner_profiles ADD COLUMN IF NOT EXISTS active_session_id TEXT;
