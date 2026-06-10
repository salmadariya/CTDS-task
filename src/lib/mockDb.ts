import type { Task, TaskStatus, TaskPriority, TaskType, TaskComment, TaskAttachment } from '@/types/task.types'
import type { Department, User, UserProfile } from '@/types/user.types'

// INITIAL MOCK DATA DEFINITIONS

const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'eng',
    name: 'Engineering',
    description: 'Product development, infrastructure, and technical design.',
    color: '#6366F1', // Indigo
    is_active: true,
    employee_count: 3,
    open_task_count: 3,
    kpi_avg: 87.8,
    sub_dept_count: 0,
    created_at: new Date(2023, 0, 1).toISOString(),
    updated_at: new Date(2023, 0, 1).toISOString()
  },
  {
    id: 'hr',
    name: 'Human Resources',
    description: 'Talent acquisition, employee relations, and training.',
    color: '#10B981', // Emerald
    is_active: true,
    employee_count: 2,
    open_task_count: 2,
    kpi_avg: 85.8,
    sub_dept_count: 1,
    created_at: new Date(2022, 5, 1).toISOString(),
    updated_at: new Date(2022, 5, 1).toISOString()
  },
  {
    id: 'ops',
    name: 'Operations',
    description: 'Business execution, client support, and SLA governance.',
    color: '#8B5CF6', // Purple
    is_active: true,
    employee_count: 1,
    open_task_count: 2,
    kpi_avg: 95.2,
    sub_dept_count: 0,
    created_at: new Date(2022, 10, 3).toISOString(),
    updated_at: new Date(2022, 10, 3).toISOString()
  },
  {
    id: 'fin',
    name: 'Finance',
    description: 'Accounting, tax planning, and financial audits.',
    color: '#F59E0B', // Amber
    is_active: true,
    employee_count: 1,
    open_task_count: 1,
    kpi_avg: 72.1,
    sub_dept_count: 0,
    created_at: new Date(2024, 8, 15).toISOString(),
    updated_at: new Date(2024, 8, 15).toISOString()
  },
  {
    id: 'mkt',
    name: 'Marketing',
    description: 'Brand strategy, outreach campaigns, and public relations.',
    color: '#EF4444', // Red
    is_active: true,
    employee_count: 2,
    open_task_count: 0,
    kpi_avg: 62.3,
    sub_dept_count: 0,
    created_at: new Date(2024, 3, 7).toISOString(),
    updated_at: new Date(2024, 3, 7).toISOString()
  }
]

