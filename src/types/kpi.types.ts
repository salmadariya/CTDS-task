// ===== KPI TYPES (PRD §10) =====

export type KPIGrade = 'excellent' | 'good' | 'average' | 'needs_improvement'

export interface KPIRecord {
  id: string
  user_id: string
  user_name: string
  department_id: string
  period_month: number // 1-12
  period_year: number
  task_score: number // 0-100 (60% weight)
  attendance_score: number // 0-100 (30% weight)
  manual_score?: number // 0-100 (10% weight)
  total_score: number // weighted total
  hr_notes?: string
  hr_override_by?: string
  is_locked: boolean
  locked_at?: string
  created_at: string
  updated_at: string
}

export interface KPIBreakdownTask {
  task_id: string
  task_title: string
  perf_weight: number
  status: string
  completed: boolean
  contribution: number
}

export interface KPITarget {
  id: string
  department_id?: string // null = platform-wide
  period_month: number
  period_year: number
  task_score_target: number // default 70
  attendance_score_target: number // default 85
  min_total_score: number // default 60, below = "Needs Improvement"
  created_by: string
  created_at: string
}

export function getKPIGrade(score: number): KPIGrade {
  if (score > 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 50) return 'average'
  return 'needs_improvement'
}

export const KPI_GRADE_LABELS: Record<KPIGrade, string> = {
  excellent: 'Excellent',
  good: 'Good',
  average: 'Average',
  needs_improvement: 'Needs Improvement',
}

export const KPI_GRADE_COLORS: Record<KPIGrade, string> = {
  excellent: 'text-emerald-600',
  good: 'text-emerald-500',
  average: 'text-amber-600',
  needs_improvement: 'text-red-600',
}

export function getKPIScoreColor(score: number): string {
  if (score > 75) return 'text-emerald-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-red-600'
}

export function getKPIScoreBgColor(score: number): string {
  if (score > 75) return 'bg-emerald-50'
  if (score >= 50) return 'bg-amber-50'
  return 'bg-red-50'
}

// KPI weights (PRD §10)
export const KPI_WEIGHTS = {
  task_score: 0.6,      // 60%
  attendance_score: 0.3, // 30%
  manual_score: 0.1,     // 10%
}

export function calculateKPITotal(
  taskScore: number,
  attendanceScore: number,
  manualScore?: number
): number {
  const manual = manualScore ?? 0
  return Number(
    (taskScore * KPI_WEIGHTS.task_score +
     attendanceScore * KPI_WEIGHTS.attendance_score +
     manual * KPI_WEIGHTS.manual_score).toFixed(1)
  )
}
