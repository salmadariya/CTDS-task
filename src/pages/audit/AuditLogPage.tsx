import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  ScrollText, Search, Download, ChevronDown, ChevronRight,
  PlusCircle, Pencil, ArrowRightCircle, UserCheck, MessageSquare,
  Archive, Trash2, Lock, LogIn, AlertTriangle, FileDown, Clock
} from 'lucide-react'

type AuditAction = 'created' | 'updated' | 'status_changed' | 'assigned' | 'commented' | 'archived' | 'deleted' | 'locked' | 'login'
type EntityType = 'task' | 'user' | 'department' | 'attendance' | 'kpi' | 'leave'

interface AuditEntry {
  id: string
  action: AuditAction
  entity_type: EntityType
  entity_id: string
  description: string
  actor: string
  actor_initials: string
  actor_color: string
  timestamp: string
  ip?: string
  old_value?: string
  new_value?: string
}

const ACTION_CONFIG: Record<AuditAction, { icon: any; color: string; bg: string }> = {
  created: { icon: PlusCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  updated: { icon: Pencil, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  status_changed: { icon: ArrowRightCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
  assigned: { icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  commented: { icon: MessageSquare, color: 'text-gray-600', bg: 'bg-gray-100' },
  archived: { icon: Archive, color: 'text-gray-600', bg: 'bg-gray-100' },
  deleted: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100' },
  locked: { icon: Lock, color: 'text-gray-600', bg: 'bg-gray-100' },
  login: { icon: LogIn, color: 'text-emerald-600', bg: 'bg-emerald-100' },
}

const ENTITY_LABELS: Record<EntityType, { label: string; bg: string; text: string }> = {
  task: { label: 'TASK', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  user: { label: 'USER', bg: 'bg-violet-50', text: 'text-violet-700' },
  department: { label: 'DEPT', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  attendance: { label: 'ATTENDANCE', bg: 'bg-amber-50', text: 'text-amber-700' },
  kpi: { label: 'KPI', bg: 'bg-teal-50', text: 'text-teal-700' },
  leave: { label: 'LEAVE', bg: 'bg-blue-50', text: 'text-blue-700' },
}

const MOCK_AUDIT: AuditEntry[] = [
  { id: '1', action: 'status_changed', entity_type: 'task', entity_id: 'TF-0042', description: 'Alice M. changed status from "In Progress" to "Done" on #TF-0042', actor: 'Alice M.', actor_initials: 'AM', actor_color: 'bg-indigo-500', timestamp: '2026-06-10 10:42:15', ip: '192.168.1.10', old_value: 'in_progress', new_value: 'done' },
  { id: '2', action: 'created', entity_type: 'task', entity_id: 'TF-0051', description: 'Carol P. created task #TF-0051 "Update User Dashboard UI"', actor: 'Carol P.', actor_initials: 'CP', actor_color: 'bg-red-500', timestamp: '2026-06-10 09:30:00', ip: '192.168.1.15' },
  { id: '3', action: 'updated', entity_type: 'user', entity_id: 'USR-0012', description: 'HR Manager updated employee profile for Eva Sharma — role changed to Employee', actor: 'Carol P.', actor_initials: 'CP', actor_color: 'bg-red-500', timestamp: '2026-06-10 09:00:00', ip: '192.168.1.15', old_value: 'dept_head', new_value: 'employee' },
  { id: '4', action: 'locked', entity_type: 'kpi', entity_id: 'KPI-2026-05', description: 'System locked KPI records for May 2026 (auto-lock on 15th)', actor: 'System', actor_initials: 'SY', actor_color: 'bg-gray-500', timestamp: '2026-06-10 00:00:00' },
  { id: '5', action: 'assigned', entity_type: 'task', entity_id: 'TF-0048', description: 'Bob K. assigned task #TF-0048 to David L.', actor: 'Bob K.', actor_initials: 'BK', actor_color: 'bg-emerald-500', timestamp: '2026-06-09 16:22:00', ip: '10.0.0.5' },
  { id: '6', action: 'commented', entity_type: 'task', entity_id: 'TF-0038', description: 'David L. added a comment on #TF-0038 "Setup CI/CD pipeline"', actor: 'David L.', actor_initials: 'DL', actor_color: 'bg-amber-500', timestamp: '2026-06-09 14:10:00', ip: '10.0.0.8' },
  { id: '7', action: 'deleted', entity_type: 'department', entity_id: 'DEPT-007', description: 'Admin deleted department "Legacy Ops" (decommissioned)', actor: 'Super Admin', actor_initials: 'SA', actor_color: 'bg-red-600', timestamp: '2026-06-09 11:45:00', ip: '192.168.1.1' },
  { id: '8', action: 'login', entity_type: 'user', entity_id: 'USR-0001', description: 'Alice M. logged in successfully', actor: 'Alice M.', actor_initials: 'AM', actor_color: 'bg-indigo-500', timestamp: '2026-06-09 08:55:00', ip: '192.168.1.10' },
  { id: '9', action: 'archived', entity_type: 'task', entity_id: 'TF-0029', description: 'Bob K. archived task #TF-0029 "Old reporting template"', actor: 'Bob K.', actor_initials: 'BK', actor_color: 'bg-emerald-500', timestamp: '2026-06-08 17:30:00', ip: '10.0.0.5' },
]

export default function AuditLogPage() {
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState<EntityType | 'all'>('all')
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all')
  const [dateFilter, setDateFilter] = useState('7d')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = MOCK_AUDIT.filter(e => {
    const matchSearch = !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.entity_id.toLowerCase().includes(search.toLowerCase())
    const matchEntity = entityFilter === 'all' || e.entity_type === entityFilter
    const matchAction = actionFilter === 'all' || e.action === actionFilter
    return matchSearch && matchEntity && matchAction
  })

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-indigo-500" /> Audit Log
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Showing <strong>{filtered.length}</strong> of <strong>{MOCK_AUDIT.length}</strong> log entries
          </p>
        </div>
        <button className="btn-secondary btn-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {['Today', '7d', '30d', '90d'].map(d => (
              <button key={d} onClick={() => setDateFilter(d)}
                className={cn('px-3 py-1 text-xs font-medium rounded-md transition-all',
                  dateFilter === d ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                )}>
                {d === '7d' ? 'Last 7d' : d === '30d' ? 'Last 30d' : d === '90d' ? 'Last 90d' : d}
              </button>
            ))}
          </div>

          {/* Entity filter */}
          <select className="input-field py-1.5 text-sm w-auto" value={entityFilter} onChange={e => setEntityFilter(e.target.value as EntityType | 'all')}>
            <option value="all">All Entities</option>
            {(Object.keys(ENTITY_LABELS) as EntityType[]).map(k => (
              <option key={k} value={k}>{ENTITY_LABELS[k].label}</option>
            ))}
          </select>

          {/* Action filter */}
          <select className="input-field py-1.5 text-sm w-auto" value={actionFilter} onChange={e => setActionFilter(e.target.value as AuditAction | 'all')}>
            <option value="all">All Actions</option>
            {(Object.keys(ACTION_CONFIG) as AuditAction[]).map(k => (
              <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1).replace('_', ' ')}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input-field pl-9 py-1.5 text-sm w-60" placeholder="Search descriptions, IDs..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filtered.map(entry => {
            const ac = ACTION_CONFIG[entry.action]
            const ec = ENTITY_LABELS[entry.entity_type]
            const Icon = ac.icon
            const isExpanded = expandedId === entry.id
            const hasDiff = entry.old_value && entry.new_value

            return (
              <div key={entry.id} className="hover:bg-gray-50 transition-colors">
                <div
                  className="flex items-start gap-4 px-5 py-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  {/* Action icon */}
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', ac.bg)}>
                    <Icon className={cn('w-4 h-4', ac.color)} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2 flex-wrap">
                      {/* Entity badge */}
                      <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold uppercase', ec.bg, ec.text)}>
                        {ec.label}
                      </span>
                      {/* Entity ID */}
                      <span className="font-mono text-xs text-gray-400 hover:text-indigo-600 cursor-pointer">
                        {entry.entity_id}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{entry.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0', entry.actor_color)}>
                          {entry.actor_initials}
                        </div>
                        <span className="text-xs text-gray-500">{entry.actor}</span>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{entry.timestamp}
                      </span>
                      {entry.ip && (
                        <span className="text-xs font-mono text-gray-300">{entry.ip}</span>
                      )}
                    </div>
                  </div>

                  {/* Expand toggle */}
                  {hasDiff && (
                    <button className="btn-icon p-1 shrink-0">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* Diff View */}
                {isExpanded && hasDiff && (
                  <div className="mx-5 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-slide-up">
                    <div className="text-xs font-semibold text-gray-500 mb-2">Change diff</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-[10px] font-semibold text-red-600 mb-1">— Before</div>
                        <code className="text-xs text-red-700 font-mono">{entry.old_value}</code>
                      </div>
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="text-[10px] font-semibold text-emerald-600 mb-1">+ After</div>
                        <code className="text-xs text-emerald-700 font-mono">{entry.new_value}</code>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <ScrollText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No audit log entries match your filters.</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
          <span className="text-sm text-gray-500">Showing <strong>{filtered.length}</strong> entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40" disabled>Previous</button>
            <button className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded-lg">1</button>
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