const INITIAL_EMPLOYEES: UserProfile[] = [
  {
    id: '1',
    full_name: 'Alice Mathews',
    email: 'alice@ablefolks.com',
    role: 'operation_manager',
    department_id: 'ops',
    department_name: 'Operations',
    department_color: '#8B5CF6',
    avatar_url: undefined,
    office_location: 'Manjeri',
    is_active: true,
    joined_date: '2024-01-12',
    created_at: new Date(2024, 0, 12).toISOString(),
    updated_at: new Date(2024, 0, 12).toISOString(),
    open_task_count: 8,
    completed_task_count: 42,
    kpi_score: 91.5,
    attendance_rate: 96.8
  },
  {
    id: '2',
    full_name: 'Bob Krishnan',
    email: 'bob@ablefolks.com',
    role: 'dept_head',
    department_id: 'eng',
    department_name: 'Engineering',
    department_color: '#6366F1',
    avatar_url: undefined,
    office_location: 'Kozhikode',
    is_active: true,
    joined_date: '2023-03-05',
    created_at: new Date(2023, 2, 5).toISOString(),
    updated_at: new Date(2023, 2, 5).toISOString(),
    open_task_count: 14,
    completed_task_count: 87,
    kpi_score: 84.2,
    attendance_rate: 94.5
  },
  {
    id: '3',
    full_name: 'Carol Pillai',
    email: 'carol@ablefolks.com',
    role: 'hr_manager',
    department_id: 'hr',
    department_name: 'Human Resources',
    department_color: '#10B981',
    avatar_url: undefined,
    office_location: 'New Delhi',
    is_active: true,
    joined_date: '2022-06-01',
    created_at: new Date(2022, 5, 1).toISOString(),
    updated_at: new Date(2022, 5, 1).toISOString(),
    open_task_count: 5,
    completed_task_count: 55,
    kpi_score: 88.9,
    attendance_rate: 98.2
  },
  {
    id: '4',
    full_name: 'David Lawrence',
    email: 'david@ablefolks.com',
    role: 'employee',
    department_id: 'fin',
    department_name: 'Finance',
    department_color: '#F59E0B',
    avatar_url: undefined,
    office_location: 'UAE',
    is_active: true,
    joined_date: '2024-09-15',
    created_at: new Date(2024, 8, 15).toISOString(),
    updated_at: new Date(2024, 8, 15).toISOString(),
    open_task_count: 11,
    completed_task_count: 19,
    kpi_score: 72.1,
    attendance_rate: 91.2
  },
  {
    id: '5',
    full_name: 'Eva Sharma',
    email: 'eva@ablefolks.com',
    role: 'employee',
    department_id: 'mkt',
    department_name: 'Marketing',
    department_color: '#EF4444',
    avatar_url: undefined,
    office_location: 'USA',
    is_active: false,
    joined_date: '2025-02-20',
    created_at: new Date(2025, 1, 20).toISOString(),
    updated_at: new Date(2025, 1, 20).toISOString(),
    open_task_count: 0,
    completed_task_count: 3,
    kpi_score: 45.3,
    attendance_rate: 55.0
  },
  {
    id: '6',
    full_name: 'Frank Rajan',
    email: 'frank@ablefolks.com',
    role: 'dept_head',
    department_id: 'ops',
    department_name: 'Operations',
    department_color: '#8B5CF6',
    avatar_url: undefined,
    office_location: 'Manjeri',
    is_active: true,
    joined_date: '2022-11-03',
    created_at: new Date(2022, 10, 3).toISOString(),
    updated_at: new Date(2022, 10, 3).toISOString(),
    open_task_count: 6,
    completed_task_count: 92,
    kpi_score: 95.2,
    attendance_rate: 97.4
  },
  {
    id: '7',
    full_name: 'Grace Thomas',
    email: 'grace@ablefolks.com',
    role: 'employee',
    department_id: 'mkt',
    department_name: 'Marketing',
    department_color: '#EF4444',
    avatar_url: undefined,
    office_location: 'Kozhikode',
    is_active: true,
    joined_date: '2024-04-07',
    created_at: new Date(2024, 3, 7).toISOString(),
    updated_at: new Date(2024, 3, 7).toISOString(),
    open_task_count: 7,
    completed_task_count: 24,
    kpi_score: 79.4,
    attendance_rate: 89.9
  },
  {
    id: '8',
    full_name: 'Harry Wilson',
    email: 'harry@ablefolks.com',
    role: 'employee',
    department_id: 'hr',
    department_name: 'Human Resources',
    department_color: '#10B981',
    avatar_url: undefined,
    office_location: 'New Delhi',
    is_active: true,
    joined_date: '2023-07-22',
    created_at: new Date(2023, 6, 22).toISOString(),
    updated_at: new Date(2023, 6, 22).toISOString(),
    open_task_count: 4,
    completed_task_count: 31,
    kpi_score: 82.7,
    attendance_rate: 93.1
  },
  {
    id: '9',
    full_name: 'System Administrator',
    email: 'admin@ablefolks.com',
    role: 'super_admin',
    department_id: 'ops',
    department_name: 'Operations',
    department_color: '#8B5CF6',
    avatar_url: undefined,
    office_location: 'New Delhi',
    is_active: true,
    joined_date: '2022-01-01',
    created_at: new Date(2022, 0, 1).toISOString(),
    updated_at: new Date(2022, 0, 1).toISOString(),
    open_task_count: 0,
    completed_task_count: 150,
    kpi_score: 98.5,
    attendance_rate: 99.2
  }
]


