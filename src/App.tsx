import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import AppShell from "@/components/layout/AppShell"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import LoginPage from "@/pages/LoginPage"
import RoleDashboard from "@/pages/dashboard/RoleDashboard"
import UnauthorizedPage from "@/pages/UnauthorizedPage"
import UsersPage from "@/pages/users/UsersPage"
import UserProfilePage from "@/pages/users/UserProfilePage"
import TasksPage from "@/pages/tasks/TasksPage"
import TaskDetailPage from "@/pages/tasks/TaskDetailPage"
import TaskCreateEditPage from "@/pages/tasks/TaskCreateEditPage"
import TaskTemplatesPage from "@/pages/tasks/TaskTemplatesPage"
import DepartmentsPage from "@/pages/departments/DepartmentsPage"
import DepartmentDetailPage from "@/pages/departments/DepartmentDetailPage"
import KPIsPage from "@/pages/kpis/KPIsPage"
import AttendancePage from "@/pages/attendance/AttendancePage"
import LeavePage from "@/pages/leave/LeavePage"
import NotificationsPage from "@/pages/notifications/NotificationsPage"
import AuditLogPage from "@/pages/audit/AuditLogPage"
import AdminPanelPage from "@/pages/admin/AdminPanelPage"
import ProfilePage from "@/pages/profile/ProfilePage"
import SettingsPage from "@/pages/settings/SettingsPage"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/store/store"

export default function App() {
  const setUser = useAuthStore(state => state.setUser)
  const setRole = useAuthStore(state => state.setRole)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user?.user_metadata?.role) {
        setRole(session.user.user_metadata.role)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user?.user_metadata?.role) {
        setRole(session.user.user_metadata.role)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      {/* Skip to main content (WCAG §15.4) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:text-indigo-600 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-medium focus:text-sm"
      >
        Skip to main content
      </a>

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Core pages */}
            <Route path="/dashboard" element={<RoleDashboard />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />

            {/* Task Management */}
            <Route element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'operation_manager', 'dept_head']} />}>
              <Route path="/tasks/create" element={<TaskCreateEditPage />} />
              <Route path="/tasks/:id/edit" element={<TaskCreateEditPage />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'operation_manager']} />}>
              <Route path="/tasks/templates" element={<TaskTemplatesPage />} />
            </Route>

            {/* Management */}
            <Route element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'operation_manager', 'hr_manager', 'dept_head']} />}>
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/departments/:id" element={<DepartmentDetailPage />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'operation_manager', 'hr_manager']} />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/:id" element={<UserProfilePage />} />
            </Route>

            {/* HR */}
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/leave" element={<LeavePage />} />
            <Route path="/kpis" element={<KPIsPage />} />

            {/* System */}
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'operation_manager']} />}>
              <Route path="/audit-log" element={<AuditLogPage />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
              <Route path="/admin" element={<AdminPanelPage />} />
            </Route>
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
