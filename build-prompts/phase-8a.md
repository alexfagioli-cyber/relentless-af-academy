# RelentlessAF Academy — Phase 8A: Engagement Features

**IMPORTANT: This project lives at ~/relentless-af-academy/ — NOT inside Atlas. All file paths are relative to ~/relentless-af-academy/. Do NOT create files in or reference the Atlas directory. Change to the project directory first: `cd ~/relentless-af-academy`**

You are building Phase 8A. All previous phases complete and deployed. This phase adds the engagement features that make the platform sticky and social. You are the builder — implement exactly what this prompt specifies. Move fast.

**Current colour palette:** Background #1A1A2E, Surface #25253D, Border #363654, Text primary #E8F0FE, Text secondary #8BA3C4, Accent: champagne gold #E8C872, Success #10B981, Error #EF4444.

## 1. AI Playground

Create `src/app/playground/page.tsx` — an embedded AI chat interface.

**How it works:**
- Simple chat UI: message input at bottom, messages scroll up
- User types a prompt, sends it
- For now (no API key yet): simulate a response with a placeholder message: "Claude API integration coming soon. For now, open claude.ai to try this prompt." with a "Open Claude" button that copies the prompt to clipboard and opens claude.ai
- Pre-load prompt templates: if the user navigates from the Prompt Library with a template, pre-fill the input
- Add a "Playground" link to the Prompt Library cards: "Try it →" opens /playground?prompt=encoded_template

**UI design:**
- Chat bubbles: user messages right-aligned (gold border), AI responses left-aligned (surface card)
- Input bar fixed at bottom with send button (gold)
- Header: "AI Playground" with subtitle "Practice your prompts"
- Mobile-first, full-height layout (no bottom nav on this page — the input bar replaces it)

**Database:**
```sql
CREATE TABLE playground_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE playground_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own history" ON playground_history FOR ALL USING (learner_id = auth.uid());
```

Save every prompt the user sends (for future analytics — what are people trying?).

**Navigation:** Add "Playground" as a floating action button on the dashboard — gold circle with a chat/sparkle icon, bottom-right above the feedback button. Also accessible from the Prompt Library.

## 2. Achievement Badges

Create `src/app/profile/badges.tsx` — badge wall component displayed on the profile page.

**Badges (12 total):**

| Badge | Name | Condition | Icon colour |
|---|---|---|---|
| first_login | "First Steps" | Completed onboarding | #8BA3C4 (silver) |
| first_module | "Off the Mark" | Completed first module | #E8C872 (gold) |
| first_assessment | "Tested" | Passed first assessment | #E8C872 (gold) |
| streak_3 | "Consistency" | 3-day streak | #8BA3C4 (silver) |
| streak_7 | "Relentless Week" | 7-day streak | #E8C872 (gold) |
| streak_30 | "Unstoppable" | 30-day streak | #E8C872 (gold) |
| tier_aware | "AI Aware" | Completed Aware tier gate | #CD7F32 (bronze) |
| tier_enabled | "AI Enabled" | Completed Enabled tier gate | #8BA3C4 (silver) |
| tier_specialist | "Specialist" | Completed Specialist tier gate | #E8C872 (gold) |
| all_challenges | "Challenger" | Completed all challenges in current tier | #E8C872 (gold) |
| cert_verified | "Certified" | Verified first Skilljar certificate | #E8C872 (gold) |
| feedback_given | "Voice Heard" | Gave first feedback | #8BA3C4 (silver) |

**Database:**
```sql
CREATE TABLE badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learner_id, badge_key)
);
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own badges" ON badges FOR SELECT USING (learner_id = auth.uid());
CREATE POLICY "Admins can read all badges" ON badges FOR SELECT USING (EXISTS (SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true));
```

**Display:** On the profile page, show a grid of all 12 badges. Earned badges are full colour with a glow effect. Unearned badges are greyed out with the name visible (so they know what to aim for). Each badge is a circle with an icon/emoji inside.

**Awarding:** Create `src/lib/badges.ts` — a function `checkAndAwardBadges(learnerId)` that queries the relevant tables and inserts any newly earned badges. Call this after: module completion, assessment pass, streak update, cert verification, feedback submission.

## 3. Community Wall

Create `src/app/community/page.tsx` — a shared activity feed.

**Database:**
```sql
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
CREATE POLICY "All authenticated can read posts" ON community_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create own posts" ON community_posts FOR INSERT WITH CHECK (learner_id = auth.uid());
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE USING (learner_id = auth.uid());
CREATE POLICY "Admins can manage all posts" ON community_posts FOR ALL USING (EXISTS (SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true));
```

**UI:**
- Feed of posts, newest first
- Each post shows: author first name, post type badge (Share/Win/Question/Tip), content, time ago, reaction buttons
- Reaction buttons: 🔥 (fire), 💡 (lightbulb), 👏 (clap) — click to toggle, show count
- "New Post" button at top: opens a form with content textarea + post type selector
- Admin can pin posts (pinned posts show at top with gold border)
- Auto-generated system posts when someone completes a tier: "[Name] just reached Enabled tier! 🎉" (opt-out in profile)

**Navigation:** Replace one of the bottom nav items or add as 6th. Alternatively, add "Community" as a card on the dashboard with latest 2 posts preview.

## 4. Challenge Gallery

Update challenge modules — after completing a challenge, learners can optionally share their response.

**Database:**
```sql
ALTER TABLE challenge_responses ADD COLUMN shared BOOLEAN DEFAULT FALSE;
ALTER TABLE challenge_responses ADD COLUMN share_anonymous BOOLEAN DEFAULT FALSE;
```

**UI changes to challenge completion:**
- After submitting a challenge, show: "Want to share this with the community?" toggle
- If shared, it appears on the community wall as a "Share" type post with the challenge title as context
- Option to share anonymously

**Gallery view:** On each challenge module page, show "See how others approached this" section at the bottom — displays shared responses (first name or "Anonymous").

## 5. Spaced Repetition

Create `src/lib/spaced-repetition.ts` — schedule review prompts after module completion.

**Database:**
```sql
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
```

**Logic:**
- When a module is completed, schedule 3 reviews: +7 days, +30 days, +90 days
- Dashboard shows "Reviews due" card when any review_schedule items have due_date <= today and completed = false
- Review is a quick 3-question quiz (subset of the module's assessment, or a reflection prompt for challenges)
- Completing a review marks it done and logs a learning_event

**UI:** "Reviews Due" card on dashboard with gold accent badge showing count. Links to a review page that presents the questions.

## Red Lines
Same as all phases. No hardcoded creds, mobile-first, no Intragen, no Atlas internals. All new tables need RLS.

## Exit Gate
- [ ] AI Playground renders with chat UI, saves prompts, links from Prompt Library
- [ ] All 12 badges defined, badge wall on profile, earned badges glow
- [ ] Community wall: create posts, react, admin pin
- [ ] Challenge gallery: share toggle, anonymous option, gallery view
- [ ] Spaced repetition: reviews scheduled on completion, due reviews shown on dashboard
- [ ] All new tables have RLS
- [ ] `npm run build` passes
- [ ] `git commit -m "feat: Phase 8A — engagement features"`
- [ ] `git push origin main`
