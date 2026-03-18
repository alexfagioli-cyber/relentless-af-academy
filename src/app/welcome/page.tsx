import Link from 'next/link'

const tiers = [
  {
    name: 'Aware',
    description: 'Understand what AI can do and start using it with confidence.',
    accent: '#F59E0B',
  },
  {
    name: 'Enabled',
    description: 'Make AI a genuine force multiplier in your work and studies.',
    accent: '#DC2626',
  },
  {
    name: 'Specialist',
    description: 'Build with AI, earn professional certification, and stand out from everyone else.',
    accent: '#8B5CF6',
  },
]

export default function WelcomePage() {
  return (
    <div className="min-h-screen px-4 py-12 sm:py-16" style={{ backgroundColor: '#111827' }}>
      <div className="max-w-lg mx-auto">

        {/* Heading */}
        <h1
          className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-8"
          style={{ color: '#F9FAFB' }}
        >
          Welcome to<br />
          <span style={{ color: '#DC2626' }}>RelentlessAF Academy</span>
        </h1>

        {/* Body copy */}
        <div className="space-y-5 text-base leading-relaxed mb-10" style={{ color: '#D1D5DB' }}>
          <p>
            <span className="font-semibold" style={{ color: '#F9FAFB' }}>Alex invited you here for a reason.</span>
          </p>

          <p>
            AI isn&apos;t something that&apos;s coming — it&apos;s already reshaping how people study, work, build businesses, and solve problems. Right now, most people are watching from the sidelines. You&apos;ve just been given a head start.
          </p>

          <p>
            This is a personal AI training programme built for the people closest to Alex. Not a generic online course. Not a YouTube playlist. A structured, curated path through the best AI training material in the world — the same content used to certify professionals at Anthropic, the company behind Claude.
          </p>

          <p>
            You&apos;ll start where you are. No judgement, no prerequisites. The platform learns what you know, builds a path that fits your life, and takes you as far as you want to go.
          </p>
        </div>

        {/* Tiers */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#F9FAFB' }}>
            Three tiers. Your journey.
          </h2>

          <div className="space-y-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className="rounded-lg p-5"
                style={{
                  backgroundColor: '#1E293B',
                  borderLeft: `3px solid ${tier.accent}`,
                }}
              >
                <p className="text-sm font-bold tracking-wide mb-1" style={{ color: tier.accent }}>
                  {tier.name}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#D1D5DB' }}>
                  {tier.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Closing copy */}
        <div className="space-y-5 text-base leading-relaxed mb-10" style={{ color: '#D1D5DB' }}>
          <p>
            Some of you will stop at Aware and that&apos;s brilliant — you&apos;ll be ahead of 90% of people. Some of you will push all the way to Specialist and come out the other side with a skill set that most professionals would pay thousands for.
          </p>

          <p className="font-semibold text-lg" style={{ color: '#F9FAFB' }}>
            The only thing that matters is that you start.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/onboarding"
          className="block w-full rounded-lg py-4 text-center text-base font-bold tracking-wide"
          style={{ backgroundColor: '#DC2626', color: '#F9FAFB' }}
        >
          Let&apos;s Go →
        </Link>
      </div>
    </div>
  )
}
