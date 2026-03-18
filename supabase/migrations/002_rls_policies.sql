-- Basejump Evaluation (build prompt item 11):
-- DECISION: Skip Basejump. It's a full SaaS scaffold (multi-tenant teams, Stripe billing,
-- personal/shared accounts). Overkill for 6-7 users with a simple is_admin flag.
-- If team isolation is needed later, a team_id FK + RLS policies takes an hour.

-- Enable RLS on all tables
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE nudges ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INVITES
-- ============================================================
-- Learners can read their own invite (by email match)
CREATE POLICY "Users can read own invite"
  ON invites FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Admins can read all invites
CREATE POLICY "Admins can read all invites"
  ON invites FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Only admins can create invites
CREATE POLICY "Admins can create invites"
  ON invites FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Only admins can update invites
CREATE POLICY "Admins can update invites"
  ON invites FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- ============================================================
-- LEARNER_PROFILES
-- ============================================================
-- Learners can read their own profile
CREATE POLICY "Users can read own profile"
  ON learner_profiles FOR SELECT
  USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON learner_profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Learners can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON learner_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Learners can update their own profile
CREATE POLICY "Users can update own profile"
  ON learner_profiles FOR UPDATE
  USING (id = auth.uid());

-- ============================================================
-- ONBOARDING_RESPONSES
-- ============================================================
-- Learners can read/write their own onboarding responses
CREATE POLICY "Users can read own onboarding"
  ON onboarding_responses FOR SELECT
  USING (learner_id = auth.uid());

CREATE POLICY "Users can insert own onboarding"
  ON onboarding_responses FOR INSERT
  WITH CHECK (learner_id = auth.uid());

-- Admins can read all onboarding responses
CREATE POLICY "Admins can read all onboarding"
  ON onboarding_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- ============================================================
-- MODULES + PREREQUISITES + ASSESSMENTS (readable by all authenticated)
-- ============================================================
CREATE POLICY "Authenticated users can read modules"
  ON modules FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read prerequisites"
  ON prerequisites FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read assessments"
  ON assessments FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admins can manage modules, prerequisites, and assessments
CREATE POLICY "Admins can manage modules"
  ON modules FOR ALL
  USING (EXISTS (
    SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can manage prerequisites"
  ON prerequisites FOR ALL
  USING (EXISTS (
    SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can manage assessments"
  ON assessments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- ============================================================
-- PROGRESS
-- ============================================================
CREATE POLICY "Users can read own progress"
  ON progress FOR SELECT
  USING (learner_id = auth.uid());

CREATE POLICY "Users can insert own progress"
  ON progress FOR INSERT
  WITH CHECK (learner_id = auth.uid());

CREATE POLICY "Users can update own progress"
  ON progress FOR UPDATE
  USING (learner_id = auth.uid());

CREATE POLICY "Admins can read all progress"
  ON progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- ============================================================
-- ASSESSMENT_ATTEMPTS
-- ============================================================
CREATE POLICY "Users can read own attempts"
  ON assessment_attempts FOR SELECT
  USING (learner_id = auth.uid());

CREATE POLICY "Users can insert own attempts"
  ON assessment_attempts FOR INSERT
  WITH CHECK (learner_id = auth.uid());

CREATE POLICY "Admins can read all attempts"
  ON assessment_attempts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- ============================================================
-- LEARNING_SIGNALS
-- ============================================================
CREATE POLICY "Users can read own signals"
  ON learning_signals FOR SELECT
  USING (learner_id = auth.uid());

CREATE POLICY "Users can insert own signals"
  ON learning_signals FOR INSERT
  WITH CHECK (learner_id = auth.uid());

CREATE POLICY "Admins can read all signals"
  ON learning_signals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- ============================================================
-- LEARNING_EVENTS
-- ============================================================
CREATE POLICY "Users can read own events"
  ON learning_events FOR SELECT
  USING (learner_id = auth.uid());

CREATE POLICY "Users can insert own events"
  ON learning_events FOR INSERT
  WITH CHECK (learner_id = auth.uid());

CREATE POLICY "Admins can read all events"
  ON learning_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- ============================================================
-- NUDGES
-- ============================================================
CREATE POLICY "Users can read own nudges"
  ON nudges FOR SELECT
  USING (learner_id = auth.uid());

CREATE POLICY "Admins can read all nudges"
  ON nudges FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can insert nudges"
  ON nudges FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true
  ));
