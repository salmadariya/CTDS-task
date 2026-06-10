import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/store'
import { mockDb } from '@/lib/mockDb'
import {
  Cpu, Zap, Settings, Play, Pause, AlertTriangle,
  Database, Server, RefreshCw, Save
} from 'lucide-react'

export default function AdminPanelPage() {
  const { role, user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'config'>('overview')

  // Jobs state
  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any | null>(null)
  const [triggeringJobId, setTriggeringJobId] = useState<string | null>(null)

  // Config state
  const [platformName, setPlatformName] = useState('')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [kpiLockDay, setKpiLockDay] = useState(15)
  const [sessionTimeout, setSessionTimeout] = useState(60)
  const [emailSender, setEmailSender] = useState('')
  const [maxAttachmentSize, setMaxAttachmentSize] = useState(10)
  const [configSaved, setConfigSaved] = useState(false)

  const loadData = () => {
    setJobs(mockDb.getJobs())
    const cfg = mockDb.getConfig()
    setPlatformName(cfg.platformName)
    setMaintenanceMode(cfg.maintenanceMode)
    setKpiLockDay(cfg.kpiLockDay)
    setSessionTimeout(cfg.sessionTimeout)
    setEmailSender(cfg.emailSender)
    setMaxAttachmentSize(cfg.maxAttachmentSize)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleTriggerJob = async (job: any) => {
    setTriggeringJobId(job.id)
    
    // Simulate job execution
    await new Promise(r => setTimeout(r, 1200))
    
    const updatedLogs = [
      `${new Date().toLocaleTimeString()} — Manual trigger initiated by ${user?.email || 'admin'}`,
      ...job.logs
    ].slice(0, 10)

    const updatedJob = {
      ...job,
      last_run: new Date().toISOString(),
      success_count: job.success_count + 1,
      logs: updatedLogs
    }
    
    mockDb.saveJob(updatedJob)
    
    // Add audit log
    mockDb.addAuditLog({
      action: 'created',
      entity_type: 'user', // System audit
      entity_id: job.id,
      description: `Manual trigger of background job "${job.name}" succeeded`,
      actor: { name: user?.email?.split('@')[0] || 'Admin', initials: 'A', role: role || 'super_admin' }
    })

    setTriggeringJobId(null)
    loadData()
    if (selectedJob && selectedJob.id === job.id) {
      setSelectedJob(updatedJob)
    }
  }

  const handleToggleJob = (job: any) => {
    const nextStatus = job.status === 'paused' ? 'idle' : 'paused'
    const updatedJob = { ...job, status: nextStatus }
    mockDb.saveJob(updatedJob)
    loadData()
  }

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault()
    const updated = {
      platformName,
      maintenanceMode,
      defaultPriority: 'p2' as const,
      kpiLockDay,
      sessionTimeout,
      emailSender,
      maxAttachmentSize,
      offices: ['Manjeri', 'Kozhikode', 'New Delhi', 'UAE', 'USA']
    }
    mockDb.saveConfig(updated)
    
    mockDb.addAuditLog({
      action: 'updated',
      entity_type: 'user', // System config audit
      entity_id: 'config',
      description: `User updated global platform configuration preferences`,
      actor: { name: user?.email?.split('@')[0] || 'Admin', initials: 'A', role: role || 'super_admin' }
    })

    setConfigSaved(true)
    setTimeout(() => setConfigSaved(false), 2000)
  }

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* Page Header */}
      <div>
        <h1 className="page-title">Super Admin Panel</h1>
        <p className="text-xs text-gray-500 mt-1">
          Monitor system services, manage background automated workers, and configure global platform settings.
        </p>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'overview', label: 'System Overview', icon: Cpu },
          { id: 'jobs', label: 'Background Jobs', icon: Zap },
          { id: 'config', label: 'Platform Settings', icon: Settings }
        ].map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                "px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px flex items-center gap-2",
                activeTab === t.id ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Tabs Content */}
      <div className="min-h-[400px]">
        
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Composite Health</span>
                  <div className="text-3xl font-black text-gray-900">99.98%</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">✓ API & database online</span>
                </div>
                <Server className="w-12 h-12 text-indigo-100 shrink-0" />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Average API Latency</span>
                  <div className="text-3xl font-black text-gray-900">124 ms</div>
                  <span className="text-[10px] text-indigo-500 font-semibold">— Target SLA &lt; 300ms</span>
                </div>
                <Cpu className="w-12 h-12 text-indigo-100 shrink-0" />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Storage Utilized</span>
                  <div className="text-3xl font-black text-gray-900">4.12 GB</div>
                  <span className="text-[10px] text-gray-400 font-semibold">Out of 50.0 GB threshold</span>
                </div>
                <Database className="w-12 h-12 text-indigo-100 shrink-0" />
              </div>
            </div>

            {/* Performance charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <ActivityIndicator className="bg-emerald-500" /> API Response Time (24h Load)
                </h3>
                
                {/* SVG Mock Chart */}
                <div className="h-44 bg-gray-50/50 rounded-xl border border-gray-100/50 flex items-end p-4 relative overflow-hidden">
                  <div className="absolute top-4 left-4 text-[9px] text-indigo-400 font-bold uppercase tracking-wider">p95 response time (ms)</div>
                  
                  {/* SLA Target Line */}
                  <div className="absolute top-1/3 left-0 right-0 border-t border-dashed border-red-200 z-0">
                    <span className="absolute right-2 -top-2.5 text-[8px] font-bold text-red-500 bg-white px-1">SLA Target (300ms)</span>
                  </div>

                  <svg viewBox="0 0 100 30" className="w-full h-24 text-indigo-500 overflow-visible z-10" preserveAspectRatio="none">
                    <path
                      d="M0,25 Q15,10 30,22 T60,12 T90,20 T100,15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M0,25 Q15,10 30,22 T60,12 T90,20 T100,15 L100,30 L0,30 Z"
                      fill="currentColor"
                      fillOpacity="0.05"
                    />
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <ActivityIndicator className="bg-emerald-500" /> Active Platform Sessions
                </h3>
                <div className="space-y-3 pt-2">
                  {[
                    { label: 'Engineering Dashboard Users', val: 14, color: 'bg-indigo-500' },
                    { label: 'Operations Management Queue', val: 8, color: 'bg-amber-500' },
                    { label: 'HR Attendance Processing', val: 5, color: 'bg-emerald-500' }
                  ].map((srv, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-gray-600">
                        <span>{srv.label}</span>
                        <span>{srv.val} active</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', srv.color)} style={{ width: `${(srv.val / 20) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Background Jobs */}
        {activeTab === 'jobs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Jobs list table */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-500 text-xs">
                      <th className="px-5 py-4">Job Worker</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Executions</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(job => (
                      <tr
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={cn(
                          "border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors",
                          selectedJob?.id === job.id && "bg-indigo-50/20"
                        )}
                      >
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900">{job.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">Last run: {new Date(job.last_run).toLocaleTimeString()}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 w-fit capitalize',
                            job.status === 'scheduled' && 'bg-indigo-50 border-indigo-100 text-indigo-700',
                            job.status === 'running' && 'bg-amber-50 border-amber-100 text-amber-700 animate-pulse',
                            job.status === 'paused' && 'bg-gray-50 border-gray-100 text-gray-500',
                            job.status === 'idle' && 'bg-gray-50 border-gray-100 text-gray-500'
                          )}>
                            <span className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              job.status === 'scheduled' && 'bg-indigo-500',
                              job.status === 'running' && 'bg-amber-500',
                              job.status === 'paused' && 'bg-gray-400',
                              job.status === 'idle' && 'bg-gray-400'
                            )} />
                            {job.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono font-semibold text-gray-600 text-xs">
                          {job.success_count} S / {job.fail_count} F
                        </td>
                        <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleTriggerJob(job)}
                              disabled={triggeringJobId === job.id}
                              className="btn-icon p-1.5 text-indigo-600 disabled:opacity-40"
                              title="Execute job now"
                            >
                              {triggeringJobId === job.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleToggleJob(job)}
                              className="btn-icon p-1.5 text-gray-500"
                              title={job.status === 'paused' ? 'Resume job' : 'Pause job'}
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Job Log Console */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 shadow-lg flex flex-col h-[400px] overflow-hidden text-xs text-gray-300 font-mono">
              <h3 className="text-xs text-gray-400 font-bold border-b border-gray-800 pb-2 flex items-center justify-between">
                <span>CONSOLE OUTPUT</span>
                <span className="text-[10px] bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900">
                  {selectedJob ? selectedJob.name : 'Choose Job'}
                </span>
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-2 pt-3 pr-1">
                {selectedJob ? (
                  selectedJob.logs.map((l: string, i: number) => (
                    <div key={i} className="leading-relaxed border-l-2 border-indigo-500 pl-2">
                      {l}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic h-full flex items-center justify-center text-center">
                    Select a background job worker to inspect console audit logs.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Config */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-50 pb-2">Global Enterprise Configurations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-xs block mb-1.5">Platform Instance Title</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={platformName}
                  onChange={e => setPlatformName(e.target.value)}
                />
              </div>

              <div>
                <label className="label-xs block mb-1.5">Default Notification Sender Email</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={emailSender}
                  onChange={e => setEmailSender(e.target.value)}
                />
              </div>

              <div>
                <label className="label-xs block mb-1.5">KPI Performance Lock Day (1-28)</label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  className="input-field"
                  value={kpiLockDay}
                  onChange={e => setKpiLockDay(parseInt(e.target.value) || 15)}
                />
              </div>

              <div>
                <label className="label-xs block mb-1.5">Session Expiration Timeout (minutes)</label>
                <input
                  type="number"
                  min={5}
                  className="input-field"
                  value={sessionTimeout}
                  onChange={e => setSessionTimeout(parseInt(e.target.value) || 60)}
                />
              </div>

              <div>
                <label className="label-xs block mb-1.5">Max Attachment Threshold (MB)</label>
                <input
                  type="number"
                  min={1}
                  className="input-field"
                  value={maxAttachmentSize}
                  onChange={e => setMaxAttachmentSize(parseInt(e.target.value) || 10)}
                />
              </div>

              {/* Maintenance mode toggle */}
              <div className="flex items-center justify-between p-3.5 bg-red-50/50 rounded-xl border border-red-100/50 self-end md:col-span-2">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-red-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Platform Maintenance Mode
                  </div>
                  <div className="text-[10px] text-red-600">Forces immediate read-only logout sessions for non-administrators.</div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={e => setMaintenanceMode(e.target.checked)}
                    className="w-4.5 h-4.5 rounded accent-red-600"
                  />
                  <span className="text-xs font-bold text-red-700">{maintenanceMode ? 'Active' : 'Inactive'}</span>
                </label>
              </div>

            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button type="submit" className="btn-primary flex items-center gap-1.5 btn-sm px-5">
                <Save className="w-4 h-4" /> Save Configurations
              </button>
              {configSaved && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  ✓ Config parameters updated successfully
                </span>
              )}
            </div>
          </form>
        )}

      </div>
    </div>
  )
}

function ActivityIndicator({ className }: { className: string }) {
  return (
    <span className={cn('relative flex h-2 w-2 shrink-0 rounded-full', className)}>
      <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-75', className)} />
    </span>
  )
}
