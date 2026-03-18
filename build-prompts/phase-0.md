# RelentlessAF Academy — Phase 0: Foundation & Schema

You are building Phase 0 of the RelentlessAF Academy. This is a mobile-first AI training platform built with Next.js + Supabase + Vercel. You are the builder — implement exactly what this prompt specifies. Do not design. Do not deviate.

## What to build

1. **Initialise Next.js project** in the current directory (`~/relentless-af-academy/`). The directory already has a `.git` folder and `.env.local` — preserve both.
   - `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` (answer Yes to overwrite if prompted — the dir only has .git and .env.local)
   - Verify `.env.local` survived. If not, recreate it from the values below.

2. **Install dependencies:**
   ```
   npm install @supabase/supabase-js @supabase/ssr
   npx shadcn@latest init -d
   ```

3. **Supabase client setup** — create `src/lib/supabase/client.ts` (browser client) and `src/lib/supabase/server.ts` (server client using cookies).

4. **Database schema** — create `supabase/migrations/001_schema.sql` with ALL 11 tables below. Then run the migration against the live Supabase project using the Supabase Management API or SQL Editor.

5. **RLS policies** — create `supabase/migrations/002_rls_policies.sql`:
   - Each learner can only read/write their own data (learner_profiles, progress, assessment_attempts, onboarding_responses, learning_events, learning_signals)
   - Admins (is_admin = true on learner_profiles) can read all data
   - Invites: anyone authenticated can read their own invite, only admins can create
   - Modules and assessments: readable by all authenticated users

6. **Invite-only registration:**
   - Disable public signups in Supabase Auth (check dashboard: Authentication > Settings > disable "Enable email signups" for non-invited users, OR enforce via RLS + middleware)
   - Create `src/app/auth/confirm/route.ts` — handles the PKCE token_hash from Supabase invite emails. Verifies server-side, sets session cookies, redirects to onboarding or dashboard.
   - Create `src/app/auth/login/page.tsx` — email/password login form
   - Create `src/app/auth/set-password/page.tsx` — for first-time invited users to set their password

7. **Auth middleware** — create `src/middleware.ts`:
   - Check for valid Supabase session on all routes except `/auth/*`
   - Redirect unauthenticated users to `/auth/login`
   - Check if user has completed onboarding — if not, redirect to `/onboarding`

8. **Mobile-first layout shell:**
   - Create `src/app/layout.tsx` with dark mode defaults (background #111827, text #F9FAFB)
   - Create `src/components/layout/bottom-nav.tsx` — bottom navigation bar with: Home, Learn, Profile icons
   - Create `src/app/page.tsx` — dashboard home showing welcome message and placeholder for learning path
   - All components designed at 375px width first, scaling up
   - Use Inter font (Next.js default)
   - Apply branding: primary crimson #DC2626, surface #1E293B, secondary text #9CA3AF

9. **Tailwind config** — extend with the branding colours:
   ```
   colors: {
     brand: { crimson: '#DC2626', charcoal: '#1F2937' },
     surface: '#1E293B',
     background: '#111827',
   }
   ```

10. **CLAUDE.md** — create project conventions file at the repo root:
    ```
    # RelentlessAF Academy

    ## Tech Stack
    Next.js 14+ (App Router), TypeScript strict, Tailwind CSS, Supabase JS v2, shadcn/ui

    ## Conventions
    - Mobile-first: design at 375px, scale up
    - Dark mode only (background #111827)
    - All secrets in .env.local, never hardcoded
    - Server-side scoring only for assessments
    - British English in all user-facing text

    ## Supabase
    - Project: nsuktnnzukvitqlrhklg
    - Region: eu-west-1
    - RLS enforced on all tables

    ## Git
    - Conventional commits (feat/fix/chore)
    - Push to main branch
    ```

11. **Basejump evaluation** (15 minutes max): Check if the `basejump` npm package adds value for team/RBAC management with this small cohort. If it maps cleanly (team = cohort, owner = admin, member = learner) AND doesn't add unnecessary complexity, adopt it. If it's overkill for 6-7 users with a simple is_admin flag, skip it. Document your decision in a comment at the top of 002_rls_policies.sql.

## .env.local values (already in the file — verify they exist)

```
NEXT_PUBLIC_SUPABASE_URL=https://nsuktnnzukvitqlrhklg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdWt0bm56dWt2aXRxbHJoa2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NDAxMTksImV4cCI6MjA4OTQxNjExOX0.NoFO60Vjai7xXgwZ9z2-aM3EQosT6taNjNquhwWGx9s
SUPABASE_SERVICE_ROLE_KEY=<already in file>
```

## Full Database Schema (11 tables)

```sql
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
```

## Red Lines (check your work against these)

1. No hardcoded credentials — all secrets via .env.local
2. Mobile-first — design at 375px, scale up
3. No Intragen connection — zero corporate references
4. Invite-only enforced at database level (RLS), not just UI
5. Assessment answers never sent to client before submission (not relevant this phase, but don't create patterns that violate it)
6. Admin access via is_admin flag on learner_profiles, not hardcoded email
7. No Atlas internals exposed
8. Every automated creation has a lifecycle path — invites have expiry

## Exit Gate

Before reporting done, verify ALL of these:

- [ ] `npm run dev` starts without errors
- [ ] Can register via Supabase invite link (test with your own email or a test email)
- [ ] Login works with email/password
- [ ] Unauthenticated users redirected to login
- [ ] Mobile layout renders correctly at 375px (check in browser dev tools)
- [ ] Bottom navigation shows Home, Learn, Profile
- [ ] Dark mode styling applied (background #111827, crimson accents)
- [ ] All 11 tables exist in Supabase (check via SQL editor: `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`)
- [ ] RLS policies active on all tables (check via: `SELECT tablename, policyname FROM pg_policies`)
- [ ] .env.local contains all 3 keys and is NOT committed to git
- [ ] Basejump decision documented in 002_rls_policies.sql header comment
- [ ] `git add . && git commit -m "feat: Phase 0 — foundation and schema"` — commit all work

## Sub-phase proposal

Before writing any code, propose your sub-phase breakdown and wait for confirmation. Example:
- 0.1: Next.js init + deps + Supabase client
- 0.2: Schema migration + RLS
- 0.3: Auth flow (invite, login, set-password, middleware)
- 0.4: Layout shell + branding + bottom nav
- 0.5: CLAUDE.md + Basejump eval + exit gate verification
