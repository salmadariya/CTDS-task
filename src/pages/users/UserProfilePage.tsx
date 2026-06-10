import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/store'
import { mockDb } from '@/lib/mockDb'
import {
  User, Building2, Mail, MapPin, Calendar, Clock, ArrowLeft, CheckCircle2,
  AlertCircle, ClipboardList, Target, CalendarCheck, Shield, ChevronDown
} from 'lucide-react'
import type { UserProfile, Role } from '@/types/user.types'
import type { Task } from '@/types/task.types'

const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  operation_manager: 'Operations Manager',
  hr_manager: 'HR Manager',
  dept_head: 'Department Head',
  employee: 'Employee',
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { role, user } = useAuthStore()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState<'tasks' | 'kpis' | 'attendance'>('tasks')

  // Monthly KPI mock history
  const kpiHistory = [
    { month: 'May 2026', score: 88.2, taskScore: 90, attendanceScore: 98, manualScore: 50 },
    { month: 'Apr 2026', score: 91.5, taskScore: 92, attendanceScore: 97, manualScore: 75 },
    { month: 'Mar 2026', score: 84.8, taskScore: 82, attendanceScore: 96, manualScore: 60 }
  ]

  // Attendance mock calendar days
  const attendanceDays = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1
    const statuses = ['present', 'present', 'present', 'present', 'leave', 'holiday', 'present']
    const status = day > 10 ? 'no_record' : statuses[day % statuses.length]
    return { day, status }
  })

  useEffect(() => {
    if (!id) return
    const allEmployees = mockDb.getEmployees()
    const foundEmp = allEmployees.find(e => e.id === id)
    if (foundEmp) {
      setProfile(foundEmp)
      
      // Load tasks assigned to this employee
      const allTasks = mockDb.getTasks()
      const assigned = allTasks.filter(t => t.assignees.some(a => a.id === id))
      setTasks(assigned)
    } else {
      navigate('/users')
    }
  }, [id])

  if (!profile) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* Back & Breadcrumb Row */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/users')} className="btn-icon p-1.5">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center text-sm text-gray-500 font-medium">
          <Link to="/users" className="hover:text-indigo-600 transition-colors">Employees</Link>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-gray-900 font-semibold">{profile.full_name}</span>
        </div>
      </div>

      {/* Profile Header Dossier */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-indigo-500 text-white text-2xl font-bold flex items-center justify-center shadow-md shrink-0">
          {profile.full_name.substring(0, 2).toUpperCase()}
        </div>
        
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{profile.full_name}</h1>
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize">
              {ROLE_LABELS[profile.role]}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-1.5 gap-x-4 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1.5 truncate">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" /> {profile.email}
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Building2 className="w-4 h-4 text-gray-400 shrink-0" /> {profile.department_name}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" /> {profile.office_location || 'Headquarters'}
            </div>
            <div className="flex items-center gap-1.5 md:col-span-3">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" /> Joined on {new Date(profile.joined_date).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'KPI Performance', value: `${profile.kpi_score.toFixed(1)}%`, desc: 'Average metric score', icon: Target, color: 'text-emerald-500 bg-emerald-50' },
          { label: 'Attendance Rate', value: `${profile.attendance_rate.toFixed(1)}%`, desc: 'Presence rate this month', icon: CalendarCheck, color: 'text-indigo-500 bg-indigo-50' },
          { label: 'Open Tasks', value: tasks.filter(t=>t.status!=='done').length, desc: 'Currently assigned active', icon: ClipboardList, color: 'text-amber-500 bg-amber-50' },
          { label: 'Completed Tasks', value: profile.completed_task_count, desc: 'Total tasks compiled', icon: CheckCircle2, color: 'text-cyan-500 bg-cyan-50' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', item.color)}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{item.label}</div>
              <div className="text-2xl font-black text-gray-900 mt-0.5">{item.value}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 font-medium">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'tasks', label: 'Task History' },
          { id: 'kpis', label: 'KPI Ledger' },
          { id: 'attendance', label: 'Attendance Calendar' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={cn(
              "px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px",
              activeTab === t.id ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[300px]">
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {tasks.length === 0 ? (
              <div className="p-16 text-center text-gray-400 text-sm">
                No tasks currently assigned to this employee.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-500 text-xs">
                      <th className="px-6 py-4">Task ID</th>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(t => (
                      <tr
                        key={t.id}
                        onClick={() => navigate(`/tasks/${t.id}`)}
                        className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 font-mono font-semibold text-gray-400 text-xs">{t.task_id}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900 truncate max-w-xs">{t.title}</td>
                        <td className="px-6 py-4 capitalize font-bold text-xs">{t.priority}</td>
                        <td className="px-6 py-4 capitalize font-semibold text-xs">{t.status.replace('_', ' ')}</td>
                        <td className="px-6 py-4 font-mono text-gray-500 text-xs">{t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'kpis' && (
          <div className="space-y-4">
            {kpiHistory.map((kh, index) => (
              <div key={index} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <h3 className="font-bold text-gray-900 text-sm">{kh.month} Scorecard</h3>
                  <span className="font-mono font-bold text-base text-emerald-600">{kh.score.toFixed(1)}%</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Task Completion (60%)', val: kh.taskScore, color: 'bg-indigo-500' },
                    { label: 'Attendance Rate (30%)', val: kh.attendanceScore, color: 'bg-emerald-500' },
                    { label: 'Manual Score Override (10%)', val: kh.manualScore, color: 'bg-amber-500' }
                  ].map((sub, sIdx) => (
                    <div key={sIdx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-gray-600">
                        <span>{sub.label}</span>
                        <span>{sub.val} / 100</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', sub.color)} style={{ width: `${sub.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-indigo-500" /> Attendance Ledger (Current Month)
            </h3>
            
            <div className="grid grid-cols-7 gap-2.5 text-center">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((w, idx) => (
                <div key={idx} className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{w}</div>
              ))}
              
              {attendanceDays.map(d => {
                const colors: Record<string, string> = {
                  present: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  leave: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                  holiday: 'bg-gray-100 text-gray-500 border-gray-200',
                  no_record: 'bg-white border-gray-200 text-gray-400'
                }
                return (
                  <div
                    key={d.day}
                    className={cn(
                      'aspect-square flex items-center justify-center rounded-xl text-xs font-bold border transition-all hover:scale-105',
                      colors[d.status] || 'bg-white text-gray-600'
                    )}
                  >
                    {d.day}
                  </div>
                )
              })}
            </div>
            
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-50 text-[10px] uppercase font-bold tracking-wider text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-100 inline-block" /> Present
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-indigo-50 border border-indigo-100 inline-block" /> Leave
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-gray-100 border border-gray-200 inline-block" /> Holiday
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-white border border-gray-200 inline-block" /> Pending
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