const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    task_id: 'TF-0051',
    title: 'Update User Dashboard UI — Phase 2 redesign with glassmorphism',
    description: 'Implement the new glassmorphism design for the user dashboard as per the latest PRD requirements. Focus on smooth animations and responsive widgets. Ensure WCAG 2.1 AA compliance with readable text contrasts over gradient backgrounds.',
    status: 'in_progress',
    priority: 'p1',
    type: 'admin',
    department_id: 'eng',
    department_name: 'Engineering',
    assignees: [
      { id: '1', name: 'Alice Mathews', email: 'alice@ablefolks.com', role: 'operation_manager' },
      { id: '2', name: 'Bob Krishnan', email: 'bob@ablefolks.com', role: 'dept_head' }
    ],
    due_date: '2026-06-10',
    perf_weight: 15,
    is_recurring: false,
    attachment_count: 3,
    comment_count: 2,
    created_by: { id: '1', name: 'Alice Mathews', email: 'alice@ablefolks.com', role: 'operation_manager' },
    created_at: new Date(2026, 5, 1).toISOString(),
    updated_at: new Date(2026, 5, 8).toISOString(),
    subtask_ids: ['sub-1', 'sub-2'],
    sla_deadline: '2026-06-12T18:00:00Z'
  },
  {
    id: '2',
    task_id: 'TF-0048',
    title: 'Fix payment gateway timeout error',
    description: 'Critical issue: payment gateway timing out after 30 seconds. Investigate the Stripe webhook handler latency and optimize database queries execution inside webhook callbacks.',
    status: 'in_progress',
    priority: 'p0',
    type: 'operations',
    department_id: 'eng',
    department_name: 'Engineering',
    assignees: [
      { id: '3', name: 'Carol Pillai', email: 'carol@ablefolks.com', role: 'hr_manager' }
    ],
    due_date: '2026-06-08',
    perf_weight: 30,
    is_recurring: false,
    attachment_count: 1,
    comment_count: 1,
    created_by: { id: '6', name: 'Frank Rajan', email: 'frank@ablefolks.com', role: 'dept_head' },
    created_at: new Date(2026, 5, 4).toISOString(),
    updated_at: new Date(2026, 5, 8).toISOString(),
    subtask_ids: [],
    sla_deadline: '2026-06-08T23:59:59Z'
  },
  {
    id: '3',
    task_id: 'TF-0045',
    title: 'Write Q2 Onboarding Documentation',
    description: 'Create comprehensive onboarding guide for new hires joining in Q2 2026. Document tools setup, corporate policies, and department contact persons.',
    status: 'todo',
    priority: 'p2',
    type: 'training',
    department_id: 'hr',
    department_name: 'Human Resources',
    assignees: [
      { id: '4', name: 'David Lawrence', email: 'david@ablefolks.com', role: 'employee' }
    ],
    due_date: '2026-06-20',
    perf_weight: 10,
    is_recurring: true,
    recurrence_rule: 'FREQ=MONTHLY;BYMONTHDAY=1',
    attachment_count: 0,
    comment_count: 0,
    created_by: { id: '3', name: 'Carol Pillai', email: 'carol@ablefolks.com', role: 'hr_manager' },
    created_at: new Date(2026, 4, 28).toISOString(),
    updated_at: new Date(2026, 5, 2).toISOString(),
    subtask_ids: []
  },
  {
    id: '4',
    task_id: 'TF-0043',
    title: 'Review PR #142 — Dashboard redesign',
    description: 'Review and approve the dashboard redesign pull request. Check accessibility, loading states, and responsiveness across standard browser viewports.',
    status: 'in_review',
    priority: 'p1',
    type: 'admin',
    department_id: 'eng',
    department_name: 'Engineering',
    assignees: [
      { id: '5', name: 'Eva Sharma', email: 'eva@ablefolks.com', role: 'employee' },
      { id: '6', name: 'Frank Rajan', email: 'frank@ablefolks.com', role: 'dept_head' }
    ],
    due_date: '2026-06-09',
    perf_weight: 20,
    is_recurring: false,
    attachment_count: 2,
    comment_count: 3,
    created_by: { id: '2', name: 'Bob Krishnan', email: 'bob@ablefolks.com', role: 'dept_head' },
    created_at: new Date(2026, 5, 5).toISOString(),
    updated_at: new Date(2026, 5, 9).toISOString(),
    subtask_ids: []
  },
  {
    id: '5',
    task_id: 'TF-0040',
    title: 'Monthly KPI Report — May 2026',
    description: 'Compile, review, and publish the monthly KPI performance report for all operational departments. Verify weights and manual overrides with HR.',
    status: 'done',
    priority: 'p2',
    type: 'research',
    department_id: 'hr',
    department_name: 'Human Resources',
    assignees: [
      { id: '1', name: 'Alice Mathews', email: 'alice@ablefolks.com', role: 'operation_manager' }
    ],
    due_date: '2026-06-01',
    perf_weight: 12,
    is_recurring: true,
    recurrence_rule: 'FREQ=MONTHLY;BYMONTHDAY=1',
    attachment_count: 1,
    comment_count: 0,
    created_by: { id: '3', name: 'Carol Pillai', email: 'carol@ablefolks.com', role: 'hr_manager' },
    created_at: new Date(2026, 4, 25).toISOString(),
    updated_at: new Date(2026, 5, 1).toISOString(),
    subtask_ids: []
  }
]

