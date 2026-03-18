# RelentlessAF Academy — Phase 2: Assessments & Gating

You are building Phase 2. Phase 0 (59d6224) and Phase 1 (f2a8184) are complete — Next.js app with auth, onboarding profiler, 32-module curriculum with prerequisite DAG, learning path, progress tracking, streaks. You are the builder — implement exactly what this prompt specifies.

## What to build

### 1. SurveyJS Integration

Install SurveyJS:
```
npm install survey-core survey-react-ui
```

Create `src/components/assessment/survey-renderer.tsx` — a client component that:
- Takes a SurveyJS JSON definition (from the `assessments.questions` JSONB column)
- Renders the assessment using SurveyJS React UI
- On completion, submits answers to the server-side scoring endpoint
- Shows pass/fail result with score
- Applies dark mode styling matching the branding (#111827 background, #1E293B surface, #DC2626 crimson accents, #F9FAFB text)

**Critical red line:** Assessment answers and correct answers are NEVER sent to the client. The SurveyJS JSON sent to the client contains only the questions and options — no scoring data. Scoring happens server-side only.

### 2. Server-Side Scoring Endpoint

Create `src/app/api/assess/score/route.ts`:
- Receives: `{ assessmentId, answers }` in POST body
- Fetches the assessment from database (including correct answers in the JSONB)
- Scores the submission server-side
- Calculates percentage score
- Determines pass/fail against `assessments.pass_score` (default 70%)
- Inserts into `assessment_attempts` table
- Updates `progress` table: 'completed' if passed, 'failed' if not
- Logs learning_event: 'passed' or 'failed' verb
- Updates streak on pass
- Returns: `{ score, passed, total_questions, correct_count }`

### 3. Assessment Seed Data

Create `supabase/migrations/005_seed_assessments.sql` with 3 assessments (one per tier). Run via SQL Editor (pbcopy method).

**Assessment: AI Basics (module A03, Aware tier)**
Pass score: 70%. Time limit: 15 minutes. 6 questions.

Questions (SurveyJS JSON format — store FULL JSON including correctAnswer in the DB, but only send questions/choices to the client):

1. "What is Claude?" — Multiple choice
   - A chatbot made by OpenAI (wrong)
   - An AI assistant made by Anthropic (correct)
   - A search engine (wrong)
   - A programming language (wrong)

2. "What should you do if AI gives you an important fact?" — Multiple choice
   - Trust it completely (wrong)
   - Verify it from another source (correct)
   - Ignore it (wrong)
   - Ask the AI to confirm it (wrong)

3. "Which of these is something AI can help with?" — Multiple choice
   - Summarising long documents (correct)
   - Predicting the future with certainty (wrong)
   - Replacing human judgement entirely (wrong)
   - Accessing private databases (wrong)

4. "What is a 'hallucination' in AI?" — Multiple choice
   - When AI creates images (wrong)
   - When AI generates confident but incorrect information (correct)
   - When AI refuses to answer (wrong)
   - When AI runs too slowly (wrong)

5. "What makes a good prompt?" — Multiple choice
   - Being as brief as possible (wrong)
   - Giving clear context and specific instructions (correct)
   - Using technical jargon (wrong)
   - Asking multiple unrelated questions at once (wrong)

6. "AI models like Claude are trained on..." — Multiple choice
   - Live internet data in real-time (wrong)
   - Large datasets of text, with a knowledge cutoff date (correct)
   - Only scientific papers (wrong)
   - Data you provide in your conversations (wrong)

**Assessment: Applied Prompting (module E03, Enabled tier)**
Pass score: 70%. Time limit: 20 minutes. 7 questions.

1. "What is the main benefit of giving AI a 'role' in your prompt?" — Multiple choice
   - It makes the AI respond faster (wrong)
   - It shapes the perspective and expertise of the response (correct)
   - It reduces the cost of the API call (wrong)
   - It prevents hallucinations completely (wrong)

2. "Which prompt is most likely to get a useful response?" — Multiple choice
   - "Write something about marketing" (wrong)
   - "Write a 200-word LinkedIn post for a B2B SaaS company launching a new analytics feature, targeting CTOs, in a professional but conversational tone" (correct)
   - "Marketing content please" (wrong)
   - "Write the best marketing copy ever" (wrong)

3. "What is 'few-shot prompting'?" — Multiple choice
   - Asking the AI to respond briefly (wrong)
   - Providing examples of desired input/output pairs in the prompt (correct)
   - Using the AI for a limited number of tasks (wrong)
   - A technique for reducing API costs (wrong)

4. "When should you break a complex task into multiple prompts?" — Multiple choice
   - Never — AI works best with everything in one prompt (wrong)
   - When the task has distinct stages that build on each other (correct)
   - Only when the response is too long (wrong)
   - When you want to test different models (wrong)

5. "What is 'chain-of-thought' prompting?" — Multiple choice
   - Linking multiple AI models together (wrong)
   - Asking the AI to explain its reasoning step by step (correct)
   - Using AI to generate a sequence of social media posts (wrong)
   - A technique for training AI models (wrong)

6. "Which approach best helps AI maintain context in a long conversation?" — Multiple choice
   - Starting every message with 'Remember what I said earlier' (wrong)
   - Periodically summarising the conversation state and key decisions (correct)
   - Using shorter messages (wrong)
   - Switching to a different AI model (wrong)

7. "What is the purpose of output constraints in a prompt?" — Multiple choice
   - To make the AI work harder (wrong)
   - To specify the format, length, style, or structure of the response (correct)
   - To limit the AI's knowledge (wrong)
   - To reduce processing time (wrong)

**Assessment: Specialist Readiness (module S14, Specialist tier)**
Pass score: 75%. Time limit: 30 minutes. 8 questions.

1. "In the Claude API, what is the purpose of the 'system' parameter?" — Multiple choice
   - To specify which Claude model to use (wrong)
   - To set persistent instructions that guide the assistant's behaviour (correct)
   - To authenticate the API request (wrong)
   - To limit the response length (wrong)

2. "What is MCP (Model Context Protocol)?" — Multiple choice
   - A method for compressing AI model weights (wrong)
   - A protocol that lets AI models connect to external tools and data sources (correct)
   - A security protocol for encrypting AI conversations (wrong)
   - A standard for training AI models on custom data (wrong)

3. "When building a tool for Claude to use, what must you provide?" — Multiple choice
   - Only the tool's name (wrong)
   - A name, description, and input schema so Claude knows when and how to use it (correct)
   - The tool's source code (wrong)
   - A training dataset for the tool (wrong)

4. "What is the main advantage of streaming responses from the Claude API?" — Multiple choice
   - It's cheaper per token (wrong)
   - Users see partial results immediately instead of waiting for the full response (correct)
   - It allows longer responses (wrong)
   - It improves accuracy (wrong)

5. "In prompt engineering, what is 'constitutional AI'?" — Multiple choice
   - AI that follows government regulations (wrong)
   - A training approach where the AI is guided by a set of principles to be helpful, harmless, and honest (correct)
   - AI that only works in democratic countries (wrong)
   - A technique for making AI responses longer (wrong)

6. "What is an 'agent' in the context of AI systems?" — Multiple choice
   - Any AI chatbot (wrong)
   - An AI system that can autonomously plan, use tools, and take actions to accomplish goals (correct)
   - A human who manages AI systems (wrong)
   - A type of AI model architecture (wrong)

7. "When evaluating AI outputs, what does 'ground truth' mean?" — Multiple choice
   - The AI's confidence score (wrong)
   - The known correct answer against which AI output is compared (correct)
   - The original training data (wrong)
   - The most popular answer among users (wrong)

8. "What is the key risk of giving an AI agent too many tools?" — Multiple choice
   - Higher API costs (wrong)
   - The agent may choose inappropriate tools or take unintended actions due to ambiguity (correct)
   - The agent will run more slowly (wrong)
   - The tools will conflict with each other (wrong)

### 4. Assessment Page Update

Update `src/app/learn/[moduleId]/module-actions.tsx`:
- For modules with `module_type === 'assessment'`: instead of the Phase 2 placeholder, check if an assessment exists for this module
- If yes: render the SurveyJS assessment via `survey-renderer.tsx`
- Show previous attempts and scores
- If already passed: show "Passed" badge, don't allow retake (or allow retake for practice with a note)
- If failed: allow retry with "Try Again" button

### 5. Pass-to-Progress Gating via XState

Create `src/lib/progression-machine.ts`:
- XState v5 statechart modelling module states: `locked → available → in_progress → assessment → passed → completed` and `failed` (with retry path back to `available`)
- Guards: `canUnlock` (all prerequisites met), `hasPassedAssessment` (score >= pass_score)
- Use this machine to determine module status on the learning path — replacing or augmenting the current status logic
- The machine doesn't need to persist state — it's computed from database state (progress + assessment_attempts) on each render

Install XState:
```
npm install xstate @xstate/react
```

### 6. Certificate Verification

Create `src/app/learn/[moduleId]/verify-cert.tsx` — a client component shown on external course modules:
- Input field for Skilljar certificate number
- "Verify" button that checks `https://verify.skilljar.com/c/{CERT_NUMBER}`
- If verification works: mark module as completed
- **CAVEAT from the plan:** This endpoint hasn't been independently tested. If it returns errors or doesn't work as expected, fall back to: a "Self-Report Completion" button that marks the module complete (admin can verify later via dashboard)
- Either way, log a learning_event with verb 'completed'

### 7. Learning Events for All Assessment Activity

Ensure every assessment interaction logs to `learning_events`:
- `attempted`: when learner submits an assessment
- `passed`: when score >= pass_score
- `failed`: when score < pass_score

## Error Handling

- SurveyJS fails to load: show "Assessment couldn't load. Please refresh or try again later." Do not allow bypass.
- Scoring endpoint fails: show error, do not mark as passed or failed. Let learner retry.
- Skilljar cert endpoint unreachable: fall back to self-report completion.

## Red Lines

1. No hardcoded credentials
2. Mobile-first at 375px
3. No Intragen references
4. Invite-only at DB (already enforced)
5. **Assessment answers never sent to client before submission — scoring server-side only.** This is the critical red line for this phase. The SurveyJS JSON sent to the client MUST NOT contain correctAnswer fields. Strip them before sending.
6. Admin via is_admin flag
7. No Atlas internals
8. Lifecycle paths

## Exit Gate

- [ ] SurveyJS renders assessments with dark mode styling
- [ ] Server-side scoring returns correct scores (test with known answers)
- [ ] Correct answers are NOT in the client-side payload (verify via browser Network tab)
- [ ] Pass → module status changes to 'completed', next modules unlock
- [ ] Fail → module status changes to 'failed', retry available
- [ ] XState progression machine correctly models all states
- [ ] Certificate verification works OR self-report fallback is in place
- [ ] learning_events logged for attempted/passed/failed
- [ ] All 3 seed assessments work (AI Basics, Applied Prompting, Specialist Readiness)
- [ ] `npm run build` passes
- [ ] `git commit -m "feat: Phase 2 — assessments and gating"`
