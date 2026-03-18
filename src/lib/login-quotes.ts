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
  "Showing up is the hardest part. You're already here.",
]

export function getLoginQuote(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return LOGIN_QUOTES[dayOfYear % LOGIN_QUOTES.length]
}
