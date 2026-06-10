import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/store'
import { mockDb } from '@/lib/mockDb'
import {
  Clock, Building2, Paperclip, MessageSquare,
  CheckCircle2, Circle, Loader2, Ban, Eye, Pencil, Trash2,
  Target, Repeat, Send, Plus, X, Upload, Calendar, Check,
  ChevronDown, ArrowLeft, FileText
} from 'lucide-react'
import type { Task, TaskStatus, TaskPriority, TaskType, TaskComment, TaskAttachment } from '@/types/task.types'
import { TASK_STATUS_TRANSITIONS, TASK_STATUS_LABELS, TASK_TYPE_LABELS } from '@/types/task.types'

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ElementType; bg: string; text: string; dot: string }> = {
  backlog: { label: 'Backlog', icon: Circle, bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  todo: { label: 'To-Do', icon: Circle, bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  in_progress: { label: 'In Progress', icon: Loader2, bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  in_review: { label: 'In Review', icon: Eye, bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
  done: { label: 'Done', icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  blocked: { label: 'Blocked', icon: Ban, bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  archived: { label: 'Archived', icon: Trash2, bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-500' }
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; bar: string; badge: string; text: string; dot: string }> = {
  p0: { label: 'P0 — Critical', bar: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200', text: 'text-red-600', dot: 'bg-red-500' },
  p1: { label: 'P1 — High', bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-600', dot: 'bg-amber-500' },
  p2: { label: 'P2 — Medium', bar: 'bg-indigo-400', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-600', dot: 'bg-indigo-500' },
  p3: { label: 'P3 — Low', bar: 'bg-gray-300', badge: 'bg-gray-100 text-gray-600 border-gray-200', text: 'text-gray-500', dot: 'bg-gray-400' }
}

const TYPE_COLORS: Record<TaskType, string> = {
  admin: 'bg-slate-100 text-slate-700',
  client: 'bg-blue-50 text-blue-700',
  training: 'bg-teal-50 text-teal-700',
  research: 'bg-violet-50 text-violet-700',
  operations: 'bg-orange-50 text-orange-700',
  intern_log: 'bg-pink-50 text-pink-700',
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { role, user } = useAuthStore()
  
  const [task, setTask] = useState<Task | null>(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  
  // Comments
  const [comments, setComments] = useState<TaskComment[]>([])
  const [newComment, setNewComment] = useState('')

  // Subtasks
  const [subtasks, setSubtasks] = useState<{ id: string; parent_id: string; title: string; is_completed: boolean }[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  // Attachments
  const [attachments, setAttachments] = useState<TaskAttachment[]>([])
  
  // Layout states
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  
  // SLA
  const [slaCountdown, setSlaCountdown] = useState('')

  const loadTaskData = () => {
    if (!id) return
    const foundTask = mockDb.getTaskById(id)
    if (foundTask) {
      if (role === 'employee' && !foundTask.assignees.some(a => a.email === user?.email)) {
        navigate('/unauthorized')
        return
      }
      setTask(foundTask)
      setTempTitle(foundTask.title)
      setDescription(foundTask.description || '')
      setComments(mockDb.getComments(id))
      setAttachments(mockDb.getAttachments(id))
      setSubtasks(mockDb.getSubtasksByParent(id))
    } else {
      navigate('/tasks')
    }
  }

  useEffect(() => {
    loadTaskData()
  }, [id])

  // SLA countdown timer
  useEffect(() => {
    if (!task?.sla_deadline) return
    const interval = setInterval(() => {
      const diff = new Date(task.sla_deadline!).getTime() - new Date().getTime()
      if (diff <= 0) {
        setSlaCountdown('SLA BREACHED')
        clearInterval(interval)
      } else {
        const hrs = Math.floor(diff / 3600000)
        const mins = Math.floor((diff % 3600000) / 60000)
        setSlaCountdown(`${hrs}h ${mins}m left`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [task?.sla_deadline])

  if (!task) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  const handleSaveTitle = () => {
    if (!tempTitle.trim() || tempTitle.length > 160) return
    const updated = { ...task, title: tempTitle }
    mockDb.saveTask(updated)
    setTask(updated)
    setIsEditingTitle(false)
    mockDb.addAuditLog({
      action: 'updated',
      entity_type: 'task',
      entity_id: task.task_id,
      description: `${user?.email || 'User'} renamed task to "${tempTitle}"`,
      actor: { name: user?.email?.split('@')[0] || 'User', initials: 'U', role: role || 'employee' }
    })
  }

  const handleSaveDescription = () => {
    const updated = { ...task, description }
    mockDb.saveTask(updated)
    setTask(updated)
    setIsEditingDesc(false)
    mockDb.addAuditLog({
      action: 'updated',
      entity_type: 'task',
      entity_id: task.task_id,
      description: `${user?.email || 'User'} updated description`,
      actor: { name: user?.email?.split('@')[0] || 'User', initials: 'U', role: role || 'employee' }
    })
  }

  const handleStatusChange = (newStatus: TaskStatus) => {
    const updated = { ...task, status: newStatus }
    mockDb.saveTask(updated)
    setTask(updated)
    setShowStatusDropdown(false)
    
    // Audit Log
    mockDb.addAuditLog({
      action: 'status_changed',
      entity_type: 'task',
      entity_id: task.task_id,
      description: `${user?.email || 'User'} changed status to ${TASK_STATUS_LABELS[newStatus]}`,
      actor: { name: user?.email?.split('@')[0] || 'User', initials: 'U', role: role || 'employee' },
      diff: { old_val: task.status, new_val: newStatus }
    })

    // Reload
    loadTaskData()
  }

  const handlePriorityChange = (newPriority: TaskPriority) => {
    const updated = { ...task, priority: newPriority }
    mockDb.saveTask(updated)
    setTask(updated)
    mockDb.addAuditLog({
      action: 'updated',
      entity_type: 'task',
      entity_id: task.task_id,
      description: `${user?.email || 'User'} set priority to ${newPriority.toUpperCase()}`,
      actor: { name: user?.email?.split('@')[0] || 'User', initials: 'U', role: role || 'employee' }
    })
  }

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return
    const newSub = {
      id: 'sub-' + Math.random().toString(36).substr(2, 9),
      parent_id: task.id,
      title: newSubtaskTitle.trim(),
      is_completed: false
    }
    mockDb.saveSubtask(newSub)
    setSubtasks(prev => [...prev, newSub])
    setNewSubtaskTitle('')
    
    // Update subtask ids list in task
    const updatedTask = { ...task, subtask_ids: [...(task.subtask_ids || []), newSub.id] }
    mockDb.saveTask(updatedTask)
    setTask(updatedTask)
  }

  const handleToggleSubtask = (subId: string, completed: boolean) => {
    const target = subtasks.find(s => s.id === subId)
    if (!target) return
    const updatedSub = { ...target, is_completed: completed }
    mockDb.saveSubtask(updatedSub)
    setSubtasks(prev => prev.map(s => s.id === subId ? updatedSub : s))
    
    mockDb.addAuditLog({
      action: 'updated',
      entity_type: 'task',
      entity_id: task.task_id,
      description: `${user?.email || 'User'} marked subtask "${target.title}" as ${completed ? 'completed' : 'incomplete'}`,
      actor: { name: user?.email?.split('@')[0] || 'User', initials: 'U', role: role || 'employee' }
    })
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    const comment: TaskComment = {
      id: 'c-' + Math.random().toString(36).substr(2, 9),
      text: newComment.trim(),
      author: {
        id: 'user',
        name: user?.email?.split('@')[0] || 'CurrentUser',
        email: user?.email || '',
        role: role || 'employee'
      },
      created_at: new Date().toISOString()
    }
    mockDb.addComment(task.id, comment)
    setComments(prev => [...prev, comment])
    setNewComment('')

    // Update count in task
    const updatedTask = { ...task, comment_count: (task.comment_count || 0) + 1 }
    mockDb.saveTask(updatedTask)
    setTask(updatedTask)
  }

  const handleAddAttachment = () => {
    const names = ['spec_sheet.pdf', 'redesign_draft.xlsx', 'design_assets.zip', 'user_flow.png']
    const randomName = names[Math.floor(Math.random() * names.length)]
    const newAtt: TaskAttachment = {
      id: 'att-' + Math.random().toString(36).substr(2, 9),
      name: randomName,
      size: Math.floor(Math.random() * 5000000) + 100000,
      type: randomName.endsWith('.pdf') ? 'application/pdf' : 'image/png',
      url: '#',
      uploaded_by: user?.email?.split('@')[0] || 'User',
      uploaded_at: new Date().toISOString()
    }
    mockDb.addAttachment(task.id, newAtt)
    setAttachments(prev => [...prev, newAtt])

    // Update count
    const updatedTask = { ...task, attachment_count: (task.attachment_count || 0) + 1 }
    mockDb.saveTask(updatedTask)
    setTask(updatedTask)
  }

  const handleDeleteTask = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      mockDb.deleteTask(task.id)
      mockDb.addAuditLog({
        action: 'deleted',
        entity_type: 'task',
        entity_id: task.task_id,
        description: `${user?.email || 'User'} deleted task "${task.title}"`,
        actor: { name: user?.email?.split('@')[0] || 'User', initials: 'U', role: role || 'employee' }
      })
      navigate('/tasks')
    }
  }

  // Get available next status transitions
  const allowedTransitions = TASK_STATUS_TRANSITIONS[task.status] || []

  return (
    <div className="space-y-6 animate-slide-up pb-12">
      {/* Breadcrumbs & Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/tasks')} className="btn-icon p-1.5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center text-sm text-gray-500 font-medium">
            <Link to="/tasks" className="hover:text-indigo-600 transition-colors">Tasks</Link>
            <span className="mx-2 text-gray-300">/</span>
            <span className="text-gray-400 font-mono">{task.task_id}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Edit Task Action */}
          {role !== 'employee' && (
            <Link to={`/tasks/${task.id}/edit`} className="btn-secondary btn-sm">
              <Pencil className="w-4 h-4" /> Edit Task
            </Link>
          )}
          {/* Delete Task (HR/Admin/Ops only) */}
          {['super_admin', 'admin', 'operation_manager'].includes(role || '') && (
            <button onClick={handleDeleteTask} className="btn-danger-outline btn-sm">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Details) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            
            {/* Title Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={cn('px-2 py-0.5 rounded text-xs font-semibold uppercase', TYPE_COLORS[task.type])}>
                  {TASK_TYPE_LABELS[task.type]}
                </span>
                {task.is_recurring && (
                  <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold">
                    <Repeat className="w-3.5 h-3.5" /> Recurring
                  </span>
                )}
              </div>
              
              {isEditingTitle ? (
                <div className="flex items-start gap-2">
                  <textarea
                    className="input-field text-xl font-bold font-sans w-full p-2 resize-none"
                    rows={2}
                    value={tempTitle}
                    onChange={e => setTempTitle(e.target.value)}
                    maxLength={160}
                  />
                  <div className="flex flex-col gap-1">
                    <button onClick={handleSaveTitle} className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setTempTitle(task.title); setIsEditingTitle(false) }} className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <h1
                  onClick={() => role !== 'employee' && setIsEditingTitle(true)}
                  className={cn(
                    "text-2xl font-bold text-gray-900 leading-tight rounded p-1 -ml-1 flex items-start justify-between gap-4",
                    role !== 'employee' && "hover:bg-gray-50 cursor-pointer group"
                  )}
                >
                  <span>{task.title}</span>
                  {role !== 'employee' && (
                    <Pencil className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-2" />
                  )}
                </h1>
              )}
            </div>

            {/* Description Tab & Content */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-sm font-semibold text-gray-900">Task Description</h3>
                {!isEditingDesc && role !== 'employee' && (
                  <button onClick={() => setIsEditingDesc(true)} className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-medium">
                    <Pencil className="w-3.5 h-3.5" /> Edit Description
                  </button>
                )}
              </div>

              {isEditingDesc ? (
                <div className="space-y-3">
                  <textarea
                    className="input-field font-sans w-full p-3 min-h-[160px] resize-y"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Provide a detailed description of the task..."
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditingDesc(false)} className="btn-ghost btn-sm">Cancel</button>
                    <button onClick={handleSaveDescription} className="btn-primary btn-sm">Save</button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {task.description || (
                    <span className="text-gray-400 italic">No description provided. Click "Edit Description" to add some detail.</span>
                  )}
                </div>
              )}
            </div>

            {/* Subtasks Section */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Subtasks Checklist</h3>
                <span className="text-xs text-gray-500 font-medium">
                  {subtasks.filter(s => s.is_completed).length} / {subtasks.length} Done
                </span>
              </div>

              {subtasks.length > 0 && (
                <div className="space-y-2.5">
                  {subtasks.map(s => (
                    <label key={s.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={s.is_completed}
                        onChange={e => handleToggleSubtask(s.id, e.target.checked)}
                        className="w-4.5 h-4.5 accent-indigo-500 rounded border-gray-300"
                      />
                      <span className={cn('text-sm transition-all text-gray-700', s.is_completed && 'line-through text-gray-400')}>
                        {s.title}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {role !== 'employee' && (
                <form onSubmit={handleAddSubtask} className="flex gap-2">
                  <input
                    className="input-field text-sm py-2"
                    placeholder="Add a new subtask checklist item..."
                    value={newSubtaskTitle}
                    onChange={e => setNewSubtaskTitle(e.target.value)}
                  />
                  <button type="submit" className="btn-primary btn-sm px-4 shrink-0">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </form>
              )}
            </div>

            {/* Attachments Section */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Supporting Attachments</h3>
                {role !== 'employee' && (
                  <button onClick={handleAddAttachment} className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-medium">
                    <Upload className="w-3.5 h-3.5" /> Mock Upload
                  </button>
                )}
              </div>

              {attachments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {attachments.map(att => (
                    <div key={att.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 bg-gray-50 hover:bg-white hover:border-gray-200 transition-all group">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 truncate">{att.name}</div>
                        <div className="text-xs text-gray-400">
                          {(att.size / 1024).toFixed(0)} KB · Uploaded by {att.uploaded_by}
                        </div>
                      </div>
                      {role !== 'employee' && (
                        <button
                          onClick={() => {
                            mockDb.removeAttachment(task.id, att.id)
                            setAttachments(prev => prev.filter(a => a.id !== att.id))
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50/50">
                  <Paperclip className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No supporting documentation uploaded yet.</p>
                </div>
              )}
            </div>

          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-500" /> Discussion & Updates ({comments.length})
            </h3>
            
            {comments.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {comments.map(c => (
                  <div key={c.id} className="flex items-start gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                      {c.author.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 relative group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">{c.author.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(c.created_at).toLocaleDateString()} {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-xs italic">
                No comments yet. Start the conversation below.
              </div>
            )}

            <form onSubmit={handleAddComment} className="flex gap-3 pt-3 border-t border-gray-100">
              <input
                className="input-field text-sm"
                placeholder="Type your comment or update..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button type="submit" className="btn-primary btn-sm px-4 shrink-0">
                <Send className="w-4 h-4" /> Send
              </button>
            </form>
          </div>

        </div>

        {/* Right Sidebar (Task Metadata) */}
        <div className="space-y-6">
          
          {/* SLA Badge Panel (If present) */}
          {task.sla_deadline && (
            <div className={cn(
              'rounded-2xl border p-4 shadow-sm flex items-center gap-3.5',
              slaCountdown === 'SLA BREACHED'
                ? 'bg-red-50 border-red-200 text-red-700 animate-pulse'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700'
            )}>
              <Clock className="w-6 h-6 shrink-0" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider">SLA Deadline Status</div>
                <div className="text-lg font-bold font-mono mt-0.5">{slaCountdown}</div>
              </div>
            </div>
          )}

          {/* Configuration Parameters Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            
            {/* Status Dropdown */}
            <div>
              <label className="label-xs block text-gray-400 font-semibold mb-1.5 uppercase tracking-wider">Status Lifecycle</label>
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className={cn(
                    'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                    STATUS_CONFIG[task.status].bg,
                    STATUS_CONFIG[task.status].text
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full', STATUS_CONFIG[task.status].dot)} />
                    {STATUS_CONFIG[task.status].label}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                </button>
                
                {showStatusDropdown && (
                  <div className="absolute left-0 right-0 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-30 animate-slide-up">
                    <div className="px-3 py-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-50 mb-1">
                      Allowed Next States
                    </div>
                    {allowedTransitions.map((tStatus) => (
                      <button
                        key={tStatus}
                        onClick={() => handleStatusChange(tStatus as TaskStatus)}
                        className="flex items-center gap-2 px-3.5 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 w-full text-left transition-colors font-medium"
                      >
                        <span className={cn('w-2 h-2 rounded-full', STATUS_CONFIG[tStatus as TaskStatus].dot)} />
                        {STATUS_CONFIG[tStatus as TaskStatus].label}
                      </button>
                    ))}
                    {allowedTransitions.length === 0 && (
                      <div className="px-3.5 py-2 text-xs text-gray-400 italic">
                        No valid state transitions from {task.status}.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Priority Picker */}
            <div>
              <label className="label-xs block text-gray-400 font-semibold mb-2.5 uppercase tracking-wider">Priority Level</label>
              <div className="grid grid-cols-2 gap-2">
                {(['p0', 'p1', 'p2', 'p3'] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    disabled={role === 'employee'}
                    onClick={() => handlePriorityChange(p)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 border rounded-xl text-xs font-bold transition-all text-left justify-start disabled:opacity-75 disabled:cursor-not-allowed',
                      task.priority === p
                        ? cn(PRIORITY_CONFIG[p].badge, 'border-current shadow-sm ring-1 ring-current')
                        : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                    )}
                  >
                    <span className={cn('w-2 h-2 rounded-full', PRIORITY_CONFIG[p].dot)} />
                    {PRIORITY_CONFIG[p].label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Weight Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="label-xs text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-indigo-500" /> Weight (0–100)
                </label>
                <span className="text-sm font-bold text-gray-700 font-mono">{task.perf_weight} pts</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={task.perf_weight}
                disabled={role === 'employee'}
                onChange={e => {
                  const val = parseInt(e.target.value)
                  const updated = { ...task, perf_weight: val }
                  mockDb.saveTask(updated)
                  setTask(updated)
                }}
                className="w-full accent-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="label-xs block text-gray-400 font-semibold mb-1.5 uppercase tracking-wider">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  className="input-field pl-10 py-2.5 text-sm disabled:opacity-75 disabled:cursor-not-allowed"
                  value={task.due_date || ''}
                  disabled={role === 'employee'}
                  onChange={e => {
                    const updated = { ...task, due_date: e.target.value }
                    mockDb.saveTask(updated)
                    setTask(updated)
                    mockDb.addAuditLog({
                      action: 'updated',
                      entity_type: 'task',
                      entity_id: task.task_id,
                      description: `${user?.email || 'User'} updated due date to ${e.target.value}`,
                      actor: { name: user?.email?.split('@')[0] || 'User', initials: 'U', role: role || 'employee' }
                    })
                  }}
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="label-xs block text-gray-400 font-semibold mb-1.5 uppercase tracking-wider">Department Assignment</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  className="input-field pl-10 py-2.5 text-sm appearance-none disabled:opacity-75 disabled:cursor-not-allowed"
                  value={task.department_id}
                  disabled={role === 'employee'}
                  onChange={e => {
                    const selectedName = e.target.options[e.target.selectedIndex].text
                    const updated = { ...task, department_id: e.target.value, department_name: selectedName }
                    mockDb.saveTask(updated)
                    setTask(updated)
                  }}
                >
                  <option value="eng">Engineering</option>
                  <option value="hr">Human Resources</option>
                  <option value="ops">Operations</option>
                  <option value="fin">Finance</option>
                  <option value="mkt">Marketing</option>
                </select>
              </div>
            </div>

            {/* Recurrence Rule */}
            <div>
              <label className="label-xs block text-gray-400 font-semibold mb-1.5 uppercase tracking-wider">Recurrence Rule</label>
              <div className="p-3 border border-gray-100 bg-gray-50/50 rounded-xl text-xs flex items-center justify-between gap-3 text-gray-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Repeat className="w-4 h-4 text-amber-500" />
                  {task.is_recurring ? (task.recurrence_rule || 'FREQ=DAILY') : 'Single Task (Non-recurring)'}
                </span>
                <button
                  type="button"
                  disabled={role === 'employee'}
                  onClick={() => {
                    const updated = {
                      ...task,
                      is_recurring: !task.is_recurring,
                      recurrence_rule: !task.is_recurring ? 'FREQ=WEEKLY;BYDAY=MO' : undefined
                    }
                    mockDb.saveTask(updated)
                    setTask(updated)
                  }}
                  className="text-xs text-indigo-600 hover:underline font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Toggle
                </button>
              </div>
            </div>

          </div>

          {/* Audit Metadata Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 text-xs">
            <h3 className="font-semibold text-gray-900 border-b border-gray-50 pb-2">Record Metadata</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Created By:</span>
                <span className="font-semibold text-gray-700">{task.created_by.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created At:</span>
                <span className="font-mono text-gray-600">{new Date(task.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Modified:</span>
                <span className="font-mono text-gray-600">{new Date(task.updated_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
