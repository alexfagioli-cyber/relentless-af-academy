CREATE TABLE module_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('useful', 'too_easy', 'too_hard', 'confusing')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learner_id, module_id)
);

ALTER TABLE module_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own feedback" ON module_feedback FOR ALL USING (learner_id = auth.uid());
CREATE POLICY "Admins can read all feedback" ON module_feedback FOR SELECT USING (public.is_admin());
