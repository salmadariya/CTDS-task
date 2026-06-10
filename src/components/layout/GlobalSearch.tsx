import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/store'
import { cn } from '@/lib/cn'
import { mockDb } from '@/lib/mockDb'
import {
  Search,
  X,
  CheckSquare,
  Building2,
  Users,
  LayoutDashboard,
  ClipboardList,
  Calendar,
  ClipboardCheck,
  BarChart3,
  Bell,
  ScrollText,
  ShieldCheck,
  Settings,
  User,
  LayoutTemplate,
  ArrowRight,
} from 'lucide-react'
import type { Role } from '@/store/store'

// ─── Static page shortcuts ────────────────────────────────────────────────────
interface PageItem {
  id: string
  label: string
  path: string
  icon: React.ElementType
  roles: Role[]
}

const PAGE_SHORTCUTS: PageItem[] = [
  { id: 'dashboard',        label: 'Dashboard',         path: '/dashboard',        icon: LayoutDashboard, roles: ['super_admin', 'admin', 'operation_manager', 'hr_manager', 'dept_head', 'employee'] },
  { id: 'my-tasks',         label: 'My Tasks',           path: '/tasks',            icon: CheckSquare,     roles: ['employee', 'dept_head'] },
  { id: 'all-tasks',        label: 'All Tasks',          path: '/tasks',            icon: ClipboardList,   roles: ['super_admin', 'admin', 'operation_manager', 'hr_manager'] },
  { id: 'task-templates',   label: 'Task Templates',     path: '/tasks/templates',  icon: LayoutTemplate,  roles: ['super_admin', 'admin', 'operation_manager'] },
  { id: 'departments',      label: 'Departments',        path: '/departments',      icon: Building2,       roles: ['super_admin', 'admin', 'operation_manager', 'hr_manager', 'dept_head'] },
  { id: 'employees',        label: 'Employees',          path: '/users',            icon: Users,           roles: ['super_admin', 'admin', 'operation_manager', 'hr_manager'] },
  { id: 'attendance',       label: 'Attendance',         path: '/attendance',       icon: Calendar,        roles: ['super_admin', 'admin', 'hr_manager', 'dept_head', 'operation_manager', 'employee'] },
  { id: 'leave',            label: 'Leave Requests',     path: '/leave',            icon: ClipboardCheck,  roles: ['super_admin', 'admin', 'hr_manager', 'dept_head', 'operation_manager', 'employee'] },
  { id: 'kpis',             label: 'KPI & Performance',  path: '/kpis',             icon: BarChart3,       roles: ['super_admin', 'admin', 'hr_manager', 'dept_head', 'operation_manager', 'employee'] },
  { id: 'notifications',    label: 'Notifications',      path: '/notifications',    icon: Bell,            roles: ['super_admin', 'admin', 'operation_manager', 'hr_manager', 'dept_head', 'employee'] },
  { id: 'audit-log',        label: 'Audit Log',          path: '/audit-log',        icon: ScrollText,      roles: ['super_admin', 'admin', 'operation_manager'] },
  { id: 'admin',            label: 'Admin Panel',        path: '/admin',            icon: ShieldCheck,     roles: ['super_admin'] },
  { id: 'profile',          label: 'My Profile',         path: '/profile',          icon: User,            roles: ['super_admin', 'admin', 'operation_manager', 'hr_manager', 'dept_head', 'employee'] },
  { id: 'settings',         label: 'Settings',           path: '/settings',         icon: Settings,        roles: ['super_admin', 'admin', 'operation_manager', 'hr_manager', 'dept_head', 'employee'] },
]

// ─── Unified result type ──────────────────────────────────────────────────────
interface ResultItem {
  id: string
  category: 'Tasks' | 'Employees' | 'Departments' | 'Pages'
  label: string        // primary text — always one line
  meta: string         // secondary text — always one line
  path: string
  icon: React.ElementType
  color?: string       // dept color dot
  badge?: string       // e.g. task ID or role
}

const STATUS_LABEL: Record<string, string> = {
  todo:        'To Do',
  in_progress: 'In Progress',
  in_review:   'In Review',
  done:        'Done',
  cancelled:   'Cancelled',
}

