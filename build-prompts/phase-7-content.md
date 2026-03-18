# RelentlessAF Academy — Phase 7: Content Enrichment

**IMPORTANT: This project lives at ~/relentless-af-academy/ — NOT inside Atlas. All file paths are relative to ~/relentless-af-academy/. Do NOT create files in or reference the Atlas directory. Change to the project directory first: `cd ~/relentless-af-academy`**

You are building Phase 7. All previous phases are complete and deployed. This phase adds internal content that makes the platform feel valuable beyond linking to external courses. You are the builder — implement exactly what this prompt specifies.

**Problem this solves:** The first thing a learner does after onboarding is click an external link to Anthropic's website. They leave the platform in 30 seconds. The platform needs its own content — gateway modules that teach, contextualise, and engage BEFORE sending learners to external courses.

## What to build

### 1. Internal Course Page Component

Create `src/app/learn/[moduleId]/internal-course.tsx` — a client component for in-app course content:
- Renders a series of "screens" (pages within the module) — swipeable or button-navigated
- Each screen has: title, body text (markdown-safe), optional text input fields, optional radio/checkbox responses
- Final screen has a "Complete" button that saves any responses and marks the module done
- Responses saved to a new `challenge_responses` table (see migration below)
- Dark mode styling consistent with branding
- Smooth slide transitions between screens (reuse the onboarding animation pattern)

### 2. Database Migration

Create `supabase/migrations/007_challenge_responses.sql`:
```sql
CREATE TABLE challenge_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learner_id, module_id)
);

ALTER TABLE challenge_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own responses" ON challenge_responses FOR ALL USING (learner_id = auth.uid());
CREATE POLICY "Admins can read all responses" ON challenge_responses FOR SELECT USING (EXISTS (SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true));
```

Run via SQL Editor (pbcopy).

### 3. New Internal Modules — Seed Data

Create `supabase/migrations/008_enrichment_modules.sql`:

**A00: Your First AI Moment** (new first module, order_index 0, no prerequisites)
- tier: aware, track: 1, module_type: course, platform: internal
- estimated_duration_mins: 15

Content (store as JSONB in a new `module_content` column on the modules table, or in a separate `internal_content` table):

```json
{
  "screens": [
    {
      "title": "What is Claude?",
      "body": "Claude is an AI assistant made by Anthropic. It can read, write, analyse, code, research, brainstorm, and reason.\n\nIt's not a search engine — it's a thinking partner. The better you learn to work with it, the more powerful it becomes.\n\nThis programme teaches you how to use it properly — from the basics through to professional certification."
    },
    {
      "title": "What makes AI different",
      "body": "AI isn't magic and it isn't perfect. It can be confidently wrong — that's called a hallucination. It has a knowledge cutoff date. It works best when you give it clear context and specific instructions.\n\nLearning to use it well is a genuine skill. The people who develop that skill have an advantage in everything they do — school, work, business, life.\n\nThat's what you're here to learn."
    },
    {
      "title": "Your first task",
      "body": "Open your Claude Pro account in a new tab.\n\nAsk it to help you with something real — something you're actually working on today. A school assignment, a work problem, a decision you're making, a question you've been curious about. Anything.\n\nSpend 10 minutes with it. Have a real conversation. Then come back here.",
      "action": "external_prompt",
      "action_label": "Open Claude",
      "action_url": "https://claude.ai"
    },
    {
      "title": "How was that?",
      "body": "Take a moment to reflect on what just happened.",
      "inputs": [
        { "key": "what_asked", "type": "textarea", "label": "What did you ask Claude to help with?", "placeholder": "Describe what you tried..." },
        { "key": "what_surprised", "type": "textarea", "label": "What surprised you about the response?", "placeholder": "Anything unexpected..." },
        { "key": "usefulness", "type": "radio", "label": "How useful was it?", "options": ["Very useful", "Somewhat useful", "Not very useful"] }
      ]
    }
  ]
}
```

**A01b: What to Look For** (after A01 Claude 101, before A02 challenge)
- tier: aware, track: 1, module_type: course, platform: internal
- estimated_duration_mins: 5
- prerequisites: A01

```json
{
  "screens": [
    {
      "title": "You've just completed Claude 101",
      "body": "Before you move on, let's make sure the key concepts landed.\n\nClaude 101 covered a lot of ground. The three things that matter most right now:\n\n**1. Claude is a conversation, not a command.** The more context you give, the better the response.\n\n**2. You're in control.** Claude follows your lead. If the response isn't right, refine your question — don't just accept it.\n\n**3. AI has limits.** It can hallucinate. It has a knowledge cutoff. Always verify important facts."
    },
    {
      "title": "Quick check",
      "body": "No scoring — just checking your understanding.",
      "inputs": [
        { "key": "key_takeaway", "type": "textarea", "label": "What's the one thing from Claude 101 that you'll remember?", "placeholder": "The concept that stuck with you..." },
        { "key": "first_use_idea", "type": "textarea", "label": "Name one thing you want to try using Claude for this week.", "placeholder": "Something specific..." }
      ]
    }
  ]
}
```

