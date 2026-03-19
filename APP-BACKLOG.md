# RelentlessAF Academy — Development Backlog

> App-specific development backlog. Not Atlas AT items.
> Raised: 19 March 2026 — live walkthrough debug session.

## Critical — Blocks Next Invite

| # | Issue | Location | Detail |
|---|---|---|---|
| ~~C1~~ | ~~No invite UI in admin panel~~ | `/admin` | **DONE** — invite form exists on Overview tab (was below the fold). Email input + Send Invite button + invite history. |
| C2 | Invite email flow untested | Auth flow | PKCE code exchange deployed but never tested end-to-end: invite → email → `/auth/confirm` → `/auth/set-password` → welcome. |
| C3 | Jason Staats has no tier | Database | Shows "—" for tier, 0/12 modules. Onboarding not completed. Middleware should redirect him to onboarding on login — verify this works. |

## High — Wrong Data or Confusing UX

| # | Issue | Location | Detail |
|---|---|---|---|
| H1 | Dashboard progress inconsistency | `/` | Ring shows "5%" but text says "0 of 10 in Enabled". Should count cross-tier progress or show 0%. |
| H2 | "sam" display name lowercase | Database | `learner_profiles.display_name` = "sam". Should be "Samantha Staats" or "Sam Staats". |
| H3 | Avg Completion mismatch | Admin | Overview shows 12%, Analytics shows 7%. Different calculations — align or explain the difference. |
| H4 | "What to Look For" unlocked without A00 | `/learn` | Third Aware module unlocked despite first module (Your First AI Moment) not completed. Check `prerequisites` table. |
| H5 | "Continue" label ambiguous on completed modules | `/learn/[id]` | Completed module shows "Continue →" next to "Revisit Course →". Should say "Next Module →". |
| H6 | Dead link warning always shows | `/learn/[id]` | "This course may have moved" displays on all external modules, not only when link fails. |

## Medium — Polish

| # | Issue | Location | Detail |
|---|---|---|---|
| M1 | Video placeholder not rendering on internal modules | `/learn/[id]` | Component exists at `src/components/ui/video-placeholder.tsx` but condition doesn't trigger on A00/E00/S00. |
| M2 | Community page — no bottom nav active state | `/community` | Community is accessible via dashboard card but isn't in the bottom nav, so no tab highlights. |
| M3 | Feedback button overlaps bottom nav on mobile | All pages | Floating "Feedback" button sits close to/over the bottom nav at 375px width. |
| M4 | Sliding panels don't work | `/futures` | Persona carousel — swipe/slide interaction broken. |

---

## Ideas & Enhancements

> Added: 19 March 2026 — Alex brain dump. Not prioritised yet.

### Curriculum & Progression

| # | Idea | Detail |
|---|---|---|
| E1 | More stages / sub-levels | Break tiers into smaller steps so the path feels less daunting. Too big a jump between Aware → Enabled → Specialist. |
| E2 | Start everyone at a lower level | Default entry point should feel achievable, not intimidating. |
| E3 | Only expose courses at the right level | Tighter gating — don't show what's locked, or create sub-level unlocks within each tier. |
| E4 | Limit visible courses | Don't overwhelm with the full list. Show what's relevant now. |
| E5 | Introduce Claude Desktop earlier | Get people using Claude Desktop/Code sooner in the curriculum rather than waiting for Specialist. |
| E6 | Deep research module ideas | Teach deep research techniques — how to use Claude for proper investigation, not just Q&A. |
| E7 | Transcription and Wispr | Include transcription tools (Wispr, etc.) in the curriculum — practical AI workflow. |
| E8 | What other training to include? | Research what else is out there — other platforms, certifications, complementary content. |
| E9 | Embed Claude training better | Integrate Anthropic Academy content more directly rather than linking out to Skilljar. |
| E10 | Different levels of training | More granularity in difficulty — not just 3 tiers but progressive skill building within each. |

### Features

| # | Idea | Detail |
|---|---|---|
| F1 | Desktop-enabled layout | Currently mobile-first only. Make it work properly on desktop — wider layouts, better use of space. |
| F2 | Community bots | Seed the community with bot-generated posts so new learners don't land on an empty wall. |
| F3 | Q&A help when stuck | In-app support when a learner doesn't understand something — could be a chatbot, FAQ, or ask-the-group feature. |
| F4 | Chatbot powered by Atlas | Embed an Atlas-connected chatbot that can answer questions about the curriculum and guide learners. |
| F5 | Make front page more interactive | Dashboard is static — needs more engagement, dynamic content, or personalised nudges. |

### Content & Polish

| # | Idea | Detail |
|---|---|---|
| P1 | Create video content | Produce video for key modules — potentially using HeyGen (already in browser tabs). |
| P2 | Make news section better | Current news page is basic. Needs richer content, better formatting, or curated AI updates. |
| P3 | Improve prompt library | Current prompt area needs enhancement — better categories, more templates, or interactive examples. |
| P4 | Update Futures personas | Change or expand the persona stories to better match the actual target audience. |
