// ===== ATTENDANCE & LEAVE TYPES (PRD §09) =====

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'half_day'
  | 'on_leave'
  | 'public_holiday'

export type LeaveType =
  | 'annual'
  | 'sick'
  | 'casual'
  | 'unpaid'
  | 'compensatory'

export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export interface AttendanceRecord {
  id: string
  user_id: string
  user_name: string
  user_avatar?: string
  department_name: string
  date: string // ISO date YYYY-MM-DD
  status: AttendanceStatus
  check_in?: string // HH:mm
  check_out?: string // HH:mm
  hours?: number
  note?: string
  edited_by?: string
  edited_by_name?: string
  is_locked: boolean
  created_at: string
  updated_at: string
}

export interface LeaveRequest {
  id: string
  user_id: string
  user_name: string
  user_avatar?: string
  department_name: string
  type: LeaveType
  from_date: string
  to_date: string
  duration_days: number
  reason: string
  status: LeaveStatus
  approved_by?: string
  approved_by_name?: string
  rejected_reason?: string
  supporting_doc_url?: string
  submitted_at: string
  updated_at: string
}

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  half_day: 'Half Day',
  on_leave: 'On Leave',
  public_holiday: 'Public Holiday',
}

export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, {
  bg: string
  text: string
  cellBg: string
  icon: string
}> = {
  present: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    cellBg: '#ECFDF5',
    icon: 'CalendarCheck',
  },
  absent: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    cellBg: '#FEF2F2',
    icon: 'CalendarX',
  },
  half_day: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    cellBg: '#FFFBEB',
    icon: 'CalendarMinus',
  },
  on_leave: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    cellBg: '#EEF2FF',
    icon: 'CalendarOff',
  },
  public_holiday: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    cellBg: '#F3F4F6',
    icon: 'Star',
  },
}

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  annual: 'Annual Leave',
  sick: 'Sick Leave',
  casual: 'Casual Leave',
  unpaid: 'Unpaid Leave',
  compensatory: 'Compensatory Leave',
}

export const LEAVE_TYPE_COLORS: Record<LeaveType, { bg: string; text: string; border: string }> = {
  annual: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  sick: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  casual: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  unpaid: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  compensatory: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
}

export const LEAVE_STATUS_COLORS: Record<LeaveStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700' },
}
