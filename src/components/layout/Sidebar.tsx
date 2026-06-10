import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/store'
import { cn } from '@/lib/cn'
import {
  LayoutDashboard,
  CheckSquare,
  ClipboardList,
  ListChecks,
  LayoutTemplate,
  Building2,
  Users,
  Calendar,
  ClipboardCheck,
  BarChart3,
  Bell,
  ScrollText,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import type { Role } from '@/types/user.types'

// ─── Nav Item Structure ───────────────────────────────────────────────────────
interface NavItem {
  name: string
  path: string
  icon: React.ElementType
  roles: Role[]
  badge?: number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

// PRD §3.2 — Role-Adaptive Navigation
const NAV_GROUPS: NavGroup[] = [
  {
    label: 'WORKSPACE',
    items: [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        roles: ['super_admin', 'admin', 'operation_manager', 'hr_manager', 'dept_head', 'employee'],
      },
      {
        name: 'My Tasks',
        path: '/tasks',
        icon: CheckSquare,
        roles: ['employee', 'dept_head'],
      },
    ],
  },
  {
    label: 'TASK MANAGEMENT',
    items: [
      {
        name: 'All Tasks',
        path: '/tasks',
        icon: ClipboardList,
        roles: ['super_admin', 'admin', 'operation_manager', 'hr_manager'],
      },
      {
        name: 'Department Tasks',
        path: '/tasks',
        icon: ListChecks,
        roles: ['dept_head'],
      },
      {
        name: 'Task Templates',
        path: '/tasks/templates',
        icon: LayoutTemplate,
        roles: ['super_admin', 'admin', 'operation_manager'],
      },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      {
        name: 'Departments',
        path: '/departments',
        icon: Building2,
        roles: ['super_admin', 'admin', 'operation_manager', 'hr_manager', 'dept_head'],
      },
      {
        name: 'Employees',
        path: '/users',
        icon: Users,
        roles: ['super_admin', 'admin', 'operation_manager', 'hr_manager'],
      },
    ],
  },
  {
    label: 'HR',
    items: [
      {
        name: 'Attendance',
        path: '/attendance',
        icon: Calendar,
        roles: ['super_admin', 'admin', 'hr_manager', 'dept_head', 'operation_manager', 'employee'],
      },
      {
        name: 'Leave Requests',
        path: '/leave',
        icon: ClipboardCheck,
        roles: ['super_admin', 'admin', 'hr_manager', 'dept_head', 'operation_manager', 'employee'],
      },
      {
        name: 'KPI & Performance',
        path: '/kpis',
        icon: BarChart3,
        roles: ['super_admin', 'admin', 'hr_manager', 'dept_head', 'operation_manager', 'employee'],
      },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      {
        name: 'Notifications',
        path: '/notifications',
        icon: Bell,
        roles: ['super_admin', 'admin', 'operation_manager', 'hr_manager', 'dept_head', 'employee'],
        badge: 3,
      },
      {
        name: 'Audit Log',
        path: '/audit-log',
        icon: ScrollText,
        roles: ['super_admin', 'admin', 'operation_manager'],
      },
      {
        name: 'Admin Panel',
        path: '/admin',
        icon: ShieldCheck,
        roles: ['super_admin'],
      },
    ],
  },
]

// ─── Avatar Initials ──────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-red-500', 'bg-violet-500', 'bg-blue-500', 'bg-teal-500', 'bg-pink-500',
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

// ─── Role display label ───────────────────────────────────────────────────────
function formatRole(role: string | null): string {
  if (!role) return ''
  return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// ─── Sidebar Component ────────────────────────────────────────────────────────
interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, role, setUser, setRole } = useAuthStore()
  const navigate = useNavigate()

  const userName = user?.email?.split('@')[0] ?? 'User'
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1)

  const handleLogout = () => {
    setUser(null)
    setRole(null)
    navigate('/login')
  }

  const filteredGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => role && item.roles.includes(role as Role)),
  })).filter(group => group.items.length > 0)

  // ─── Sidebar inner ──────────────────────────────────────────────────────────
  const sidebarContent = (
    <div className={cn(
      'flex flex-col h-full bg-navy-DEFAULT transition-all duration-300 relative',
      collapsed ? 'w-14' : 'w-52'
    )} style={{ backgroundColor: '#0A0E1A' }}>

      {/* Logo Zone */}
      <div className={cn(
        'flex items-center h-14 border-b shrink-0',
        collapsed ? 'px-3 justify-center' : 'px-5 gap-2.5',
      )} style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/30 shrink-0">
          TF
        </div>
        {!collapsed && (
          <span className="font-bold text-white text-base tracking-tight truncate">TaskFlow</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-1.5 space-y-0.5 custom-scrollbar">
        {filteredGroups.map(group => (
          <div key={group.label} className="mb-1">
            {!collapsed && (
              <div className="px-4 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-indigo-300/60 select-none">
                {group.label}
              </div>
            )}
            {group.items.map(item => {
              const Icon = item.icon
              return (
                <NavLink
                  key={`${group.label}-${item.path}-${item.name}`}
                  to={item.path}
                  title={collapsed ? item.name : undefined}
                  className={({ isActive }) => cn(
                    'nav-item-compact relative',
                    collapsed && 'justify-center px-0 mx-0 rounded-none',
                    isActive && 'nav-item-active',
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                  {/* Notification badge */}
                  {item.badge && item.badge > 0 && (
                    <span className={cn(
                      'bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none',
                      collapsed ? 'absolute top-1 right-1' : 'ml-auto'
                    )}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Zone */}
      <div className="shrink-0 border-t p-2.5" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        {!collapsed ? (
          <div className="flex items-center gap-3 mb-2 px-1">
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0',
              getAvatarColor(displayName)
            )}>
              {getInitials(displayName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-sm font-medium truncate">{displayName}</div>
              <div className="text-indigo-300 text-xs truncate">{formatRole(role)}</div>
            </div>
          </div>
        ) : (
          <div className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm mb-2 mx-auto',
            getAvatarColor(displayName)
          )}>
            {getInitials(displayName)}
          </div>
        )}

        <div className={cn('flex gap-1', collapsed ? 'flex-col items-center' : 'items-center')}>
          <button
            onClick={() => navigate('/settings')}
            title="Settings"
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-indigo-500 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors z-10 hidden lg:flex"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen sticky top-0 shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <aside className="fixed left-0 top-0 h-screen z-40 md:hidden animate-slide-in">
            <div className="relative">
              {sidebarContent}
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  )
}
