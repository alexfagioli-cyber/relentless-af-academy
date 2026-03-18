-- Phase 7: General feedback table for floating feedback button

CREATE TABLE general_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE,
  page TEXT NOT NULL,
  rating TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE general_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own feedback" ON general_feedback FOR INSERT
  WITH CHECK (learner_id = auth.uid());

CREATE POLICY "Users can read own feedback" ON general_feedback FOR SELECT
  USING (learner_id = auth.uid());

CREATE POLICY "Admins can read all feedback" ON general_feedback FOR SELECT
  USING (EXISTS (SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true));