const PRIORITY_LABEL: Record<string, string> = {
  p0: 'Critical',
  p1: 'High',
  p2: 'Medium',
  p3: 'Low',
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface GlobalSearchProps {
  open: boolean
  onClose: () => void
}

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const navigate = useNavigate()
  const { role } = useAuthStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // ─── Build results from real mockDb data ────────────────────────────────────
  const allResults = useMemo((): ResultItem[] => {
    const tasks = mockDb.getTasks()
    const employees = mockDb.getEmployees()
    const departments = mockDb.getDepartments()

    const taskItems: ResultItem[] = tasks.map(t => ({
      id: `task-${t.id}`,
      category: 'Tasks',
      label: t.title,
      meta: `${t.task_id} · ${STATUS_LABEL[t.status] ?? t.status} · ${PRIORITY_LABEL[t.priority] ?? t.priority}`,
      path: `/tasks/${t.id}`,
      icon: CheckSquare,
      badge: t.task_id,
    }))

    const empItems: ResultItem[] = employees.map(e => ({
      id: `emp-${e.id}`,
      category: 'Employees',
      label: e.full_name,
      meta: `${e.department_name ?? '—'} · ${e.role.replace(/_/g, ' ')}`,
      path: `/users/${e.id}`,
      icon: Users,
      color: e.department_color,
    }))

    const deptItems: ResultItem[] = departments.map(d => ({
      id: `dept-${d.id}`,
      category: 'Departments',
      label: d.name,
      meta: `${d.employee_count} employees · ${d.open_task_count} open tasks`,
      path: `/departments/${d.id}`,
      icon: Building2,
      color: d.color,
    }))

    const allowedPages = PAGE_SHORTCUTS.filter(p =>
      !role || p.roles.includes(role as Role)
    )
    const pageItems: ResultItem[] = allowedPages.map(p => ({
      id: `page-${p.id}`,
      category: 'Pages',
      label: p.label,
      meta: 'Navigate to page',
      path: p.path,
      icon: p.icon,
    }))

    return [...taskItems, ...empItems, ...deptItems, ...pageItems]
  }, [role])

  // ─── Filter ─────────────────────────────────────────────────────────────────
  const filtered = useMemo((): ResultItem[] => {
    const q = query.trim().toLowerCase()
    if (!q) {
      // When no query: show pages + first 3 tasks + first 3 employees
      return [
        ...allResults.filter(r => r.category === 'Pages'),
        ...allResults.filter(r => r.category === 'Tasks').slice(0, 3),
        ...allResults.filter(r => r.category === 'Employees').slice(0, 3),
      ]
    }
    return allResults.filter(r =>
      r.label.toLowerCase().includes(q) ||
      r.meta.toLowerCase().includes(q) ||
      r.badge?.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    )
  }, [allResults, query])

  // Group
  const grouped = useMemo(() => {
    const order: ResultItem['category'][] = ['Tasks', 'Employees', 'Departments', 'Pages']
    const map: Partial<Record<ResultItem['category'], ResultItem[]>> = {}
    for (const item of filtered) {
      if (!map[item.category]) map[item.category] = []
      map[item.category]!.push(item)
    }
    return order.filter(cat => map[cat]?.length).map(cat => ({ cat, items: map[cat]! }))
  }, [filtered])

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSelect = useCallback((item: ResultItem) => {
    navigate(item.path)
    onClose()
    setQuery('')
    setActiveIndex(0)
  }, [navigate, onClose])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[activeIndex]) handleSelect(filtered[activeIndex])
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, filtered, activeIndex, handleSelect, onClose])

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
        style={{ maxHeight: '72vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Input ── */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 shrink-0">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIndex(0) }}
            placeholder="Search tasks, employees, departments…"
            className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-sm outline-none"
          />
          {query ? (
            <button
              onClick={() => { setQuery(''); setActiveIndex(0); inputRef.current?.focus() }}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:flex text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 font-mono shrink-0">
              ESC
            </kbd>
          )}
        </div>

        {/* ── Results ── */}
        <div ref={listRef} className="overflow-y-auto flex-1 py-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                No results for <span className="font-semibold text-gray-700">"{query}"</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">Try a task name, employee name, or department</p>
            </div>
          ) : (
            grouped.map(({ cat, items }) => (
              <div key={cat}>
                {/* Category header */}
                <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{cat}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {items.map(item => {
                  const globalIdx = filtered.indexOf(item)
                  const Icon = item.icon
                  const isActive = globalIdx === activeIndex
                  return (
                    <button
                      key={item.id}
                      data-index={globalIdx}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2 text-left transition-colors group',
                        isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'
                      )}
                    >
                      {/* Icon / color dot */}
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                        isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                      )}
                        style={item.color && !isActive
                          ? { backgroundColor: item.color + '20', color: item.color }
                          : undefined
                        }
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Label + meta — single line */}
                      <div className="min-w-0 flex-1 flex items-center gap-2 overflow-hidden">
                        <span className={cn(
                          'text-sm font-medium truncate whitespace-nowrap shrink-0 max-w-[45%]',
                          isActive ? 'text-indigo-700' : 'text-gray-900'
                        )}>
                          {item.label}
                        </span>
                        <span className="text-gray-300 shrink-0">·</span>
                        <span className="text-xs text-gray-400 truncate whitespace-nowrap min-w-0">
                          {item.meta}
                        </span>
                      </div>

                      {/* Right side: badge or arrow */}
                      {item.badge && (
                        <span className={cn(
                          'text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0',
                          isActive ? 'bg-indigo-100 text-indigo-500' : 'bg-gray-100 text-gray-400'
                        )}>
                          {item.badge}
                        </span>
                      )}
                      <ArrowRight className={cn(
                        'w-3.5 h-3.5 shrink-0 transition-opacity',
                        isActive ? 'opacity-100 text-indigo-400' : 'opacity-0'
                      )} />
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-100 text-[10px] text-gray-400 shrink-0">
          <span className="flex items-center gap-1">
            <kbd className="bg-gray-100 px-1 rounded font-mono">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-gray-100 px-1 rounded font-mono">↵</kbd> open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-gray-100 px-1 rounded font-mono">esc</kbd> close
          </span>
          <span className="ml-auto text-gray-300">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  )
}
