import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/store'
import { mockDb } from '@/lib/mockDb'
import {
  Plus, X, CalendarRange, Check, XCircle, ChevronDown,
  FileText, Upload, Clock, AlertCircle, CheckCircle2,
  Download, Filter
} from 'lucide-react'

type LeaveType = 'annual' | 'sick' | 'casual' | 'unpaid' | 'compensatory'
type LeaveStatus = 'pending' | 'approved' | 'rejected'

interface LeaveRequest {
  id: string
  employee: string
  employeeEmail: string
  dept: string
  avatar: string
  type: LeaveType
  from: string
  to: string
  days: number
  reason: string
  status: LeaveStatus
  approvedBy?: string
  submitted: string
}

const TYPE_CONFIG: Record<LeaveType, { label: string; bg: string; text: string }> = {
  annual: { label: 'Annual Leave', bg: 'bg-blue-50', text: 'text-blue-700' },
  sick: { label: 'Sick Leave', bg: 'bg-red-50', text: 'text-red-700' },
  casual: { label: 'Casual Leave', bg: 'bg-amber-50', text: 'text-amber-700' },
  unpaid: { label: 'Unpaid Leave', bg: 'bg-gray-100', text: 'text-gray-700' },
  compensatory: { label: 'Compensatory', bg: 'bg-violet-50', text: 'text-violet-700' },
}

