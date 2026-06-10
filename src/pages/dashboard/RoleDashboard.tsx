import { useAuthStore } from '@/store/store'
import { cn } from '@/lib/utils'
import { Link, useNavigate } from 'react-router-dom'
import { mockDb } from '@/lib/mockDb'
import {
  CheckSquare, Clock, Gauge, CalendarCheck,
  ListChecks, AlertCircle, Award, ClipboardCheck,
  Users, AlertTriangle, BarChart3, Server,
  TrendingUp, TrendingDown, Activity, Star,
  ArrowUpRight, MoreHorizontal, Bell, Zap,
  CalendarDays, Building2, Target, FileText
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const taskStatusData = [
  { name: 'Backlog', value: 12, color: '#6B7280' },
  { name: 'To-Do', value: 18, color: '#6366F1' },
  { name: 'In Progress', value: 24, color: '#F59E0B' },
  { name: 'In Review', value: 8, color: '#8B5CF6' },
  { name: 'Done', value: 45, color: '#10B981' },
  { name: 'Blocked', value: 3, color: '#EF4444' },
]

const activityData = [
  { month: 'Jan', tasks: 42, completed: 38 },
  { month: 'Feb', tasks: 53, completed: 47 },
  { month: 'Mar', tasks: 48, completed: 43 },
  { month: 'Apr', tasks: 61, completed: 54 },
  { month: 'May', tasks: 55, completed: 52 },
  { month: 'Jun', tasks: 67, completed: 58 },
]

const deptPerformanceData = [
  { dept: 'Engineering', completion: 87 },
  { dept: 'HR', completion: 92 },
  { dept: 'Finance', completion: 78 },
  { dept: 'Marketing', completion: 83 },
  { dept: 'Operations', completion: 95 },
]

const teamWorkload = [
  { name: 'Alice M.', tasks: 8, avatar: 'AM' },
  { name: 'Bob K.', tasks: 14, avatar: 'BK' },
  { name: 'Carol P.', tasks: 5, avatar: 'CP' },
  { name: 'David L.', tasks: 11, avatar: 'DL' },
  { name: 'Eva S.', tasks: 6, avatar: 'ES' },
]

const recentActivity = [
  { id: 1, action: 'Status changed', detail: '"Fix login bug" → Done', actor: 'Alice M.', time: '2m ago', color: 'bg-emerald-100 text-emerald-600' },
  { id: 2, action: 'Task assigned', detail: '"Design new dashboard" to Bob K.', actor: 'Carol P.', time: '15m ago', color: 'bg-indigo-100 text-indigo-600' },
  { id: 3, action: 'Leave approved', detail: 'Annual leave Jun 20–22 approved', actor: 'HR Manager', time: '1h ago', color: 'bg-emerald-100 text-emerald-600' },
  { id: 4, action: 'Comment added', detail: '"API Integration" — new comment', actor: 'David L.', time: '2h ago', color: 'bg-gray-100 text-gray-600' },
  { id: 5, action: 'P0 task created', detail: '"Payment gateway down" — CRITICAL', actor: 'Eva S.', time: '3h ago', color: 'bg-red-100 text-red-600' },
]

const pendingReviews = [
  { id: 'TF-0042', title: 'Update API documentation', assignee: 'Alice M.', dept: 'Engineering', priority: 'p1', due: 'Tomorrow' },
  { id: 'TF-0038', title: 'Design system audit', assignee: 'Bob K.', dept: 'Design', priority: 'p2', due: 'Jun 15' },
  { id: 'TF-0035', title: 'Q2 Performance report', assignee: 'Carol P.', dept: 'HR', priority: 'p1', due: 'Jun 12' },
]

// ─── Shared Sub-components ────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, iconBg, iconColor, trend, trendLabel, alert }: {
  label: string; value: string | number; icon: any; iconBg: string; iconColor: string;
  trend?: number; trendLabel?: string; alert?: boolean
}) {
  return (
    <div className={cn(
      'bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow relative overflow-hidden group',
      alert ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
    )}>
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20 pointer-events-none transition-transform group-hover:scale-150 duration-500"
        style={{ background: `radial-gradient(circle, ${iconBg} 0%, transparent 70%)` }} />
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', iconBg)}>
        <Icon className={cn('w-5 h-5', iconColor)} />
      </div>
      <div className={cn('text-3xl font-bold', alert ? 'text-red-700' : 'text-gray-900')}>{value}</div>
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500 mt-1">{label}</div>
      {trend !== undefined && (
        <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', trend >= 0 ? 'text-emerald-600' : 'text-red-500')}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend >= 0 ? '+' : ''}{trend}% {trendLabel || 'vs last month'}
        </div>
      )}
    </div>
  )
}

