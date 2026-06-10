import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/store'
import { cn } from '@/lib/cn'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import type { Role } from '@/types/user.types'

// Mock roles for demo login
const DEMO_ROLES: { label: string; role: Role; email: string }[] = [
  { label: 'Super Admin', role: 'super_admin', email: 'admin@ablefolks.com' },
  { label: 'Ops Manager', role: 'operation_manager', email: 'alice@ablefolks.com' },
  { label: 'HR Manager', role: 'hr_manager', email: 'carol@ablefolks.com' },
  { label: 'Dept Head', role: 'dept_head', email: 'bob@ablefolks.com' },
  { label: 'Employee', role: 'employee', email: 'david@ablefolks.com' },
]

export default function LoginPage() {
  const setUser = useAuthStore(state => state.setUser)
  const setRole = useAuthStore(state => state.setRole)
  const navigate = useNavigate()

  const [email, setEmail] = useState('admin@ablefolks.com')
  const [password, setPassword] = useState('password')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const validate = () => {
    let valid = true
    setEmailError('')
    setPasswordError('')

    if (!email) { setEmailError('Email is required'); valid = false }
    else if (!/\S+@\S+\.\S+/.test(email)) { setEmailError('Enter a valid email'); valid = false }

    if (!password) { setPasswordError('Password is required'); valid = false }
    else if (password.length < 6) { setPasswordError('Password must be at least 6 characters'); valid = false }

    return valid
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setError('')

    // Mock login — find matching demo role by email
    await new Promise(r => setTimeout(r, 1000))

    const matched = DEMO_ROLES.find(r => r.email === email.toLowerCase().trim())
    const role: Role = matched?.role ?? 'employee'

    setUser({ id: '1', email: email.trim() } as any)
    setRole(role)
    navigate('/dashboard')
  }

  const handleDemoLogin = (demoRole: typeof DEMO_ROLES[0]) => {
    setEmail(demoRole.email)
    setPassword('password')
    setIsLoading(true)
    setTimeout(() => {
      setUser({ id: '1', email: demoRole.email } as any)
      setRole(demoRole.role)
      navigate('/dashboard')
    }, 600)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: '#0A0E1A' }}>

      {/* Background blobs (PRD §4.1) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo zone */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30 mb-3">
              TF
            </div>
            <h1 className="text-2xl font-bold text-gray-900">TaskFlow</h1>
            <p className="text-sm text-gray-500 mt-1">Ablefolks Education MNC</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5" noValidate>

            {/* Global error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="label-xs block" htmlFor="email">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@ablefolks.com"
                  autoComplete="email"
                  className={cn(
                    'input-field pl-10',
                    emailError && 'input-field-error'
                  )}
                  aria-describedby={emailError ? 'email-error' : undefined}
                  aria-invalid={!!emailError}
                />
              </div>
              {emailError && (
                <p id="email-error" className="flex items-center gap-1 text-xs text-red-500 mt-1">
                  <AlertCircle className="w-3 h-3" /> {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="label-xs" htmlFor="password">Password</label>
                <button type="button" className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(
                    'input-field pl-10 pr-10',
                    passwordError && 'input-field-error'
                  )}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                  aria-invalid={!!passwordError}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p id="password-error" className="flex items-center gap-1 text-xs text-red-500 mt-1">
                  <AlertCircle className="w-3 h-3" /> {passwordError}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600">Remember me for 7 days</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2.5 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-xs text-gray-400 text-center mt-6">
            Contact your admin if you cannot access your account.
          </p>
        </div>

        {/* Demo Role Quick Login */}
        <div className="mt-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <p className="text-xs text-gray-400 text-center mb-3 font-medium uppercase tracking-wide">
            Quick Demo Login
          </p>
          <div className="grid grid-cols-5 gap-2">
            {DEMO_ROLES.map(dr => (
              <button
                key={dr.role}
                onClick={() => handleDemoLogin(dr)}
                disabled={isLoading}
                className="flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-center transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 text-[10px] font-bold border border-indigo-500/30 group-hover:bg-indigo-500/30 transition-colors">
                  {dr.label.slice(0, 2)}
                </div>
                <span className="text-[9px] text-gray-400 leading-tight">{dr.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
