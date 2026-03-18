-- Phase 7: Challenge responses table + content column on modules

-- Challenge/course responses (text inputs, reflections)
CREATE TABLE challenge_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learner_id, module_id)
);

ALTER TABLE challenge_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own responses" ON challenge_responses FOR ALL USING (learner_id = auth.uid());
CREATE POLICY "Admins can read all responses" ON challenge_responses FOR SELECT USING (EXISTS (SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true));

-- Add content column to modules for internal course screen data
ALTER TABLE modules ADD COLUMN IF NOT EXISTS content JSONB;
