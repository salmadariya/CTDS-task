import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/store'
import { mockDb } from '@/lib/mockDb'
import {
  ChevronLeft, ChevronRight, Download, Search,
  CalendarCheck, CalendarX, CalendarMinus,
  Clock, Filter, Plus, X, LayoutGrid, List
} from 'lucide-react'

type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'on_leave' | 'public_holiday' | 'no_record'

interface DayCell {
  date: number
  status: AttendanceStatus | null
  isToday: boolean
  isWeekend: boolean
  isFuture: boolean
  checkIn?: string
  checkOut?: string
}

const STATUS_STYLE: Record<AttendanceStatus, { bg: string; text: string; label: string; icon: any }> = {
  present: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Present', icon: CalendarCheck },
  absent: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Absent', icon: CalendarX },
  half_day: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Half Day', icon: CalendarMinus },
  on_leave: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', label: 'On Leave', icon: CalendarCheck },
  public_holiday: { bg: 'bg-gray-100 border-gray-200', text: 'text-gray-600', label: 'Holiday', icon: CalendarCheck },
  no_record: { bg: 'bg-white border-gray-100', text: 'text-gray-400', label: '—', icon: CalendarCheck },
}

// Generate mock month data
function generateMonth(year: number, month: number): DayCell[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const todayDate = today.getDate()
  const todayMonth = today.getMonth()
  const todayYear = today.getFullYear()

  const mockStatuses: (AttendanceStatus | null)[] = []
  for (let i = 0; i < daysInMonth; i++) {
    const d = new Date(year, month, i + 1)
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    if (isWeekend) { mockStatuses.push(null); continue }
    const rand = Math.random()
    if (rand < 0.75) mockStatuses.push('present')
    else if (rand < 0.82) mockStatuses.push('absent')
    else if (rand < 0.88) mockStatuses.push('half_day')
    else if (rand < 0.94) mockStatuses.push('on_leave')
    else mockStatuses.push('public_holiday')
  }

  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1)
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    const isFuture = d > today
    const isToday = i + 1 === todayDate && month === todayMonth && year === todayYear
    return {
      date: i + 1,
      status: isFuture || isWeekend ? null : mockStatuses[i],
      isToday,
      isWeekend,
      isFuture,
      checkIn: !isFuture && !isWeekend && mockStatuses[i] === 'present' ? '09:02 AM' : undefined,
      checkOut: !isFuture && !isWeekend && mockStatuses[i] === 'present' ? '06:05 PM' : undefined,
    }
  })
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

// Table view mock
const TABLE_RECORDS = [
  { name: 'Alice Mathews', date: 'Jun 09', checkIn: '08:55 AM', checkOut: '06:10 PM', status: 'present' as AttendanceStatus, hours: '9h 15m', note: '' },
  { name: 'Bob Krishnan', date: 'Jun 09', checkIn: '09:30 AM', checkOut: '01:00 PM', status: 'half_day' as AttendanceStatus, hours: '3h 30m', note: 'Doctor visit' },
  { name: 'Carol Pillai', date: 'Jun 09', checkIn: '—', checkOut: '—', status: 'absent' as AttendanceStatus, hours: '—', note: 'No show' },
  { name: 'David Lawrence', date: 'Jun 09', checkIn: '—', checkOut: '—', status: 'on_leave' as AttendanceStatus, hours: '—', note: 'Annual leave approved' },
  { name: 'Eva Sharma', date: 'Jun 09', checkIn: '09:05 AM', checkOut: '06:00 PM', status: 'present' as AttendanceStatus, hours: '8h 55m', note: '' },
]

