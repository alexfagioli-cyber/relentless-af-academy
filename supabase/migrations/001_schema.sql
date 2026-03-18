-- RelentlessAF Academy — Phase 0 Schema
-- 11 tables as specified in build-prompts/phase-0.md

-- TABLE 1: invites
CREATE TABLE invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_invites_email ON invites(email);
CREATE INDEX idx_invites_status ON invites(status);

-- TABLE 2: learner_profiles
CREATE TABLE learner_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT NOT NULL,
  age INTEGER,
  occupation TEXT,
  tier TEXT CHECK (tier IN ('aware', 'enabled', 'specialist')),
  onboarding_complete BOOLEAN DEFAULT FALSE,
  weekly_time_commitment TEXT CHECK (weekly_time_commitment IN ('1-2h', '3-5h', '5h+')),
  primary_goal TEXT,
  learning_motivation TEXT,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  streak_current INTEGER DEFAULT 0,
  streak_longest INTEGER DEFAULT 0,
  streak_last_date DATE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 3: onboarding_responses
CREATE TABLE onboarding_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_onboarding_learner ON onboarding_responses(learner_id);

-- TABLE 4: modules
CREATE TABLE modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tier TEXT NOT NULL CHECK (tier IN ('aware', 'enabled', 'specialist')),
  track INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  external_url TEXT,
  platform TEXT CHECK (platform IN ('skilljar', 'github', 'coursera', 'claudecertifications', 'internal')),
  order_index INTEGER NOT NULL,
  estimated_duration_mins INTEGER,
  module_type TEXT NOT NULL CHECK (module_type IN ('course', 'challenge', 'assessment')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_modules_tier ON modules(tier);

-- TABLE 5: prerequisites (DAG with AND/OR logic)
CREATE TABLE prerequisites (
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  prerequisite_module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  prerequisite_group INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (module_id, prerequisite_module_id),
  CHECK (module_id != prerequisite_module_id)
);

-- TABLE 6: progress
CREATE TABLE progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  score NUMERIC,
  attempts INTEGER DEFAULT 0,
  UNIQUE(learner_id, module_id)
);
CREATE INDEX idx_progress_learner ON progress(learner_id);
CREATE INDEX idx_progress_status ON progress(status);

-- TABLE 7: assessments
CREATE TABLE assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  pass_score NUMERIC NOT NULL DEFAULT 70,
  questions JSONB NOT NULL,
  time_limit_mins INTEGER
);

-- TABLE 8: assessment_attempts
CREATE TABLE assessment_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score NUMERIC NOT NULL,
  passed BOOLEAN NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_attempts_learner ON assessment_attempts(learner_id);

-- TABLE 9: learning_signals
CREATE TABLE learning_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('pace_fast', 'pace_slow', 'struggle', 'skip', 'complete_fast', 'revisit')),
  module_id UUID REFERENCES modules(id),
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 10: learning_events (xAPI-style)
CREATE TABLE learning_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID REFERENCES auth.users(id),
  verb TEXT NOT NULL CHECK (verb IN ('started', 'completed', 'attempted', 'passed', 'failed', 'skipped')),
  object_type TEXT NOT NULL CHECK (object_type IN ('module', 'assessment', 'challenge')),
  object_id UUID NOT NULL,
  result JSONB,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_events_learner ON learning_events(learner_id);
CREATE INDEX idx_events_verb ON learning_events(verb);
CREATE INDEX idx_events_created ON learning_events(created_at);

-- TABLE 11: nudges (tracking only — actual nudges via WhatsApp)
CREATE TABLE nudges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE,
  nudge_type TEXT NOT NULL CHECK (nudge_type IN ('day_3', 'day_7', 'day_14')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  channel TEXT DEFAULT 'whatsapp'
);
CREATE INDEX idx_nudges_learner ON nudges(learner_id);
