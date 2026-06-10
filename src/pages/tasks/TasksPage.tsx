import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/store'
import { mockDb } from '@/lib/mockDb'
import {
  Plus, Search, Filter, LayoutList, Table2,
  Clock, Building2, Paperclip, MessageSquare,
  MoreHorizontal, ChevronDown, Flag, Repeat,
  Eye, Pencil, Archive, Trash2, Copy,
  AlertCircle, CheckCircle2, Circle, Loader2, Ban,
  ArrowUpDown, Download, X, Target
} from 'lucide-react'
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/types/task.types'

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ElementType; bg: string; text: string; dot: string }> = {
  backlog: { label: 'Backlog', icon: Circle, bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  todo: { label: 'To-Do', icon: Circle, bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  in_progress: { label: 'In Progress', icon: Loader2, bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  in_review: { label: 'In Review', icon: Eye, bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
  done: { label: 'Done', icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  blocked: { label: 'Blocked', icon: Ban, bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  archived: { label: 'Archived', icon: Archive, bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-500' }
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; bar: string; badge: string; text: string }> = {
  p0: { label: 'P0', bar: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200', text: 'text-red-600' },
  p1: { label: 'P1', bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-600' },
  p2: { label: 'P2', bar: 'bg-indigo-400', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-600' },
  p3: { label: 'P3', bar: 'bg-gray-300', badge: 'bg-gray-100 text-gray-600 border-gray-200', text: 'text-gray-500' },
}

const TYPE_CONFIG: Record<TaskType, string> = {
  admin: 'bg-slate-100 text-slate-700',
  client: 'bg-blue-50 text-blue-700',
  training: 'bg-teal-50 text-teal-700',
  research: 'bg-violet-50 text-violet-700',
  operations: 'bg-orange-50 text-orange-700',
  intern_log: 'bg-pink-50 text-pink-700',
}

const TYPE_LABELS: Record<TaskType, string> = {
  admin: 'Admin', client: 'Client', training: 'Training',
  research: 'Research', operations: 'Operations', intern_log: 'Intern Log',
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog', todo: 'To-Do', in_progress: 'In Progress',
  in_review: 'In Review', done: 'Done', blocked: 'Blocked', archived: 'Archived'
}

// ─── Task Card Component ──────────────────────────────────────────────────────
function TaskCard({ task, onOpen, onEdit, onDelete, onArchive }: {
  task: Task
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
  onArchive: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const role = useAuthStore(state => state.role)
  const canManage = ['super_admin', 'admin', 'operation_manager', 'dept_head'].includes(role || '')
  const pCfg = PRIORITY_CONFIG[task.priority]
  const sCfg = STATUS_CONFIG[task.status]
  
  // Calculate relative or formatted due date
  const isOverdue = task.due_date ? new Date(task.due_date).getTime() < Date.now() && task.status !== 'done' : false
  const isDueToday = task.due_date ? new Date(task.due_date).toDateString() === new Date().toDateString() : false
  
  const dueLabel = task.due_date
    ? isDueToday ? 'Today' : new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })
    : 'No Date'

  return (
    <div
      className={cn(
        'relative bg-white rounded-xl border overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-200',
        isOverdue ? 'border-red-200 animate-[p0-pulse_3s_ease-in-out_infinite]' : 'border-gray-100',
        task.priority === 'p0' && !isOverdue && 'border-red-200 shadow-[0_0_0_1px_rgba(239,68,68,0.3)]',
      )}
      onClick={onOpen}
    >
      {/* Priority bar */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-1', pCfg.bar)} />

      <div className="pl-4 pr-4 pt-4 pb-3">
        {/* Top row: type + priority + status */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-semibold', TYPE_CONFIG[task.type])}>
              {TYPE_LABELS[task.type]}
            </span>
            {task.is_recurring && (
              <span title="Recurring task" className="text-amber-500">
                <Repeat className="w-3 h-3" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold border', pCfg.badge)}>
              {pCfg.label}
            </span>
            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1', sCfg.bg, sCfg.text)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', sCfg.dot)} />
              {sCfg.label}
            </span>
          </div>
        </div>

        {/* Task ID */}
        <div className="text-[10px] font-mono text-gray-400 mb-1">{task.task_id}</div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1">
          {isOverdue && (
            <AlertCircle className="w-3.5 h-3.5 text-red-500 inline mr-1" />
          )}
          {task.title}
        </h4>

        {/* Description */}
        <p className="text-xs text-gray-400 line-clamp-1 mb-3">{task.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Assignees */}
            <div className="flex -space-x-1.5">
              {task.assignees.slice(0, 3).map((a, i) => (
                <div key={i} title={a.name} className={cn('w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold bg-indigo-500')}>
                  {a.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
              ))}
              {task.assignees.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-600 text-[9px] font-bold">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>

            {/* Department */}
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Building2 className="w-3 h-3" />{task.department_name}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Meta icons */}
            {task.attachment_count > 0 && (
              <div className="flex items-center gap-0.5 text-[10px] text-gray-400">
                <Paperclip className="w-3 h-3" />{task.attachment_count}
              </div>
            )}
            {task.comment_count > 0 && (
              <div className="flex items-center gap-0.5 text-[10px] text-gray-400">
                <MessageSquare className="w-3 h-3" />{task.comment_count}
              </div>
            )}

            {/* Due Date */}
            {task.due_date && (
              <div className={cn('flex items-center gap-1 text-[10px] font-medium',
                isOverdue ? 'text-red-500' :
                isDueToday ? 'text-amber-600' : 'text-gray-400'
              )}>
                <Clock className="w-3 h-3" />{dueLabel}
              </div>
            )}

            {/* Kebab menu */}
            {canManage && (
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-30 animate-slide-up">
                    <button onClick={() => { setMenuOpen(false); onOpen() }} className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 w-full text-left transition-colors font-medium">
                      <Eye className="w-4 h-4" />View details
                    </button>
                    <button onClick={() => { setMenuOpen(false); onEdit() }} className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 w-full text-left transition-colors font-medium">
                      <Pencil className="w-4 h-4" />Edit task
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={() => { setMenuOpen(false); onArchive() }} className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 w-full text-left transition-colors font-medium">
                      <Archive className="w-4 h-4" />Archive
                    </button>
                    <button onClick={() => { setMenuOpen(false); onDelete() }} className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left transition-colors font-medium">
                      <Trash2 className="w-4 h-4" />Delete task
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* perf_weight indicator */}
      {task.perf_weight > 0 && (
        <div className="border-t border-gray-50 px-4 py-1.5 flex items-center gap-1.5 text-[10px] text-gray-400">
          <Target className="w-3 h-3 text-indigo-400" />
          <span>perf_weight: <span className="font-semibold text-gray-600">{task.perf_weight}</span></span>
        </div>
      )}
    </div>
  )
}

// ─── Table Row ────────────────────────────────────────────────────────────────
function TaskTableRow({ task, selected, onSelect, onOpen, onEdit, onDelete }: {
  task: Task
  selected: boolean
  onSelect: (id: string) => void
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const role = useAuthStore(state => state.role)
  const canManage = ['super_admin', 'admin', 'operation_manager', 'dept_head'].includes(role || '')
  const pCfg = PRIORITY_CONFIG[task.priority]
  const sCfg = STATUS_CONFIG[task.status]
  
  const isOverdue = task.due_date ? new Date(task.due_date).getTime() < Date.now() && task.status !== 'done' : false
  const isDueToday = task.due_date ? new Date(task.due_date).toDateString() === new Date().toDateString() : false
  
  const dueLabel = task.due_date
    ? isDueToday ? 'Today' : new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })
    : 'No Date'

  return (
    <tr className={cn('table-row hover:bg-gray-50/50 cursor-pointer', selected && 'bg-indigo-50/40')} onClick={onOpen}>
      <td className="table-data-cell" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <input
            type="checkbox" checked={selected}
            onChange={() => onSelect(task.id)}
            className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
          />
          <span className="font-mono text-[10px] text-gray-400">{task.task_id}</span>
        </div>
      </td>
      <td className="table-data-cell max-w-xs">
        <div className="flex items-start gap-2">
          <div className={cn('w-1 h-full rounded-full shrink-0 mt-1', pCfg.bar)} style={{ minHeight: '16px' }} />
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate text-sm">{task.title}</div>
            <div className={cn('text-[10px] mt-0.5', TYPE_CONFIG[task.type], 'inline-flex px-1.5 py-0.5 rounded font-medium')}>
              {TYPE_LABELS[task.type]}
            </div>
          </div>
        </div>
      </td>
      <td className="table-data-cell">
        <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold border', pCfg.badge)}>{pCfg.label}</span>
      </td>
      <td className="table-data-cell">
        <span className={cn('badge-status text-[10px]', sCfg.bg, sCfg.text)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', sCfg.dot)} />
          {sCfg.label}
        </span>
      </td>
      <td className="table-data-cell">
        <div className="flex -space-x-1.5">
          {task.assignees.slice(0, 3).map((a, i) => (
            <div key={i} title={a.name} className={cn('w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold bg-indigo-500')}>
              {a.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
          ))}
        </div>
      </td>
      <td className="table-data-cell">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Building2 className="w-3.5 h-3.5 text-gray-400" />{task.department_name}
        </div>
      </td>
      <td className="table-data-cell">
        <span className={cn('flex items-center gap-1 text-xs font-medium',
          isOverdue ? 'text-red-500' : isDueToday ? 'text-amber-600' : 'text-gray-500'
        )}>
          <Clock className="w-3.5 h-3.5" />{dueLabel}
        </span>
      </td>
      <td className="table-data-cell text-center text-xs font-semibold text-gray-700">{task.perf_weight}</td>
      <td className="table-data-cell" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <button onClick={onOpen} className="btn-icon p-1.5"><Eye className="w-3.5 h-3.5" /></button>
          {canManage && (
            <>
              <button onClick={onEdit} className="btn-icon p-1.5"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={onDelete} className="btn-icon p-1.5 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

// ─── Main TasksPage ───────────────────────────────────────────────────────────
export default function TasksPage() {
  const { role, user } = useAuthStore()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  
  const [view, setView] = useState<'list' | 'table'>('list')
  const [search, setSearch] = useState('')
  const [activeStatuses, setActiveStatuses] = useState<TaskStatus[]>([])
  const [activePriorities, setActivePriorities] = useState<TaskPriority[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('due_date_asc')

  const canCreate = ['super_admin', 'admin', 'operation_manager', 'dept_head'].includes(role || '')

  const loadTasks = () => {
    let allTasks = mockDb.getTasks()
    if (role === 'employee') {
      allTasks = allTasks.filter(t => t.assignees.some(a => a.email === user?.email))
    }
    setTasks(allTasks)
  }

  useEffect(() => {
    loadTasks()
  }, [])

  // Action handlers
  const handleDelete = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const taskToDelete = tasks.find(t => t.id === taskId)
      mockDb.deleteTask(taskId)
      
      // Audit Log
      if (taskToDelete) {
        mockDb.addAuditLog({
          action: 'deleted',
          entity_type: 'task',
          entity_id: taskToDelete.task_id,
          description: `User deleted task "${taskToDelete.title}"`,
          actor: { name: 'User', initials: 'U', role: role || 'employee' }
        })
      }
      loadTasks()
    }
  }

  const handleArchive = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      const updated = { ...task, status: 'archived' as TaskStatus }
      mockDb.saveTask(updated)
      mockDb.addAuditLog({
        action: 'archived',
        entity_type: 'task',
        entity_id: task.task_id,
        description: `User archived task "${task.title}"`,
        actor: { name: 'User', initials: 'U', role: role || 'employee' }
      })
      loadTasks()
    }
  }

  const handleBulkArchive = () => {
    if (confirm(`Archive ${selectedIds.length} selected tasks?`)) {
      selectedIds.forEach(id => {
        const task = tasks.find(t => t.id === id)
        if (task) {
          mockDb.saveTask({ ...task, status: 'archived' })
        }
      })
      setSelectedIds([])
      loadTasks()
    }
  }

  // Filter logic
  const filtered = tasks.filter(t => {
    // Hide archived tasks unless explicitly searching for it
    if (t.status === 'archived' && !activeStatuses.includes('archived')) return false

    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.task_id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = activeStatuses.length === 0 || activeStatuses.includes(t.status)
    const matchPriority = activePriorities.length === 0 || activePriorities.includes(t.priority)
    return matchSearch && matchStatus && matchPriority
  })

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'due_date_asc') {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    }
    if (sortBy === 'due_date_desc') {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
    }
    if (sortBy === 'priority') {
      const pWeights = { p0: 0, p1: 1, p2: 2, p3: 3 }
      return pWeights[a.priority] - pWeights[b.priority]
    }
    if (sortBy === 'created') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    return 0
  })

  const toggleStatus = (s: TaskStatus) =>
    setActiveStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const togglePriority = (p: TaskPriority) =>
    setActivePriorities(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const allSelected = sorted.length > 0 && sorted.every(t => selectedIds.includes(t.id))

  const hasActiveFilters = activeStatuses.length > 0 || activePriorities.length > 0 || search

  const overdueCount = tasks.filter(t => t.due_date && new Date(t.due_date).getTime() < Date.now() && t.status !== 'done').length

  return (
    <div className="space-y-5 animate-slide-up pb-8">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">
            {sorted.length} task{sorted.length !== 1 ? 's' : ''} shown · {overdueCount} overdue
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="btn-secondary btn-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          {canCreate && (
            <Link to="/tasks/create" className="btn-primary btn-sm">
              <Plus className="w-4 h-4" /> New Task
            </Link>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input-field pl-9 py-2 text-sm"
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 flex-wrap">
            {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map(s => (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border',
                  activeStatuses.includes(s)
                    ? cn(STATUS_CONFIG[s].bg, STATUS_CONFIG[s].text, 'border-current')
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                )}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Priority Filter */}
            <div className="flex items-center gap-1">
              {(['p0', 'p1', 'p2', 'p3'] as TaskPriority[]).map(p => (
                <button
                  key={p}
                  onClick={() => togglePriority(p)}
                  className={cn(
                    'px-2 py-1.5 rounded-lg text-xs font-bold transition-all border',
                    activePriorities.includes(p)
                      ? cn(PRIORITY_CONFIG[p].badge, 'border-current')
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  )}
                >
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="input-field py-1.5 text-xs w-auto pr-8">
              <option value="due_date_asc">Due Date ↑</option>
              <option value="due_date_desc">Due Date ↓</option>
              <option value="priority">Priority</option>
              <option value="created">Created</option>
            </select>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setView('list')} className={cn('p-1.5 rounded-md transition-all', view === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600')}>
                <LayoutList className="w-4 h-4" />
              </button>
              <button onClick={() => setView('table')} className={cn('p-1.5 rounded-md transition-all', view === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600')}>
                <Table2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">Filters:</span>
            {activeStatuses.map(s => (
              <span key={s} className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', STATUS_CONFIG[s].bg, STATUS_CONFIG[s].text)}>
                {STATUS_LABELS[s]}
                <button onClick={() => toggleStatus(s)}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {activePriorities.map(p => (
              <span key={p} className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border', PRIORITY_CONFIG[p].badge)}>
                {PRIORITY_CONFIG[p].label}
                <button onClick={() => togglePriority(p)}><X className="w-3 h-3" /></button>
              </span>
            ))}
            <button onClick={() => { setActiveStatuses([]); setActivePriorities([]); setSearch('') }}
              className="text-xs text-red-500 hover:underline ml-1">Clear all</button>
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 flex items-center gap-4 animate-slide-up">
          <span className="text-sm font-semibold text-indigo-700">{selectedIds.length} task{selectedIds.length !== 1 ? 's' : ''} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={handleBulkArchive} className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium border border-red-200">Archive</button>
            <button onClick={() => setSelectedIds([])} className="btn-icon p-1.5"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Content */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            {hasActiveFilters ? 'Try adjusting your filters or search query.' : 'No tasks have been created yet. Start by creating your first task.'}
          </p>
          {canCreate && (
            <Link to="/tasks/create" className="btn-primary mx-auto mt-6">
              <Plus className="w-4 h-4" /> Create First Task
            </Link>
          )}
        </div>
      ) : view === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={() => navigate(`/tasks/${task.id}`)}
              onEdit={() => navigate(`/tasks/${task.id}/edit`)}
              onDelete={() => handleDelete(task.id)}
              onArchive={() => handleArchive(task.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-header-cell w-28">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={allSelected}
                        onChange={() => setSelectedIds(allSelected ? [] : sorted.map(t => t.id))}
                        className="w-4 h-4 accent-indigo-500 rounded"
                      />
                      <span>ID</span>
                    </div>
                  </th>
                  {['Title', 'Priority', 'Status', 'Assignees', 'Department', 'Due Date', 'Weight', 'Actions'].map(h => (
                    <th key={h} className="table-header-cell">
                      <div className="flex items-center gap-1">
                        {h}
                        {['Title', 'Priority', 'Due Date'].includes(h) && <ArrowUpDown className="w-3 h-3" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(task => (
                  <TaskTableRow
                    key={task.id}
                    task={task}
                    selected={selectedIds.includes(task.id)}
                    onSelect={toggleSelect}
                    onOpen={() => navigate(`/tasks/${task.id}`)}
                    onEdit={() => navigate(`/tasks/${task.id}/edit`)}
                    onDelete={() => handleDelete(task.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <span className="text-sm text-gray-500">Showing <strong>{sorted.length}</strong> of <strong>{tasks.length}</strong> tasks</span>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-40" disabled>Previous</button>
              <button className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded-lg font-medium">1</button>
              <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-100" disabled>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
