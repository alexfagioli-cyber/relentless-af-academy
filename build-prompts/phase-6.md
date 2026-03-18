# RelentlessAF Academy — Phase 6: Personality & Polish

**IMPORTANT: This project lives at ~/relentless-af-academy/ — NOT inside Atlas. All file paths are relative to ~/relentless-af-academy/. Do NOT create files in or reference the Atlas directory. Change to the project directory first: `cd ~/relentless-af-academy`**

You are building Phase 6. Phases 0-5 are complete and deployed. This phase adds personality — the difference between a functional platform and one that feels like someone built it with intent. You are the builder — implement exactly what this prompt specifies.

**Tone guidance:** Confident, direct, warm but not sentimental. Not corny. Not over-personalised. Think: a mentor who respects you enough to be straight with you. No exclamation marks. No "amazing!" or "awesome!" or "you've got this!". The tone is quiet confidence — understated but powerful.

## What to build

### 1. "From Alex" Note on Welcome Screen

Update `src/app/welcome/page.tsx` — add a signed note AFTER the tier breakdown and BEFORE the "Let's Go" button. Subtle styling — smaller text, slightly muted, with a simple line separator above.

Copy:

```
I built this because I've seen what AI does when people actually learn to use it properly. Not surface-level stuff — real understanding that changes how you work, study, and think.

This platform exists for the people I care about. Go at your own pace, take what you need, and know that the content here is the same material used to train professionals at the companies building this technology.

— Alex
```

Style: `text-sm`, `text-[#9CA3AF]`, `italic` on the signature only. A thin `border-t border-[#1E293B]` separator above. Do not make it a card — it should feel like a handwritten note, not a UI element.

### 2. Visual Progress Ring

