import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Bell, CheckCheck, CheckCircle2, AlertTriangle, Calendar, BarChart3,
  UserPlus, X, MessageSquare, Clock, Filter, Search, BellOff
} from 'lucide-react'

type NotifType = 'task' | 'leave' | 'kpi' | 'system' | 'comment' | 'employee'

interface Notification {
  id: string
  type: NotifType
  title: string
  message: string
  time: string
  read: boolean
  cta?: string
}

const TYPE_CONFIG: Record<NotifType, { icon: any; bg: string; color: string }> = {
  task: { icon: CheckCircle2, bg: 'bg-indigo-100', color: 'text-indigo-600' },
  leave: { icon: Calendar, bg: 'bg-amber-100', color: 'text-amber-600' },
  kpi: { icon: BarChart3, bg: 'bg-emerald-100', color: 'text-emerald-600' },
  system: { icon: AlertTriangle, bg: 'bg-red-100', color: 'text-red-600' },
  comment: { icon: MessageSquare, bg: 'bg-gray-100', color: 'text-gray-600' },
  employee: { icon: UserPlus, bg: 'bg-violet-100', color: 'text-violet-600' },
}

const MOCK_NOTIFS: Notification[] = [
  { id: '1', type: 'task', title: 'Task assigned to you', message: '"Update User Dashboard UI — Phase 2" has been assigned to you by Carol P.', time: '2 min ago', read: false, cta: 'View Task' },
  { id: '2', type: 'task', title: 'Task due in 24 hours', message: '"Review PR #142 — Dashboard redesign" is due tomorrow. Current status: In Review.', time: '1h ago', read: false, cta: 'View Task' },
  { id: '3', type: 'leave', title: 'Leave request approved', message: 'Your annual leave request for Jun 20–22 (3 days) has been approved by HR Manager.', time: '2h ago', read: false, cta: 'See Details' },
  { id: '4', type: 'task', title: 'Task overdue', message: '"Fix payment gateway timeout" (#TF-0048) is now 2 days overdue. Priority: P0.', time: '3h ago', read: false, cta: 'View Task' },
  { id: '5', type: 'kpi', title: 'KPI score published', message: 'Your KPI score for May 2026 has been published: 84.5 / 100 — Good.', time: '5h ago', read: true, cta: 'See Score' },
  { id: '6', type: 'comment', title: 'New comment on your task', message: 'David L. commented on "Setup CI/CD pipeline": "Blocked on DevOps access — need your help."', time: '1d ago', read: true, cta: 'View Comment' },
  { id: '7', type: 'employee', title: 'New employee joined', message: 'Grace Thomas has joined the Engineering department as an Employee.', time: '2d ago', read: true },
  { id: '8', type: 'leave', title: 'Leave request submitted', message: 'Bob K. submitted a sick leave request for Jun 11 (1 day). Awaiting your approval.', time: '3d ago', read: true, cta: 'Review' },
  { id: '9', type: 'system', title: 'P0 task created', message: '"Fix payment gateway timeout error" was created as a P0 Critical task by Eva S.', time: '4d ago', read: true, cta: 'View Task' },
]

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<NotifType | 'all'>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [notifs, setNotifs] = useState(MOCK_NOTIFS)
  const [search, setSearch] = useState('')

  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  const dismiss = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id))

  const filtered = notifs.filter(n => {
    const matchType = activeFilter === 'all' || n.type === activeFilter
    const matchRead = !showUnreadOnly || !n.read
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase())
    return matchType && matchRead && matchSearch
  })

  const unreadCount = notifs.filter(n => !n.read).length

  return (
    <div className="space-y-5 animate-slide-up max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Bell className="w-6 h-6 text-gray-700" /> Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{unreadCount} unread · {notifs.length} total</p>
        </div>
        <button onClick={markAllRead} className="btn-secondary btn-sm flex items-center gap-1.5">
          <CheckCheck className="w-4 h-4" /> Mark all read
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Type filters */}
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'task', 'leave', 'kpi', 'system', 'comment', 'employee'] as const).map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                  activeFilter === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Unread toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={cn('relative w-9 h-5 rounded-full transition-colors', showUnreadOnly ? 'bg-gray-800' : 'bg-gray-200')}
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}>
                <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform', showUnreadOnly ? 'translate-x-4' : 'translate-x-0.5')} />
              </div>
              <span className="text-xs text-gray-600">Unread only</span>
            </label>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input className="input-field pl-8 py-1.5 text-xs w-40" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-700">You're all caught up!</p>
            <p className="text-sm text-gray-400 mt-1">No notifications match your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(notif => {
              const tc = TYPE_CONFIG[notif.type]
              const Icon = tc.icon
              return (
                <div
                  key={notif.id}
                  className={cn(
                    'flex items-start gap-4 p-5 hover:bg-gray-50 cursor-pointer transition-colors group relative',
                    !notif.read && 'bg-gray-50/50'
                  )}
                  onClick={() => markRead(notif.id)}
                >
                  {/* Unread dot */}
                  {!notif.read && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500" />
                  )}

                  {/* Icon */}
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', tc.bg)}>
                    <Icon className={cn('w-5 h-5', tc.color)} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className={cn('text-sm font-semibold', notif.read ? 'text-gray-700' : 'text-gray-900')}>{notif.title}</div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{notif.time}
                      </span>
                      {notif.cta && (
                        <button className="text-xs text-indigo-600 font-medium hover:underline">{notif.cta} →</button>
                      )}
                    </div>
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={e => { e.stopPropagation(); dismiss(notif.id) }}
                    className="btn-icon p-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
