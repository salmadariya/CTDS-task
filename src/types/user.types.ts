// ===== USER / EMPLOYEE TYPES (PRD §08) =====

export type Role =
  | 'super_admin'
  | 'admin'
  | 'operation_manager'
  | 'hr_manager'
  | 'dept_head'
  | 'employee'

export type OfficeLocation = 'Manjeri' | 'Kozhikode' | 'New Delhi' | 'UAE' | 'USA'

export interface Department {
  id: string
  name: string
  description?: string
  parent_id?: string
  parent_name?: string
  head_id?: string
  head_name?: string
  head_avatar?: string
  color: string // hex color for dept strip
  is_active: boolean
  employee_count: number
  open_task_count: number
  kpi_avg: number
  sub_dept_count: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  full_name: string
  email: string
  role: Role
  department_id?: string
  department_name?: string
  department_color?: string
  avatar_url?: string
  office_location?: OfficeLocation
  is_active: boolean
  joined_date: string
  created_at: string
  updated_at: string
}

export interface UserProfile extends User {
  open_task_count: number
  completed_task_count: number
  kpi_score: number
  attendance_rate: number
}

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  operation_manager: 'Operations Manager',
  hr_manager: 'HR Manager',
  dept_head: 'Department Head',
  employee: 'Employee',
}

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  super_admin: ['*'], // all permissions
  admin: ['manage_users', 'manage_depts', 'manage_tasks', 'view_audit', 'manage_kpi'],
  operation_manager: ['manage_tasks', 'view_all_tasks', 'manage_depts', 'view_audit', 'view_employees'],
  hr_manager: ['manage_attendance', 'manage_leave', 'manage_kpi', 'view_employees', 'manage_employees'],
  dept_head: ['manage_dept_tasks', 'approve_leave', 'view_dept_attendance', 'view_dept_kpi'],
  employee: ['view_own_tasks', 'view_own_kpi', 'view_own_attendance', 'submit_leave'],
}

export function hasPermission(role: Role | null, permission: string): boolean {
  if (!role) return false
  const perms = ROLE_PERMISSIONS[role]
  return perms.includes('*') || perms.includes(permission)
}

export function canManageTasks(role: Role | null): boolean {
  return hasPermission(role, 'manage_tasks') || hasPermission(role, 'manage_dept_tasks') || role === 'super_admin'
}

export function canCreateTask(role: Role | null): boolean {
  return ['super_admin', 'admin', 'operation_manager', 'dept_head'].includes(role ?? '')
}

export function canArchiveTask(role: Role | null): boolean {
  return ['super_admin', 'admin', 'operation_manager'].includes(role ?? '')
}

export function canManageKPI(role: Role | null): boolean {
  return ['super_admin', 'admin', 'hr_manager'].includes(role ?? '')
}

export function canApproveLeave(role: Role | null): boolean {
  return ['super_admin', 'admin', 'hr_manager', 'dept_head'].includes(role ?? '')
}

export function isSuperAdmin(role: Role | null): boolean {
  return role === 'super_admin'
}
