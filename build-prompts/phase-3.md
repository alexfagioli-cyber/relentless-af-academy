# RelentlessAF Academy — Phase 3: Autonomy & Admin

You are building Phase 3. Phases 0-2 are complete (commits 59d6224, f2a8184, 1fc6e71) — full app with auth, onboarding, 32-module curriculum, assessments with server-side scoring, XState progression, cert verification, streaks. You are the builder — implement exactly what this prompt specifies.

## What to build

### 1. Admin Dashboard

Create `src/app/admin/page.tsx` (new page, admin-only):

**Access control:** Check `is_admin` flag on `learner_profiles` for the current user. If not admin, redirect to dashboard. Do NOT hardcode email addresses.

**Sections:**

**a) Learner Table**
- List all learner_profiles with columns: Name, Email (from auth.users), Tier, Modules Completed (count), Last Active, Streak, Status indicator
- Status indicator logic:
  - Green: active in last 3 days
  - Amber: inactive 3-7 days
  - Red: inactive 7-14 days
  - Grey: inactive 14+ days
- Click a row to expand and see: full progress list, assessment scores, onboarding responses
- Mobile-responsive: horizontal scroll on small screens, or card layout at 375px

**b) Invite Management**
- Form: email input + "Send Invite" button
- Calls Supabase `auth.admin.inviteUserByEmail()` (requires service_role key — use a server action or API route)
- Creates a row in the `invites` table with status 'pending'
- Shows list of all invites with status (pending/accepted/expired)
- Expired invites (past expires_at) shown with "Expired" badge

**c) Progress Overview**
- Summary stats at the top: total learners, average completion %, most common tier, average streak
- Per-tier breakdown: how many learners in each tier, average progress per tier

**d) Manual Tier Override**
- In the expanded learner detail: dropdown to change tier (aware/enabled/specialist)
- Updates learner_profiles.tier directly
- Logs a learning_event with verb 'skipped' and context noting "admin tier override"

### 2. Invite Management API Route

Create `src/app/api/admin/invite/route.ts`:
- POST: receives `{ email }`, checks caller is admin, calls `supabase.auth.admin.inviteUserByEmail(email)`, creates invite row
- Must use the service_role key (create a separate admin Supabase client using SUPABASE_SERVICE_ROLE_KEY)
- Create `src/lib/supabase/admin.ts` — server-only client using the service_role key for admin operations

### 3. Inactive Learner Flagging

The admin dashboard (section a) already shows status indicators. Additionally:

Create `src/app/api/admin/briefing/route.ts` — the weekly briefing API endpoint:
- GET request with bearer token auth (use a simple shared secret in .env.local: `BRIEFING_API_TOKEN`)
- Returns JSON:
```json
{
  "generated_at": "ISO timestamp",
  "summary": {
    "total_learners": N,
    "active_last_7_days": N,
    "inactive_7_plus_days": N,
    "average_completion_pct": N
  },
  "learners": [
    {
      "name": "...",
      "tier": "...",
      "modules_completed": N,
      "modules_total": N,
      "completion_pct": N,
      "last_active": "ISO timestamp",
      "days_inactive": N,
      "current_streak": N,
      "status": "active|stalling|inactive|dormant",
      "recent_events": [
        { "verb": "...", "object": "...", "date": "..." }
      ]
    }
  ]
}
```
- Status logic: active (0-3 days), stalling (3-7), inactive (7-14), dormant (14+)
- Add `BRIEFING_API_TOKEN` to .env.local (generate a random string)

### 4. Invite Expiry Enforcement

In the auth confirm route (`src/app/auth/confirm/route.ts`):
- After verifying the token, check the invites table for the user's email
- If the invite status is 'expired' OR `expires_at < now()`, redirect to a "Your invite has expired" page
- If valid, update invite status to 'accepted'

Create `src/app/auth/expired/page.tsx` — simple page: "Your invite has expired. Contact Alex for a new one."

## Error Handling

- Admin API routes return 403 for non-admin users (don't leak whether the endpoint exists)
- Invite send failure: show error message, don't create invite row
- Briefing endpoint with wrong/missing token: return 401

## Red Lines

1. No hardcoded credentials — briefing token in .env.local
2. Mobile-first at 375px — admin dashboard must work on mobile
3. No Intragen references
4. Invite-only at DB level
5. Server-side scoring (already enforced)
6. Admin via is_admin flag — NO hardcoded email checks
7. No Atlas internals
8. Lifecycle paths — invites expire, expired invites rejected

## Exit Gate

- [ ] Admin dashboard loads for admin users, redirects non-admins
- [ ] Learner table shows all learners with correct status colours
- [ ] Can send invite from admin dashboard (test with a real email)
- [ ] Invite appears in invites table with 'pending' status
- [ ] Invite expiry check works (expired invite → expired page)
- [ ] Progress overview shows accurate stats
- [ ] Manual tier override works and logs learning_event
- [ ] Briefing API returns valid JSON with correct data structure
- [ ] Briefing API rejects requests without valid token
- [ ] `npm run build` passes
- [ ] `git commit -m "feat: Phase 3 — autonomy and admin"`
