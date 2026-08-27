import React from 'react'
import { HealthStatus, RiskLevel } from '@/types'

interface StatusIndicatorProps {
  status: HealthStatus | RiskLevel
  showLabel?: boolean
}

const healthStatusColors = {
  healthy: { bg: 'bg-success-100', dot: 'bg-success-500', text: 'text-success-700' },
  'at-risk': { bg: 'bg-warning-100', dot: 'bg-warning-500', text: 'text-warning-700' },
  critical: { bg: 'bg-danger-100', dot: 'bg-danger-500', text: 'text-danger-700' },
  'end-of-life': { bg: 'bg-neutral-100', dot: 'bg-neutral-500', text: 'text-neutral-700' },
}

const riskLevelColors = {
  low: { bg: 'bg-success-100', dot: 'bg-success-500', text: 'text-success-700' },
  medium: { bg: 'bg-warning-100', dot: 'bg-warning-500', text: 'text-warning-700' },
  high: { bg: 'bg-danger-100', dot: 'bg-danger-500', text: 'text-danger-700' },
  critical: { bg: 'bg-danger-100', dot: 'bg-danger-700', text: 'text-danger-700' },
}

export function StatusIndicator({ status, showLabel = true }: StatusIndicatorProps) {
  const isHealthStatus = status in healthStatusColors
  const colors = isHealthStatus ? healthStatusColors[status as HealthStatus] : riskLevelColors[status as RiskLevel]

  const label =
    status === 'at-risk'
      ? 'At Risk'
      : status === 'end-of-life'
        ? 'End of Life'
        : status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.bg}`}>
      <div className={`w-2 h-2 rounded-full animate-pulse ${colors.dot}`} />
      {showLabel && <span className={`text-sm font-medium ${colors.text}`}>{label}</span>}
    </div>
  )
}
