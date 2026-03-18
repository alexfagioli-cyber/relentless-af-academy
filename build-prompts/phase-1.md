# RelentlessAF Academy — Phase 1: Onboarding & Content

You are building Phase 1. Phase 0 is complete (commit 59d6224) — Next.js app with Supabase auth, 11-table schema, RLS, dark mode layout with bottom nav. You are the builder — implement exactly what this prompt specifies.

## What to build

### 1. Onboarding Profiler

Create `src/app/onboarding/page.tsx` (replace the Phase 0 placeholder) — a multi-step conversational profiler. Use either `react-multistep` or `rhf-wizard` — whichever integrates cleaner with the existing stack. If neither works well, build a clean custom stepper (the flow is only 3 steps, a library might be overkill).

**Step 1: Welcome** (Q1 + Q2)

Q1: `motivation` — "What brings you to RelentlessAF Academy?"
| Option | Aware | Enabled | Specialist |
|---|---|---|---|
| "I'm curious about AI and want to understand it" | 3 | 1 | 0 |
| "I want to use AI to be better at my work or studies" | 1 | 3 | 1 |
| "I want to build a career skill or business around AI" | 0 | 1 | 3 |
| "Someone I trust told me to check this out" | 2 | 2 | 0 |

Q2: `background` — "What best describes you right now?"
| Option | Aware | Enabled | Specialist |
|---|---|---|---|
| "Student (school)" | 2 | 1 | 0 |
| "Student (university)" | 1 | 2 | 1 |
| "Working professional" | 0 | 3 | 1 |
| "Career changer / exploring options" | 0 | 2 | 2 |

**Step 2: AI Knowledge** (Q3 → adaptive Q4 branch → Q5 → Q6 → Q7)

Q3: `ai_familiarity` — "Have you used any AI tool before? (ChatGPT, Claude, Copilot, Gemini)"
| Option | Aware | Enabled | Specialist | Next |
|---|---|---|---|---|
| "No, never" | 3 | 0 | 0 | Q4a |
| "Yes, a few times" | 2 | 1 | 0 | Q4b |
| "Yes, I use AI regularly" | 0 | 2 | 1 | Q4c |
| "Yes, I've built things with AI" | 0 | 0 | 3 | Q4d |

Q4a (novice): `ai_concept` — "What do you think AI is best at?"
| Option | Aware | Enabled | Specialist |
|---|---|---|---|
| "I'm not really sure" | 3 | 0 | 0 |
| "Answering questions and writing things" | 2 | 1 | 0 |
| "Helping with complex tasks and analysis" | 1 | 2 | 0 |

Q4b (casual): `ai_usage` — "What have you mainly used AI for?"
| Option | Aware | Enabled | Specialist |
|---|---|---|---|
| "Fun / curiosity / chatting" | 2 | 1 | 0 |
| "Homework / work tasks / writing help" | 1 | 2 | 0 |
| "Research / analysis / problem-solving" | 0 | 2 | 1 |

Q4c (regular): `ai_depth` — "Which of these have you done?"
| Option | Aware | Enabled | Specialist |
|---|---|---|---|
| "Given AI instructions to get better answers" | 1 | 2 | 0 |
| "Created reusable prompts or workflows" | 0 | 2 | 1 |
| "Used AI APIs or developer tools" | 0 | 0 | 3 |

Q4d (builder): `ai_building` — "What have you built with AI?"
| Option | Aware | Enabled | Specialist |
|---|---|---|---|
| "Simple scripts or automations" | 0 | 1 | 2 |
| "Apps or tools that use AI" | 0 | 0 | 3 |
| "I've integrated AI APIs into production systems" | 0 | 0 | 4 |

Q5: `prompt_knowledge` — "A 'prompt' in AI is..."
| Option | Aware | Enabled | Specialist |
|---|---|---|---|
| "I don't know" | 3 | 0 | 0 |
| "What you type to ask AI something" | 1 | 2 | 0 |
| "An instruction that shapes the AI's response — context, format, and constraints matter" | 0 | 1 | 2 |

Q6: `ai_limitations` — "Which of these is true about AI?"
| Option | Aware | Enabled | Specialist |
|---|---|---|---|
| "AI always gives correct answers" | 3 | 0 | 0 |
| "AI can make mistakes — you should check important facts" | 1 | 2 | 0 |
| "AI can hallucinate, has knowledge cutoffs, and works best with clear constraints" | 0 | 1 | 3 |

Q7: `code_comfort` — "How comfortable are you with code or technical tools?"
| Option | Aware | Enabled | Specialist |
|---|---|---|---|
| "Not at all — and that's fine" | 2 | 1 | 0 |
| "I've seen code but don't write it" | 1 | 2 | 0 |
| "I can write basic scripts" | 0 | 1 | 2 |
| "I'm a confident developer" | 0 | 0 | 3 |

**Step 3: Goals** (Q8 + Q9)