interface Subtask {
  id: string
  parent_id: string
  title: string
  is_completed: boolean
}

const INITIAL_SUBTASKS: Subtask[] = [
  { id: 'sub-1', parent_id: '1', title: 'Create Tailwind configurations for glassmorphism classes', is_completed: true },
  { id: 'sub-2', parent_id: '1', title: 'Implement dynamic widgets on Employee dashboard view', is_completed: false }
]

const INITIAL_COMMENTS: Record<string, TaskComment[]> = {
  '1': [
    {
      id: 'c-1',
      text: 'Draft design mockup looks brilliant. Let us proceed with implementing the UI layout using Tailwind custom components.',
      author: { id: '2', name: 'Bob Krishnan', email: 'bob@ablefolks.com', role: 'dept_head' },
      created_at: new Date(2026, 5, 5, 14, 30).toISOString()
    },
    {
      id: 'c-2',
      text: 'I have added the initial boilerplate for CSS tokens. Will begin working on widgets tomorrow.',
      author: { id: '1', name: 'Alice Mathews', email: 'alice@ablefolks.com', role: 'operation_manager' },
      created_at: new Date(2026, 5, 7, 10, 15).toISOString()
    }
  ],
  '2': [
    {
      id: 'c-3',
      text: 'Server logs indicate DB thread pool exhaustion. We need to throttle queries inside webhook endpoint.',
      author: { id: '6', name: 'Frank Rajan', email: 'frank@ablefolks.com', role: 'dept_head' },
      created_at: new Date(2026, 5, 8, 9, 0).toISOString()
    }
  ]
}

const INITIAL_ATTACHMENTS: Record<string, TaskAttachment[]> = {
  '1': [
    { id: 'att-1', name: 'glassmorphism_guide.pdf', size: 1048576, type: 'application/pdf', url: '#', uploaded_by: 'Bob Krishnan', uploaded_at: new Date(2026, 5, 5).toISOString() },
    { id: 'att-2', name: 'mockup_v2.png', size: 2048576, type: 'image/png', url: '#', uploaded_by: 'Bob Krishnan', uploaded_at: new Date(2026, 5, 5).toISOString() }
  ],
  '2': [
    { id: 'att-3', name: 'error_log_stripe.txt', size: 4528, type: 'text/plain', url: '#', uploaded_by: 'Carol Pillai', uploaded_at: new Date(2026, 5, 8).toISOString() }
  ]
}

interface AuditLog {
  id: string
  timestamp: string
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'assigned' | 'commented' | 'archived' | 'locked' | 'login' | 'login_failed' | 'exported'
  entity_type: 'task' | 'user' | 'department' | 'attendance' | 'kpi' | 'leave'
  entity_id: string
  description: string
  actor: { name: string; initials: string; role: string }
  ip_address?: string
  diff?: { old_val: string; new_val: string }
}

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'a-1',
    timestamp: new Date(2026, 5, 8, 10, 20).toISOString(),
    action: 'status_changed',
    entity_type: 'task',
    entity_id: 'TF-0051',
    description: 'Alice Mathews changed status from To-Do to In Progress on #TF-0051',
    actor: { name: 'Alice Mathews', initials: 'AM', role: 'Ops Manager' },
    ip_address: '192.168.1.101',
    diff: { old_val: 'To-Do', new_val: 'In Progress' }
  },
  {
    id: 'a-2',
    timestamp: new Date(2026, 5, 8, 9, 30).toISOString(),
    action: 'commented',
    entity_type: 'task',
    entity_id: 'TF-0048',
    description: 'Frank Rajan commented on #TF-0048: "Server logs indicate DB thread pool exhaustion..."',
    actor: { name: 'Frank Rajan', initials: 'FR', role: 'Dept Head' },
    ip_address: '192.168.1.144'
  },
  {
    id: 'a-3',
    timestamp: new Date(2026, 5, 5, 12, 10).toISOString(),
    action: 'created',
    entity_type: 'task',
    entity_id: 'TF-0051',
    description: 'Alice Mathews created task #TF-0051 "Update User Dashboard UI"',
    actor: { name: 'Alice Mathews', initials: 'AM', role: 'Ops Manager' },
    ip_address: '192.168.1.101'
  }
]

