'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

interface Persona {
  name: string
  role: string
  initials: string
  colour: string
  tag: string
  before: string
  afterAware: string
  afterEnabled: string
  afterSpecialist: string | null
}

const PERSONAS: Persona[] = [
  {
    name: 'Sarah',
    role: 'School Student (16)',
    initials: 'S',
    colour: '#E8C872',
    tag: 'Starts at Aware',
    before: 'Spends hours on revision, struggles with essay structure, googles everything.',
    afterAware: 'Uses Claude for revision breakdowns, essay planning, and research summaries.',
    afterEnabled: 'Built a prompt library for every subject. Grades improved. Teaches friends how to use AI.',
    afterSpecialist: 'Built a revision app for her school. Considering computer science at uni.',
  },
  {
    name: 'Ronnie',
    role: 'Home & Family Manager',
    initials: 'R',
    colour: '#EC4899',
    tag: 'Starts at Aware',
    before: 'Manages a household, plans holidays, handles finances, supports kids\' homework.',
    afterAware: 'Uses AI for meal planning, travel research, comparing insurance, helping kids with homework.',
    afterEnabled: 'Automates family admin — budgets, schedules, school communications. Became the person friends ask for AI help.',
    afterSpecialist: null,
  },
  {
    name: 'James',
    role: 'Working Professional (35)',
    initials: 'J',
    colour: '#3B82F6',
    tag: 'Starts at Aware, goal Enabled',
    before: 'Drowns in email, spends hours on reports, meetings eat his day.',
    afterAware: 'Uses Claude to draft emails, summarise meetings, prepare for presentations.',
    afterEnabled: 'Built AI workflows that save 8 hours/week. Promoted because his output doubled.',
    afterSpecialist: 'Left to start an AI consultancy. Charges £2,000/day.',
  },
  {
    name: 'Jess',
    role: 'University Student (18)',
    initials: 'J',
    colour: '#8B5CF6',
    tag: 'Starts at Aware, goal Specialist',
    before: 'Standard study approach — good but not exceptional.',
    afterAware: 'Uses AI to break down complex topics, improve essay drafts, prepare for exams.',
    afterEnabled: 'Published research using AI-assisted analysis. Internship applications stand out because of AI skills.',
    afterSpecialist: 'Gets certified as Claude Architect before graduating. Job offers before finals.',
  },
  {
    name: 'Tom',
    role: 'Small Business Owner',
    initials: 'T',
    colour: '#22C55E',
    tag: 'Starts at Enabled',
    before: 'Does everything himself — marketing, invoicing, customer service, planning.',
    afterAware: 'Uses AI for social media content, customer emails, basic analysis.',
    afterEnabled: 'Automated 60% of his admin. AI handles first-line customer queries. Revenue up 30%.',
    afterSpecialist: 'Built custom AI tools for his industry. Sells them to competitors.',
  },
  {
    name: 'Priya',
    role: 'Career Changer',
    initials: 'P',
    colour: '#06B6D4',
    tag: 'Starts at Aware, goal Specialist',
    before: '10 years in retail management. Wants something different.',
    afterAware: 'Understands the AI landscape. Sees where the opportunities are.',
    afterEnabled: 'Retrained as a prompt engineer. Remote freelance work within 3 months.',
    afterSpecialist: 'AI Solutions Architect at a tech firm. Triple her previous salary.',
  },
]

