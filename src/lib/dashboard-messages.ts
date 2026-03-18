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
      subtext: 'From revision to research to writing — AI changes how you learn everything.',
    }
  }
  // University student
  if (profile.occupation?.includes('university')) {
    return {
      headline: 'AI is about to change how you study, write, and think',
      subtext: 'The students who learn this now will have an edge that lasts their entire career.',
    }
  }
  // Working professional
  if (profile.occupation?.includes('professional')) {
    return {
      headline: "Let's make AI the sharpest tool in your kit",
      subtext: "Less time on admin. Better analysis. Faster decisions. AI doesn't replace you — it amplifies you.",
    }
  }
  // Career changer
  if (profile.occupation?.includes('career') || profile.occupation?.includes('exploring')) {
    return {
      headline: "Let's build something the market can't ignore",
      subtext: "AI skills are the most in-demand capability in the world right now. You're about to have them.",
    }
  }
  // Specialist-track
  if (profile.tier === 'specialist') {
    return {
      headline: "You already know what AI can do. Let's go deeper.",
      subtext: 'APIs, agents, MCP, certification — this is where you become dangerous.',
    }
  }
  // Default
  return {
    headline: 'Your AI journey starts here',
    subtext: 'Curated content, practical challenges, real skills. Go at your own pace.',
  }
}
