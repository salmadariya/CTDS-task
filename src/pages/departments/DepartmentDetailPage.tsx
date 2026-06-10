import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/store'
import { mockDb } from '@/lib/mockDb'
import {
  Building2, Users, ClipboardList, Target, Clock, ArrowLeft,
  ChevronRight, Power, UserCheck, Shield, HelpCircle, Save, Calendar
} from 'lucide-react'
import type { Department, UserProfile } from '@/types/user.types'
import type { Task } from '@/types/task.types'

export default function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { role, user } = useAuthStore()

  const [dept, setDept] = useState<Department | null>(null)
  const [employees, setEmployees] = useState<UserProfile[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [subDepts, setSubDepts] = useState<Department[]>([])
  const [activeTab, setActiveTab] = useState<'employees' | 'tasks' | 'subdepts' | 'settings'>('employees')
  
  // Settings Target states
  const [taskScoreTarget, setTaskScoreTarget] = useState(80)
  const [attendanceTarget, setAttendanceTarget] = useState(95)
  const [minTotalScore, setMinTotalScore] = useState(75)
  const [isSaved, setIsSaved] = useState(false)

  const loadData = () => {
    if (!id) return
    const allDepts = mockDb.getDepartments()
    const foundDept = allDepts.find(d => d.id === id)
    if (foundDept) {
      setDept(foundDept)
      
      // Filter employees
      const allEmps = mockDb.getEmployees()
      setEmployees(allEmps.filter(e => e.department_id === id))

      // Filter tasks
      const allTasks = mockDb.getTasks()
      setTasks(allTasks.filter(t => t.department_id === id))

      // Filter child departments
      setSubDepts(allDepts.filter(d => d.parent_id === id))
    } else {
      navigate('/departments')
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  if (!dept) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)

    // Add audit log
    mockDb.addAuditLog({
      action: 'updated',
      entity_type: 'department',
      entity_id: dept.id,
      description: `User updated performance KPI targets for department "${dept.name}"`,
      actor: { name: user?.email?.split('@')[0] || 'User', initials: 'U', role: role || 'employee' }
    })
  }

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* Back & Title Row */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/departments')} className="btn-icon p-1.5">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center text-sm text-gray-500 font-medium">
          <Link to="/departments" className="hover:text-indigo-600 transition-colors">Departments</Link>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-gray-900 font-semibold">{dept.name}</span>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-3 w-full" style={{ backgroundColor: dept.color }} />
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-500" />
              {dept.name}
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl">{dept.description || 'No description provided.'}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dept Head</div>
              <div className="text-sm font-bold text-gray-700">{dept.head_name || 'Not assigned'}</div>
            </div>
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 shrink-0',
              dept.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
            )}>
              <Power className="w-3 h-3" />
              {dept.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Headcount', value: employees.length, sub: 'Active employees', icon: Users, color: 'text-indigo-500 bg-indigo-50' },
          { label: 'Active Tasks', value: tasks.filter(t=>t.status !== 'done').length, sub: 'Currently open tasks', icon: ClipboardList, color: 'text-amber-500 bg-amber-50' },
          { label: 'Dept KPI Avg', value: dept.kpi_avg ? `${dept.kpi_avg.toFixed(1)}%` : '—', sub: 'Previous month avg', icon: Target, color: 'text-emerald-500 bg-emerald-50' },
          { label: 'Presence Rate', value: '96.2%', sub: 'Attendance this month', icon: Calendar, color: 'text-cyan-500 bg-cyan-50' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', item.color)}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{item.label}</div>
              <div className="text-2xl font-black text-gray-900 mt-0.5">{item.value}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 font-medium">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'employees', label: `Employees (${employees.length})` },
          { id: 'tasks', label: `Active Tasks (${tasks.filter(t=>t.status!=='done'&&t.status!=='archived').length})` },
          { id: 'subdepts', label: `Sub-Departments (${subDepts.length})` },
          { id: 'settings', label: 'Performance Settings' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={cn(
              "px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px",
              activeTab === t.id
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[300px]">
        {activeTab === 'employees' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {employees.length === 0 ? (
              <div className="p-16 text-center text-gray-400 text-sm">
                No employees are assigned to this department.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-500 text-xs">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Joined Date</th>
                      <th className="px-6 py-4 text-center">KPI Score</th>
                      <th className="px-6 py-4 text-center">Open Tasks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr
                        key={emp.id}
                        onClick={() => navigate(`/users/${emp.id}`)}
                        className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                            {emp.full_name.substring(0, 2).toUpperCase()}
                          </div>
                          {emp.full_name}
                        </td>
                        <td className="px-6 py-4 capitalize text-gray-600">{emp.role.replace('_', ' ')}</td>
                        <td className="px-6 py-4 font-mono text-gray-500">{new Date(emp.joined_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-center font-bold">
                          <span className={cn(
                            emp.kpi_score >= 85 ? 'text-emerald-600' : emp.kpi_score >= 70 ? 'text-amber-600' : 'text-red-500'
                          )}>{emp.kpi_score.toFixed(1)}%</span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-gray-700">{emp.open_task_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {tasks.filter(t=>t.status !== 'done' && t.status !== 'archived').length === 0 ? (
              <div className="p-16 text-center text-gray-400 text-sm">
                No active tasks assigned to this department.
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
                    {tasks.filter(t=>t.status !== 'done' && t.status !== 'archived').map(t => (
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

        {activeTab === 'subdepts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subDepts.length === 0 ? (
              <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400 text-sm">
                This department has no nested sub-departments.
              </div>
            ) : (
              subDepts.map(sd => (
                <div
                  key={sd.id}
                  onClick={() => navigate(`/departments/${sd.id}`)}
                  className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-indigo-200 cursor-pointer transition-all hover:shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: sd.color }} />
                    <div>
                      <h4 className="font-bold text-gray-900">{sd.name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{sd.employee_count} employees · {sd.open_task_count} tasks</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-xl space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-50 pb-2">Target Performance Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label-xs block mb-1.5">Task Score Target (Points / 100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="input-field"
                  value={taskScoreTarget}
                  onChange={e => setTaskScoreTarget(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="label-xs block mb-1.5">Monthly Attendance Target (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="input-field"
                  value={attendanceTarget}
                  onChange={e => setAttendanceTarget(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="label-xs block mb-1.5">Minimum KPI Override Threshold (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="input-field"
                  value={minTotalScore}
                  onChange={e => setMinTotalScore(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button type="submit" className="btn-primary flex items-center gap-1.5 btn-sm px-5">
                <Save className="w-4 h-4" /> Save Targets
              </button>
              {isSaved && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  ✓ Targets updated successfully
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