const SUGGESTIONS: Record<string, string[]> = {
  Student: [
    'Revision planning — break any topic into a structured study plan',
    'Essay structuring — get feedback on arguments before you write',
    'Research summaries — digest papers and articles in seconds',
    'Exam preparation — generate practice questions by topic',
    'Subject explanations — understand anything at your level',
    'Project planning — scope and plan assignments step by step',
    'Citation finding — locate relevant sources faster',
    'Study scheduling — build a realistic revision timetable',
  ],
  Professional: [
    'Email drafting — clear, professional emails in seconds',
    'Meeting summaries — turn notes into action items instantly',
    'Report generation — first drafts from data and bullet points',
    'Data analysis — spot patterns and trends you\'d miss',
    'Presentation prep — structure slides and talking points',
    'Project planning — break complex projects into phases',
    'Decision frameworks — structured analysis for tough calls',
    'Competitor research — industry intelligence in minutes',
  ],
  'Business Owner': [
    'Marketing content — social posts, blogs, ads that convert',
    'Customer communications — professional responses at scale',
    'Financial analysis — understand your numbers better',
    'Process automation — identify and eliminate repetitive work',
    'Proposal writing — win clients with polished proposals',
    'Market research — understand your competitive landscape',
    'Social media — a month of content in an hour',
    'Invoicing and admin — automate the stuff you hate',
  ],
  'Home Manager': [
    'Meal planning — weekly menus from ingredients you have',
    'Budget tracking — understand where your money goes',
    'Travel research — plan holidays like a professional agent',
    'Homework help — explain any topic at the right level',
    'Comparison shopping — analyse products and find the best deal',
    'Event planning — parties, holidays, and gatherings organised',
    'Health research — understand medical information clearly',
    'Scheduling — family calendars that actually work',
  ],
  'Career Changer': [
    'CV rewriting — tailor your experience for new industries',
    'Industry research — understand where opportunities are',
    'Skill gap analysis — know exactly what to learn next',
    'Interview prep — practise with AI roleplay',
    'Portfolio building — showcase transferable skills',
    'Freelance positioning — find your niche and price yourself',
    'Networking strategies — approach the right people the right way',
    'Certification paths — map out the qualifications that matter',
  ],
  Other: [
    'Research — understand any topic from scratch',
    'Writing — draft, edit, and improve any text',
    'Planning — break big projects into manageable steps',
    'Analysis — make sense of complex information',
    'Decision-making — structured frameworks for tough choices',
    'Learning — master new skills faster with AI guidance',
    'Creative work — brainstorm, ideate, and create',
    'Automation — identify tasks AI can handle for you',
  ],
}

const QUICK_EXAMPLES = [
  'Plan a kitchen renovation in 10 minutes',
  'Understand a medical report your doctor gave you',
  'Write a CV that actually gets interviews',
  'Help your child with maths homework you\'ve forgotten',
  'Analyse 3 insurance quotes and pick the best one',
  'Draft a complaint letter that gets results',
  'Learn any topic from scratch in an afternoon',
  'Prepare for a job interview with AI roleplay',
  'Create a business plan from a napkin idea',
  'Translate and understand a legal contract',
  'Build a personal budget that actually works',
  'Write social media content for a month in an hour',
  'Research a holiday destination like a travel agent',
  'Summarise a 300-page book in 5 minutes',
  'Turn meeting notes into action items automatically',
]

