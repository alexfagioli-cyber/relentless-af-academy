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
  { text: "Every expert started exactly where you are. The difference is they started." },
]

export function getDailyTip(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length].text
}
