import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

export type Role = 'super_admin' | 'admin' | 'operation_manager' | 'hr_manager' | 'dept_head' | 'employee' | null

interface AuthState {
  user: User | null
  role: Role
  setUser: (user: User | null) => void
  setRole: (role: Role) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
}))
