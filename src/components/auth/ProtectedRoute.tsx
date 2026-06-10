import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/store"
import type { Role } from "@/store/store"

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)
  const location = useLocation()
  
  // For demo/development purposes, we consider role !== null as authenticated
  const isAuthenticated = user !== null || role !== null
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