**A04b: Prompt Patterns That Work** (after A03 assessment, before A04/A05)
- tier: aware, track: 1, module_type: course, platform: internal
- estimated_duration_mins: 10
- prerequisites: A03

```json
{
  "screens": [
    {
      "title": "10 prompt patterns you can use right now",
      "body": "Before you dive into the deeper courses, here are patterns that make Claude dramatically more useful. These aren't theory — they're templates you can copy and adapt today."
    },
    {
      "title": "Pattern 1: The Role",
      "body": "**Start with who Claude should be.**\n\n\"You are an experienced [teacher / editor / analyst / coach]. Help me with [task].\"\n\nThis shapes the perspective of every response. A teacher explains differently from an analyst."
    },
    {
      "title": "Pattern 2: The Context Dump",
      "body": "**Give Claude everything it needs.**\n\n\"Here's my situation: [paste details]. Given this context, [your question].\"\n\nThe more relevant context you provide, the more specific and useful the response. Don't make Claude guess."
    },
    {
      "title": "Pattern 3: The Format Request",
      "body": "**Tell Claude what you want back.**\n\n\"Give me this as [a bullet list / a table / a step-by-step guide / a 200-word summary].\"\n\nFormat control is one of the most underused features. You don't have to accept whatever Claude gives you."
    },
    {
      "title": "Pattern 4: The Refinement Loop",
      "body": "**Don't accept the first response.**\n\n\"That's good but [make it shorter / more specific / less formal / add examples]. Also [additional instruction].\"\n\nThe best results come from 2-3 rounds of refinement, not one perfect prompt."
    },
    {
      "title": "Pattern 5: The Critique Request",
      "body": "**Ask Claude to challenge you.**\n\n\"Here's my [plan / essay / idea]. What are the weaknesses? What am I missing? Be direct.\"\n\nThis is where AI becomes genuinely powerful — as a thinking partner who spots what you can't see."
    },
    {
      "title": "Now use them",
      "body": "Pick two of these patterns. Use them with Claude right now on something real. Then come back.",
      "inputs": [
        { "key": "patterns_used", "type": "textarea", "label": "Which patterns did you try? What happened?", "placeholder": "What you tried and how it went..." },
        { "key": "favourite_pattern", "type": "radio", "label": "Which pattern was most useful?", "options": ["The Role", "The Context Dump", "The Format Request", "The Refinement Loop", "The Critique Request"] }
      ]
    }
  ]
}
```

**E00: Why Prompting Changes Everything** (first Enabled module, before E01)
- tier: enabled, track: 2, module_type: course, platform: internal
- estimated_duration_mins: 10
- prerequisites: A09

```json
{
  "screens": [
    {
      "title": "Welcome to Enabled",
      "body": "You've completed the Aware tier. You understand what AI is, what it can do, and how to have a useful conversation with it.\n\nThe Enabled tier is where AI stops being interesting and starts being indispensable.\n\nThe difference between someone who \"uses AI\" and someone who's genuinely AI-enabled is one thing: prompt engineering. Not as a buzzword — as a real, practical skill that changes how you work."
    },
    {
      "title": "What changes at this level",
      "body": "In Aware, you learned to ask Claude questions.\n\nIn Enabled, you'll learn to:\n\n**Structure complex tasks** — breaking big problems into steps that AI can handle\n\n**Create reusable systems** — prompts and workflows you use every day\n\n**Think in AI-native ways** — approaching problems differently because you have AI as a tool\n\nBy the end of this tier, AI won't be something you use occasionally. It'll be something you can't imagine working without."
    },
    {
      "title": "What's ahead",
      "body": "The Enabled tier includes:\n\n• A Coursera specialisation on real-world AI application\n• Anthropic's own prompt engineering tutorials\n• Challenges where you build your personal prompt library and AI workflow\n• Assessments that prove you genuinely understand this material\n\nThis is where the real skills start. Let's go.",
      "inputs": [
        { "key": "enabled_goal", "type": "textarea", "label": "What's the one thing you most want AI to help you with at this level?", "placeholder": "Be specific..." }
      ]
    }
  ]
}
```

**S00: From User to Builder** (first Specialist module, before S01)
- tier: specialist, track: 3, module_type: course, platform: internal
- estimated_duration_mins: 10
- prerequisites: E09

```json
{
  "screens": [
    {
      "title": "Welcome to Specialist",
      "body": "Most people will never reach this tier. The skills you're about to develop are the same ones used by engineers at Anthropic, and by the professionals who build AI-powered products and services.\n\nThis is where you stop being someone who uses AI and become someone who builds with it."
    },
    {
      "title": "What changes here",
      "body": "In Enabled, you mastered prompting — talking to AI effectively.\n\nIn Specialist, you'll learn to:\n\n**Use the Claude API** — call Claude programmatically, not just through a chat interface\n\n**Build with MCP** — connect Claude to real tools, databases, and services\n\n**Create AI agents** — systems that can plan, execute, and verify their own work\n\n**Prepare for certification** — the Claude Certified Architect credential\n\nThis is career-grade material. Take it seriously."
    },
    {
      "title": "Before you start",
      "body": "The Specialist tier involves code. You don't need to be an expert programmer, but you should be comfortable reading code and following technical instructions.\n\nIf you're not there yet, that's fine — the courses will teach you what you need. But know that this tier requires more effort than the previous two.",
      "inputs": [
        { "key": "specialist_motivation", "type": "textarea", "label": "Why do you want to reach Specialist level? What will you build?", "placeholder": "What's driving you to go this deep..." }
      ]
    }
  ]
}
```

