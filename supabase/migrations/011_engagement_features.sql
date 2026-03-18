-- Phase 8A: Engagement features — playground, badges, community, challenge gallery, spaced repetition

-- 1. Playground history
CREATE TABLE playground_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE playground_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own history" ON playground_history FOR ALL USING (learner_id = auth.uid());

-- 2. Achievement badges
CREATE TABLE badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learner_id, badge_key)
);
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own badges" ON badges FOR SELECT USING (learner_id = auth.uid());
CREATE POLICY "Users can insert own badges" ON badges FOR INSERT WITH CHECK (learner_id = auth.uid());
CREATE POLICY "Admins can read all badges" ON badges FOR SELECT USING (EXISTS (SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true));

-- 3. Community posts
CREATE TABLE community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('share', 'win', 'question', 'tip')),
  reactions JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated can read posts" ON community_posts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can create own posts" ON community_posts FOR INSERT WITH CHECK (learner_id = auth.uid());
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE USING (learner_id = auth.uid());
CREATE POLICY "Admins can manage all posts" ON community_posts FOR ALL USING (EXISTS (SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true));

-- 4. Challenge gallery columns
ALTER TABLE challenge_responses ADD COLUMN IF NOT EXISTS shared BOOLEAN DEFAULT FALSE;
ALTER TABLE challenge_responses ADD COLUMN IF NOT EXISTS share_anonymous BOOLEAN DEFAULT FALSE;

-- 5. Spaced repetition
CREATE TABLE review_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  review_type TEXT NOT NULL CHECK (review_type IN ('1_week', '1_month', '3_month')),
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE review_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own reviews" ON review_schedule FOR ALL USING (learner_id = auth.uid());