export default function AttendancePage() {
  const role = useAuthStore(state => state.role)
  const user = useAuthStore(state => state.user)
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [view, setView] = useState<'calendar' | 'table'>('calendar')
  const [attendanceRecords, setAttendanceRecords] = useState(() => mockDb.getAttendance())

  const cells = generateMonth(year, month)

  // Map user database/check-in overrides onto generated cells
  const updatedCells = cells.map(cell => {
    if (!user?.email) return cell
    const dateKey = `${user.email}_${year}-${String(month + 1).padStart(2, '0')}-${String(cell.date).padStart(2, '0')}`
    const dbRecord = attendanceRecords[dateKey]
    if (dbRecord) {
      return {
        ...cell,
        status: dbRecord.status,
        checkIn: dbRecord.checkIn,
        checkOut: dbRecord.checkOut
      }
    }
    return cell
  })

  const firstDay = new Date(year, month, 1).getDay()
  const blanks = Array(firstDay).fill(null)

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const presentCount = updatedCells.filter(c => c.status === 'present').length
  const absentCount = updatedCells.filter(c => c.status === 'absent').length
  const leaveCount = updatedCells.filter(c => c.status === 'on_leave').length
  const halfDayCount = updatedCells.filter(c => c.status === 'half_day').length
  const workDays = updatedCells.filter(c => !c.isWeekend).length
  const attendanceRate = workDays > 0 ? Math.round(((presentCount + halfDayCount * 0.5) / workDays) * 100) : 0

  const isHR = ['super_admin', 'admin', 'hr_manager'].includes(role || '')

  // Today's Date info for Check-In Card
  const today = new Date()
  const todayDate = today.getDate()
  const todayMonth = today.getMonth()
  const todayYear = today.getFullYear()
  const todayKey = user?.email
    ? `${user.email}_${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(todayDate).padStart(2, '0')}`
    : ''
  const todayStatus = todayKey ? attendanceRecords[todayKey] : null

  const handleCheckIn = () => {
    if (!user?.email) return
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const record = { status: 'present' as const, checkIn: timeStr }
    mockDb.saveAttendance(todayKey, record)
    setAttendanceRecords(mockDb.getAttendance())

    mockDb.addAuditLog({
      action: 'status_changed',
      entity_type: 'attendance',
      entity_id: todayKey,
      description: `${user.email} checked in today at ${timeStr}`,
      actor: { name: user.email.split('@')[0], initials: user.email[0].toUpperCase(), role: role || 'Employee' }
    })
  }

  const handleCheckOut = () => {
    if (!user?.email) return
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const existing = attendanceRecords[todayKey] || { status: 'present' as const, checkIn: '09:00 AM' }
    const record = { ...existing, checkOut: timeStr }
    mockDb.saveAttendance(todayKey, record)
    setAttendanceRecords(mockDb.getAttendance())

    mockDb.addAuditLog({
      action: 'status_changed',
      entity_type: 'attendance',
      entity_id: todayKey,
      description: `${user.email} checked out today at ${timeStr}`,
      actor: { name: user.email.split('@')[0], initials: user.email[0].toUpperCase(), role: role || 'Employee' }
    })
  }

  // Dynamic table records for employee self-view
  const employeeTableRecords = updatedCells
    .filter(c => c.status && c.status !== 'no_record')
    .map(c => {
      let hoursStr = '—'
      if (c.checkIn && c.checkOut) {
        const parseTime = (tStr: string) => {
          const [time, modifier] = tStr.split(' ')
          let [hours, minutes] = time.split(':').map(Number)
          if (modifier === 'PM' && hours < 12) hours += 12
          if (modifier === 'AM' && hours === 12) hours = 0
          return hours * 60 + minutes
        }
        try {
          const inMins = parseTime(c.checkIn)
          const outMins = parseTime(c.checkOut)
          const diff = outMins - inMins
          if (diff > 0) {
            const h = Math.floor(diff / 60)
            const m = diff % 60
            hoursStr = `${h}h ${m}m`
          }
        } catch (e) {
          // ignore
        }
      }
      return {
        name: user?.email ? (mockDb.getEmployees().find(e => e.email === user.email)?.full_name || user.email.split('@')[0]) : 'Employee',
        date: `${MONTH_NAMES[month].substring(0, 3)} ${String(c.date).padStart(2, '0')}`,
        checkIn: c.checkIn || '—',
        checkOut: c.checkOut || '—',
        status: c.status || 'no_record',
        hours: hoursStr,
        note: c.isToday ? 'Self Check-in' : ''
      }
    })

  const displayRecords = role === 'employee' ? employeeTableRecords : TABLE_RECORDS

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">{MONTH_NAMES[month]} {year} · Attendance Rate: <strong className="text-emerald-600">{attendanceRate}%</strong></p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm"><Download className="w-4 h-4" /> Export</button>
          {isHR && <button className="btn-primary btn-sm"><Plus className="w-4 h-4" /> Mark Attendance</button>}
        </div>
      </div>

      {/* Check-In / Check-Out Card for Employee */}
      {role === 'employee' && (
        <div className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-400/20">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Daily Work Attendance</h2>
            <p className="text-sm opacity-90">
              {todayStatus ? (
                <>
                  Status: <strong className="capitalize">{todayStatus.status}</strong> 
                  {todayStatus.checkIn && ` · Checked in at ${todayStatus.checkIn}`} 
                  {todayStatus.checkOut && ` · Checked out at ${todayStatus.checkOut}`}
                </>
              ) : (
                'You have not checked in today.'
              )}
            </p>
          </div>
          <div className="flex gap-3">
            {!todayStatus?.checkIn ? (
              <button
                onClick={handleCheckIn}
                className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <CalendarCheck className="w-5 h-5" /> Check In
              </button>
            ) : !todayStatus?.checkOut ? (
              <button
                onClick={handleCheckOut}
                className="bg-white text-purple-600 hover:bg-purple-50 font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <Clock className="w-5 h-5" /> Check Out
              </button>
            ) : (
              <button
                disabled
                className="bg-white/20 text-white/80 border border-white/30 font-semibold px-6 py-2.5 rounded-xl cursor-not-allowed flex items-center gap-2"
              >
                <CalendarCheck className="w-5 h-5" /> Checked Out
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Present', value: presentCount, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Absent', value: absentCount, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
          { label: 'Half Day', value: halfDayCount, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
          { label: 'On Leave', value: leaveCount, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
          { label: 'Work Days', value: workDays, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-xl border p-4 text-center', s.bg)}>
            <div className={cn('text-2xl font-bold', s.color)}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* View Toggle + Month Nav */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          {/* Month navigation */}
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="btn-icon p-1.5"><ChevronLeft className="w-4 h-4" /></button>
            <h3 className="font-semibold text-gray-900 min-w-[160px] text-center">
              {MONTH_NAMES[month]} {year}
            </h3>
            <button onClick={nextMonth} className="btn-icon p-1.5"><ChevronRight className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center gap-2">
            {/* Legend */}
            <div className="hidden md:flex items-center gap-3 text-xs text-gray-500 mr-4">
              {[
                { label: 'Present', color: 'bg-emerald-400' },
                { label: 'Absent', color: 'bg-red-400' },
                { label: 'Half Day', color: 'bg-amber-400' },
                { label: 'Leave', color: 'bg-indigo-400' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className={cn('w-3 h-3 rounded-full', l.color)} />
                  {l.label}
                </div>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setView('calendar')} className={cn('p-1.5 rounded-md transition-all', view === 'calendar' ? 'bg-white shadow-sm' : 'text-gray-400')}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setView('table')} className={cn('p-1.5 rounded-md transition-all', view === 'table' ? 'bg-white shadow-sm' : 'text-gray-400')}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {view === 'calendar' ? (
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className={cn('text-center text-xs font-semibold py-2', d === 'Sun' || d === 'Sat' ? 'text-red-400' : 'text-gray-400')}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {blanks.map((_, i) => <div key={`blank-${i}`} />)}
              {updatedCells.map((cell) => {
                const style = cell.status ? STATUS_STYLE[cell.status as AttendanceStatus] : null
                return (
                  <div
                    key={cell.date}
                    className={cn(
                      'aspect-square rounded-lg border p-1 flex flex-col items-center justify-center cursor-pointer transition-all relative group',
                      cell.isWeekend ? 'bg-gray-50 border-gray-100 opacity-50' :
                      cell.isFuture ? 'bg-gray-50/50 border-gray-100 opacity-40 cursor-default' :
                      style ? cn(style.bg, 'hover:shadow-sm') : 'bg-white border-gray-100 hover:bg-gray-50',
                      cell.isToday && 'ring-2 ring-indigo-500 ring-offset-1',
                    )}
                  >
                    <span className={cn(
                      'text-xs font-semibold',
                      cell.isToday ? 'text-indigo-700' :
                      cell.isWeekend ? 'text-gray-400' :
                      style ? style.text : 'text-gray-400'
                    )}>
                      {cell.date}
                    </span>
                    {cell.status && !cell.isWeekend && !cell.isFuture && (
                      <span className="text-[9px] mt-0.5 font-medium hidden sm:block" style={{ color: 'inherit' }}>
                        {cell.status === 'present' ? '✓' :
                         cell.status === 'absent' ? '✗' :
                         cell.status === 'half_day' ? '½' :
                         cell.status === 'on_leave' ? 'L' :
                         cell.status === 'public_holiday' ? 'H' : ''}
                      </span>
                    )}
                    {/* Tooltip on hover */}
                    {cell.checkIn && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 bg-gray-900 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap shadow-lg text-center">
                        <div>In: {cell.checkIn}</div>
                        {cell.checkOut && <div>Out: {cell.checkOut}</div>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {(isHR ? ['Employee', 'Date', 'Check In', 'Check Out', 'Status', 'Hours', 'Note', 'Actions'] : ['Date', 'Check In', 'Check Out', 'Status', 'Hours', 'Note']).map(h => (
                    <th key={h} className="table-header-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRecords.map((rec, i) => {
                  const sStyle = STATUS_STYLE[rec.status as AttendanceStatus]
                  return (
                    <tr key={i} className="table-row">
                      {isHR && (
                        <td className="table-data-cell font-medium text-gray-900">{rec.name}</td>
                      )}
                      <td className="table-data-cell text-gray-600">{rec.date}</td>
                      <td className="table-data-cell">
                        {rec.checkIn !== '—' && <Clock className="w-3.5 h-3.5 text-gray-400 inline mr-1" />}
                        <span className={rec.checkIn === '—' ? 'text-gray-400' : 'text-gray-700'}>{rec.checkIn}</span>
                      </td>
                      <td className="table-data-cell">
                        {rec.checkOut !== '—' && <Clock className="w-3.5 h-3.5 text-gray-400 inline mr-1" />}
                        <span className={rec.checkOut === '—' ? 'text-gray-400' : 'text-gray-700'}>{rec.checkOut}</span>
                      </td>
                      <td className="table-data-cell">
                        <span className={cn('badge-status text-xs', sStyle.bg.replace('border-emerald-200', '').replace('border-red-200', '').replace('border-amber-200', '').replace('border-indigo-200', '').replace('border-gray-200', ''), sStyle.text)}>
                          {sStyle.label}
                        </span>
                      </td>
                      <td className="table-data-cell font-mono text-xs text-gray-600">{rec.hours}</td>
                      <td className="table-data-cell text-xs text-gray-500">{rec.note || '—'}</td>
                      {isHR && (
                        <td className="table-data-cell">
                          <button className="btn-icon p-1.5 text-xs">Edit</button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
