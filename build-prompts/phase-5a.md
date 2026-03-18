# RelentlessAF Academy — Phase 5A: Experience Polish

**IMPORTANT: This project lives at ~/relentless-af-academy/ — NOT inside Atlas. All file paths are relative to ~/relentless-af-academy/. Do NOT create files in or reference the Atlas directory. Change to the project directory first: `cd ~/relentless-af-academy`**

You are building Phase 5A. Phases 0-4 are complete — full working app deployed to Vercel. This phase adds the human touches that make the platform feel alive. You are the builder — implement exactly what this prompt specifies.

## What to build

### 1. Celebration Moments

Create `src/components/ui/celebration-toast.tsx` — a reusable toast/notification component:
- Slides in from top or bottom, auto-dismisses after 5 seconds
- Dark background (#1E293B), crimson accent border, white text
- Dismiss on tap
- Subtle entrance animation (slide + fade)

Create `src/lib/celebrations.ts` — maps milestone events to messages:

```typescript
export const CELEBRATIONS = {
  first_module_started: {
    title: "You're off",
    message: "This is where it starts. Every expert was once a beginner — but not every beginner takes the first step. You just did."
  },
  first_module_completed: {
    title: "One down",
    message: "You've officially started your AI journey. Most people talk about learning AI. You're actually doing it."
  },
  first_assessment_passed: {
    title: "Passed",
    message: "That's not luck — that's understanding. You've earned your way forward."
  },
  first_assessment_failed: {
    title: "Not this time",
    message: "But that's how learning works. Review what you missed and come back stronger. The assessment isn't going anywhere."
  },
  streak_3: {
    title: "Three days running",
    message: "Consistency is where the real gains happen. Keep this up."
  },
  streak_7: {
    title: "A full week",
    message: "You're building something most people never do — a genuine AI skill set. Relentless."
  },
  tier_aware_to_enabled: {
    title: "Tier unlocked: Enabled",
    message: "You're no longer just aware of AI — you're about to make it work for you. The real tools start here."
  },
  tier_enabled_to_specialist: {
    title: "Tier unlocked: Specialist",
    message: "This is where most people never reach. You're building with AI now — not just using it. Welcome to the deep end."
  },
  tier_complete: {
    title: "Track complete",
    message: "You've completed every module in this track. Take a moment — that's a genuine achievement. When you're ready, the next tier is waiting."
  },
  first_cert_verified: {
    title: "Certificate verified",
    message: "That's external proof of what you've learned — recognised by Anthropic. Add it to your CV, your LinkedIn, wherever you want the world to see it."
  }
}
```

Wire celebrations into the existing flows:
- Module completion (in `module-actions.tsx`) → check if it's their first module, trigger toast
- Assessment scoring result (in `survey-renderer.tsx`) → trigger passed/failed toast
- Streak updates (in `streak.ts`) → trigger streak_3 and streak_7
- Tier gate assessment passed → trigger tier unlock toast
- Cert verification → trigger first_cert_verified

Use a simple check: query learning_events count for the relevant verb. If count === 1 after the current action, it's a "first" event.

### 2. Art of the Possible — Welcome Screen Update

Update `src/app/welcome/page.tsx`. After the opening paragraphs ("Alex invited you here...") and before the tier breakdown, add:

```
**What people are doing with AI right now:**

Students are using AI to revise smarter, break down complex topics in seconds, and write with more clarity than they ever thought possible.

Professionals are automating half their admin, generating reports in minutes, and making better decisions with AI-powered analysis.

Builders are creating apps, tools, and entire businesses that didn't exist six months ago — some without writing a single line of code.

This is where you start.
```

Style these as 3 distinct cards or blocks with subtle crimson left-border accent. Each one should feel like a window into a different world.

### 3. Personalised Dashboard Messaging

Update `src/app/page.tsx` — the dashboard welcome message should be conditional based on the learner's onboarding responses.

Create `src/lib/dashboard-messages.ts`:

```typescript
export function getDashboardMessage(profile: {
  tier: string
  occupation: string | null
  learning_motivation: string | null
  primary_goal: string | null
}): { headline: string; subtext: string } {
  // School student
  if (profile.occupation?.includes('school')) {
    return {
      headline: "Let's make AI your secret weapon for school",
      subtext: "From revision to research to writing — AI changes how you learn everything."
    }
  }
  // University student
  if (profile.occupation?.includes('university')) {
    return {
      headline: "AI is about to change how you study, write, and think",
      subtext: "The students who learn this now will have an edge that lasts their entire career."
    }
  }
  // Working professional
  if (profile.occupation?.includes('professional')) {
    return {
      headline: "Let's make AI the sharpest tool in your kit",
      subtext: "Less time on admin. Better analysis. Faster decisions. AI doesn't replace you — it amplifies you."
    }
  }
  // Career changer
  if (profile.occupation?.includes('career') || profile.occupation?.includes('exploring')) {
    return {
      headline: "Let's build something the market can't ignore",
      subtext: "AI skills are the most in-demand capability in the world right now. You're about to have them."
    }
  }
  // Specialist-track
  if (profile.tier === 'specialist') {
    return {
      headline: "You already know what AI can do. Let's go deeper.",
      subtext: "APIs, agents, MCP, certification — this is where you become dangerous."
    }
  }
  // Default
  return {
    headline: "Your AI journey starts here",
    subtext: "Curated content, practical challenges, real skills. Go at your own pace."
  }
}
```

Replace the current static welcome text on the dashboard with the output of this function.

### 4. Custom Invite Email Template

This is a Supabase dashboard change, not code. Provide the HTML template and instruct Alex to paste it.

Create a file `docs/invite-email-template.html` with the email HTML:
- Dark background (#111827), white text
- "RelentlessAF Academy" header in Inter Bold
- Body: "Alex has invited you to join RelentlessAF Academy — a personal AI training programme built for the people closest to him. Click below to get started."
- Crimson CTA button: "Accept Invitation"
- Footer: "This invite expires in 30 days."
- The {{ .ConfirmationURL }} Supabase variable goes in the button href

After creating the file, output instructions for Alex:
"Go to Supabase Dashboard → Authentication → Email Templates → Invite User. Replace the template with the content of docs/invite-email-template.html."

## Red Lines
Same as all phases. No hardcoded creds, mobile-first, no Intragen, no Atlas internals.

## Exit Gate
- [ ] Celebration toasts appear at: first module start, first completion, first assessment pass, first fail, streak 3, streak 7
- [ ] Welcome screen has "art of the possible" section with 3 example cards
- [ ] Dashboard shows personalised message based on onboarding answers (test with at least 2 different profiles)
- [ ] Invite email template HTML created in docs/
- [ ] `npm run build` passes
- [ ] `git commit -m "feat: Phase 5A — experience polish"`