const ROLE_OPTIONS = ['Student', 'Professional', 'Business Owner', 'Home Manager', 'Career Changer', 'Other']

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function FuturesClient() {
  const [personaIdx, setPersonaIdx] = useState(0)
  const [wizardStep, setWizardStep] = useState(0)
  const [role, setRole] = useState<string | null>(null)
  const [timeEater, setTimeEater] = useState('')
  const [tenHours, setTenHours] = useState('')
  const [showResults, setShowResults] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const persona = PERSONAS[personaIdx]
  const touchStartX = useRef<number | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0 && personaIdx < PERSONAS.length - 1) {
        setPersonaIdx(personaIdx + 1)
      } else if (diff < 0 && personaIdx > 0) {
        setPersonaIdx(personaIdx - 1)
      }
    }
    touchStartX.current = null
  }, [personaIdx])

  function handleShowResults() {
    if (role) setShowResults(true)
  }

  const suggestions = SUGGESTIONS[role ?? 'Other'] ?? SUGGESTIONS.Other
  // Pick 5 deterministic suggestions
  const picked = suggestions.slice(0, 5)

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 animate-fade-in">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
        Where Could AI Take You?
      </h1>
      <p className="text-sm mb-8" style={{ color: '#D4D4E8' }}>
        Real stories, real possibilities. See what&apos;s ahead.
      </p>

      {/* ============================================================ */}
      {/* PART 1: PEOPLE LIKE YOU                                       */}
      {/* ============================================================ */}
      <div className="mb-10">
        <h2 className="text-xs uppercase tracking-wide font-semibold mb-4" style={{ color: '#E8C872' }}>
          People Like You
        </h2>

        {/* Persona card */}
        <div
          ref={scrollRef}
          className="rounded-xl p-5 mb-3 animate-fade-in touch-pan-y"
          style={{ backgroundColor: '#25253D', border: '1px solid #363654' }}
          key={personaIdx}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Avatar + name */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: persona.colour, color: '#1A1A2E' }}
            >
              {persona.initials}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>{persona.name}</p>
              <p className="text-xs" style={{ color: '#D4D4E8' }}>{persona.role}</p>
            </div>
            <span
              className="ml-auto text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded"
              style={{ color: '#E8C872', backgroundColor: '#E8C87215' }}
            >
              {persona.tag}
            </span>
          </div>

          {/* Before */}
          <div className="mb-3">
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: '#6B7280' }}>Before</p>
            <p className="text-xs leading-relaxed" style={{ color: '#D4D4E8' }}>{persona.before}</p>
          </div>

          {/* After tiers */}
          <div className="space-y-2">
            <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'transparent' }}>
              <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: '#E8C872' }}>After Aware</p>
              <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#D1D5DB' }}>{persona.afterAware}</p>
            </div>
            <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'transparent' }}>
              <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: '#E8C872' }}>After Enabled</p>
              <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#D1D5DB' }}>{persona.afterEnabled}</p>
            </div>
            {persona.afterSpecialist && (
              <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'transparent' }}>
                <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: '#8B5CF6' }}>After Specialist</p>
                <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#D1D5DB' }}>{persona.afterSpecialist}</p>
              </div>
            )}
          </div>
        </div>

        {/* Persona dots */}
        <div className="flex justify-center gap-2">
          {PERSONAS.map((_, i) => (
            <button
              key={i}
              onClick={() => setPersonaIdx(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: i === personaIdx ? '#E8C872' : '#363654',
                width: i === personaIdx ? 16 : 8,
              }}
            />
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* PART 2: WHAT COULD AI DO FOR YOU?                             */}
      {/* ============================================================ */}
      <div className="mb-10">
        <h2 className="text-xs uppercase tracking-wide font-semibold mb-4" style={{ color: '#E8C872' }}>
          What Could AI Do for You?
        </h2>

        {!showResults ? (
          <div className="rounded-xl p-5" style={{ backgroundColor: '#25253D', border: '1px solid #363654' }}>
            {wizardStep === 0 && (
              <div className="animate-fade-in">
                <p className="text-sm font-semibold mb-3" style={{ color: '#FFFFFF' }}>
                  What best describes you?
                </p>
                <div className="space-y-2">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setRole(opt); setWizardStep(1) }}
                      className="w-full text-left rounded-lg px-4 py-3 text-sm transition-all"
                      style={{
                        backgroundColor: role === opt ? '#E8C872' : '#1A1A2E',
                        color: role === opt ? '#1A1A2E' : '#8BA3C4',
                        border: `1px solid ${role === opt ? '#E8C872' : '#363654'}`,
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {wizardStep === 1 && (
              <div className="animate-fade-in">
                <p className="text-sm font-semibold mb-3" style={{ color: '#FFFFFF' }}>
                  What takes up most of your time?
                </p>
                <textarea
                  value={timeEater}
                  onChange={(e) => setTimeEater(e.target.value)}
                  placeholder="The thing that eats your hours..."
                  rows={3}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none mb-3"
                  style={{ backgroundColor: '#1A1A2E', color: '#FFFFFF', border: '1px solid #363654' }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setWizardStep(0)}
                    className="flex-1 rounded-lg py-2.5 text-sm font-semibold"
                    style={{ backgroundColor: '#1A1A2E', color: '#D4D4E8', border: '1px solid #363654' }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setWizardStep(2)}
                    disabled={!timeEater.trim()}
                    className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-opacity disabled:opacity-30"
                    style={{ backgroundColor: '#E8C872', color: '#1A1A2E' }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="animate-fade-in">
                <p className="text-sm font-semibold mb-3" style={{ color: '#FFFFFF' }}>
                  What would you do with an extra 10 hours per week?
                </p>
                <textarea
                  value={tenHours}
                  onChange={(e) => setTenHours(e.target.value)}
                  placeholder="If you had the time..."
                  rows={3}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none mb-3"
                  style={{ backgroundColor: '#1A1A2E', color: '#FFFFFF', border: '1px solid #363654' }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="flex-1 rounded-lg py-2.5 text-sm font-semibold"
                    style={{ backgroundColor: '#1A1A2E', color: '#D4D4E8', border: '1px solid #363654' }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleShowResults}
                    disabled={!tenHours.trim()}
                    className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-opacity disabled:opacity-30"
                    style={{ backgroundColor: '#E8C872', color: '#1A1A2E' }}
                  >
                    See My Results
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in space-y-3">
            {/* Personal context */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#25253D', border: '1px solid #363654' }}>
              <p className="text-sm" style={{ color: '#FFFFFF' }}>
                You said most of your time goes to <strong style={{ color: '#E8C872' }}>{timeEater}</strong>.
                With 10 extra hours you&apos;d <strong style={{ color: '#E8C872' }}>{tenHours}</strong>.
              </p>
            </div>

            <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
              Here are 5 ways AI could change your week:
            </p>

            {picked.map((suggestion, i) => {
              const [title, ...rest] = suggestion.split(' — ')
              return (
                <div
                  key={i}
                  className="rounded-lg px-4 py-3"
                  style={{ backgroundColor: '#25253D', borderLeft: '3px solid #E8C872' }}
                >
                  <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{title}</p>
                  {rest.length > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: '#D4D4E8' }}>{rest.join(' — ')}</p>
                  )}
                </div>
              )
            })}

            <Link
              href="/learn"
              className="block rounded-lg py-3 text-center text-sm font-bold mt-4"
              style={{ backgroundColor: '#E8C872', color: '#1A1A2E' }}
            >
              Your Path Starts Here →
            </Link>

            <button
              onClick={() => { setShowResults(false); setWizardStep(0); setRole(null); setTimeEater(''); setTenHours('') }}
              className="block w-full text-center text-xs py-2"
              style={{ color: '#D4D4E8' }}
            >
              Try again with different answers
            </button>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* PART 3: AI IN REAL LIFE                                       */}
      {/* ============================================================ */}
      <div className="mb-10">
        <h2 className="text-xs uppercase tracking-wide font-semibold mb-4" style={{ color: '#E8C872' }}>
          AI in Real Life
        </h2>
        <p className="text-sm mb-4" style={{ color: '#D4D4E8' }}>
          AI isn&apos;t just for tech people. Here&apos;s what anyone can do today:
        </p>

        <div className="grid grid-cols-1 gap-2">
          {QUICK_EXAMPLES.map((example, i) => (
            <div
              key={i}
              className="rounded-lg px-4 py-2.5 flex items-center gap-3"
              style={{ backgroundColor: '#25253D', border: '1px solid #363654' }}
            >
              <span className="text-xs" style={{ color: '#E8C872' }}>✦</span>
              <p className="text-xs" style={{ color: '#D1D5DB' }}>{example}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <Link
        href="/learn"
        className="block rounded-lg py-4 text-center text-base font-bold mb-8"
        style={{ backgroundColor: '#E8C872', color: '#1A1A2E' }}
      >
        Start Your AI Journey →
      </Link>
    </div>
  )
}
