// ===== TASK TYPES (PRD §06) =====

export type TaskStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'done'
  | 'blocked'
  | 'archived'

export type TaskPriority = 'p0' | 'p1' | 'p2' | 'p3'

export type TaskType =
  | 'admin'
  | 'client'
  | 'training'
  | 'research'
  | 'operations'
  | 'intern_log'

export interface TaskAssignee {
  id: string
  name: string
  email: string
  avatar_url?: string
  role: string
}

export interface TaskAttachment {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploaded_by: string
  uploaded_at: string
}

export interface TaskComment {
  id: string
  text: string
  author: TaskAssignee
  created_at: string
  attachments?: TaskAttachment[]
}

export interface Task {
  id: string
  task_id: string // #TF-0001 format
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  type: TaskType
  department_id: string
  department_name: string
  assignees: TaskAssignee[]
  due_date?: string
  perf_weight: number // 0-100
  is_recurring: boolean
  recurrence_rule?: string // RRULE string
  parent_task_id?: string
  subtask_ids?: string[]
  attachment_count: number
  comment_count: number
  created_by: TaskAssignee
  created_at: string
  updated_at: string
  sla_deadline?: string
}

export interface TaskListItem extends Omit<Task, 'description' | 'subtask_ids'> {
  description_excerpt?: string
}

// State machine: valid next states per current status (PRD §6.2)
export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  backlog: ['todo'],
  todo: ['in_progress', 'blocked', 'backlog'],
  in_progress: ['in_review', 'blocked', 'todo'],
  in_review: ['done', 'in_progress'],
  done: ['archived'],
  blocked: ['in_progress', 'todo'],
  archived: [],
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'To-Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
  blocked: 'Blocked',
  archived: 'Archived',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  p0: 'P0 — Critical',
  p1: 'P1 — High',
  p2: 'P2 — Medium',
  p3: 'P3 — Low',
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  admin: 'Admin Task',
  client: 'Client Task',
  training: 'Training',
  research: 'Research',
  operations: 'Operations',
  intern_log: 'Intern Log',
}

export interface TaskFilters {
  search?: string
  status?: TaskStatus[]
  priority?: TaskPriority[]
  assignee_ids?: string[]
  department_id?: string
  type?: TaskType[]
  due_from?: string
  due_to?: string
  sort_by?: 'due_date_asc' | 'due_date_desc' | 'priority' | 'created' | 'updated' | 'title'
}