Q8: `success_vision` — "What would success look like for you?"
| Option | Aware | Enabled | Specialist |
|---|---|---|---|
| "I understand what AI can do and feel confident talking about it" | 3 | 0 | 0 |
| "I use AI daily and it saves me time on real tasks" | 0 | 3 | 0 |
| "I can build AI-powered tools or get certified as an AI professional" | 0 | 0 | 3 |
| "I'm not sure yet — I want to explore and see" | 2 | 1 | 0 |

Q9: `time_commitment` — "How much time can you commit per week?"
Options: "1-2 hours", "3-5 hours", "5+ hours" — stored in profile, not scored.

### Tier Assignment Algorithm

Create `src/lib/tier-logic.ts`:

```
total_aware = sum of all Aware scores
total_enabled = sum of all Enabled scores
total_specialist = sum of all Specialist scores

if total_specialist > total_enabled AND total_specialist > total_aware:
  tier = 'specialist'
elif total_enabled > total_aware:
  tier = 'enabled'
else:
  tier = 'aware'

// Conservative rule: if enabled and specialist are within 15%,
// assign 'enabled' — let them prove up through the platform
if tier == 'specialist' and (total_enabled / total_specialist) > 0.85:
  tier = 'enabled'
```

After tier assignment:
- Save all responses to `onboarding_responses` table
- Update `learner_profiles` with tier, onboarding_complete = true, weekly_time_commitment, primary_goal, learning_motivation
- Redirect to dashboard

### 2. Curriculum Seed Data

Create `supabase/migrations/004_seed_modules.sql` with all 32 modules. Run against live database.

**Aware tier (Track 1):**

| Order | ID | Title | Type | Platform | URL | Duration | Prerequisites |
|---|---|---|---|---|---|---|---|
| 1 | A01 | Claude 101 | course | skilljar | https://anthropic.skilljar.com/claude-101 | 210 | none |
| 2 | A02 | Challenge: First Conversation | challenge | internal | — | 30 | A01 |
| 3 | A03 | Assessment: AI Basics | assessment | internal | — | 15 | A02 |
| 4 | A04 | AI Fluency: Framework & Foundations | course | skilljar | https://anthropic.skilljar.com/ai-fluency-framework | 210 | A03 |
| 5 | A05 | AI Fluency for Students | course | skilljar | https://anthropic.skilljar.com/ai-fluency-students | 180 | A03 |
| 6 | A06 | Challenge: Summarise a Real Document | challenge | internal | — | 30 | A04 OR A05 |
| 7 | A07 | Assessment: Frameworks Applied | assessment | internal | — | 15 | A06 |
| 8 | A08 | Challenge: AI in Your Daily Life | challenge | internal | — | 45 | A07 |
| 9 | A09 | Tier Gate: Aware Completion | assessment | internal | — | 20 | A08 |

A06 uses OR prerequisites: (A06, A04, group=1) + (A06, A05, group=2)

**Enabled tier (Track 2):**

| Order | ID | Title | Type | Platform | URL | Duration | Prerequisites |
|---|---|---|---|---|---|---|---|
| 10 | E01 | Real-World AI for Everyone | course | coursera | https://www.coursera.org/specializations/real-world-ai-for-everyone | 600 | A09 |
| 11 | E02 | Challenge: Custom Instruction Set | challenge | internal | — | 45 | E01 |
| 12 | E03 | Assessment: Applied Prompting | assessment | internal | — | 20 | E02 |
| 13 | E04 | Prompt Engineering Interactive Tutorial | course | github | https://github.com/anthropics/courses/tree/master/prompt_engineering_interactive_tutorial | 180 | E03 |
| 14 | E05 | Real World Prompting | course | github | https://github.com/anthropics/courses/tree/master/real_world_prompting | 120 | E04 |
| 15 | E06 | Challenge: Build a Prompt Library | challenge | internal | — | 60 | E05 |
| 16 | E07 | Assessment: Prompt Engineering Mastery | assessment | internal | — | 25 | E06 |
| 17 | E08 | Challenge: AI Workflow Integration | challenge | internal | — | 60 | E07 |
| 18 | E09 | Tier Gate: Enabled Completion | assessment | internal | — | 25 | E08 |

**Specialist tier (Track 3):**

