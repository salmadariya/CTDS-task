import { useState, useRef, useEffect } from 'react'
import GlobalSearch from './GlobalSearch'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/store'
import { cn } from '@/lib/cn'
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  X,
  CheckCheck,
} from 'lucide-react'

interface TopBarProps {
  onMobileMenuToggle: () => void
  breadcrumbs?: { label: string; href?: string }[]
}

export default function TopBar({ onMobileMenuToggle, breadcrumbs = [] }: TopBarProps) {
  const { user, role, setUser, setRole } = useAuthStore()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const userName = user?.email?.split('@')[0] ?? 'User'
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1)
  const displayRole = role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) ?? ''

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifPanel(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Cmd/Ctrl+K opens search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const handleLogout = () => {
    setUser(null)
    setRole(null)
    navigate('/login')
  }

  // Mock notifications (will be replaced with real data)
  const notifications = [
    { id: '1', title: 'New task assigned', message: 'You have been assigned to "Update Dashboard UI"', time: '2m ago', read: false, type: 'task' },
    { id: '2', title: 'Leave request approved', message: 'Your annual leave for Jun 20–22 has been approved', time: '1h ago', read: false, type: 'leave' },
    { id: '3', title: 'KPI score updated', message: 'Your KPI score for May 2026 has been published: 84.5', time: '3h ago', read: true, type: 'kpi' },
  ]
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 flex items-center px-4 lg:px-6 gap-3 shrink-0">

      {/* Mobile menu toggle */}
      <button
        onClick={onMobileMenuToggle}
        className="btn-icon md:hidden shrink-0"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb (PRD §3.4) */}
      <nav aria-label="Breadcrumb" className="flex-1 flex items-center gap-1.5 text-sm min-w-0">
        {breadcrumbs.length === 0 ? (
          <span className="text-gray-400 text-sm">TaskFlow</span>
        ) : (
          breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-gray-300 text-xs">›</span>
              )}
              {crumb.href && i < breadcrumbs.length - 1 ? (
                <button
                  onClick={() => navigate(crumb.href!)}
                  className="text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className={cn(
                  i === breadcrumbs.length - 1
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500'
                )}>
                  {crumb.label}
                </span>
              )}
            </span>
          ))
        )}
      </nav>

      {/* Global Search (PRD §3.3) */}
      <button
        onClick={() => setSearchOpen(true)}
        className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 w-80 text-sm text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors shrink-0 whitespace-nowrap"
        aria-label="Open global search"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">Search tasks, employees...</span>
        <kbd className="text-[10px] bg-white/80 text-gray-400 px-1.5 py-0.5 rounded border border-gray-200 font-mono">⌘K</kbd>
      </button>

      {/* Mobile search icon */}
      <button
        onClick={() => setSearchOpen(true)}
        className="md:hidden btn-icon shrink-0"
        aria-label="Search"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Notification Bell */}
      <div className="relative shrink-0" ref={notifRef}>
        <button
          onClick={() => setShowNotifPanel(!showNotifPanel)}
          className="relative btn-icon"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel (mini, PRD §11.1) */}
        {showNotifPanel && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-slide-up overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="font-semibold text-gray-900 text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            </div>
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors',
                    !notif.read && 'bg-indigo-50/40'
                  )}
                >
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2" />
                  )}
                  <div className={cn('min-w-0', notif.read && 'pl-5')}>
                    <div className="text-sm font-medium text-gray-900 truncate">{notif.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{notif.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 text-center">
              <button
                onClick={() => { navigate('/notifications'); setShowNotifPanel(false) }}
                className="text-xs text-indigo-600 hover:underline"
              >
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Avatar Menu (PRD §3.3) */}
      <div className="relative shrink-0" ref={userMenuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
          aria-label="User menu"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900 leading-none">{displayName}</span>
            <span className="text-[10px] text-gray-500 mt-0.5">{displayRole}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
        </button>

        {/* Dropdown */}
        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-slide-up">
            <button
              onClick={() => { navigate('/profile'); setShowUserMenu(false) }}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 w-full text-left transition-colors"
            >
              <User className="w-4 h-4" /> Profile
            </button>
            <button
              onClick={() => { navigate('/settings'); setShowUserMenu(false) }}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 w-full text-left transition-colors"
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>

    <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
