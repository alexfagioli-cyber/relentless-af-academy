export type CelebrationKey =
  | 'first_module_started'
  | 'first_module_completed'
  | 'first_assessment_passed'
  | 'first_assessment_failed'
  | 'streak_3'
  | 'streak_7'
  | 'tier_aware_to_enabled'
  | 'tier_enabled_to_specialist'
  | 'tier_complete'
  | 'first_cert_verified'

export interface CelebrationMessage {
  title: string
  message: string
}

export const CELEBRATIONS: Record<CelebrationKey, CelebrationMessage> = {
  first_module_started: {
    title: "You're off",
    message: "This is where it starts. Every expert was once a beginner — but not every beginner takes the first step. You just did.",
  },
  first_module_completed: {
    title: 'One down',
    message: "You've officially started your AI journey. Most people talk about learning AI. You're actually doing it.",
  },
  first_assessment_passed: {
    title: 'Passed',
    message: "That's not luck — that's understanding. You've earned your way forward.",
  },
  first_assessment_failed: {
    title: 'Not this time',
    message: "But that's how learning works. Review what you missed and come back stronger. The assessment isn't going anywhere.",
  },
  streak_3: {
    title: 'Three days running',
    message: 'Consistency is where the real gains happen. Keep this up.',
  },
  streak_7: {
    title: 'A full week',
    message: "You're building something most people never do — a genuine AI skill set. Relentless.",
  },
  tier_aware_to_enabled: {
    title: 'Tier unlocked: Enabled',
    message: "You're no longer just aware of AI — you're about to make it work for you. The real tools start here.",
  },
  tier_enabled_to_specialist: {
    title: 'Tier unlocked: Specialist',
    message: "This is where most people never reach. You're building with AI now — not just using it. Welcome to the deep end.",
  },
  tier_complete: {
    title: 'Track complete',
    message: "You've completed every module in this track. Take a moment — that's a genuine achievement. When you're ready, the next tier is waiting.",
  },
  first_cert_verified: {
    title: 'Certificate verified',
    message: "That's external proof of what you've learned — recognised by Anthropic. Add it to your CV, your LinkedIn, wherever you want the world to see it.",
  },
}
