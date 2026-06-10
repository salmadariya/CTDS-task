import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/store'
import { mockDb } from '@/lib/mockDb'
import {
  User, Mail, Shield, Building2, MapPin, Calendar, Lock, Save
} from 'lucide-react'
import type { OfficeLocation } from '@/types/user.types'

export default function ProfilePage() {
  const { role, user } = useAuthStore()

  // Get employee profile from DB
  const currentUserProfile = mockDb.getEmployees().find(e => e.email === user?.email)
  const fullName = currentUserProfile?.full_name ?? (user?.email?.split('@')[0]?.replace(/^\w/, c => c.toUpperCase()) || 'Administrator')
  const email = user?.email || 'admin@ablefolks.com'
  const deptName = currentUserProfile?.department_name ?? 'Corporate Operations'

  const [location, setLocation] = useState<OfficeLocation>(currentUserProfile?.office_location || 'New Delhi')
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [isSaved, setIsSaved] = useState(false)
  const [pwdError, setPwdError] = useState('')

  const handleLocationChange = (newLocation: string) => {
    const loc = newLocation as OfficeLocation
    setLocation(loc)
    if (currentUserProfile) {
      const updatedProfile = {
        ...currentUserProfile,
        office_location: loc
      }
      mockDb.saveEmployee(updatedProfile)
      
      mockDb.addAuditLog({
        action: 'updated',
        entity_type: 'user',
        entity_id: currentUserProfile.id,
        description: `User "${email}" updated office location to ${newLocation}`,
        actor: { name: fullName, initials: fullName.split(' ').map(n=>n[0]).join('').toUpperCase(), role: role || 'employee' }
      })
    }
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setPwdError('')
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError('All password fields are required.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      setPwdError('Password must be at least 6 characters.')
      return
    }

    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
    
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')

    // Add Audit Log
    mockDb.addAuditLog({
      action: 'updated',
      entity_type: 'user',
      entity_id: 'user_profile',
      description: `User "${email}" updated account password credentials`,
      actor: { name: fullName, initials: 'U', role: role || 'employee' }
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up pb-8">
      {/* Header */}
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage your personal details, office locations, and security settings.
        </p>
      </div>

      {/* Profile Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500 text-white text-xl font-bold flex items-center justify-center shadow-md shrink-0">
            {fullName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{fullName}</h2>
            <p className="text-xs text-gray-500 capitalize">{role?.replace('_', ' ')} · Ablefolks MNC</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-500 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
            <Mail className="w-4.5 h-4.5 text-gray-400" />
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Email Address</div>
              <div className="text-gray-700 font-mono mt-0.5">{email}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
            <Shield className="w-4.5 h-4.5 text-gray-400" />
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Account Role</div>
              <div className="text-gray-700 capitalize mt-0.5">{role?.replace('_', ' ')}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
            <Building2 className="w-4.5 h-4.5 text-gray-400" />
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Department</div>
              <div className="text-gray-700 mt-0.5">{deptName}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
            <MapPin className="w-4.5 h-4.5 text-gray-400" />
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Office Location</div>
              <select
                className="text-gray-700 bg-transparent focus:outline-none mt-0.5 border-none p-0 w-full font-bold text-xs"
                value={location}
                onChange={e => handleLocationChange(e.target.value)}
              >
                <option value="Manjeri">Manjeri, India</option>
                <option value="Kozhikode">Kozhikode, India</option>
                <option value="New Delhi">New Delhi, India</option>
                <option value="UAE">UAE Office</option>
                <option value="USA">USA Office</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Security settings (Password Update) */}
      <form onSubmit={handleUpdatePassword} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-1.5">
          <Lock className="w-4.5 h-4.5 text-indigo-500" /> Update Password Credentials
        </h3>
        
        {pwdError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
            {pwdError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="label-xs block mb-1.5">Current Password</label>
            <input
              type="password"
              className="input-field py-2"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="label-xs block mb-1.5">New Password</label>
            <input
              type="password"
              className="input-field py-2"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="label-xs block mb-1.5">Confirm New Password</label>
            <input
              type="password"
              className="input-field py-2"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
          <button type="submit" className="btn-primary btn-sm flex items-center gap-1.5 px-5">
            <Save className="w-4 h-4" /> Save Credentials
          </button>
          {isSaved && (
            <span className="text-xs text-emerald-600 font-semibold">
              ✓ Password credentials successfully reset
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
