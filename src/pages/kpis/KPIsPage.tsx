import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/store'
import {
  BarChart3, Target, Lock, Unlock, Download, ChevronLeft, ChevronRight,
  TrendingUp, Users, Award, CheckCircle2, AlertTriangle, Pencil, X, Info
} from 'lucide-react'
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'

type KPIGrade = 'excellent' | 'good' | 'average' | 'needs_improvement'

interface KPIRecord {
  id: string
  name: string
  initials: string
  dept: string
  avatar_color: string
  task_score: number
  attendance_score: number
  manual_score: number
  total: number
  is_locked: boolean
}

const GRADE_CONFIG: Record<KPIGrade, { label: string; color: string; bg: string; text: string }> = {
  excellent: { label: 'Excellent', color: '#10B981', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  good: { label: 'Good', color: '#6366F1', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  average: { label: 'Average', color: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-700' },
  needs_improvement: { label: 'Needs Improvement', color: '#EF4444', bg: 'bg-red-50', text: 'text-red-700' },
}

function getGrade(score: number): KPIGrade {
  if (score > 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 50) return 'average'
  return 'needs_improvement'
}

function getScoreColor(score: number) {
  if (score > 75) return 'text-emerald-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-red-600'
}

function getBarColor(score: number) {
  if (score > 75) return 'bg-emerald-500'
  if (score >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

const MOCK_KPI: KPIRecord[] = [
  { id: '1', name: 'Alice Mathews', initials: 'AM', dept: 'Engineering', avatar_color: 'bg-indigo-500', task_score: 88.5, attendance_score: 96.7, manual_score: 85, total: 91.1, is_locked: true },
  { id: '2', name: 'Bob Krishnan', initials: 'BK', dept: 'Engineering', avatar_color: 'bg-emerald-500', task_score: 74.2, attendance_score: 91.3, manual_score: 80, total: 82.3, is_locked: true },
  { id: '3', name: 'Carol Pillai', initials: 'CP', dept: 'HR', avatar_color: 'bg-red-500', task_score: 65.8, attendance_score: 88.0, manual_score: 70, total: 76.8, is_locked: false },
  { id: '4', name: 'David Lawrence', initials: 'DL', dept: 'Finance', avatar_color: 'bg-amber-500', task_score: 52.3, attendance_score: 79.5, manual_score: 60, total: 66.3, is_locked: false },
  { id: '5', name: 'Eva Sharma', initials: 'ES', dept: 'Marketing', avatar_color: 'bg-violet-500', task_score: 38.5, attendance_score: 65.0, manual_score: 40, total: 48.3, is_locked: false },
  { id: '6', name: 'Frank Rajan', initials: 'FR', dept: 'Operations', avatar_color: 'bg-teal-500', task_score: 95.1, attendance_score: 98.3, manual_score: 95, total: 96.2, is_locked: true },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function KPIGaugeCircle({ score }: { score: number }) {
  const grade = getGrade(score)
  const cfg = GRADE_CONFIG[grade]
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#F3F4F6" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="50" fill="none"
            stroke={cfg.color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 314.16} 314.16`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-3xl font-bold', getScoreColor(score))}>{score.toFixed(1)}</span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
      </div>
      <span className={cn('mt-2 px-3 py-1 rounded-full text-xs font-semibold', cfg.bg, cfg.text)}>
        {cfg.label}
      </span>
    </div>
  )
}

function OverrideModal({ employee, onClose }: { employee: KPIRecord; onClose: () => void }) {
  const [score, setScore] = useState(employee.manual_score)
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Manual KPI Override</h2>
          <button onClick={onClose} className="btn-icon"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Employee info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm', employee.avatar_color)}>
              {employee.initials}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{employee.name}</div>
              <div className="text-xs text-gray-500">{employee.dept} · Total: <strong>{employee.total.toFixed(1)}</strong></div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">Manual score changes will be recorded in the audit log. Provide a clear reason.</p>
          </div>

          {/* Score slider */}
          <div>
            <label className="label-xs block mb-2">Manual Score (10% weight)</label>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={100} value={score} onChange={e => setScore(Number(e.target.value))} className="flex-1 accent-indigo-500" />
              <div className="w-16">
                <input type="number" min={0} max={100} value={score} onChange={e => setScore(Math.min(100, Math.max(0, Number(e.target.value))))} className="input-field text-center font-bold" />
              </div>
            </div>
          </div>

          {/* HR Notes */}
          <div>
            <label className="label-xs block mb-1.5">HR Notes <span className="text-red-500">*</span></label>
            <textarea className="input-field resize-none" rows={3} placeholder="Reason for manual override (min 20 chars)..." minLength={20} required />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button className="btn-primary">Save Override</button>
        </div>
      </div>
    </div>
  )
}

export default function KPIsPage() {
  const role = useAuthStore(state => state.role)
  const user = useAuthStore(state => state.user)
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [overrideEmployee, setOverrideEmployee] = useState<KPIRecord | null>(null)

  const isHR = ['super_admin', 'admin', 'hr_manager'].includes(role || '')
  const isEmployee = role === 'employee'

  const myKPI = MOCK_KPI.find(k => {
    const email = user?.email?.toLowerCase() || ''
    if (email.startsWith('alice') && k.name.includes('Alice')) return true
    if (email.startsWith('bob') && k.name.includes('Bob')) return true
    if (email.startsWith('carol') && k.name.includes('Carol')) return true
    if (email.startsWith('david') && k.name.includes('David')) return true
    if (email.startsWith('eva') && k.name.includes('Eva')) return true
    if (email.startsWith('frank') && k.name.includes('Frank')) return true
    return false
  }) || MOCK_KPI[0]
  const avgKPI = MOCK_KPI.reduce((a, k) => a + k.total, 0) / MOCK_KPI.length

  const prevMonth = () => setSelectedMonth(m => m === 0 ? 11 : m - 1)
  const nextMonth = () => setSelectedMonth(m => m === 11 ? 0 : m + 1)

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">KPI & Performance</h1>
          {isEmployee ? (
            <p className="text-sm text-gray-500 mt-1">Personal Scorecard & Performance Metrics</p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">Team avg: <strong className="text-indigo-600">{avgKPI.toFixed(1)}</strong> · {MOCK_KPI.filter(k => k.is_locked).length} locked months</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm"><Download className="w-4 h-4" /> Export CSV</button>
          {isHR && <button className="btn-primary btn-sm"><Target className="w-4 h-4" /> Set Targets</button>}
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="btn-icon p-1.5"><ChevronLeft className="w-4 h-4" /></button>
          <div className="flex gap-1 overflow-x-auto flex-1">
            {MONTHS.map((m, i) => {
              const isLocked = [0, 1, 2, 3, 4].includes(i) // Jan–May locked
              return (
                <button key={m} onClick={() => setSelectedMonth(i)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0',
                    selectedMonth === i ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                  )}>
                  {isLocked && <Lock className="w-3 h-3" />}
                  {m}
                </button>
              )
            })}
          </div>
          <button onClick={nextMonth} className="btn-icon p-1.5"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* My KPI Score Card (employee sees own, others see team) */}
      {(isEmployee || true) && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="section-header mb-6">
            <Award className="w-4 h-4 text-indigo-500" />
            {isEmployee ? 'My KPI Score' : 'Team Overview'} — {MONTHS[selectedMonth]} {now.getFullYear()}
          </h3>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Gauge */}
            <KPIGaugeCircle score={myKPI.total} />

            {/* Component Bars */}
            <div className="flex-1 space-y-5">
              {[
                { label: 'Task Score', score: myKPI.task_score, weight: '60%', icon: CheckCircle2 },
                { label: 'Attendance Score', score: myKPI.attendance_score, weight: '30%', icon: Users },
                { label: 'Manual Score', score: myKPI.manual_score, weight: '10%', icon: Pencil },
              ].map(c => (
                <div key={c.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <c.icon className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-700">{c.label}</span>
                      <span className="text-xs text-gray-400">({c.weight})</span>
                    </div>
                    <span className={cn('font-bold text-sm', getScoreColor(c.score))}>{c.score.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className={cn('h-2.5 rounded-full transition-all duration-700', getBarColor(c.score))}
                      style={{ width: `${c.score}%` }} />
                  </div>
                </div>
              ))}

              {/* Lock status */}
              <div className={cn('flex items-center gap-2 p-3 rounded-lg text-sm', myKPI.is_locked ? 'bg-gray-50 text-gray-600' : 'bg-amber-50 text-amber-700')}>
                {myKPI.is_locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                {myKPI.is_locked ? 'This period is locked. No further changes.' : 'This period is open. KPI will lock on the 15th.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team KPI Table (head/hr/ops) */}
      {!isEmployee && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="section-header"><Users className="w-4 h-4 text-indigo-500" /> Team KPI — {MONTHS[selectedMonth]}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Employee', 'Task Score', 'Attendance Score', 'Manual Score', 'Total Score', 'Status', 'Actions'].map(h => (
                    <th key={h} className="table-header-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_KPI.map(kpi => {
                  const grade = getGrade(kpi.total)
                  const cfg = GRADE_CONFIG[grade]
                  return (
                    <tr key={kpi.id} className="table-row">
                      <td className="table-data-cell">
                        <div className="flex items-center gap-2.5">
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold', kpi.avatar_color)}>
                            {kpi.initials}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{kpi.name}</div>
                            <div className="text-xs text-gray-400">{kpi.dept}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-data-cell">
                        <div>
                          <span className={cn('font-semibold', getScoreColor(kpi.task_score))}>{kpi.task_score.toFixed(1)}</span>
                          <div className="w-20 bg-gray-100 rounded-full h-1 mt-1">
                            <div className={cn('h-1 rounded-full', getBarColor(kpi.task_score))} style={{ width: `${kpi.task_score}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="table-data-cell">
                        <div>
                          <span className={cn('font-semibold', getScoreColor(kpi.attendance_score))}>{kpi.attendance_score.toFixed(1)}</span>
                          <div className="w-20 bg-gray-100 rounded-full h-1 mt-1">
                            <div className={cn('h-1 rounded-full', getBarColor(kpi.attendance_score))} style={{ width: `${kpi.attendance_score}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="table-data-cell">
                        <div className="flex items-center gap-1.5">
                          <span className={cn('font-semibold', getScoreColor(kpi.manual_score))}>{kpi.manual_score.toFixed(1)}</span>
                          {isHR && !kpi.is_locked && (
                            <button onClick={() => setOverrideEmployee(kpi)} className="btn-icon p-1" title="Override">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="table-data-cell">
                        <span className={cn('text-lg font-bold', getScoreColor(kpi.total))}>{kpi.total.toFixed(1)}</span>
                      </td>
                      <td className="table-data-cell">
                        <div className="flex items-center gap-1.5">
                          {kpi.is_locked ? <Lock className="w-3.5 h-3.5 text-gray-400" /> : <Unlock className="w-3.5 h-3.5 text-amber-500" />}
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', cfg.bg, cfg.text)}>{cfg.label}</span>
                        </div>
                      </td>
                      <td className="table-data-cell">
                        {isHR && !kpi.is_locked && (
                          <button onClick={() => setOverrideEmployee(kpi)} className="text-xs text-indigo-600 hover:underline">Override</button>
                        )}
                        {kpi.is_locked && <span className="text-xs text-gray-400">Locked</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {overrideEmployee && (
        <OverrideModal employee={overrideEmployee} onClose={() => setOverrideEmployee(null)} />
      )}
    </div>
  )
}
