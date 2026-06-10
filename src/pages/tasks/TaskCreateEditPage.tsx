import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/store'
import { mockDb } from '@/lib/mockDb'
import {
  ArrowLeft, Plus, AlertCircle, Calendar, Building2, Repeat, Target,
  FileText, Paperclip, Trash2, Shield, Eye, HelpCircle, Save, X
} from 'lucide-react'
import type { Task, TaskPriority, TaskType, TaskStatus, TaskAssignee, TaskAttachment } from '@/types/task.types'

export default function TaskCreateEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { role, user } = useAuthStore()
  
  const isEditMode = !!id

  // Form Fields State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<TaskType>('admin')
  const [priority, setPriority] = useState<TaskPriority>('p2')
  const [deptId, setDeptId] = useState('eng')
  const [dueDate, setDueDate] = useState('')
  const [perfWeight, setPerfWeight] = useState(10)
  const [isRecurring, setIsRecurring] = useState(false)
  
  // Recurrence builder states
  const [rruleFreq, setRruleFreq] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY')
  const [rruleInterval, setRruleInterval] = useState(1)
  const [rruleDays, setRruleDays] = useState<string[]>([]) // MO, TU, etc.
  
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([])
  const [parentTaskId, setParentTaskId] = useState('')
  const [attachments, setAttachments] = useState<any[]>([])

  // Options loaded from mock DB
  const [employees, setEmployees] = useState<any[]>([])
  const [allTasks, setAllTasks] = useState<any[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load employee and parent task list
  useEffect(() => {
    setEmployees(mockDb.getEmployees())
    setAllTasks(mockDb.getTasks().filter(t => t.id !== id)) // Prevent self-parenting
  }, [id])

  // Load existing task if in Edit Mode
  useEffect(() => {
    if (isEditMode && id) {
      const task = mockDb.getTaskById(id)
      if (task) {
        setTitle(task.title)
        setDescription(task.description || '')
        setType(task.type)
        setPriority(task.priority)
        setDeptId(task.department_id)
        setDueDate(task.due_date || '')
        setPerfWeight(task.perf_weight)
        setIsRecurring(task.is_recurring)
        setSelectedAssigneeIds(task.assignees.map(a => a.id))
        setParentTaskId(task.parent_task_id || '')
        setAttachments(mockDb.getAttachments(id))
        
        // Parse simple RRULE if exists
        if (task.recurrence_rule) {
          const parts = task.recurrence_rule.split(';')
          parts.forEach(p => {
            if (p.startsWith('FREQ=')) setRruleFreq(p.replace('FREQ=', '') as any)
            if (p.startsWith('INTERVAL=')) setRruleInterval(parseInt(p.replace('INTERVAL=', '')))
            if (p.startsWith('BYDAY=')) setRruleDays(p.replace('BYDAY=', '').split(','))
          })
        }
      } else {
        navigate('/tasks')
      }
    }
  }, [isEditMode, id])

  const handleDayToggle = (day: string) => {
    setRruleDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
    setIsDirty(true)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Task title is required.'
    else if (title.length > 160) newErrors.title = 'Title must be under 160 characters.'
    
    if (description.length > 5000) newErrors.description = 'Description must be under 5000 characters.'
    
    if (!dueDate) newErrors.dueDate = 'Due date is required.'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = (e: React.FormEvent, statusOverride?: TaskStatus) => {
    e.preventDefault()
    if (!validateForm()) return

    const selectedAssignees: TaskAssignee[] = employees
      .filter(emp => selectedAssigneeIds.includes(emp.id))
      .map(emp => ({
        id: emp.id,
        name: emp.full_name,
        email: emp.email,
        role: emp.role
      }))

    const depts = mockDb.getDepartments()
    const selectedDept = depts.find(d => d.id === deptId)
    const deptName = selectedDept ? selectedDept.name : 'Engineering'

    // Compile RRULE if recurring
    let rrule: string | undefined = undefined
    if (isRecurring) {
      rrule = `FREQ=${rruleFreq};INTERVAL=${rruleInterval}`
      if (rruleDays.length > 0 && rruleFreq === 'WEEKLY') {
        rrule += `;BYDAY=${rruleDays.join(',')}`
      }
    }

    const currentTask = isEditMode ? mockDb.getTaskById(id!) : null

    const taskData: Task = {
      id: isEditMode && id ? id : 'tf-' + Math.random().toString(36).substr(2, 9),
      task_id: isEditMode && currentTask ? currentTask.task_id : 'TF-' + String(mockDb.getTasks().length + 51).padStart(4, '0'),
      title: title.trim(),
      description: description.trim(),
      status: statusOverride ? statusOverride : (isEditMode && currentTask ? currentTask.status : 'todo'),
      priority,
      type,
      department_id: deptId,
      department_name: deptName,
      assignees: selectedAssignees,
      due_date: dueDate,
      perf_weight: perfWeight,
      is_recurring: isRecurring,
      recurrence_rule: rrule,
      parent_task_id: parentTaskId || undefined,
      attachment_count: attachments.length,
      comment_count: isEditMode && currentTask ? currentTask.comment_count : 0,
      created_by: isEditMode && currentTask ? currentTask.created_by : {
        id: 'user',
        name: user?.email?.split('@')[0] || 'User',
        email: user?.email || '',
        role: role || 'employee'
      },
      created_at: isEditMode && currentTask ? currentTask.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sla_deadline: priority === 'p0' ? new Date(Date.now() + 24 * 3600 * 1000).toISOString() : undefined // 24hr SLA for P0
    }

    mockDb.saveTask(taskData)

    // Log to Audit Log
    mockDb.addAuditLog({
      action: isEditMode ? 'updated' : 'created',
      entity_type: 'task',
      entity_id: taskData.task_id,
      description: `${user?.email || 'User'} ${isEditMode ? 'updated' : 'created'} task "${taskData.title}"`,
      actor: { name: user?.email?.split('@')[0] || 'User', initials: 'U', role: role || 'employee' }
    })

    setIsDirty(false)
    navigate(`/tasks/${taskData.id}`)
  }

  const handleCancel = () => {
    if (isDirty && !confirm('You have unsaved changes. Are you sure you want to discard them?')) {
      return
    }
    navigate(-1)
  }

  const handleAddMockFile = () => {
    const newFile = {
      id: 'att-mock-' + Math.random().toString(36).substr(2, 9),
      name: 'mock_upload_asset.png',
      size: 154200,
      type: 'image/png'
    }
    setAttachments(prev => [...prev, newFile])
    setIsDirty(true)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={handleCancel} className="btn-icon p-1.5">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="page-title">{isEditMode ? 'Edit Task' : 'Create New Task'}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {isEditMode ? 'Modify specific details and configuration parameters of the task.' : 'Specify configurations, departments, assignees, and recurrence values.'}
          </p>
        </div>
      </div>

      <form onSubmit={e => handleSave(e)} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* P0 Alert Banner */}
        {priority === 'p0' && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border-b border-red-200">
            <AlertCircle className="w-5.5 h-5.5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-red-800">Critical Priority Status (P0) Selected</div>
              <div className="text-xs text-red-600 mt-0.5">
                P0 tasks represent highest urgency. Immediate platform notifications and dashboard warning flashes will trigger for all assignees. A 24-hour SLA target will automatically attach.
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          
          {/* Title input */}
          <div className="space-y-1">
            <label className="label-xs flex items-center justify-between text-gray-700 font-semibold">
              <span>Task Title <span className="text-red-500">*</span></span>
              <span className={cn('text-[10px] font-mono', title.length > 140 ? 'text-amber-500' : 'text-gray-400')}>
                {title.length} / 160
              </span>
            </label>
            <input
              type="text"
              className={cn('input-field py-2.5 font-medium', errors.title && 'border-red-400 focus:ring-red-500/20')}
              placeholder="Enter task summary (e.g. Build payment integration with Stripe)"
              value={title}
              onChange={e => { setTitle(e.target.value); setIsDirty(true) }}
              maxLength={160}
            />
            {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title}</p>}
          </div>

          {/* Description input */}
          <div className="space-y-1">
            <label className="label-xs flex items-center justify-between text-gray-700 font-semibold">
              <span>Description / Context</span>
              <span className={cn('text-[10px] font-mono', description.length > 4500 ? 'text-amber-500' : 'text-gray-400')}>
                {description.length} / 5000
              </span>
            </label>
            <textarea
              className={cn('input-field min-h-[140px] p-3 resize-y', errors.description && 'border-red-400')}
              placeholder="Add comprehensive descriptions, step-by-step checklist, logs, context, or acceptance criteria..."
              value={description}
              onChange={e => { setDescription(e.target.value); setIsDirty(true) }}
              maxLength={5000}
            />
            {errors.description && <p className="text-xs text-red-500 font-medium">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Task Type */}
            <div className="space-y-1.5">
              <label className="label-xs text-gray-700 font-semibold">Task Classification</label>
              <select
                className="input-field py-2.5"
                value={type}
                onChange={e => { setType(e.target.value as TaskType); setIsDirty(true) }}
              >
                <option value="admin">Admin Task</option>
                <option value="client">Client Project Task</option>
                <option value="training">Training / Intern L&D</option>
                <option value="research">R&D / Technical Research</option>
                <option value="operations">Daily Business Operations</option>
                <option value="intern_log">Intern Log Entry</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="label-xs text-gray-700 font-semibold">Priority Designation</label>
              <select
                className="input-field py-2.5 font-medium"
                value={priority}
                onChange={e => { setPriority(e.target.value as TaskPriority); setIsDirty(true) }}
              >
                <option value="p0" className="text-red-600 font-semibold">P0 — Critical Priority</option>
                <option value="p1" className="text-amber-600">P1 — High Priority</option>
                <option value="p2" className="text-indigo-600">P2 — Medium Priority</option>
                <option value="p3" className="text-gray-600">P3 — Low Priority</option>
              </select>
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label className="label-xs text-gray-700 font-semibold">Department Scope</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  className="input-field pl-10 py-2.5"
                  value={deptId}
                  onChange={e => { setDeptId(e.target.value); setIsDirty(true) }}
                >
                  <option value="eng">Engineering</option>
                  <option value="hr">Human Resources</option>
                  <option value="ops">Operations</option>
                  <option value="fin">Finance</option>
                  <option value="mkt">Marketing</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="label-xs text-gray-700 font-semibold flex items-center gap-1">
                <span>Due Date Target <span className="text-red-500">*</span></span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  className={cn('input-field pl-10 py-2.5', errors.dueDate && 'border-red-400')}
                  value={dueDate}
                  onChange={e => { setDueDate(e.target.value); setIsDirty(true) }}
                />
              </div>
              {errors.dueDate && <p className="text-xs text-red-500 font-medium">{errors.dueDate}</p>}
            </div>

          </div>

          {/* Performance Weight Range Slider */}
          <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="label-xs text-gray-700 font-semibold flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-500" /> KPI Performance Impact (perf_weight)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={perfWeight}
                  onChange={e => {
                    const v = Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                    setPerfWeight(v)
                    setIsDirty(true)
                  }}
                  className="input-field w-16 text-center py-1 font-semibold text-xs"
                />
                <span className="text-xs text-gray-400 font-medium">pts</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={100}
                value={perfWeight}
                onChange={e => { setPerfWeight(parseInt(e.target.value)); setIsDirty(true) }}
                className="flex-1 accent-indigo-500"
              />
              <span className="text-xs text-gray-400 w-24 text-right">
                {perfWeight <= 10 ? 'Low Impact (10%)' : perfWeight <= 30 ? 'Medium (30%)' : 'High Impact (50%+)'}
              </span>
            </div>
          </div>

          {/* Assignees Selector */}
          <div className="space-y-2">
            <label className="label-xs text-gray-700 font-semibold block">Assign Tasks to Employees</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[160px] overflow-y-auto pr-1 border border-gray-100 rounded-xl p-3 bg-gray-50/20">
              {employees.map(emp => (
                <label
                  key={emp.id}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all text-xs font-semibold',
                    selectedAssigneeIds.includes(emp.id)
                      ? 'border-indigo-200 bg-indigo-50/50 text-indigo-900'
                      : 'border-gray-100 bg-white text-gray-600'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedAssigneeIds.includes(emp.id)}
                    onChange={() => {
                      setSelectedAssigneeIds(prev =>
                        prev.includes(emp.id) ? prev.filter(x => x !== emp.id) : [...prev, emp.id]
                      )
                      setIsDirty(true)
                    }}
                    className="w-3.5 h-3.5 rounded accent-indigo-500"
                  />
                  <span>{emp.full_name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Parent Task Selector */}
          <div className="space-y-1.5">
            <label className="label-xs text-gray-700 font-semibold block">Parent Task Link (If subtask)</label>
            <select
              className="input-field py-2.5 text-sm"
              value={parentTaskId}
              onChange={e => { setParentTaskId(e.target.value); setIsDirty(true) }}
            >
              <option value="">No Parent (Root Task)</option>
              {allTasks.map(t => (
                <option key={t.id} value={t.id}>{t.task_id} — {t.title}</option>
              ))}
            </select>
          </div>

          {/* Recurrence Rule builder */}
          <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={e => { setIsRecurring(e.target.checked); setIsDirty(true) }}
                  className="w-4.5 h-4.5 rounded accent-indigo-500"
                />
                <span className="text-sm text-gray-800 font-bold flex items-center gap-1.5">
                  <Repeat className="w-4 h-4 text-indigo-500 animate-spin-slow" /> Recurring Schedule (RRULE)
                </span>
              </label>
              <span className="text-xs text-gray-400">Repeats automatically</span>
            </div>

            {isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100/60 animate-slide-up">
                <div className="space-y-1.5">
                  <label className="label-xs text-gray-500 font-medium">Frequency</label>
                  <select
                    className="input-field py-1.5 text-xs"
                    value={rruleFreq}
                    onChange={e => { setRruleFreq(e.target.value as any); setIsDirty(true) }}
                  >
                    <option value="DAILY">Daily repeat</option>
                    <option value="WEEKLY">Weekly schedule</option>
                    <option value="MONTHLY">Monthly repeat</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="label-xs text-gray-500 font-medium">Repeat Interval</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Every</span>
                    <input
                      type="number"
                      min={1}
                      className="input-field text-center py-1 w-16 text-xs font-semibold"
                      value={rruleInterval}
                      onChange={e => { setRruleInterval(parseInt(e.target.value) || 1); setIsDirty(true) }}
                    />
                    <span className="text-xs text-gray-400">
                      {rruleFreq === 'DAILY' ? 'days' : rruleFreq === 'WEEKLY' ? 'weeks' : 'months'}
                    </span>
                  </div>
                </div>

                {rruleFreq === 'WEEKLY' && (
                  <div className="space-y-1.5 md:col-span-3">
                    <label className="label-xs text-gray-500 font-medium">On Days of the Week</label>
                    <div className="flex flex-wrap gap-1">
                      {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={cn(
                            'px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border',
                            rruleDays.includes(day)
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                          )}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Attachments Upload mockup */}
          <div className="space-y-2">
            <label className="label-xs text-gray-700 font-semibold block">Upload Supporting Files (Max 5 files, 10MB each)</label>
            <div
              onClick={handleAddMockFile}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-indigo-400 hover:bg-indigo-50/10 transition-all text-center cursor-pointer"
            >
              <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-700">Click to select files, or drag files here</div>
              <p className="text-xs text-gray-400 mt-1">Supports PDF, XLSX, ZIP, PNG, and JPEG formats.</p>
            </div>

            {attachments.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center justify-between border border-gray-100 rounded-lg p-2 bg-gray-50 text-xs">
                    <span className="truncate font-medium flex items-center gap-1.5 text-gray-700">
                      <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                      className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Action Panel Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button type="button" onClick={handleCancel} className="btn-ghost">
            Cancel
          </button>
          
          <div className="flex items-center gap-3">
            {!isEditMode && (
              <button
                type="button"
                onClick={e => handleSave(e, 'backlog')}
                className="btn-secondary"
              >
                Save as Draft
              </button>
            )}
            <button type="submit" className="btn-primary">
              <Save className="w-4 h-4" />
              {isEditMode ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </div>

      </form>
    </div>
  )
}