interface BackgroundJob {
  id: string
  name: string
  status: 'running' | 'idle' | 'scheduled' | 'failed' | 'paused'
  last_run: string
  next_run: string
  success_count: number
  fail_count: number
  logs: string[]
}

const INITIAL_JOBS: BackgroundJob[] = [
  {
    id: 'job-1',
    name: 'SLA Breach Monitor Check',
    status: 'scheduled',
    last_run: new Date(2026, 5, 10, 11, 30).toISOString(),
    next_run: new Date(2026, 5, 10, 11, 45).toISOString(),
    success_count: 144,
    fail_count: 0,
    logs: [
      '11:30:00 — Starting SLA scan...',
      '11:30:04 — Scanned 52 active tasks, detected 1 pending SLA expiration.',
      '11:30:05 — Completed. Uptime stable.'
    ]
  },
  {
    id: 'job-2',
    name: 'Daily Attendance Report Sync',
    status: 'idle',
    last_run: new Date(2026, 5, 10, 9, 0).toISOString(),
    next_run: new Date(2026, 5, 11, 9, 0).toISOString(),
    success_count: 28,
    fail_count: 1,
    logs: [
      '09:00:00 — Commencing HRMS database synchronization...',
      '09:00:15 — Synced attendance records for 8 employees.',
      '09:00:16 — Daily sync succeeded.'
    ]
  },
  {
    id: 'job-3',
    name: 'KPI Auto-Lock Process',
    status: 'paused',
    last_run: new Date(2026, 4, 15, 23, 59).toISOString(),
    next_run: new Date(2026, 5, 15, 23, 59).toISOString(),
    success_count: 5,
    fail_count: 0,
    logs: [
      '23:59:00 — Initiating auto-lock for May 2026 period...',
      '23:59:12 — locked KPI sheets for all 5 departments.',
      '23:59:15 — KPI lock finished.'
    ]
  }
]

interface PlatformConfig {
  platformName: string
  maintenanceMode: boolean
  defaultPriority: TaskPriority
  kpiLockDay: number
  sessionTimeout: number
  emailSender: string
  maxAttachmentSize: number
  offices: string[]
}

const INITIAL_CONFIG: PlatformConfig = {
  platformName: 'TaskFlow',
  maintenanceMode: false,
  defaultPriority: 'p2',
  kpiLockDay: 15,
  sessionTimeout: 60,
  emailSender: 'notifications@ablefolks.com',
  maxAttachmentSize: 10,
  offices: ['Manjeri', 'Kozhikode', 'New Delhi', 'UAE', 'USA']
}

interface TaskTemplate {
  id: string
  title: string
  description: string
  type: TaskType
  priority: TaskPriority
  perf_weight: number
  department_name: string
  subtask_titles: string[]
}

const INITIAL_TEMPLATES: TaskTemplate[] = [
  {
    id: 'temp-1',
    title: 'Monthly Financial Audit Compilation',
    description: 'Assemble all transaction logs, invoice receipts, and reconciliations for the past calendar month. Present the final spreadsheet to the Ops Director.',
    type: 'operations',
    priority: 'p1',
    perf_weight: 20,
    department_name: 'Finance',
    subtask_titles: [
      'Download Stripe monthly payout report',
      'Collect department head expense reports',
      'Crosscheck ledger entries with bank records',
      'Compile audit summary PDF and upload'
    ]
  },
  {
    id: 'temp-2',
    title: 'New Intern Onboarding Lifecycle',
    description: 'Guide for welcoming a new developer intern to the team. Setup hardware, create accounts, and assign initial learning module task.',
    type: 'training',
    priority: 'p2',
    perf_weight: 8,
    department_name: 'Engineering',
    subtask_titles: [
      'Request Google Workspace account activation',
      'Set up laptop and security credentials',
      'Invite to Slack channels and GitHub repository',
      'Schedule 30-min intro call with team lead'
    ]
  }
]