### 4. Rewrite Existing Challenges

Update the descriptions for existing challenge modules to be more specific and practical. Update via SQL migration `008_enrichment_modules.sql`:

**A02 (was "Challenge: First Conversation") → "Your First Real Conversation"**
New description: "Use Claude to help with something real this week — homework, a work task, a decision, a creative project. Paste your best exchange and reflect on what worked."

**A06 (was "Challenge: Summarise a Real Document") → "Solve a Real Problem"**
New description: "Pick something you're genuinely stuck on. Use Claude and everything you've learned to work through it. Document your process — what you asked, how you refined, what the outcome was."

**A08 (was "Challenge: AI in Your Daily Life") → "Build Your AI Toolkit"**
New description: "Set up Claude with custom instructions tailored to your life. Create 3 reusable prompt templates for tasks you do regularly. Test each one and refine until they work reliably."

**E02 (was "Challenge: Custom Instruction Set") → "Build Your Personal AI Assistant"**
New description: "Create a comprehensive custom instruction set that makes Claude work like your personal assistant. Test it across 5 different real tasks. Document what works and what doesn't."

**E06 (was "Challenge: Build a Prompt Library") → "Your Prompt Library"**
New description: "Build a library of 10 prompts you'll actually reuse. Categories: research, writing, analysis, decision-making, creative. Test each one on real tasks and rate their effectiveness."

**E08 (was "Challenge: AI Workflow Integration") → "AI in Your Workflow"**
New description: "Map your daily or weekly routine. Identify 3 tasks where AI can save time or improve quality. Build the prompts, use them for a full week, then report: time saved, quality difference, what you'd change."

### 5. Update Module Detail Page

Update `src/app/learn/[moduleId]/page.tsx` and `module-actions.tsx`:
- For modules with platform 'internal' and module_type 'course': render the `internal-course.tsx` component with the module's content data
- For modules with platform 'internal' and module_type 'challenge': show the challenge description prominently, with a text area for the learner to paste their work/reflection, and a "Done — Move On" button
- Save challenge text to `challenge_responses` table

### 6. Update Prerequisites

The new modules change the prerequisite chain:
- A00 has no prerequisites (it's the new first module)
- A01 now requires A00 (was: no prerequisites)
- A01b requires A01
- A02 now requires A01b (was: A01)
- A04b requires A03
- A04 now requires A04b (was: A03)
- A05 now requires A04b (was: A03)
- E00 requires A09
- E01 now requires E00 (was: A09)
- S00 requires E09
- S01 now requires S00 (was: E09)

### 7. Add module_content column

Either add a `content` JSONB column to the modules table, or create a separate `internal_content` table:

```sql
ALTER TABLE modules ADD COLUMN content JSONB;
```

Then populate it for the new internal course modules (A00, A01b, A04b, E00, S00).

## Red Lines
Same as all phases. Plus: all internal content must use British English.

## Exit Gate
- [ ] A00 "Your First AI Moment" is the first module a new learner sees
- [ ] Internal course screens render with slide transitions
- [ ] Text inputs save to challenge_responses table
- [ ] A01b, A04b, E00, S00 all render their content correctly
- [ ] Challenge descriptions updated for A02, A06, A08, E02, E06, E08
- [ ] Prerequisite chain updated — new modules correctly gate progression
- [ ] Module detail page distinguishes between internal courses, challenges, and external courses
- [ ] `npm run build` passes
- [ ] `git commit -m "feat: Phase 7 — content enrichment"`
- [ ] `git push origin main`

### 8. Dashboard Enrichment

Update `src/app/page.tsx` — the dashboard should feel like a hub, not a bare stats page. Add these sections below the existing stats:

**a) "Continue where you left off" card**
- Shows the last module they were working on (status = in_progress)
- Module title, type icon, progress indicator
- One-tap to resume
- If no module in progress, shows the next available module instead

**b) Current tier progress section**
- Visual indicator of how far through their current tier they are
- "X of Y modules complete in [Tier]"
- Shows what's next: "Next up: [module title]"

**c) Daily tip (already built in Phase 6 — ensure it's prominent)**

**d) Recent activity feed**
- Last 3-5 learning_events: "You completed Module X" / "You passed Assessment Y"
- Timestamped, compact, shows momentum
- If no activity: "Nothing here yet. Your journey starts with one tap."

**e) Quick stats bar**
- Total time invested (sum of estimated_duration_mins for completed modules)
- Current streak with flame/fire emoji visual
- Tier badge (Aware/Enabled/Specialist with appropriate colour)

Style: cards with surface (#1E293B) backgrounds, crimson accents on active elements, comfortable spacing. The dashboard should feel full and alive, not sparse.
