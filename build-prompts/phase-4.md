# RelentlessAF Academy — Phase 4: Polish & Deploy

You are building Phase 4 — the final phase. Phases 0-3 are complete (commits 59d6224, f2a8184, 1fc6e71, 31ce07d) — full app with auth, onboarding, curriculum, assessments, admin dashboard, briefing API. You are the builder — implement exactly what this prompt specifies.

## What to build

### 1. Mobile Responsive Polish

Test every page at 375px (iPhone SE), 390px (iPhone 14), and 414px (iPhone 14 Plus). Fix any issues:

Pages to check:
- `/auth/login` — form centred, inputs full-width, no overflow
- `/auth/set-password` — same
- `/onboarding` — steps readable, options tappable (minimum 44px tap targets)
- `/` (dashboard) — stats cards stack properly, "Continue Learning" button prominent
- `/learn` — module cards stack vertically, no horizontal overflow
- `/learn/[moduleId]` — content readable, buttons full-width on mobile
- `/admin` — learner table either horizontal scrolls or switches to card layout at 375px

Specific fixes to look for:
- Text truncation on long module titles
- Buttons too small to tap (minimum 44px height)
- Horizontal overflow causing side-scroll on the page body (never acceptable)
- Input fields too narrow on mobile
- Bottom nav overlapping content (add padding-bottom to main content area)

### 2. Loading States

Add loading states for:
- Dashboard data loading (skeleton cards with pulse animation)
- Learning path loading (skeleton module list)
- Module detail loading
- Assessment submission (button shows spinner, disabled during submission)
- Admin dashboard loading
- Use shadcn/ui Skeleton component or a simple CSS pulse animation matching the branding

### 3. Error Handling UI

Add user-facing error states for:
- Supabase connection failure → "Service temporarily unavailable. Please try again."
- Module not found → 404 page styled with branding
- Assessment scoring failure → "Something went wrong. Your answers are saved — try again."
- Auth errors → clear message on login page

Create `src/app/not-found.tsx` — branded 404 page (dark mode, crimson accent, "Page not found" with link home)

### 4. Empty States

- Dashboard with no progress → "Welcome! Start your first module to begin your AI journey." with link to /learn
- Learning path with all modules locked → "Complete the modules above to unlock more content."
- Admin with no learners → "No learners yet. Send your first invite above."
- Admin with no invites → "No invites sent yet."

### 5. Smooth Transitions

- Page transitions: subtle fade-in on route change (CSS transition on main content)
- Module status change: smooth colour transition when marking complete
- Onboarding step transitions: slide or fade between steps
- Assessment result: brief pause then reveal (not instant)
- Keep it subtle — this is polish, not animation-heavy

### 6. Feedback Button (Added by Alex)

Create a simple per-module feedback mechanism:

**Database:** Create `supabase/migrations/006_feedback.sql`:
```sql
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
CREATE POLICY "Admins can read all feedback" ON module_feedback FOR SELECT USING (EXISTS (SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true));
```

**Component:** Create `src/components/feedback/module-feedback.tsx`:
- 4 buttons in a row: Useful / Too Easy / Too Hard / Confusing
- Shown on module detail page after the module is completed
- One selection per module (updates on re-click, doesn't create duplicates — UNIQUE constraint)
- Optional comment field (textarea, hidden by default, expand on click)
- Subtle — doesn't dominate the page

**Admin visibility:** Add a "Feedback" tab or section to the admin dashboard showing recent feedback across all modules.

### 7. Vercel Deployment

- Ensure all env vars are set in Vercel (they were configured during setup, but verify):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `BRIEFING_API_TOKEN`
- Push to main → Vercel auto-deploys
- Test the production URL: `relentless-af-academy.vercel.app`
- Verify all pages load, auth works, API routes respond

### 8. Seed Test Invite

- From the running app (or via the admin dashboard), send an invite to Alex's email (`alexfagioli@icloud.com`)
- Verify the invite email arrives
- Do NOT complete the registration — just verify the invite flow works end-to-end

## Red Lines (final check)

1. No hardcoded credentials — verify .env.local not in git, Vercel env vars set
2. Mobile-first — every page verified at 375px
3. No Intragen — grep the entire codebase for "intragen" — zero results
4. Invite-only at DB level — test that direct URL access without auth redirects
5. Server-side scoring — verify correct answers not in Network tab payload
6. Admin via is_admin — verify no hardcoded emails
7. No Atlas internals — grep for "atlas" (should only appear in build-prompts, not app code)
8. Lifecycle paths — invites expire, events logged

## Exit Gate

- [ ] All pages render correctly at 375px (no horizontal overflow, no truncation, tappable buttons)
- [ ] Loading states on dashboard, learning path, module detail, admin
- [ ] Error states: 404 page, connection error, scoring error
- [ ] Empty states on dashboard, learning path, admin
- [ ] Subtle transitions: page fade, step slide, status colour change
- [ ] Feedback button works on completed modules, visible in admin
- [ ] Production URL loads on Vercel (`relentless-af-academy.vercel.app`)
- [ ] Auth works in production (login page renders, redirect works)
- [ ] API routes work in production (briefing endpoint returns JSON)
- [ ] Invite email sent to Alex's email (verify delivery, don't complete registration)
- [ ] Full red line verification (all 8 checked against production)
- [ ] `npm run build` passes
- [ ] `git commit -m "feat: Phase 4 — polish and deploy"`
- [ ] Lighthouse mobile score >80