const INITIAL_LEAVES = [
  { id: '1', employee: 'Alice Mathews', employeeEmail: 'alice@ablefolks.com', dept: 'Operations', avatar: 'AM', type: 'annual', from: 'Jun 20', to: 'Jun 22', days: 3, reason: 'Family vacation', status: 'pending', submitted: '2 days ago' },
  { id: '2', employee: 'Bob Krishnan', employeeEmail: 'bob@ablefolks.com', dept: 'Engineering', avatar: 'BK', type: 'sick', from: 'Jun 11', to: 'Jun 11', days: 1, reason: 'Medical appointment', status: 'pending', submitted: '5h ago' },
  { id: '3', employee: 'Carol Pillai', employeeEmail: 'carol@ablefolks.com', dept: 'Human Resources', avatar: 'CP', type: 'casual', from: 'Jun 15', to: 'Jun 15', days: 1, reason: 'Personal work', status: 'approved', approvedBy: 'HR Manager', submitted: '3 days ago' },
  { id: '4', employee: 'David Lawrence', employeeEmail: 'david@ablefolks.com', dept: 'Finance', avatar: 'DL', type: 'annual', from: 'Jul 1', to: 'Jul 5', days: 5, reason: 'Planned vacation', status: 'approved', approvedBy: 'HR Manager', submitted: '1 week ago' },
  { id: '5', employee: 'Eva Sharma', employeeEmail: 'eva@ablefolks.com', dept: 'Marketing', avatar: 'ES', type: 'unpaid', from: 'Jun 18', to: 'Jun 19', days: 2, reason: 'Extended travel', status: 'rejected', submitted: '4 days ago' },
]

// HELPER FOR LOCALSTORAGE GET/SET
const getStorage = <T>(key: string, initial: T): T => {
  const raw = localStorage.getItem(key)
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(initial))
    return initial
  }
  try {
    return JSON.parse(raw) as T
  } catch {
    return initial
  }
}

const setStorage = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data))
}

