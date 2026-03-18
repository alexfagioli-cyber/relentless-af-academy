# RelentlessAF Academy — Phase 5B: Security & Technical Hardening

**IMPORTANT: This project lives at ~/relentless-af-academy/ — NOT inside Atlas. All file paths are relative to ~/relentless-af-academy/. Do NOT create files in or reference the Atlas directory. Change to the project directory first: `cd ~/relentless-af-academy`**

You are building Phase 5B. Phases 0-4 are complete — full working app deployed to Vercel. This phase hardens security, adds PWA support, and runs a comprehensive debug pass. You are the builder — implement exactly what this prompt specifies.

## What to build

### 1. Security Hardening

**RLS Policy Audit:**
- Read every policy in `supabase/migrations/002_rls_policies.sql` and `supabase/migrations/003_fix_admin_rls.sql`
- Verify: no policy allows a non-admin user to read another user's data
- Verify: no policy allows unauthenticated access to any table
- Verify: the is_admin() function is SECURITY DEFINER (prevents recursion)
- Test via curl with the anon key: attempt to read learner_profiles, progress, assessment_attempts without auth → should get empty array or error

**API Route Protection:**
- `/api/assess/score` — verify it checks for authenticated user, rejects without session
- `/api/admin/invite` — verify it checks is_admin, returns 403 for non-admins
- `/api/admin/briefing` — verify it checks bearer token, returns 401 without token
- Test each with curl: no auth → rejected

**Input Sanitisation:**
- Assessment scoring endpoint: validate assessmentId is a valid UUID before querying
- Invite endpoint: validate email format before calling Supabase
- Cert verification: sanitise the certificate number input (strip whitespace, limit length)
- Onboarding responses: validate question_key against known keys before inserting

**Client-Side Security:**
- Verify SUPABASE_SERVICE_ROLE_KEY never appears in client-side bundles
- Check: `grep -r "service_role\|SERVICE_ROLE" src/app/ src/components/ src/lib/supabase/client.ts` → should find nothing (only server.ts and admin.ts)
- Verify assessment correctAnswer fields are stripped before reaching the client (check module-actions.tsx)

**Fix any issues found.** Document what was checked and what was fixed in a comment at the top of a new file: `SECURITY.md` at the repo root.

### 2. PWA Manifest

Create `public/manifest.json`:
```json
{
  "name": "RelentlessAF Academy",
  "short_name": "RAF Academy",
  "description": "Personal AI training programme",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#111827",
  "theme_color": "#DC2626",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Add to `src/app/layout.tsx`:
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#DC2626" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

For the icons: create simple placeholder icons using a crimson (#DC2626) circle with "R" in white Inter Bold. These are placeholders until Alex provides a proper logo. Use a simple SVG-to-PNG approach or create them as static files.

### 3. Vercel Production Verification

- Verify all 4 env vars are set in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `BRIEFING_API_TOKEN`
- After pushing, test the production URL:
  - `/auth/login` loads
  - `/api/admin/briefing` returns 401 without token, 200 with token
  - Unauthenticated access to `/` redirects to `/auth/login`

### 4. Full-Flow Debug Pass

Run through the complete user journey on localhost. For each step, note any issues:

1. Open `/auth/login` at 375px viewport — check layout
2. Navigate to an invite confirm URL (or test the redirect flow)
3. Set password → verify redirect to welcome page
4. Welcome page → read through, check copy renders correctly, "Let's Go" button works
5. Onboarding → complete all 3 steps, try each Q3 branch (test novice AND regular paths)
6. Dashboard → verify tier assigned, stats show 0/32 or relevant count, personalised message
7. Learning path → verify modules display, first module available (A01), rest locked
8. Click A01 → module detail loads, "Start Course" opens Anthropic Academy in new tab
9. Mark A01 complete → progress updates, A02 unlocks, streak starts
10. Navigate to A03 (assessment) → verify it shows assessment UI when available (or locked if prerequisites not met)
11. Admin → check learner table shows the test user, status indicator correct
12. Admin → check feedback section (empty at this point)
13. Briefing API → curl production URL with token, verify JSON structure

Fix any issues found during the pass. Document what was tested and fixed.

### 5. Codebase Grep Verification

```bash
# Red line 3: No Intragen
grep -ri "intragen" src/ --include="*.ts" --include="*.tsx"
# Should return nothing

# Red line 7: No Atlas internals
grep -ri "atlas" src/ --include="*.ts" --include="*.tsx"
# Should return nothing (only in build-prompts/ and CLAUDE.md)

# Service role key not in client code
grep -ri "service_role\|SERVICE_ROLE" src/app/ src/components/ src/lib/supabase/client.ts
# Should return nothing
```

## Red Lines
Final verification of all 8 red lines against the complete codebase.

## Exit Gate
- [ ] SECURITY.md documents all checks performed and results
- [ ] RLS verified: anon curl returns empty/error on all protected tables
- [ ] API routes verified: reject unauthenticated/unauthorised requests
- [ ] Input validation on all user-facing endpoints
- [ ] Service role key not in any client-side code
- [ ] PWA manifest present, meta tags in layout, placeholder icons created
- [ ] Production URL verified: login loads, briefing API works, redirects work
- [ ] Full flow debug pass completed with no blocking issues
- [ ] Codebase grep clean: zero intragen, zero atlas in app code, zero service_role in client
- [ ] `npm run build` passes
- [ ] `git commit -m "feat: Phase 5B — security hardening and debug pass"`
