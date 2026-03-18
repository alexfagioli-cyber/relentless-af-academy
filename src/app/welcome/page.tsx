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
    <div className="min-h-screen px-4 py-12 sm:py-16" style={{ backgroundColor: '#0F172A' }}>
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

        {/* Art of the possible */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#F9FAFB' }}>
            What people are doing with AI right now:
          </h2>
          <div className="space-y-3">
            <div className="rounded-lg p-5" style={{ backgroundColor: '#1E293B', borderLeft: '3px solid #DC2626' }}>
              <p className="text-sm leading-relaxed" style={{ color: '#D1D5DB' }}>
                <span className="font-semibold" style={{ color: '#F9FAFB' }}>Students</span> are using AI to revise smarter, break down complex topics in seconds, and write with more clarity than they ever thought possible.
              </p>
            </div>
            <div className="rounded-lg p-5" style={{ backgroundColor: '#1E293B', borderLeft: '3px solid #DC2626' }}>
              <p className="text-sm leading-relaxed" style={{ color: '#D1D5DB' }}>
                <span className="font-semibold" style={{ color: '#F9FAFB' }}>Professionals</span> are automating half their admin, generating reports in minutes, and making better decisions with AI-powered analysis.
              </p>
            </div>
            <div className="rounded-lg p-5" style={{ backgroundColor: '#1E293B', borderLeft: '3px solid #DC2626' }}>
              <p className="text-sm leading-relaxed" style={{ color: '#D1D5DB' }}>
                <span className="font-semibold" style={{ color: '#F9FAFB' }}>Builders</span> are creating apps, tools, and entire businesses that didn&apos;t exist six months ago — some without writing a single line of code.
              </p>
            </div>
          </div>
          <p className="mt-4 text-base font-semibold" style={{ color: '#F9FAFB' }}>
            This is where you start.
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

        {/* From Alex */}
        <div className="mb-10 pt-8" style={{ borderTop: '1px solid #1E293B' }}>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#9CA3AF' }}>
            I built this because I&apos;ve seen what AI does when people actually learn to use it properly. Not surface-level stuff — real understanding that changes how you work, study, and think.
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#9CA3AF' }}>
            This platform exists for the people I care about. Go at your own pace, take what you need, and know that the content here is the same material used to train professionals at the companies building this technology.
          </p>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            — <span className="italic">Alex</span>
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