function SectionCard({ title, icon: Icon, children, action }: {
  title: string; icon?: any; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  )
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    p0: 'bg-red-500', p1: 'bg-amber-500', p2: 'bg-indigo-400', p3: 'bg-gray-300'
  }
  return <span className={cn('w-2 h-2 rounded-full shrink-0', colors[priority] || 'bg-gray-300')} />
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    backlog: 'bg-gray-100 text-gray-600', todo: 'bg-indigo-50 text-indigo-700',
    in_progress: 'bg-amber-50 text-amber-700', in_review: 'bg-violet-50 text-violet-700',
    done: 'bg-emerald-50 text-emerald-700', blocked: 'bg-red-50 text-red-700',
  }
  const labels: Record<string, string> = {
    backlog: 'Backlog', todo: 'To-Do', in_progress: 'In Progress',
    in_review: 'In Review', done: 'Done', blocked: 'Blocked',
  }
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', styles[status] || 'bg-gray-100 text-gray-600')}>
      {labels[status] || status}
    </span>
  )
}

// ─── Mini Attendance Calendar Widget ──────────────────────────────────────────
function MiniAttendanceCalendar() {
  const { user } = useAuthStore()
  const email = user?.email || ''
  
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  // Align to Monday start
  const mondayFirstDay = (firstDay + 6) % 7
  const blanks = Array(mondayFirstDay).fill(null)
  
  const persistentRecords = mockDb.getAttendance ? mockDb.getAttendance() : {}

  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const d = new Date(year, month, day)
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    const isFuture = d > now
    const isToday = day === now.getDate()
    
    const dateKey = `${email}_${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const persisted = persistentRecords[dateKey]
    
    let status: string | null = null
    if (persisted) {
      status = persisted.status
    } else if (isToday) {
      status = 'no_record'
    } else if (!isFuture && !isWeekend) {
      const val = (day * 7) % 100
      if (val < 75) status = 'present'
      else if (val < 85) status = 'absent'
      else if (val < 92) status = 'half_day'
      else status = 'on_leave'
    }

    return { day, status, isWeekend, isFuture, isToday }
  })

  const colors: Record<string, string> = {
    present: 'bg-emerald-500 text-white border-emerald-600',
    absent: 'bg-red-500 text-white border-red-600',
    half_day: 'bg-amber-500 text-white border-amber-600',
    on_leave: 'bg-indigo-500 text-white border-indigo-600',
    public_holiday: 'bg-gray-400 text-white border-gray-500',
    no_record: 'bg-white border-gray-200 text-gray-400',
  }

  return (
    <div className="p-5">
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((w, idx) => (
          <div key={idx}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
        {dayCells.map(c => (
          <div
            key={c.day}
            className={cn(
              'aspect-square flex items-center justify-center rounded-lg text-xs font-bold transition-all border text-center',
              c.isWeekend ? 'bg-gray-50 border-gray-100 text-gray-300' :
              c.isFuture ? 'bg-gray-50/50 border-gray-100 text-gray-300 hover:cursor-default' :
              c.status ? colors[c.status] || 'bg-white text-gray-600' : 'bg-white text-gray-600',
              c.isToday && 'ring-2 ring-indigo-500 ring-offset-1'
            )}
          >
            {c.day}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-4 text-[9px] font-bold uppercase tracking-wider text-gray-400 justify-center">
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Present</div>
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500" /> Absent</div>
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> Half-Day</div>
        <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-500" /> Leave</div>
      </div>
    </div>
  )
}

// ─── Pending Leaves Widget ───────────────────────────────────────────────────
function PendingLeavesWidget() {
  const { user } = useAuthStore()
  const leaves = mockDb.getLeaveRequests ? mockDb.getLeaveRequests().filter(r => r.employeeEmail === user?.email) : []

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200'
  }

  const typeLabels: Record<string, string> = {
    annual: 'Annual',
    sick: 'Sick',
    casual: 'Casual',
    unpaid: 'Unpaid',
    compensatory: 'Compensatory'
  }

  return (
    <div className="divide-y divide-gray-50 max-h-[265px] overflow-y-auto">
      {leaves.slice(0, 4).map(req => (
        <div key={req.id} className="px-5 py-3 flex items-center justify-between text-xs hover:bg-gray-50/50 transition-colors">
          <div>
            <div className="font-semibold text-gray-900 capitalize">{typeLabels[req.type] || req.type} Leave</div>
            <div className="text-gray-400 mt-0.5">{req.from} – {req.to} ({req.days} days)</div>
          </div>
          <span className={cn('px-2 py-0.5 rounded-full border font-semibold text-[10px]', statusColors[req.status])}>
            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
          </span>
        </div>
      ))}
      {leaves.length === 0 && (
        <div className="p-8 text-center text-xs text-gray-400 italic">No leave requests submitted yet.</div>
      )}
    </div>
  )
}

// ─── Employee Dashboard ───────────────────────────────────────────────────────
function EmployeeDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const profile = mockDb.getEmployees().find(e => e.email === user?.email)
  const allTasks = mockDb.getTasks()
  
  // Filter tasks assigned to this employee
  const myTasks = allTasks.filter(t => t.assignees.some(a => a.email === user?.email))
  
  const openTasks = myTasks.filter(t => t.status !== 'done' && t.status !== 'archived')
  const dueTodayTasks = openTasks.filter(t => t.due_date && new Date(t.due_date).toDateString() === new Date().toDateString())
  const kpiScore = profile?.kpi_score ?? 80
  const attendanceRate = profile?.attendance_rate ?? 90

  // Donut chart counts
  const statusCounts = myTasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const dynamicStatusData = [
    { name: 'Backlog', value: statusCounts['backlog'] || 0, color: '#6B7280' },
    { name: 'To-Do', value: statusCounts['todo'] || 0, color: '#6366F1' },
    { name: 'In Progress', value: statusCounts['in_progress'] || 0, color: '#F59E0B' },
    { name: 'In Review', value: statusCounts['in_review'] || 0, color: '#8B5CF6' },
    { name: 'Done', value: statusCounts['done'] || 0, color: '#10B981' },
    { name: 'Blocked', value: statusCounts['blocked'] || 0, color: '#EF4444' },
  ]

  // KPI Breakdown Calculations
  const attScore = profile?.attendance_rate ?? 95
  const manualScore = 80
  const taskScore = Math.round(((kpiScore - (attScore * 0.3) - (manualScore * 0.1)) / 0.6) * 10) / 10

  // Filter audit logs for activities relating to the user's tasks or actor
  const allLogs = mockDb.getAuditLogs()
  const myActivities = allLogs.filter(log => {
    if (log.entity_type === 'task') {
      const taskObj = allTasks.find(t => t.task_id === log.entity_id)
      if (taskObj && taskObj.assignees.some(a => a.email === user?.email)) {
        return true
      }
    }
    const nameMatch = profile && log.actor.name.toLowerCase().includes(profile.full_name.toLowerCase().split(' ')[0])
    return nameMatch
  })

  // Format dynamic status badge in task list
  const getDueLabel = (due_date?: string) => {
    if (!due_date) return 'No Date'
    const isDueToday = new Date(due_date).toDateString() === new Date().toDateString()
    const isOverdue = new Date(due_date).getTime() < Date.now()
    return isOverdue ? 'Overdue' : isDueToday ? 'Today' : new Date(due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  // Sort my open tasks by due date
  const sortedOpenTasks = [...openTasks].sort((a, b) => {
    if (!a.due_date) return 1
    if (!b.due_date) return -1
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  })

  return (
    <div className="space-y-6">
      {/* Row 1: Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Open Tasks" value={openTasks.length} icon={CheckSquare} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
        <StatCard label="Due Today" value={dueTodayTasks.length} icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard label="My KPI Score" value={kpiScore.toFixed(1)} icon={Gauge} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard label="Attendance Rate" value={`${attendanceRate.toFixed(1)}%`} icon={CalendarCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
      </div>

      {/* Row 2: Tasks List + Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="My Tasks" icon={CheckSquare} action={
            <Link to="/tasks" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          }>
            <div className="divide-y divide-gray-50">
              {sortedOpenTasks.slice(0, 5).map(task => (
                <div
                  key={task.id}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <PriorityDot priority={task.priority} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{task.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                      <span className="font-mono">{task.task_id}</span>
                      <span>·</span>
                      <Building2 className="w-3 h-3" />{task.department_name}
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                  <div className={cn('text-xs flex items-center gap-1 shrink-0',
                    getDueLabel(task.due_date) === 'Overdue' ? 'text-red-500 font-medium' :
                    getDueLabel(task.due_date) === 'Today' ? 'text-amber-600 font-medium' : 'text-gray-400'
                  )}>
                    <Clock className="w-3 h-3" />{getDueLabel(task.due_date)}
                  </div>
                </div>
              ))}
              {sortedOpenTasks.length === 0 && (
                <div className="p-8 text-center text-xs text-gray-400 italic">No active tasks assigned to you.</div>
              )}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Task Status Breakdown" icon={Activity}>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={dynamicStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value">
                  {dynamicStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v, 'Tasks']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {dynamicStatusData.filter(s => s.value > 0).map(s => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-gray-600">{s.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Row 3: My Attendance Calendar + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="My Attendance Calendar" icon={CalendarCheck}>
            <MiniAttendanceCalendar />
          </SectionCard>
        </div>

        <SectionCard title="Recent Activity" icon={Activity} action={
          <Link to="/notifications" className="text-xs text-indigo-600 hover:underline font-semibold">View all</Link>
        }>
          <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
            {myActivities.slice(0, 8).map(a => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-indigo-100 text-indigo-600">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-gray-900">{a.description}</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{new Date(a.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
            {myActivities.length === 0 && (
              <div className="p-6 text-center text-xs text-gray-400 italic">No recent activity found.</div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Row 4: My KPI Breakdown + Pending Leave Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="My KPI Breakdown" icon={BarChart3}>
            <div className="p-5 space-y-4">
              {[
                { label: 'Task Score', score: isNaN(taskScore) ? 80 : taskScore, weight: '60%', color: 'bg-indigo-500' },
                { label: 'Attendance Score', score: attScore, weight: '30%', color: 'bg-emerald-500' },
                { label: 'Manual Score', score: manualScore, weight: '10%', color: 'bg-amber-500' },
              ].map(kpi => (
                <div key={kpi.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">{kpi.label}</span>
                    <span className="text-gray-900 font-bold">{kpi.score.toFixed(1)} <span className="text-gray-400 font-normal">({kpi.weight})</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={cn('h-2 rounded-full transition-all duration-700', kpi.color)} style={{ width: `${kpi.score}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">{kpiScore.toFixed(1)}</div>
                  <div className="text-xs text-gray-500 mt-1">Total KPI Score</div>
                  <span className={cn('inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full',
                    kpiScore > 90 ? 'bg-emerald-50 text-emerald-700' :
                    kpiScore >= 75 ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                  )}>
                    {kpiScore > 90 ? 'Excellent' : kpiScore >= 75 ? 'Good' : 'Average'}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Pending Leave Requests" icon={ClipboardCheck}>
          <PendingLeavesWidget />
        </SectionCard>
      </div>
    </div>
  )
}

