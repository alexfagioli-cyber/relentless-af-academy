'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface Stats {
  totalLearners: number
  activeThisWeek: number
  avgCompletionPct: number
  avgStreak: number
  totalLearningHours: number
}

interface EngagementPoint {
  date: string
  activeUsers: number
}

interface CompletionFunnelPoint {
  module: string
  fullTitle: string
  completed: number
}

interface TierPoint {
  name: string
  value: number
}

interface PassRatePoint {
  assessment: string
  fullTitle: string
  passRate: number
  total: number
  passed: number
}

interface ActivityItem {
  learnerName: string
  verb: string
  objectType: string
  objectId: string
  objectTitle: string
  createdAt: string
}

interface AnalyticsClientProps {
  stats: Stats
  engagementData: EngagementPoint[]
  completionFunnelData: CompletionFunnelPoint[]
  tierData: TierPoint[]
  passRateData: PassRatePoint[]
  recentActivity: ActivityItem[]
}

const GOLD = '#E8C872'
const GOLD_DIM = '#B89A45'
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#E2E8F0'
const TEXT_PRIMARY = '#1E293B'
const TEXT_SECONDARY = '#64748B'
const GRID_COLOR = '#E2E8F0'

const TIER_COLORS = ['#E8C872', '#B89A45', '#8B7535']

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-1"
      style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
    >
      <span className="text-xs font-medium" style={{ color: TEXT_SECONDARY }}>
        {label}
      </span>
      <span className="text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>
        {value}
      </span>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
    >
      <h3 className="text-sm font-semibold mb-4" style={{ color: TEXT_PRIMARY }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded px-3 py-2 text-xs"
      style={{ backgroundColor: '#F8FAFC', border: `1px solid ${CARD_BORDER}`, color: TEXT_PRIMARY }}
    >
      <p style={{ color: TEXT_SECONDARY }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: GOLD }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function verbLabel(verb: string): string {
  switch (verb) {
    case 'started': return 'started'
    case 'completed': return 'completed'
    case 'attempted': return 'attempted'
    case 'passed': return 'passed'
    case 'failed': return 'failed'
    default: return verb
  }
}

export function AnalyticsClient({
  stats,
  engagementData,
  completionFunnelData,
  tierData,
  passRateData,
  recentActivity,
}: AnalyticsClientProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Learners" value={stats.totalLearners} />
        <StatCard label="Active This Week" value={stats.activeThisWeek} />
        <StatCard label="Avg Completion" value={`${stats.avgCompletionPct}%`} />
        <StatCard label="Avg Streak" value={stats.avgStreak} />
        <StatCard label="Learning Hours" value={stats.totalLearningHours} />
      </div>

      {/* Engagement Over Time */}
      <ChartCard title="Engagement Over Time (Daily Active Users — Last 30 Days)">
        <div className="w-full" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={engagementData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: TEXT_SECONDARY, fontSize: 11 }}
                stroke={GRID_COLOR}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: TEXT_SECONDARY, fontSize: 11 }}
                stroke={GRID_COLOR}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="activeUsers"
                name="Active Users"
                stroke={GOLD}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: GOLD }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Module Completion Funnel */}
      <ChartCard title="Module Completion Funnel">
        <div className="w-full" style={{ height: Math.max(280, completionFunnelData.length * 36) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={completionFunnelData}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fill: TEXT_SECONDARY, fontSize: 11 }}
                stroke={GRID_COLOR}
              />
              <YAxis
                type="category"
                dataKey="module"
                width={140}
                tick={{ fill: TEXT_SECONDARY, fontSize: 10 }}
                stroke={GRID_COLOR}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const data = payload[0].payload as CompletionFunnelPoint
                  return (
                    <div
                      className="rounded px-3 py-2 text-xs"
                      style={{ backgroundColor: '#F8FAFC', border: `1px solid ${CARD_BORDER}`, color: TEXT_PRIMARY }}
                    >
                      <p style={{ color: TEXT_SECONDARY }}>{data.fullTitle}</p>
                      <p style={{ color: GOLD }}>{data.completed} completed</p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="completed" fill={GOLD} radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Tier Distribution + Assessment Pass Rates side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tier Distribution */}
        <ChartCard title="Tier Distribution">
          <div className="w-full" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {tierData.map((_, i) => (
                    <Cell key={i} fill={TIER_COLORS[i % TIER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload as TierPoint
                    return (
                      <div
                        className="rounded px-3 py-2 text-xs"
                        style={{ backgroundColor: '#F8FAFC', border: `1px solid ${CARD_BORDER}`, color: TEXT_PRIMARY }}
                      >
                        <p style={{ color: GOLD }}>{d.name}: {d.value} learners</p>
                      </div>
                    )
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Assessment Pass Rates */}
        <ChartCard title="Assessment Pass Rates">
          {passRateData.length === 0 ? (
            <p className="text-xs py-8 text-center" style={{ color: TEXT_SECONDARY }}>
              No assessment data yet
            </p>
          ) : (
            <div className="w-full" style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={passRateData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis
                    dataKey="assessment"
                    tick={{ fill: TEXT_SECONDARY, fontSize: 10 }}
                    stroke={GRID_COLOR}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: TEXT_SECONDARY, fontSize: 11 }}
                    stroke={GRID_COLOR}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload as PassRatePoint
                      return (
                        <div
                          className="rounded px-3 py-2 text-xs"
                          style={{ backgroundColor: '#F8FAFC', border: `1px solid ${CARD_BORDER}`, color: TEXT_PRIMARY }}
                        >
                          <p style={{ color: TEXT_SECONDARY }}>{d.fullTitle}</p>
                          <p style={{ color: GOLD }}>{d.passRate}% pass rate</p>
                          <p style={{ color: TEXT_SECONDARY }}>{d.passed}/{d.total} attempts</p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="passRate" fill={GOLD} radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Recent Activity Feed */}
      <ChartCard title="Recent Activity">
        {recentActivity.length === 0 ? (
          <p className="text-xs py-4" style={{ color: TEXT_SECONDARY }}>
            No recent activity
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 py-2 border-b last:border-b-0"
                style={{ borderColor: CARD_BORDER }}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium" style={{ color: TEXT_PRIMARY }}>
                    {item.learnerName}
                  </span>
                  <span className="text-xs mx-1.5" style={{ color: TEXT_SECONDARY }}>
                    {verbLabel(item.verb)}
                  </span>
                  <span className="text-xs" style={{ color: GOLD }}>
                    {item.objectTitle}
                  </span>
                </div>
                <span
                  className="text-xs whitespace-nowrap flex-shrink-0"
                  style={{ color: TEXT_SECONDARY }}
                >
                  {formatTimestamp(item.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </ChartCard>
    </div>
  )
}