Create `src/components/ui/progress-ring.tsx`:
- SVG circular progress indicator
- Takes `completed` and `total` as props
- Crimson (#DC2626) for the filled portion, dark grey (#1E293B) for the track
- Percentage number in the centre (white, bold)
- Smooth CSS transition on the fill (transition: stroke-dashoffset 0.6s ease)
- Size: 120px on mobile, can scale

Update `src/app/page.tsx` (dashboard):
- Replace the "X/Y modules completed" text stat with the progress ring
- Keep tier and streak as text stats flanking the ring
- Ring should be visually prominent — the centrepiece of the dashboard

### 3. Daily AI Tip

Create `src/lib/daily-tips.ts`:
- Array of 30 tips that rotate by day (`tips[dayOfYear % tips.length]`)
- Each tip has a `text` and a `source` (optional attribution)
- Tone: factual, specific, slightly provocative. Not generic motivational fluff.

Tips (provide all 30):

```typescript
export const DAILY_TIPS = [
  { text: "Professionals using AI report saving 5-8 hours per week on routine tasks. That's a full working day back." },
  { text: "The best prompt engineers don't write longer prompts — they write clearer ones." },
  { text: "Claude can read and analyse a 200-page PDF in under 30 seconds. Most people don't know this." },
  { text: "Students using AI for revision retain more because they can ask 'why' until they actually understand." },
  { text: "AI doesn't replace thinking. It replaces the tedious parts so you can focus on the thinking that matters." },
  { text: "The Claude Certified Architect exam exists. It's the first professional AI credential. This platform prepares you for it." },
  { text: "Companies are now listing 'AI fluency' as a required skill, not a nice-to-have." },
  { text: "A well-structured prompt can turn a 2-hour research task into a 10-minute conversation." },
  { text: "AI can write code, but understanding what to ask it to build is the real skill." },
  { text: "The gap between people who use AI and people who don't is growing every month." },
  { text: "Prompt engineering isn't a gimmick. It's the interface between human intent and machine capability." },
  { text: "You don't need to be technical to use AI well. You need to be clear about what you want." },
  { text: "AI tools are free or cheap. The skill to use them properly is what's valuable." },
  { text: "Most people use AI like a search engine. The ones who get ahead use it like a thinking partner." },
  { text: "A 15-year-old who learns AI now will enter the job market with a skill most adults are still ignoring." },
  { text: "The Anthropic Academy courses you're taking here are the same ones used by enterprise teams worldwide." },
  { text: "AI hallucinations aren't a flaw to fear — they're a pattern to recognise and manage." },
  { text: "Building with the Claude API is easier than most people think. The Specialist tier will show you." },
  { text: "Every module you complete here puts you ahead of someone who's still thinking about starting." },
  { text: "The best AI users aren't the most technical. They're the most curious." },
  { text: "MCP (Model Context Protocol) lets AI connect to real tools — databases, APIs, file systems. That's where it gets powerful." },
  { text: "An AI agent can plan, execute, and verify its own work. Understanding how is a career-defining skill." },
  { text: "Consistency beats intensity. 20 minutes a day will take you further than 5 hours once a month." },
  { text: "The people who understand AI will set the direction. Everyone else will follow it." },
  { text: "AI fluency isn't about knowing how AI works internally. It's about knowing what it can do for you." },
  { text: "One well-crafted prompt template can save you hundreds of hours over a year." },
  { text: "The Aware tier alone puts you ahead of 90% of people. Enabled puts you in the top 5%." },
  { text: "AI changes fast. The skill that compounds is learning how to learn it." },
  { text: "You're not competing against AI. You're competing against people who know how to use it." },
  { text: "Every expert started exactly where you are. The difference is they started." }
]
```

Display on dashboard: below the progress ring, above the "Continue Learning" button. Styled as a card with a subtle left crimson border. `text-sm`, `text-[#9CA3AF]`. No attribution needed — just the tip text.

### 4. RelentlessAF Microcopy

Update button text and UI copy throughout the app. This is a find-and-replace pass through every user-facing component.

| Current | Replace with |
|---|---|
| "Sign In" | "Sign In" (keep — it's standard) |
| "Set Password" / "Set your password" | "Set Your Password" |
| "Get Started" (onboarding) | "Let's Go" |
| "Submit" (onboarding steps) | "Next" or "Continue" |
| "Mark Complete" | "Done — Move On" |
| "Try Again" (failed assessment) | "Go Again" |
| "Start Course" (external link) | "Start This" |
| "Verify" (cert verification) | "Verify Certificate" |
| "Loading..." | "Loading" (no ellipsis — cleaner) |
| "Service temporarily unavailable" | "Something's not right. Give it a moment and try again." |
| "Assessment couldn't load" | "Assessment didn't load. Refresh and try again." |
| "Your invite has expired" | "This invite has expired. Reach out to Alex for a new one." |
| "No modules completed" / empty dashboard | "Nothing started yet. That changes today." |
| "Your learning path will appear here" | "Your path is ready. Tap below to start." |
| Any "Welcome back, [name]" | Just use the personalised message from 5A — no generic greeting |

Search every `.tsx` file in `src/` for these strings. Only change user-facing text, not variable names or comments.

### 5. Login Page Motivational Line

Update `src/app/auth/login/page.tsx` — add a rotating line above the login form.

Create `src/lib/login-quotes.ts`:

```typescript
export const LOGIN_QUOTES = [
  "The best time to learn AI was six months ago. The second best time is now.",
  "Most people will talk about AI for years. You're here to actually learn it.",
  "Small steps, consistently. That's how skills compound.",
  "The platform remembers where you left off. Pick up and keep going.",
  "Every session here is an investment in your future self.",
  "AI won't replace you. But someone who knows AI might.",
  "You don't need to be technical. You need to be willing.",
  "Progress isn't always visible day to day. But it compounds.",
  "The people in this programme were chosen for a reason.",
  "Showing up is the hardest part. You're already here."
]
```

Display: `quotes[dayOfYear % quotes.length]`. Styled as `text-sm`, `text-[#9CA3AF]`, `italic`, centred above the form with comfortable margin. Subtle — don't let it compete with the login form.

## Red Lines
Same as all phases. No hardcoded creds, mobile-first, no Intragen, no Atlas internals.

## Exit Gate
- [ ] "From Alex" note on welcome screen — reads naturally, not corny, signed with "— Alex"
- [ ] Progress ring renders on dashboard with correct completion percentage and smooth animation
- [ ] Daily tip shows on dashboard, different each day, all 30 tips populated
- [ ] Microcopy updated across all pages — grep for old strings confirms zero matches
- [ ] Login page shows rotating motivational line
- [ ] All text feels confident and direct, never sentimental or corporate
- [ ] `npm run build` passes
- [ ] `git commit -m "feat: Phase 6 — personality and polish"`
- [ ] `git push origin main`