// ─── Dept Head Dashboard ──────────────────────────────────────────────────────
function DeptHeadDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Team Tasks Open" value="34" icon={ListChecks} iconBg="bg-indigo-50" iconColor="text-indigo-600" trend={5} />
        <StatCard label="Overdue Tasks" value="3" icon={AlertCircle} iconBg="bg-red-50" iconColor="text-red-600" alert trend={-12} />
        <StatCard label="Team KPI Avg" value="81.2" icon={Award} iconBg="bg-emerald-50" iconColor="text-emerald-600" trend={2} />
        <StatCard label="Pending Approvals" value="5" icon={ClipboardCheck} iconBg="bg-amber-50" iconColor="text-amber-600" />
      </div>

      {/* Workload + Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <SectionCard title="Team Workload" icon={Users}>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={teamWorkload} layout="vertical" barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={65} />
                  <Tooltip />
                  <Bar dataKey="tasks" name="Open Tasks" radius={[0, 4, 4, 0]}>
                    {teamWorkload.map((t, i) => (
                      <Cell key={i} fill={t.tasks > 12 ? '#EF4444' : '#6366F1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 text-center mt-1">Red bars indicate overloaded members (12+ tasks)</p>
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-2">
          <SectionCard title="Pending Reviews" icon={ClipboardCheck}>
            <div className="divide-y divide-gray-50">
              {pendingReviews.map(task => (
                <div key={task.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-xs font-mono text-gray-400">{task.id}</div>
                      <div className="text-sm font-medium text-gray-900 mt-0.5 line-clamp-1">{task.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{task.assignee} · {task.dept}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors">✓ Approve</button>
                    <button className="flex-1 py-1.5 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors">✕ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Attendance Grid */}
      <SectionCard title="Team Attendance — Today" icon={CalendarCheck} action={
        <span className="text-xs text-gray-400">Jun 10, 2026</span>
      }>
        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-3">
            {['Alice M.', 'Bob K.', 'Carol P.', 'David L.', 'Eva S.', 'Frank R.', 'Grace T.', 'Harry W.'].map((name, i) => (
              <div key={name} className="flex flex-col items-center gap-1">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2',
                  i < 5 ? 'ring-emerald-400 bg-emerald-500' : 'ring-red-400 bg-red-400'
                )}>
                  {name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className={cn('text-[9px] font-medium', i < 5 ? 'text-emerald-600' : 'text-red-500')}>
                  {i < 5 ? 'Present' : 'Absent'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Recent Team Activity" icon={Activity}>
        <div className="divide-y divide-gray-50">
          {recentActivity.map(a => (
            <div key={a.id} className="flex items-start gap-3 px-6 py-3">
              <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0', a.color)}>
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-gray-900">{a.action}</span>
                <span className="text-sm text-gray-500"> — {a.detail}</span>
                <div className="text-xs text-gray-400 mt-0.5">{a.actor}</div>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Operations Manager Dashboard ─────────────────────────────────────────────
function OpsManagerDashboard() {
  const deptHeatmap = [
    { dept: 'Engineering', backlog: 5, todo: 8, inProgress: 12, inReview: 4, done: 31, blocked: 2 },
    { dept: 'HR', backlog: 2, todo: 3, inProgress: 5, inReview: 2, done: 18, blocked: 0 },
    { dept: 'Finance', backlog: 3, todo: 6, inProgress: 8, inReview: 1, done: 22, blocked: 1 },
    { dept: 'Marketing', backlog: 4, todo: 5, inProgress: 9, inReview: 3, done: 27, blocked: 0 },
    { dept: 'Operations', backlog: 1, todo: 4, inProgress: 6, inReview: 2, done: 35, blocked: 0 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Open Tasks" value="110" icon={ListChecks} iconBg="bg-indigo-50" iconColor="text-indigo-600" trend={-3} />
        <StatCard label="Critical (P0) Tasks" value="2" icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-600" alert />
        <StatCard label="Overdue Tasks" value="7" icon={AlertCircle} iconBg="bg-red-50" iconColor="text-red-600" alert />
        <StatCard label="Active Employees" value="142" icon={Users} iconBg="bg-emerald-50" iconColor="text-emerald-600" trend={4} />
      </div>

      {/* Dept Heatmap */}
      <SectionCard title="Department Task Heatmap" icon={BarChart3}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="table-header-cell w-40">Department</th>
                {['Backlog', 'To-Do', 'In Progress', 'In Review', 'Done', 'Blocked'].map(s => (
                  <th key={s} className="table-header-cell text-center">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deptHeatmap.map(row => (
                <tr key={row.dept} className="table-row">
                  <td className="table-data-cell font-semibold text-gray-800">{row.dept}</td>
                  <td className="table-data-cell text-center"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-mono text-xs">{row.backlog}</span></td>
                  <td className="table-data-cell text-center"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md font-mono text-xs">{row.todo}</span></td>
                  <td className="table-data-cell text-center"><span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md font-mono text-xs">{row.inProgress}</span></td>
                  <td className="table-data-cell text-center"><span className="px-2 py-1 bg-violet-50 text-violet-700 rounded-md font-mono text-xs">{row.inReview}</span></td>
                  <td className="table-data-cell text-center"><span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md font-mono text-xs font-bold">{row.done}</span></td>
                  <td className="table-data-cell text-center"><span className={cn('px-2 py-1 rounded-md font-mono text-xs', row.blocked > 0 ? 'bg-red-50 text-red-600 font-bold' : 'bg-gray-100 text-gray-400')}>{row.blocked}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dept Performance */}
        <SectionCard title="Department Completion Rate" icon={BarChart3}>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptPerformanceData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, 'Completion']} />
                <Bar dataKey="completion" radius={[4, 4, 0, 0]}>
                  {deptPerformanceData.map((d, i) => (
                    <Cell key={i} fill={d.completion >= 90 ? '#10B981' : d.completion >= 80 ? '#6366F1' : '#F59E0B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Recent System Events */}
        <SectionCard title="Recent System Events" icon={Activity}>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {recentActivity.map(a => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0', a.color)}>
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-gray-900">{a.action}</span>
                  <span className="text-xs text-gray-500"> — {a.detail}</span>
                  <div className="text-xs text-gray-400 mt-0.5">{a.actor} · {a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

// ─── HR Manager Dashboard ─────────────────────────────────────────────────────
function HRManagerDashboard() {
  const kpiDistribution = [
    { range: '0–25', count: 2 }, { range: '26–50', count: 5 },
    { range: '51–75', count: 28 }, { range: '76–90', count: 67 }, { range: '91–100', count: 40 },
  ]

  const leaveQueue = [
    { name: 'Alice M.', dept: 'Engineering', type: 'Annual', dates: 'Jun 20–22', days: 3 },
    { name: 'Bob K.', dept: 'HR', type: 'Sick', dates: 'Jun 11', days: 1 },
    { name: 'Carol P.', dept: 'Finance', type: 'Casual', dates: 'Jun 15', days: 1 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Headcount" value="142" icon={Users} iconBg="bg-indigo-50" iconColor="text-indigo-600" trend={2} />
        <StatCard label="Attendance Today" value="136/142" icon={CalendarCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard label="Pending Leave" value="3" icon={ClipboardCheck} iconBg="bg-amber-50" iconColor="text-amber-600" alert />
        <StatCard label="KPI Coverage" value="94%" icon={BarChart3} iconBg="bg-emerald-50" iconColor="text-emerald-600" trend={6} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KPI Score Distribution */}
        <SectionCard title="KPI Score Distribution" icon={BarChart3}>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={kpiDistribution} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [v, 'Employees']} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {kpiDistribution.map((d, i) => (
                    <Cell key={i} fill={['#EF4444', '#F59E0B', '#F59E0B', '#6366F1', '#10B981'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Leave Approval Queue */}
        <SectionCard title="Leave Request Queue" icon={ClipboardCheck} action={
          <span className="badge-status bg-amber-50 text-amber-700">3 Pending</span>
        }>
          <div className="divide-y divide-gray-50">
            {leaveQueue.map((req, i) => (
              <div key={i} className="px-5 py-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                      {req.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{req.name}</div>
                      <div className="text-xs text-gray-400">{req.dept}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">{req.type}</span>
                    <div className="text-xs text-gray-400 mt-1">{req.dates} ({req.days}d)</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors">✓ Approve</button>
                  <button className="flex-1 py-1.5 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors">✕ Reject</button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Dept Attendance */}
      <SectionCard title="Department Attendance Rates — Last 30 Days" icon={CalendarDays}>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptPerformanceData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v}%`, 'Attendance Rate']} />
              <Bar dataKey="completion" fill="#10B981" radius={[4, 4, 0, 0]} name="Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Super Admin Dashboard ────────────────────────────────────────────────────
function SuperAdminDashboard() {
  const apiPerfData = [
    { time: '00:00', p95: 180 }, { time: '04:00', p95: 145 }, { time: '08:00', p95: 280 },
    { time: '12:00', p95: 320 }, { time: '16:00', p95: 265 }, { time: '20:00', p95: 190 }, { time: '23:59', p95: 160 },
  ]

  const queueHealth = [
    { name: 'KPI Engine', status: 'running', last: '2m ago', failed: 0 },
    { name: 'RecurringTask', status: 'idle', last: '15m ago', failed: 0 },
    { name: 'Email Queue', status: 'running', last: '1m ago', failed: 1 },
    { name: 'Reports', status: 'scheduled', last: '1h ago', failed: 0 },
  ]

  const roleDistribution = [
    { name: 'Employee', value: 118, color: '#6B7280' },
    { name: 'Dept Head', value: 12, color: '#6366F1' },
    { name: 'Ops Mgr', value: 4, color: '#F59E0B' },
    { name: 'HR Mgr', value: 5, color: '#10B981' },
    { name: 'Admin', value: 3, color: '#EF4444' },
  ]

  const statusColors: Record<string, string> = {
    running: 'bg-amber-100 text-amber-700',
    idle: 'bg-gray-100 text-gray-600',
    scheduled: 'bg-indigo-100 text-indigo-700',
    failed: 'bg-red-100 text-red-600',
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="System Health" value="98.2%" icon={Server} iconBg="bg-emerald-50" iconColor="text-emerald-600" trend={1} />
        <StatCard label="Total Platform Users" value="142" icon={Users} iconBg="bg-indigo-50" iconColor="text-indigo-600" trend={4} />
        <StatCard label="Active Jobs" value="6" icon={Zap} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard label="Security Alerts" value="0" icon={Bell} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Performance */}
        <div className="lg:col-span-2">
          <SectionCard title="API Response Time — Last 24h" icon={Activity} action={
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-3 h-0.5 bg-red-400 block" />
              <span>300ms SLA</span>
            </div>
          }>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={apiPerfData}>
                  <defs>
                    <linearGradient id="colorP95" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="ms" />
                  <Tooltip formatter={(v) => [`${v}ms`, 'p95 Response']} />
                  {/* SLA line at 300ms */}
                  <Area type="monotone" dataKey="p95" stroke="#6366F1" strokeWidth={2} fill="url(#colorP95)" name="p95 Latency" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* Role Distribution */}
        <SectionCard title="Role Distribution" icon={Users}>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={roleDistribution} cx="50%" cy="50%" outerRadius={72} paddingAngle={2} dataKey="value">
                  {roleDistribution.map((r, i) => <Cell key={i} fill={r.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [v, 'Users']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {roleDistribution.map(r => (
                <div key={r.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                    <span className="text-gray-600">{r.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Bull Queue Monitor */}
      <SectionCard title="Background Job Queue Monitor" icon={Zap}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Job Name', 'Status', 'Last Run', 'Failed Jobs', 'Actions'].map(h => (
                  <th key={h} className="table-header-cell">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queueHealth.map(job => (
                <tr key={job.name} className="table-row">
                  <td className="table-data-cell font-medium text-gray-900">{job.name}</td>
                  <td className="table-data-cell">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 w-fit', statusColors[job.status] || 'bg-gray-100 text-gray-600')}>
                      {job.status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>
                  <td className="table-data-cell text-gray-500">{job.last}</td>
                  <td className="table-data-cell">
                    {job.failed > 0
                      ? <span className="text-red-600 font-semibold">{job.failed}</span>
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="table-data-cell">
                    <div className="flex items-center gap-2">
                      <button className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors font-medium">▶ Run</button>
                      <button className="text-xs px-2 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-md transition-colors">⏸ Pause</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* System Audit Feed + Storage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="System Audit Feed" icon={FileText}>
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {recentActivity.map(a => (
                <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0', a.color)}>
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-800">{a.action} — {a.detail}</span>
                    <div className="text-xs text-gray-400 mt-0.5 font-mono">{a.actor} · {a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Storage Usage" icon={Server}>
          <div className="p-5 space-y-4">
            {[
              { label: 'S3/R2 Storage', used: 68, total: '100 GB', color: 'bg-indigo-500' },
              { label: 'Database', used: 42, total: '50 GB', color: 'bg-emerald-500' },
              { label: 'Log Archive', used: 88, total: '20 GB', color: 'bg-red-500' },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600 font-medium">{s.label}</span>
                  <span className={cn('font-semibold', s.used > 80 ? 'text-red-600' : s.used > 60 ? 'text-amber-600' : 'text-gray-700')}>{s.used}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={cn('h-2 rounded-full', s.used > 80 ? 'bg-red-500' : s.used > 60 ? 'bg-amber-500' : 'bg-emerald-500')}
                    style={{ width: `${s.used}%` }} />
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">of {s.total}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

// ─── Main Role Dashboard ───────────────────────────────────────────────────────
export default function RoleDashboard() {
  const role = useAuthStore(state => state.role)
  const user = useAuthStore(state => state.user)

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin', admin: 'Admin',
    operation_manager: 'Operations Manager', hr_manager: 'HR Manager',
    dept_head: 'Department Head', employee: 'Employee',
  }

  const dashboardMap: Record<string, React.ReactNode> = {
    super_admin: <SuperAdminDashboard />,
    admin: <SuperAdminDashboard />,
    operation_manager: <OpsManagerDashboard />,
    hr_manager: <HRManagerDashboard />,
    dept_head: <DeptHeadDashboard />,
    employee: <EmployeeDashboard />,
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">{dateStr} · {roleLabels[role || ''] || 'Welcome'} View</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Role-adaptive dashboard */}
      {dashboardMap[role || 'employee'] || <EmployeeDashboard />}
    </div>
  )
}