const STATUS_CONFIG: Record<LeaveStatus, { label: string; bg: string; text: string; icon: any }> = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
  approved: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function RequestLeaveModal({ onClose, onSubmitSuccess }: { onClose: () => void; onSubmitSuccess: () => void }) {
  const { user, role } = useAuthStore()
  const [type, setType] = useState<LeaveType>('annual')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [reason, setReason] = useState('')

  const calcDays = () => {
    if (!from || !to) return 0
    const d1 = new Date(from), d2 = new Date(to)
    return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!from || !to || reason.trim().length < 10) return

    const dbEmp = mockDb.getEmployees().find(emp => emp.email === user?.email)
    const newReq: LeaveRequest = {
      id: 'req-' + Math.random().toString(36).substr(2, 9),
      employee: dbEmp?.full_name || user?.email?.split('@')[0] || 'Employee',
      employeeEmail: user?.email || '',
      dept: dbEmp?.department_name || 'Finance',
      avatar: dbEmp?.full_name?.split(' ').map(n => n[0]).join('') || 'EM',
      type,
      from: formatDate(from),
      to: formatDate(to),
      days: calcDays(),
      reason,
      status: 'pending' as const,
      submitted: 'Just now'
    }

    mockDb.saveLeaveRequest(newReq)

    mockDb.addAuditLog({
      action: 'created',
      entity_type: 'leave',
      entity_id: newReq.id,
      description: `${newReq.employee} requested ${type} leave from ${newReq.from} to ${newReq.to} (${newReq.days} days)`,
      actor: { name: newReq.employee, initials: newReq.avatar, role: role || 'Employee' }
    })

    onSubmitSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-indigo-500" /> Request Leave
          </h2>
          <button onClick={onClose} className="btn-icon"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Leave Type */}
          <div>
            <label className="label-xs block mb-2">Leave Type <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TYPE_CONFIG) as LeaveType[]).map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={cn('p-3 rounded-xl border-2 text-center transition-all text-xs font-medium',
                    type === t ? cn(TYPE_CONFIG[t].bg, TYPE_CONFIG[t].text, 'border-current') : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}>
                  {TYPE_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-xs block mb-1.5">From Date <span className="text-red-500">*</span></label>
              <input type="date" className="input-field" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="label-xs block mb-1.5">To Date <span className="text-red-500">*</span></label>
              <input type="date" className="input-field" value={to} onChange={e => setTo(e.target.value)} />
            </div>
          </div>

          {/* Duration display */}
          {from && to && (
            <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
              <CalendarRange className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-indigo-700 font-medium">Duration: <strong>{calcDays()} working day{calcDays() !== 1 ? 's' : ''}</strong></span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="label-xs block mb-1.5">Reason <span className="text-red-500">*</span></label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="Briefly describe the reason for leave..."
              maxLength={500}
            />
            <div className="text-xs text-gray-400 mt-1 text-right">{reason.length} / 500</div>
          </div>

          {/* Supporting doc for sick leave */}
          {type === 'sick' && (
            <div>
              <label className="label-xs block mb-1.5">Supporting Document</label>
              <div className="upload-zone">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <div className="text-sm text-gray-500">Drop PDF here or <span className="text-indigo-600 cursor-pointer hover:underline">browse</span></div>
                <div className="text-xs text-gray-400 mt-1">Max 5MB · PDF only</div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={!from || !to || reason.trim().length < 10}
          >
            <CalendarRange className="w-4 h-4" /> Submit Request
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LeavePage() {
  const role = useAuthStore(state => state.role)
  const user = useAuthStore(state => state.user)
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [showRequest, setShowRequest] = useState(false)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [filterStatus, setFilterStatus] = useState<LeaveStatus | 'all'>('all')

  const canApprove = ['super_admin', 'admin', 'hr_manager', 'dept_head'].includes(role || '')
  const isEmployee = role === 'employee'

  useEffect(() => {
    setLeaves(mockDb.getLeaveRequests())
  }, [])

  const refreshLeaves = () => {
    setLeaves(mockDb.getLeaveRequests())
  }

  // Filter leaves based on active user's permissions
  const roleFilteredLeaves = isEmployee
    ? leaves.filter(r => r.employeeEmail === user?.email)
    : leaves

  const filtered = roleFilteredLeaves.filter(r => filterStatus === 'all' || r.status === filterStatus)

  // Calculate dynamic balances based on approved requests
  const userApprovedLeaves = leaves.filter(l => l.employeeEmail === user?.email && l.status === 'approved')
  const getUsedDays = (type: LeaveType) => {
    return userApprovedLeaves
      .filter(l => l.type === type)
      .reduce((sum, l) => sum + (l.days || 0), 0)
  }

  const handleApprove = (req: LeaveRequest) => {
    const dbEmp = mockDb.getEmployees().find(e => e.email === user?.email)
    const updated = {
      ...req,
      status: 'approved' as const,
      approvedBy: dbEmp?.full_name || 'Manager'
    }
    mockDb.saveLeaveRequest(updated)

    mockDb.addAuditLog({
      action: 'status_changed',
      entity_type: 'leave',
      entity_id: req.id,
      description: `${dbEmp?.full_name || 'Manager'} approved leave request for ${req.employee}`,
      actor: { name: dbEmp?.full_name || 'Manager', initials: req.avatar, role: role || 'Manager' }
    })

    refreshLeaves()
  }

  const handleReject = (req: LeaveRequest) => {
    if (rejectionReason.trim().length < 10) return
    const dbEmp = mockDb.getEmployees().find(e => e.email === user?.email)
    const updated = {
      ...req,
      status: 'rejected' as const,
      reason: rejectionReason,
      approvedBy: dbEmp?.full_name || 'Manager'
    }
    mockDb.saveLeaveRequest(updated)

    mockDb.addAuditLog({
      action: 'status_changed',
      entity_type: 'leave',
      entity_id: req.id,
      description: `${dbEmp?.full_name || 'Manager'} rejected leave request for ${req.employee}. Reason: ${rejectionReason}`,
      actor: { name: dbEmp?.full_name || 'Manager', initials: req.avatar, role: role || 'Manager' }
    })

    setRejectId(null)
    setRejectionReason('')
    refreshLeaves()
  }

  const handleCancel = (reqId: string) => {
    const allLeaves = mockDb.getLeaveRequests()
    const updated = allLeaves.filter(r => r.id !== reqId)
    localStorage.setItem('tf_leaves', JSON.stringify(updated))
    refreshLeaves()
  }

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Leave Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {roleFilteredLeaves.filter(r => r.status === 'pending').length} pending ·{' '}
            {roleFilteredLeaves.filter(r => r.status === 'approved').length} approved this month
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm"><Download className="w-4 h-4" /> Export</button>
          <button onClick={() => setShowRequest(true)} className="btn-primary btn-sm">
            <Plus className="w-4 h-4" /> {isEmployee ? 'Request Leave' : 'Add Request'}
          </button>
        </div>
      </div>

      {/* Balance Cards (employee view) */}
      {isEmployee && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { type: 'Annual', used: getUsedDays('annual'), total: 20, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
            { type: 'Sick', used: getUsedDays('sick'), total: 8, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
            { type: 'Casual', used: getUsedDays('casual'), total: 5, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
            { type: 'Compensatory', used: getUsedDays('compensatory'), total: 3, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
          ].map(b => (
            <div key={b.type} className={cn('rounded-xl border p-5', b.bg)}>
              <div className="text-xs font-medium text-gray-500 mb-2">{b.type} Leave</div>
              <div className="flex items-baseline gap-1">
                <span className={cn('text-3xl font-bold', b.color)}>{b.total - b.used}</span>
                <span className="text-sm text-gray-400">/ {b.total} days left</span>
              </div>
              <div className="w-full bg-white/80 rounded-full h-1.5 mt-2">
                <div className={cn('h-1.5 rounded-full', b.color.replace('text-', 'bg-'))} style={{ width: `${(b.used / b.total) * 100}%` }} />
              </div>
              <div className="text-xs text-gray-400 mt-1">{b.used} used</div>
            </div>
          ))}
        </div>
      )}

      {/* Requests Table/Cards */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900">{canApprove ? 'Leave Requests' : 'My Leave History'}</h3>
          <div className="ml-auto flex items-center gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize',
                  filterStatus === s ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filtered.map(req => {
            const tc = TYPE_CONFIG[req.type]
            const sc = STATUS_CONFIG[req.status]
            const StatusIcon = sc.icon
            return (
              <div key={req.id} className={cn(
                'p-5 hover:bg-gray-50 transition-colors',
                req.status === 'approved' && 'bg-emerald-50/20',
                req.status === 'rejected' && 'bg-red-50/20',
              )}>
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Employee + details */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm shrink-0">
                      {req.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{req.employee}</span>
                        <span className="text-xs text-gray-400">· {req.dept}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', tc.bg, tc.text)}>{tc.label}</span>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <CalendarRange className="w-3.5 h-3.5" />
                          {req.from} – {req.to}
                          <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium ml-1">{req.days}d</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5 italic">"{req.reason}"</p>
                      {req.approvedBy && req.status === 'approved' && (
                        <p className="text-xs text-emerald-600 mt-1">✓ Approved by {req.approvedBy} · {req.submitted}</p>
                      )}
                      {req.status === 'rejected' && (
                        <div className="mt-1">
                          <p className="text-xs text-red-500">✗ Rejected {req.approvedBy ? `by ${req.approvedBy}` : ''} · {req.submitted}</p>
                          {req.reason && <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded px-2 py-1 mt-1 font-mono italic">Rejection Reason: "{req.reason}"</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Status + Actions */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', sc.bg, sc.text)}>
                      <StatusIcon className="w-3.5 h-3.5" />{sc.label}
                    </span>
                    <span className="text-xs text-gray-400">{req.submitted}</span>

                    {canApprove && req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(req)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => {
                            setRejectId(req.id)
                            setRejectionReason('')
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}

                    {!canApprove && req.status === 'pending' && (
                      <button onClick={() => handleCancel(req.id)} className="text-xs text-red-500 hover:underline">Cancel Request</button>
                    )}
                  </div>
                </div>

                {/* Reject reason textarea */}
                {rejectId === req.id && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg animate-slide-up">
                    <label className="label-xs block mb-1.5 text-red-700">Rejection Reason</label>
                    <textarea
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      className="input-field resize-none text-sm"
                      rows={2}
                      placeholder="Provide a reason for rejection (min 10 chars)..."
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleReject(req)}
                        className="btn-danger btn-sm text-xs"
                        disabled={rejectionReason.trim().length < 10}
                      >
                        Confirm Rejection
                      </button>
                      <button onClick={() => setRejectId(null)} className="btn-ghost btn-sm text-xs">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <CalendarRange className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No leave requests found.</p>
          </div>
        )}
      </div>

      {showRequest && <RequestLeaveModal onClose={() => setShowRequest(false)} onSubmitSuccess={refreshLeaves} />}
    </div>
  )
}