// PUBLIC MOCK DATABASE INTERFACE
export const mockDb = {
  getTasks: () => getStorage<Task[]>('tf_tasks', INITIAL_TASKS),
  setTasks: (tasks: Task[]) => setStorage<Task[]>('tf_tasks', tasks),
  
  getTaskById: (id: string) => {
    const tasks = mockDb.getTasks()
    return tasks.find(t => t.id === id)
  },
  
  saveTask: (task: Task) => {
    const tasks = mockDb.getTasks()
    const index = tasks.findIndex(t => t.id === task.id)
    if (index >= 0) {
      tasks[index] = { ...task, updated_at: new Date().toISOString() }
    } else {
      tasks.push(task)
    }
    mockDb.setTasks(tasks)
  },

  deleteTask: (id: string) => {
    const tasks = mockDb.getTasks()
    mockDb.setTasks(tasks.filter(t => t.id !== id))
  },

  getDepartments: () => getStorage<Department[]>('tf_depts', INITIAL_DEPARTMENTS),
  saveDepartment: (dept: Department) => {
    const depts = mockDb.getDepartments()
    const index = depts.findIndex(d => d.id === dept.id)
    if (index >= 0) {
      depts[index] = { ...dept, updated_at: new Date().toISOString() }
    } else {
      depts.push(dept)
    }
    setStorage('tf_depts', depts)
  },

  getEmployees: () => getStorage<UserProfile[]>('tf_employees', INITIAL_EMPLOYEES),
  saveEmployee: (emp: UserProfile) => {
    const emps = mockDb.getEmployees()
    const index = emps.findIndex(e => e.id === emp.id)
    if (index >= 0) {
      emps[index] = emp
    } else {
      emps.push(emp)
    }
    setStorage('tf_employees', emps)
  },

  getSubtasks: () => getStorage<Subtask[]>('tf_subtasks', INITIAL_SUBTASKS),
  getSubtasksByParent: (parentId: string) => {
    const all = mockDb.getSubtasks()
    return all.filter(s => s.parent_id === parentId)
  },
  saveSubtask: (sub: Subtask) => {
    const all = mockDb.getSubtasks()
    const index = all.findIndex(s => s.id === sub.id)
    if (index >= 0) all[index] = sub
    else all.push(sub)
    setStorage('tf_subtasks', all)
  },
  deleteSubtask: (id: string) => {
    const all = mockDb.getSubtasks()
    setStorage('tf_subtasks', all.filter(s => s.id !== id))
  },

  getComments: (taskId: string) => {
    const comments = getStorage<Record<string, TaskComment[]>>('tf_comments', INITIAL_COMMENTS)
    return comments[taskId] || []
  },
  addComment: (taskId: string, comment: TaskComment) => {
    const comments = getStorage<Record<string, TaskComment[]>>('tf_comments', INITIAL_COMMENTS)
    if (!comments[taskId]) comments[taskId] = []
    comments[taskId].push(comment)
    setStorage('tf_comments', comments)
  },

  getAttachments: (taskId: string) => {
    const attachments = getStorage<Record<string, TaskAttachment[]>>('tf_attachments', INITIAL_ATTACHMENTS)
    return attachments[taskId] || []
  },
  addAttachment: (taskId: string, attachment: TaskAttachment) => {
    const attachments = getStorage<Record<string, TaskAttachment[]>>('tf_attachments', INITIAL_ATTACHMENTS)
    if (!attachments[taskId]) attachments[taskId] = []
    attachments[taskId].push(attachment)
    setStorage('tf_attachments', attachments)
  },
  removeAttachment: (taskId: string, attId: string) => {
    const attachments = getStorage<Record<string, TaskAttachment[]>>('tf_attachments', INITIAL_ATTACHMENTS)
    if (attachments[taskId]) {
      attachments[taskId] = attachments[taskId].filter(a => a.id !== attId)
      setStorage('tf_attachments', attachments)
    }
  },

  getAuditLogs: () => getStorage<AuditLog[]>('tf_audit_logs', INITIAL_AUDIT_LOGS),
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const logs = mockDb.getAuditLogs()
    const newLog: AuditLog = {
      ...log,
      id: 'a-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    }
    logs.unshift(newLog)
    setStorage('tf_audit_logs', logs)
  },

  getJobs: () => getStorage<BackgroundJob[]>('tf_jobs', INITIAL_JOBS),
  saveJob: (job: BackgroundJob) => {
    const jobs = mockDb.getJobs()
    const index = jobs.findIndex(j => j.id === job.id)
    if (index >= 0) jobs[index] = job
    setStorage('tf_jobs', jobs)
  },

  getConfig: () => getStorage<PlatformConfig>('tf_config', INITIAL_CONFIG),
  saveConfig: (cfg: PlatformConfig) => setStorage<PlatformConfig>('tf_config', cfg),

  getTemplates: () => getStorage<TaskTemplate[]>('tf_templates', INITIAL_TEMPLATES),
  saveTemplate: (temp: TaskTemplate) => {
    const temps = mockDb.getTemplates()
    const index = temps.findIndex(t => t.id === temp.id)
    if (index >= 0) temps[index] = temp
    else temps.push(temp)
    setStorage('tf_templates', temps)
  },
  deleteTemplate: (id: string) => {
    const temps = mockDb.getTemplates()
    setStorage('tf_templates', temps.filter(t => t.id !== id))
  },

  getLeaveRequests: () => getStorage<any[]>('tf_leaves', INITIAL_LEAVES),
  saveLeaveRequest: (req: any) => {
    const all = mockDb.getLeaveRequests()
    const index = all.findIndex(r => r.id === req.id)
    if (index >= 0) all[index] = req
    else all.push(req)
    setStorage('tf_leaves', all)
  },

  getAttendance: () => getStorage<Record<string, { status: any, checkIn?: string, checkOut?: string }>>('tf_attendance', {}),
  saveAttendance: (dateKey: string, record: { status: any, checkIn?: string, checkOut?: string }) => {
    const all = mockDb.getAttendance()
    all[dateKey] = record
    setStorage('tf_attendance', all)
  }
}
