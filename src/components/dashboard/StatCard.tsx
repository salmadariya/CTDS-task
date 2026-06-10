import { cn } from '@/lib/cn'
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconBgColor?: string
  iconColor?: string
  trend?: number // percentage, positive = up, negative = down
  comparison?: string
  className?: string
  alertLevel?: 'warning' | 'danger' | null
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconBgColor = 'bg-indigo-50',
  iconColor = 'text-indigo-600',
  trend,
  comparison = 'vs last month',
  className,
  alertLevel,
}: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0
  const showTrend = trend !== undefined

  return (
    <div className={cn(
      'card p-6 hover:shadow-md transition-shadow duration-200 relative overflow-hidden',
      alertLevel === 'danger' && 'border-red-200 bg-red-50/20',
      alertLevel === 'warning' && 'border-amber-200 bg-amber-50/20',
      className
    )}>
      {/* Subtle background decoration */}
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-40 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${iconBgColor.replace('bg-', '')} 0%, transparent 70%)` }} />

      <div className="relative z-10">
        {/* Icon + Label row */}
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            iconBgColor,
            alertLevel === 'danger' && 'bg-red-100',
            alertLevel === 'warning' && 'bg-amber-100',
          )}>
            <Icon className={cn(
              'w-5 h-5',
              iconColor,
              alertLevel === 'danger' && 'text-red-600',
              alertLevel === 'warning' && 'text-amber-600',
            )} />
          </div>
          {alertLevel === 'danger' && (
            <span className="text-[10px] font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full animate-pulse">
              ALERT
            </span>
          )}
        </div>

        {/* Value */}
        <div className={cn(
          'text-3xl font-bold text-gray-900 mt-3',
          alertLevel === 'danger' && 'text-red-700',
          alertLevel === 'warning' && 'text-amber-700',
        )}>
          {value}
        </div>

        {/* Label */}
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500 mt-1">
          {label}
        </div>

        {/* Trend */}
        {showTrend && (
          <div className="flex items-center gap-1 mt-2">
            <div className={cn(
              'flex items-center gap-0.5 text-xs font-medium',
              isPositive ? 'text-emerald-600' : 'text-red-500'
            )}>
              {isPositive
                ? <TrendingUp className="w-3 h-3" />
                : <TrendingDown className="w-3 h-3" />
              }
              {isPositive ? '+' : ''}{trend}%
            </div>
            <span className="text-xs text-gray-400">{comparison}</span>
          </div>
        )}
      </div>
    </div>
  )
}
