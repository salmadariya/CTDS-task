import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/store'
import { mockDb } from '@/lib/mockDb'
import {
  Search, Plus, UserPlus, Download, MoreHorizontal,
  Mail, Building2, Power, Eye, Pencil, X,
  AlertCircle, Loader2, TrendingUp, CheckSquare,
  Gauge, CalendarCheck, Shield
} from 'lucide-react'
import type { Role, UserProfile, OfficeLocation } from '@/types/user.types'

const ROLE_CONFIG: Record<Role, { label: string; bg: string; text: string }> = {
  super_admin: { label: 'Super Admin', bg: 'bg-red-50', text: 'text-red-700' },
  admin: { label: 'Admin', bg: 'bg-red-50', text: 'text-red-700' },
  operation_manager: { label: 'Ops Manager', bg: 'bg-amber-50', text: 'text-amber-700' },
  hr_manager: { label: 'HR Manager', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  dept_head: { label: 'Dept Head', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  employee: { label: 'Employee', bg: 'bg-gray-100', text: 'text-gray-700' },
}

function AddEmployeeModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const { role, user } = useAuthStore()
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role>('employee')
  const [deptId, setDeptId] = useState('eng')
  const [location, setLocation] = useState<OfficeLocation>('Manjeri')
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0])
  const [tempPassword] = useState(() => 'TempP@ss' + Math.floor(Math.random() * 900 + 100) + '!')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim()) return

    const depts = mockDb.getDepartments()
    const currentDept = depts.find(d => d.id === deptId)

    const newEmp: UserProfile = {
      id: 'emp-' + Math.random().toString(36).substr(2, 9),
      full_name: fullName.trim(),
      email: email.trim(),
      role: selectedRole,
      department_id: deptId,
      department_name: currentDept ? currentDept.name : 'Engineering',
      department_color: currentDept ? currentDept.color : '#6366F1',
      is_active: true,
      joined_date: joinDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      open_task_count: 0,
      completed_task_count: 0,
      kpi_score: 100.0,
      attendance_rate: 100.0
    }

    mockDb.saveEmployee(newEmp)

    // Add Audit Log
    mockDb.addAuditLog({
      action: 'created',
      entity_type: 'user',
      entity_id: newEmp.id,
      description: `${user?.email || 'User'} onboarding new employee "${newEmp.full_name}"`,
      actor: { name: user?.email?.split('@')[0] || 'User', initials: 'U', role: role || 'employee' }
    })

    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-500" /> Onboard Employee
          </h2>
          <button type="button" onClick={onClose} className="btn-icon"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-xs block mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input required className="input-field" placeholder="Jane Doe" value={fullName} onChange={e=>setFullName(e.target.value)} />
            </div>
            <div>
              <label className="label-xs block mb-1.5">Work Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input required className="input-field pl-9" placeholder="jane@ablefolks.com" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label-xs block mb-1.5">Role <span className="text-red-500">*</span></label>
              <select className="input-field" value={selectedRole} onChange={e=>setSelectedRole(e.target.value as Role)}>
                {Object.entries(ROLE_CONFIG).filter(([k]) => k !== 'super_admin').map(([v, c]) => (
                  <option key={v} value={v}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-xs block mb-1.5">Department</label>
              <select className="input-field" value={deptId} onChange={e=>setDeptId(e.target.value)}>
                <option value="eng">Engineering</option>
                <option value="hr">Human Resources</option>
                <option value="ops">Operations</option>
                <option value="fin">Finance</option>
                <option value="mkt">Marketing</option>
              </select>
            </div>
            <div>
              <label className="label-xs block mb-1.5">Office Location</label>
              <select className="input-field" value={location} onChange={e=>setLocation(e.target.value as OfficeLocation)}>
                {['Manjeri', 'Kozhikode', 'New Delhi', 'UAE', 'USA'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label-xs block mb-1.5">Joining Date</label>
              <input type="date" className="input-field" value={joinDate} onChange={e=>setJoinDate(e.target.value)} />
            </div>
          </div>

          <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/40">
            <label className="label-xs block mb-1 text-indigo-700">Temporary Password</label>
            <div className="flex gap-2">
              <input className="input-field font-mono text-xs py-1" value={tempPassword} readOnly />
              <button type="button" onClick={() => navigator.clipboard.writeText(tempPassword)} className="btn-secondary py-1 text-xs px-3 shrink-0">Copy</button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">The employee will be required to update credentials on initial login.</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" className="btn-primary">
            <UserPlus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </form>
    </div>
  )
}

export default function UsersPage() {
  const navigate = useNavigate()
  const { role } = useAuthStore()

  const [employees, setEmployees] = useState<UserProfile[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')
  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'inactive'>('all')
  const [showAdd, setShowAdd] = useState(false)

  const loadEmployees = () => {
    setEmployees(mockDb.getEmployees())
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const handleToggleActive = (emp: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = { ...emp, is_active: !emp.is_active }
    mockDb.saveEmployee(updated)
    mockDb.addAuditLog({
      action: 'updated',
      entity_type: 'user',
      entity_id: emp.id,
      description: `User status of "${emp.full_name}" set to ${updated.is_active ? 'Active' : 'Inactive'}`,
      actor: { name: 'User', initials: 'U', role: role || 'employee' }
    })
    loadEmployees()
  }

  const filtered = employees.filter(e => {
    const matchSearch = !search || e.full_name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || e.role === roleFilter
    const matchStatus = statusTab === 'all' || (statusTab === 'active' ? e.is_active : !e.is_active)
    return matchSearch && matchRole && matchStatus
  })

  return (
    <div className="space-y-5 animate-slide-up pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">{employees.filter(e => e.is_active).length} active · {employees.length} total</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="btn-secondary btn-sm"><Download className="w-4 h-4" /> Export CSV</button>
          <button onClick={() => setShowAdd(true)} className="btn-primary btn-sm">
            <UserPlus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Employees', value: employees.filter(e => e.is_active).length, icon: Power, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Dept Heads', value: employees.filter(e => e.role === 'dept_head').length, icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Avg KPI Score', value: employees.length ? `${(employees.reduce((a, e) => a + e.kpi_score, 0) / employees.length).toFixed(1)}` : '—', icon: Gauge, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Open Tasks', value: employees.reduce((a, e) => a + e.open_task_count, 0), icon: CheckSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg)}>
              <s.icon className={cn('w-5 h-5', s.color)} />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-gray-100 bg-gray-50">
          {/* Status tabs */}
          <div className="flex bg-gray-200 rounded-lg p-0.5">
            {(['all', 'active', 'inactive'] as const).map(t => (
              <button key={t} onClick={() => setStatusTab(t)}
                className={cn('px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all',
                  statusTab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                )}>
                {t}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input-field pl-9 py-1.5 text-sm" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <select className="input-field py-1.5 text-sm w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value as Role | '')}>
            <option value="">All Roles</option>
            {Object.entries(ROLE_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-500 text-xs">
                {['Employee', 'Role', 'Department', 'Status', 'KPI Score', 'Open Tasks', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="table-header-cell">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => {
                const rc = ROLE_CONFIG[emp.role]
                const kpiColor = emp.kpi_score > 75 ? 'text-emerald-600' : emp.kpi_score >= 50 ? 'text-amber-600' : 'text-red-600'
                return (
                  <tr
                    key={emp.id}
                    className="table-row cursor-pointer hover:bg-indigo-50/20"
                    onClick={() => navigate(`/users/${emp.id}`)}
                  >
                    <td className="table-data-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                          {emp.full_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{emp.full_name}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />{emp.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-data-cell">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', rc.bg, rc.text)}>
                        {rc.label}
                      </span>
                    </td>
                    <td className="table-data-cell">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: emp.department_color }} />
                        <span className="text-gray-700">{emp.department_name}</span>
                      </div>
                    </td>
                    <td className="table-data-cell">
                      <span className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit',
                        emp.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      )}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', emp.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400')} />
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-data-cell text-center">
                      <span className={cn('font-bold text-sm', kpiColor)}>{emp.kpi_score}%</span>
                    </td>
                    <td className="table-data-cell text-center">
                      <span className={cn('font-semibold', emp.open_task_count > 10 ? 'text-red-600' : 'text-gray-700')}>{emp.open_task_count}</span>
                    </td>
                    <td className="table-data-cell">
                      <div className="text-gray-700 font-mono text-xs">{new Date(emp.joined_date).toLocaleDateString()}</div>
                    </td>
                    <td className="table-data-cell" onClick={e=>e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/users/${emp.id}`)} className="btn-icon p-1.5" title="View profile"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={(e) => handleToggleActive(emp, e)} className={cn('p-1.5 rounded-lg transition-colors', emp.is_active ? 'text-red-400 hover:bg-red-50 hover:text-red-600' : 'text-emerald-500 hover:bg-emerald-50')} title={emp.is_active ? 'Deactivate' : 'Activate'}>
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          <span className="text-sm text-gray-500">Showing <strong>{filtered.length}</strong> of <strong>{employees.length}</strong></span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40" disabled>Previous</button>
            <button className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded-lg">1</button>
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40" disabled>Next</button>
          </div>
        </div>
      </div>

      {showAdd && <AddEmployeeModal onClose={() => setShowAdd(false)} onSave={loadEmployees} />}
    </div>
  )
}
