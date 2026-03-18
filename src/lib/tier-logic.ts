export type Tier = 'aware' | 'enabled' | 'specialist'

export interface TierScores {
  aware: number
  enabled: number
  specialist: number
}

// Each question option maps to [aware, enabled, specialist] scores
export const QUESTION_OPTIONS: Record<string, { label: string; scores: [number, number, number] }[]> = {
  motivation: [
    { label: "I'm curious about AI and want to understand it", scores: [3, 1, 0] },
    { label: 'I want to use AI to be better at my work or studies', scores: [1, 3, 1] },
    { label: 'I want to build a career skill or business around AI', scores: [0, 1, 3] },
    { label: 'Someone I trust told me to check this out', scores: [2, 2, 0] },
  ],
  background: [
    { label: 'Student (school)', scores: [2, 1, 0] },
    { label: 'Student (university)', scores: [1, 2, 1] },
    { label: 'Working professional', scores: [0, 3, 1] },
    { label: 'Career changer / exploring options', scores: [0, 2, 2] },
  ],
  ai_familiarity: [
    { label: 'No, never', scores: [3, 0, 0] },
    { label: 'Yes, a few times', scores: [2, 1, 0] },
    { label: 'Yes, I use AI regularly', scores: [0, 2, 1] },
    { label: "Yes, I've built things with AI", scores: [0, 0, 3] },
  ],
  ai_concept: [
    { label: "I'm not really sure", scores: [3, 0, 0] },
    { label: 'Answering questions and writing things', scores: [2, 1, 0] },
    { label: 'Helping with complex tasks and analysis', scores: [1, 2, 0] },
  ],
  ai_usage: [
    { label: 'Fun / curiosity / chatting', scores: [2, 1, 0] },
    { label: 'Homework / work tasks / writing help', scores: [1, 2, 0] },
    { label: 'Research / analysis / problem-solving', scores: [0, 2, 1] },
  ],
  ai_depth: [
    { label: 'Given AI instructions to get better answers', scores: [1, 2, 0] },
    { label: 'Created reusable prompts or workflows', scores: [0, 2, 1] },
    { label: 'Used AI APIs or developer tools', scores: [0, 0, 3] },
  ],
  ai_building: [
    { label: 'Simple scripts or automations', scores: [0, 1, 2] },
    { label: 'Apps or tools that use AI', scores: [0, 0, 3] },
    { label: "I've integrated AI APIs into production systems", scores: [0, 0, 4] },
  ],
  prompt_knowledge: [
    { label: "I don't know", scores: [3, 0, 0] },
    { label: 'What you type to ask AI something', scores: [1, 2, 0] },
    { label: 'An instruction that shapes the AI\'s response — context, format, and constraints matter', scores: [0, 1, 2] },
  ],
  ai_limitations: [
    { label: 'AI always gives correct answers', scores: [3, 0, 0] },
    { label: 'AI can make mistakes — you should check important facts', scores: [1, 2, 0] },
    { label: 'AI can hallucinate, has knowledge cutoffs, and works best with clear constraints', scores: [0, 1, 3] },
  ],
  code_comfort: [
    { label: "Not at all — and that's fine", scores: [2, 1, 0] },
    { label: "I've seen code but don't write it", scores: [1, 2, 0] },
    { label: 'I can write basic scripts', scores: [0, 1, 2] },
    { label: "I'm a confident developer", scores: [0, 0, 3] },
  ],
  success_vision: [
    { label: 'I understand what AI can do and feel confident talking about it', scores: [3, 0, 0] },
    { label: 'I use AI daily and it saves me time on real tasks', scores: [0, 3, 0] },
    { label: 'I can build AI-powered tools or get certified as an AI professional', scores: [0, 0, 3] },
    { label: "I'm not sure yet — I want to explore and see", scores: [2, 1, 0] },
  ],
}

// Determine which Q4 variant to show based on ai_familiarity answer
export function getQ4Key(familiarityIndex: number): string | null {
  switch (familiarityIndex) {
    case 0: return 'ai_concept'    // Q4a — novice
    case 1: return 'ai_usage'      // Q4b — casual
    case 2: return 'ai_depth'      // Q4c — regular
    case 3: return 'ai_building'   // Q4d — builder
    default: return null
  }
}

export function computeTier(responses: Record<string, number>): { tier: Tier; scores: TierScores } {
  const totals: TierScores = { aware: 0, enabled: 0, specialist: 0 }

  for (const [questionKey, optionIndex] of Object.entries(responses)) {
    // Skip time_commitment — not scored
    if (questionKey === 'time_commitment') continue

    const options = QUESTION_OPTIONS[questionKey]
    if (!options || optionIndex < 0 || optionIndex >= options.length) continue

    const [a, e, s] = options[optionIndex].scores
    totals.aware += a
    totals.enabled += e
    totals.specialist += s
  }

  let tier: Tier

  if (totals.specialist > totals.enabled && totals.specialist > totals.aware) {
    tier = 'specialist'
  } else if (totals.enabled > totals.aware) {
    tier = 'enabled'
  } else {
    tier = 'aware'
  }

  // Conservative rule: if enabled and specialist are within 15%, assign enabled
  if (tier === 'specialist' && totals.specialist > 0 && (totals.enabled / totals.specialist) > 0.85) {
    tier = 'enabled'
  }

  return { tier, scores: totals }
}
