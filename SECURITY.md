# Security Audit — Phase 5B

Audit performed: 18 March 2026

## RLS Policy Audit

All 12 tables have RLS enabled. Policies verified:

| Table | User Policy | Admin Policy | Anon Access |
|---|---|---|---|
| invites | Read own (email match) | Read/insert/update via `is_admin()` | Blocked |
| learner_profiles | Read/insert/update own (id = auth.uid()) | Read via `is_admin()` | Blocked |
| onboarding_responses | Read/insert own (learner_id) | Read via `is_admin()` | Blocked |
| modules | Read (authenticated only) | Manage via `is_admin()` | Blocked |
| prerequisites | Read (authenticated only) | Manage via `is_admin()` | Blocked |
| progress | Read/insert/update own (learner_id) | Read via `is_admin()` | Blocked |
| assessments | Read (authenticated only) | Manage via `is_admin()` | Blocked |
| assessment_attempts | Read/insert own (learner_id) | Read via `is_admin()` | Blocked |
| learning_signals | Read/insert own (learner_id) | Read via `is_admin()` | Blocked |
| learning_events | Read/insert own (learner_id) | Read via `is_admin()` | Blocked |
| nudges | Read own (learner_id) | Read/insert via `is_admin()` | Blocked |
| module_feedback | Manage own (learner_id) | Read via `is_admin()` | Blocked |

- `is_admin()` function is `SECURITY DEFINER` — prevents infinite recursion on learner_profiles self-reference
- Tested: anon key curl against learner_profiles, progress, assessment_attempts → all return `[]`
- No policy allows cross-user data access for non-admin users

## API Route Protection

| Endpoint | Auth Method | Tested |
|---|---|---|
| `/api/assess/score` | Supabase session (auth.getUser) | Rejects without session |
| `/api/admin/invite` | Supabase session + is_admin check | Returns 403 for non-admins |
| `/api/admin/briefing` | Bearer token (BRIEFING_API_TOKEN) | Returns 401 without/wrong token |

## Input Sanitisation

| Endpoint/Component | Validation Added |
|---|---|
| `/api/assess/score` | UUID regex validation on assessmentId |
| `/api/admin/invite` | Email regex + type check + max length 254 |
| `verify-cert.tsx` | Strip whitespace, limit to 100 chars, alphanumeric + hyphens only |
| `onboarding/page.tsx` | Filter responses against known QUESTION_OPTIONS keys |

## Client-Side Security

- `SUPABASE_SERVICE_ROLE_KEY`: only referenced in server-side files (`src/lib/supabase/admin.ts`, `src/app/api/` routes, `src/app/admin/page.tsx` server component). Not in any client component or `client.ts`.
- `correctAnswer` fields: stripped via `delete element.correctAnswer` in `module-actions.tsx:69` before setting client state. Scoring uses server-side assessment fetch.
- Codebase grep clean: zero `intragen`, zero `atlas` in app code, zero hardcoded emails.

## Issues Found and Fixed

1. **Assessment scoring**: Added UUID format validation on assessmentId (was accepting any string)
2. **Invite endpoint**: Tightened email validation from simple `includes('@')` to proper regex + length check
3. **Cert verification**: Added input sanitisation (length limit, character whitelist) before building URL
4. **Onboarding**: Added question_key validation against known keys before database insert