| Order | ID | Title | Type | Platform | URL | Duration | Prerequisites |
|---|---|---|---|---|---|---|---|
| 19 | S01 | Building with the Claude API | course | skilljar | https://anthropic.skilljar.com/building-with-the-claude-api | 480 | E09 |
| 20 | S02 | API Fundamentals (GitHub) | course | github | https://github.com/anthropics/courses/tree/master/anthropic_api_fundamentals | 120 | S01 |
| 21 | S03 | Challenge: Build a Claude API Script | challenge | internal | — | 90 | S02 |
| 22 | S04 | Assessment: API Fundamentals | assessment | internal | — | 25 | S03 |
| 23 | S05 | Claude Code in Action | course | skilljar | https://anthropic.skilljar.com/claude-code-in-action | 240 | S04 |
| 24 | S06 | Introduction to MCP | course | skilljar | https://anthropic.skilljar.com/introduction-to-mcp | 150 | S05 |
| 25 | S07 | MCP Advanced Topics | course | skilljar | https://anthropic.skilljar.com/mcp-advanced-topics | 180 | S06 |
| 26 | S08 | Tool Use (GitHub) | course | github | https://github.com/anthropics/courses/tree/master/tool_use | 120 | S06 |
| 27 | S09 | Challenge: Build an MCP Server | challenge | internal | — | 120 | S07 AND S08 |
| 28 | S10 | Introduction to Agent Skills | course | skilljar | https://anthropic.skilljar.com/introduction-to-agent-skills | 30 | S09 |
| 29 | S11 | Prompt Evaluations (GitHub) | course | github | https://github.com/anthropics/courses/tree/master/prompt_evaluations | 90 | S10 |
| 30 | S12 | Building with the Claude API (Coursera) | course | coursera | https://www.coursera.org/specializations/building-with-the-claude-api | 600 | S11 |
| 31 | S13 | CCA Exam Preparation | course | claudecertifications | https://claudecertifications.com/ | 300 | S12 |
| 32 | S14 | Assessment: Specialist Readiness | assessment | internal | — | 30 | S13 |

S09 uses AND prerequisites: (S09, S07, group=0) + (S09, S08, group=0)

### 3. Learning Path View

Create `src/app/learn/page.tsx`:
- Query modules for the learner's tier (and all lower tiers — an Enabled learner sees Aware + Enabled)
- Compute unlocked modules using the recursive CTE with prerequisite_group logic (same group = AND, different groups = OR)
- Display modules as a vertical list/cards showing: title, type icon (course/challenge/assessment), duration, platform, status (locked/available/in_progress/completed)
- Locked modules shown greyed out with a lock icon
- Available modules have crimson accent border
- Completed modules show green checkmark
- Clicking an available module goes to `/learn/[moduleId]`

### 4. Module Detail Page

Create `src/app/learn/[moduleId]/page.tsx`:
- Show module title, description, estimated duration, platform
- For external courses (skilljar/github/coursera/claudecertifications): show a "Start Course" button that opens the external URL in a new tab
- For internal challenges: show challenge description and a "Mark Complete" button (self-reported for now — assessments gate in Phase 2)
- For internal assessments: show "Assessment coming in Phase 2" placeholder
- Track progress: when learner opens a module, create/update progress row to 'in_progress'. When they mark complete, set to 'completed'.
- Log learning_events for 'started' and 'completed' verbs

### 5. Streak Tracking

- When a learner completes any module or marks a challenge done, check if `streak_last_date` is today or yesterday
  - If today: no change
  - If yesterday: increment `streak_current`, update `streak_last_date` to today
  - If older or null: reset `streak_current` to 1, update `streak_last_date` to today
- Update `streak_longest` if `streak_current` exceeds it
- Display on the dashboard (already has the placeholder from Phase 0)
- Do NOT use @loyalteez — build a simple ~30 line streak utility in `src/lib/streak.ts`

### 6. Dashboard Update

Update `src/app/page.tsx`:
- Replace the "learning path placeholder" with actual data: count of completed modules, next available module, current tier
- Show a "Continue Learning" button linking to the next available module
- Streak display already wired from Phase 0 — just ensure it reads real data now

## Database access

Use the Supabase server client (`src/lib/supabase/server.ts`) for all database reads in server components. Use the browser client for client-side mutations (marking modules complete, saving onboarding responses).

Run migration 004 against the live database the same way Phase 0 did — copy SQL to clipboard with pbcopy, paste in Supabase SQL Editor.

## Error Handling

- External course URL might 404: module detail page should note "This course may have moved. Try visiting [platform] directly."
- Onboarding submitted with missing answers: default to 0 scores for all tiers, still compute tier
- Supabase connection failure: show "Service temporarily unavailable" page

## Red Lines

1. No hardcoded credentials
2. Mobile-first at 375px
3. No Intragen references
4. Invite-only at DB (already enforced)
5. Assessment answers never sent to client (not relevant yet — assessments are Phase 2 placeholders)
6. Admin via is_admin flag
7. No Atlas internals
8. Lifecycle paths (invites expire, already enforced)

## Exit Gate

- [ ] Onboarding flow works end-to-end: complete all 9 questions, tier assigned correctly
- [ ] Test tier assignment: novice answers → Aware, mixed answers → Enabled, builder answers → Specialist
- [ ] All 32 modules seeded in database
- [ ] Learning path shows correct modules for assigned tier
- [ ] Prerequisite DAG works: A06 unlocks with either A04 OR A05 completed. S09 requires both S07 AND S08.
- [ ] Module detail pages render with correct external links
- [ ] Marking a challenge complete updates progress and logs learning_event
- [ ] Streak increments on activity, resets after gap
- [ ] Dashboard shows real data (completed count, next module, streak)
- [ ] `npm run build` passes
- [ ] `git commit -m "feat: Phase 1 — onboarding and content"`
