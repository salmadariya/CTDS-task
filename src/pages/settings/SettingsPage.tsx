import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/store'
import { mockDb } from '@/lib/mockDb'
import {
  Settings, Bell, Keyboard, LayoutGrid, CheckCircle, Save, Info
} from 'lucide-react'

export default function SettingsPage() {
  const { role, user } = useAuthStore()
  
  // Settings States
  const [taskAssigned, setTaskAssigned] = useState(true)
  const [taskOverdue, setTaskOverdue] = useState(true)
  const [p0Alert, setP0Alert] = useState(true)
  const [kpiPublished, setKpiPublished] = useState(false)
  const [defaultView, setDefaultView] = useState<'list' | 'table'>('list')
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)

    // Add Audit Log
    mockDb.addAuditLog({
      action: 'updated',
      entity_type: 'user',
      entity_id: 'settings',
      description: `User "${user?.email}" updated notification alerts configuration`,
      actor: { name: user?.email?.split('@')[0] || 'User', initials: 'U', role: role || 'employee' }
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up pb-8">
      {/* Page Header */}
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-xs text-gray-500 mt-1">
          Customize notification routing preferences, display defaults, and shortcuts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-1.5">
            <Bell className="w-4.5 h-4.5 text-indigo-500" /> Notification Alert Routing
          </h3>
          
          <div className="space-y-3">
            {[
              { label: 'Task Assignment Notifications', desc: 'Trigger immediate email alerts when a task is assigned to you.', state: taskAssigned, set: setTaskAssigned },
              { label: 'SLA Overdue Escalations', desc: 'Notify via push alert when a task due date target breaches.', state: taskOverdue, set: setTaskOverdue },
              { label: 'Critical P0 Notifications', desc: 'Escalate to email and flash highlight on dashboard when a P0 issue is created.', state: p0Alert, set: setP0Alert },
              { label: 'Monthly KPI Sheet Lock Digests', desc: 'Receive automated department performance summary reports monthly.', state: kpiPublished, set: setKpiPublished }
            ].map((item, idx) => (
              <label key={idx} className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={item.state}
                  onChange={e => item.set(e.target.checked)}
                  className="w-4.5 h-4.5 rounded accent-indigo-500 mt-0.5"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-800">{item.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{item.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-1.5">
            <LayoutGrid className="w-4.5 h-4.5 text-indigo-500" /> Interface Layout Preferences
          </h3>
          
          <div className="space-y-4 text-xs font-semibold text-gray-700">
            <div>
              <label className="label-xs block mb-1.5 text-gray-500">Default Tasks View Mode</label>
              <div className="flex bg-gray-100 rounded-lg p-0.5 w-fit">
                <button
                  type="button"
                  onClick={() => setDefaultView('list')}
                  className={cn(
                    'px-4 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-wider transition-all',
                    defaultView === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  List view
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultView('table')}
                  className={cn(
                    'px-4 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-wider transition-all',
                    defaultView === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  Table view
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-1.5">
            <Keyboard className="w-4.5 h-4.5 text-indigo-500" /> Shortcut Key Bindings
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span>Search Command Palette</span>
              <kbd className="font-mono bg-white px-1.5 py-0.5 border rounded shadow-sm text-[10px] text-gray-500">Ctrl + K</kbd>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span>Create Task Panel</span>
              <kbd className="font-mono bg-white px-1.5 py-0.5 border rounded shadow-sm text-[10px] text-gray-500">C</kbd>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="btn-primary btn-sm flex items-center gap-1.5 px-6">
            <Save className="w-4 h-4" /> Save Settings
          </button>
          {isSaved && (
            <span className="text-xs text-emerald-600 font-semibold">
              ✓ Preferences updated successfully
            </span>
          )}
        </div>

      </form>
    </div>
  )
}
