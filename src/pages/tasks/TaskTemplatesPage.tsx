import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/store'
import { mockDb } from '@/lib/mockDb'
import {
  LayoutTemplate, Plus, ClipboardList, Target, Pencil, Trash2, X, Check, Save, Info
} from 'lucide-react'
import type { TaskPriority, TaskType } from '@/types/task.types'

export default function TaskTemplatesPage() {
  const { role, user } = useAuthStore()
  const [templates, setTemplates] = useState<any[]>([])
  
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null)
  
  // Modal Fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<TaskType>('admin')
  const [priority, setPriority] = useState<TaskPriority>('p2')
  const [perfWeight, setPerfWeight] = useState(10)
  const [deptName, setDeptName] = useState('Engineering')
  const [subtasks, setSubtasks] = useState<string[]>([])
  const [newSubtask, setNewSubtask] = useState('')

  const canManage = ['super_admin', 'admin', 'operation_manager'].includes(role || '')

  const loadData = () => {
    setTemplates(mockDb.getTemplates())
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingTemplate(null)
    setTitle('')
    setDescription('')
    setType('admin')
    setPriority('p2')
    setPerfWeight(10)
    setDeptName('Engineering')
    setSubtasks([])
    setShowModal(true)
  }

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtask.trim()) return
    setSubtasks(prev => [...prev, newSubtask.trim()])
    setNewSubtask('')
  }

  const handleRemoveSubtask = (idx: number) => {
    setSubtasks(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const temp = {
      id: editingTemplate ? editingTemplate.id : 'temp-' + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      perf_weight: perfWeight,
      department_name: deptName,
      subtask_titles: subtasks
    }

    mockDb.saveTemplate(temp)
    
    // Audit Log
    mockDb.addAuditLog({
      action: editingTemplate ? 'updated' : 'created',
      entity_type: 'task',
      entity_id: temp.id,
      description: `User ${editingTemplate ? 'updated' : 'created'} task template "${temp.title}"`,
      actor: { name: user?.email?.split('@')[0] || 'User', initials: 'U', role: role || 'employee' }
    })

    setShowModal(false)
    loadData()
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this template blueprint?')) {
      mockDb.deleteTemplate(id)
      loadData()
    }
  }

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Task Templates</h1>
          <p className="text-xs text-gray-500 mt-1">
            Replicate consistent recurring workflows using standardized blueprints.
          </p>
        </div>
        {canManage && (
          <button onClick={handleOpenCreate} className="btn-primary btn-sm">
            <Plus className="w-4 h-4" /> Add Template
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map(t => (
          <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 relative group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors">
                    {t.title}
                  </h3>
                  <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{t.department_name} Scope</div>
                </div>
                {canManage && (
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 rounded-lg border border-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                {t.description || <span className="italic text-gray-300">No template context provided.</span>}
              </p>

              {/* Subtasks checklists indicator */}
              {t.subtask_titles && t.subtask_titles.length > 0 && (
                <div className="space-y-1.5 bg-gray-50/50 rounded-xl p-3 border border-gray-100/50">
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Subtask Blueprints ({t.subtask_titles.length})</div>
                  <div className="space-y-1">
                    {t.subtask_titles.map((title: string, sIdx: number) => (
                      <div key={sIdx} className="text-xs text-gray-600 flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-xs">
              <div className="flex items-center gap-1.5 text-gray-400 font-semibold uppercase tracking-wider">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>Weight: <span className="text-gray-700 font-bold font-mono">{t.perf_weight} pts</span></span>
              </div>

              <span className="bg-indigo-50 border border-indigo-100 text-[10px] text-indigo-600 px-2 py-0.5 rounded-full capitalize font-semibold">
                {t.type}
              </span>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-2 bg-white border border-gray-100 rounded-2xl p-16 text-center text-gray-400 text-sm">
            No standardized task blueprints compiled yet.
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-indigo-500" />
                Create Task Blueprint
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="btn-icon"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="label-xs block mb-1.5">Blueprint Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Status Sync compilation"
                  className="input-field"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="label-xs block mb-1.5">Template Description</label>
                <textarea
                  className="input-field resize-none"
                  placeholder="Include checklists objectives, resources..."
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-xs block mb-1.5">Default Weight</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="input-field"
                    value={perfWeight}
                    onChange={e => setPerfWeight(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="label-xs block mb-1.5">Target Scope</label>
                  <select className="input-field" value={deptName} onChange={e => setDeptName(e.target.value)}>
                    <option>Engineering</option>
                    <option>Human Resources</option>
                    <option>Operations</option>
                    <option>Finance</option>
                    <option>Marketing</option>
                  </select>
                </div>
              </div>

              {/* Subtasks checklists inputs */}
              <div className="space-y-2.5 pt-2 border-t border-gray-50">
                <label className="label-xs block text-gray-700">Subtask Blueprints ({subtasks.length})</label>
                
                {subtasks.length > 0 && (
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {subtasks.map((st, sIdx) => (
                      <div key={sIdx} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs">
                        <span className="truncate font-medium flex items-center gap-1 text-gray-700">
                          <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          {st}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtask(sIdx)}
                          className="p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-field py-1.5 text-xs"
                    placeholder="Enter subtask heading..."
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                  />
                  <button type="button" onClick={handleAddSubtask} className="btn-primary text-xs py-1.5 px-3 shrink-0">Add</button>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Template
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  )
}
