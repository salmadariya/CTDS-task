import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/store'
import { mockDb } from '@/lib/mockDb'
import {
  Building2, Plus, Users, ClipboardList, Target, Pencil, X, Check,
  AlertTriangle, Power, ChevronRight, Loader2
} from 'lucide-react'
import type { Department } from '@/types/user.types'

const PRESET_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#3B82F6'  // Blue
]

export default function DepartmentsPage() {
  const { role, user } = useAuthStore()
  const navigate = useNavigate()
  
  const [depts, setDepts] = useState<Department[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  
  // Modal states
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#6366F1')
  const [parentId, setParentId] = useState('')
  const [headId, setHeadId] = useState('')
  const [isActive, setIsActive] = useState(true)
  
  const [employees, setEmployees] = useState<any[]>([])

  const canManage = ['super_admin', 'admin', 'operation_manager', 'hr_manager'].includes(role || '')

  const loadData = () => {
    setDepts(mockDb.getDepartments())
    setEmployees(mockDb.getEmployees())
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingDept(null)
    setName('')
    setDescription('')
    setColor(PRESET_COLORS[0])
    setParentId('')
    setHeadId('')
    setIsActive(true)
    setShowModal(true)
  }

  const handleOpenEdit = (dept: Department, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingDept(dept)
    setName(dept.name)
    setDescription(dept.description || '')
    setColor(dept.color)
    setParentId(dept.parent_id || '')
    setHeadId(dept.head_id || '')
    setIsActive(dept.is_active)
    setShowModal(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const selectedHead = employees.find(emp => emp.id === headId)
    const headName = selectedHead ? selectedHead.full_name : ''

    const parentDept = depts.find(d => d.id === parentId)
    const parentName = parentDept ? parentDept.name : ''

    const newDept: Department = {
      id: editingDept ? editingDept.id : 'dept-' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      description: description.trim(),
      parent_id: parentId || undefined,
      parent_name: parentName || undefined,
      head_id: headId || undefined,
      head_name: headName || undefined,
      color,
      is_active: isActive,
      employee_count: editingDept ? editingDept.employee_count : 0,
      open_task_count: editingDept ? editingDept.open_task_count : 0,
      kpi_avg: editingDept ? editingDept.kpi_avg : 0,
      sub_dept_count: editingDept ? editingDept.sub_dept_count : 0,
      created_at: editingDept ? editingDept.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    mockDb.saveDepartment(newDept)
    
    // Add audit log
    mockDb.addAuditLog({
      action: editingDept ? 'updated' : 'created',
      entity_type: 'department',
      entity_id: newDept.id,
      description: `${user?.email || 'User'} ${editingDept ? 'updated' : 'created'} department "${newDept.name}"`,
      actor: { name: user?.email?.split('@')[0] || 'User', initials: 'U', role: role || 'employee' }
    })

    setShowModal(false)
    loadData()
  }

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage Ablefolks Education corporate organization structure and performance targets.
          </p>
        </div>
        {canManage && (
          <button onClick={handleOpenCreate} className="btn-primary btn-sm">
            <Plus className="w-4 h-4" /> Create Department
          </button>
        )}
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {depts.map(d => (
          <div
            key={d.id}
            onClick={() => navigate(`/departments/${d.id}`)}
            className={cn(
              "relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md cursor-pointer transition-all duration-200 group",
              !d.is_active && "opacity-60"
            )}
          >
            {/* Color strip top */}
            <div className="h-2 w-full" style={{ backgroundColor: d.color }} />

            <div className="p-5 space-y-4">
              {/* Top Row: Name + Edit */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5 truncate">
                    {d.name}
                  </h3>
                  {d.parent_name && (
                    <div className="flex items-center text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wide">
                      Sub-Dept of <ChevronRight className="w-3 h-3 mx-0.5 inline" /> {d.parent_name}
                    </div>
                  )}
                </div>
                
                {canManage && (
                  <button
                    onClick={(e) => handleOpenEdit(d, e)}
                    className="p-1 rounded-lg border border-gray-100 hover:bg-gray-50 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 line-clamp-2 h-8 leading-relaxed">
                {d.description || <span className="italic text-gray-300">No description provided.</span>}
              </p>

              {/* Head of Dept */}
              <div className="flex items-center gap-2 border-t border-b border-gray-50 py-2.5">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                  {d.head_name ? d.head_name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase() : '??'}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Dept Head</div>
                  <div className="text-xs font-semibold text-gray-700 truncate">{d.head_name || 'Not assigned'}</div>
                </div>
                
                <span className={cn(
                  'ml-auto px-2 py-0.5 rounded-full text-[9px] font-semibold border flex items-center gap-1',
                  d.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                )}>
                  <Power className="w-2.5 h-2.5" />
                  {d.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="flex items-center justify-center gap-1 text-gray-400 mb-0.5">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-[9px] uppercase tracking-wider font-semibold">Staff</span>
                  </div>
                  <div className="font-bold text-gray-700">{d.employee_count}</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-gray-400 mb-0.5">
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span className="text-[9px] uppercase tracking-wider font-semibold">Tasks</span>
                  </div>
                  <div className="font-bold text-gray-700">{d.open_task_count}</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-gray-400 mb-0.5">
                    <Target className="w-3.5 h-3.5" />
                    <span className="text-[9px] uppercase tracking-wider font-semibold">KPI Avg</span>
                  </div>
                  <div className={cn(
                    'font-bold',
                    d.kpi_avg >= 85 ? 'text-emerald-600' : d.kpi_avg >= 70 ? 'text-amber-600' : 'text-red-500'
                  )}>{d.kpi_avg ? d.kpi_avg.toFixed(1) : '—'}</div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                {editingDept ? 'Edit Department' : 'Create New Department'}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="btn-icon"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="label-xs block mb-1.5">Department Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quality Assurance"
                  className="input-field"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="label-xs block mb-1.5">Description</label>
                <textarea
                  className="input-field resize-none"
                  placeholder="Add specific context, scope, or targets..."
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              {/* Color swatches */}
              <div>
                <label className="label-xs block mb-2">Department Accent Color</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center relative transition-transform hover:scale-105"
                      style={{ backgroundColor: c }}
                    >
                      {color === c && (
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parent Department */}
              <div>
                <label className="label-xs block mb-1.5">Parent Department</label>
                <select className="input-field" value={parentId} onChange={e => setParentId(e.target.value)}>
                  <option value="">No Parent (Root Department)</option>
                  {depts.filter(d => d.id !== editingDept?.id).map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Department Head */}
              <div>
                <label className="label-xs block mb-1.5">Department Head</label>
                <select className="input-field" value={headId} onChange={e => setHeadId(e.target.value)}>
                  <option value="">Choose Head...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.role.replace('_', ' ')})</option>
                  ))}
                </select>
              </div>

              {/* Status toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-xs font-semibold text-gray-800">Department Status</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Inactive departments hide from default employee lookups.</div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="w-4.5 h-4.5 rounded accent-indigo-500"
                  />
                  <span className="text-xs font-bold text-gray-600">{isActive ? 'Active' : 'Inactive'}</span>
                </label>
              </div>

            </div>

            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Department
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  )
}
