# RelentlessAF Academy — Phase 8B: Admin & Infrastructure

**IMPORTANT: This project lives at ~/relentless-af-academy/ — NOT inside Atlas. All file paths are relative to ~/relentless-af-academy/. Do NOT create files in or reference the Atlas directory. Change to the project directory first: `cd ~/relentless-af-academy`**

You are building Phase 8B. All previous phases complete and deployed. This phase adds admin tools, analytics, and infrastructure improvements. You are the builder — implement exactly what this prompt specifies. Move fast.

**Current colour palette:** Background #1A1A2E, Surface #25253D, Border #363654, Text primary #E8F0FE, Text secondary #8BA3C4, Accent: champagne gold #E8C872, Success #10B981, Error #EF4444.

## 1. Admin CMS

Expand the admin dashboard (`src/app/admin/`) with content management:

**a) Module Manager** — `src/app/admin/modules/page.tsx`
- List all modules with: title, tier, type, order, platform
- "Add Module" form: title, description, tier, track, module_type, platform, external_url, estimated_duration, order_index
- For internal modules: content JSON editor (simple textarea for the screens JSON — not a visual editor, just editable JSON)
- "Edit" button on each module row opens pre-filled form
- Prerequisites editor: checkboxes of existing modules, with group number input for AND/OR logic
- Save inserts/updates via Supabase service_role client

**b) News Manager** — `src/app/admin/news/page.tsx`
- List all news_items
- "Add News Item" form: title, description, url, category, published_at
- Edit existing items
- Delete (soft — add a `hidden` boolean column, don't actually delete)

**c) Prompt Manager** — `src/app/admin/prompts/page.tsx`
- List all prompt templates (currently hardcoded in the prompts page)
- Move prompts to a database table:

```sql
CREATE TABLE prompt_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  template TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated can read prompts" ON prompt_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage prompts" ON prompt_templates FOR ALL USING (EXISTS (SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true));
```

- Migrate the 20 hardcoded prompts into this table via seed migration
- Update `/prompts` page to read from database instead of hardcoded array
- Admin can add/edit/reorder prompts

**d) Tools Manager** — `src/app/admin/tools/page.tsx`
- Same pattern: move AI tools to a database table, admin can add/edit
```sql
CREATE TABLE ai_tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  pricing TEXT CHECK (pricing IN ('free', 'freemium', 'paid')),
  alex_recommends BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated can read tools" ON ai_tools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage tools" ON ai_tools FOR ALL USING (EXISTS (SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true));
```

**Admin navigation:** Add a sidebar or tab bar to the admin page: Overview | Learners | Modules | News | Prompts | Tools | Feedback | Analytics

## 2. Learning Analytics Dashboard

Create `src/app/admin/analytics/page.tsx`:

**Charts (use a lightweight chart library — recharts or chart.js via react-chartjs-2):**

Install: `npm install recharts`

**a) Engagement Over Time**
- Line chart: daily active users over last 30 days
- Query: count distinct learner_id from learning_events grouped by date

**b) Module Completion Funnel**
- Bar chart: for each module in order, how many learners have completed it
- Shows where the drop-off happens

**c) Tier Distribution**
- Pie/donut chart: how many learners in each tier

**d) Assessment Pass Rates**
- Bar chart: per assessment, pass rate percentage
- Highlights struggling assessments

**e) Top Stats Row**
- Total learners, Active this week, Average completion %, Average streak, Total learning hours (sum of completed module durations)

**f) Recent Activity Feed**
- Last 20 learning_events across all learners
- Timestamped, shows learner name + action

Style: dark surface cards, gold accent on chart lines/bars, responsive at 375px (charts stack vertically on mobile).

## 3. Video Placeholder System

Create a video section system that's ready for content:

**Database:**
```sql
ALTER TABLE modules ADD COLUMN video_url TEXT;
ALTER TABLE modules ADD COLUMN video_thumbnail TEXT;
```

**UI:** On internal course modules, if `video_url` is set, show a video player at the top of the content screens. For now, add placeholder cards on the tier gateway modules (A00, E00, S00):
- "Video introduction coming soon" with a play button icon
- Gold border, surface background
- When Alex records videos later, he just adds the URL in the Module Manager and it appears

## 4. Notification Preferences

Create `src/app/profile/notifications.tsx` — notification settings on the profile page:

**Database:**
```sql
CREATE TABLE notification_preferences (
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE PRIMARY KEY,
  streak_reminders BOOLEAN DEFAULT TRUE,
  new_content_alerts BOOLEAN DEFAULT TRUE,
  community_activity BOOLEAN DEFAULT TRUE,
  share_completions BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own preferences" ON notification_preferences FOR ALL USING (learner_id = auth.uid());
```

**UI:** Toggle switches on the profile page:
- "Streak reminders" — on/off
- "New content alerts" — on/off
- "Community activity" — on/off
- "Share my completions with the community" — on/off (controls auto-posts)

These don't send notifications yet (no WhatsApp/push integration) but the preferences are stored and ready. The admin dashboard shows who has what enabled.

## 5. Platform Health & Custom Domain Prep

**a) Error monitoring:** Create `src/lib/error-logger.ts` — a simple function that logs errors to a `platform_errors` table:
```sql
CREATE TABLE platform_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type TEXT NOT NULL,
  message TEXT,
  stack TEXT,
  page TEXT,
  learner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
Wire into the global error boundary (`src/app/error.tsx`). Admin can view errors in a new "Errors" tab.

**b) Custom domain prep:** Create `docs/custom-domain-setup.md` with instructions:
- Buy domain (e.g., `academy.relentlessaf.com` or `learn.relentlessaf.com`)
- Vercel dashboard → Project → Settings → Domains → Add
- Update Supabase Site URL and Redirect URLs
- Update any hardcoded URLs in the codebase

## Red Lines
Same as all phases. No hardcoded creds, mobile-first, no Intragen, no Atlas internals. All new tables need RLS. Admin CMS operations must use service_role client.

## Exit Gate
- [ ] Admin CMS: can add/edit modules, news, prompts, tools through the UI
- [ ] Prompt templates and AI tools now database-driven (not hardcoded)
- [ ] Analytics dashboard with 5 charts + stats row + activity feed
- [ ] recharts installed, charts render on mobile
- [ ] Video placeholder system ready (column exists, UI shows placeholder)
- [ ] Notification preferences on profile page with toggle switches
- [ ] Error logging table + wired to error boundary
- [ ] Custom domain setup documented
- [ ] All new tables have RLS
- [ ] `npm run build` passes
- [ ] `git commit -m "feat: Phase 8B — admin and infrastructure"`
- [ ] `git push origin main`
