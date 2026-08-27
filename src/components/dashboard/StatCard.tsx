import React from 'react'
import { Card, CardBody } from '@/components/common/Card'

interface StatCardProps {
  label: string
  value: number | string
  unit?: string
  icon?: React.ReactNode
  trend?: number
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function StatCard({ label, value, unit, icon, trend, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'border-l-4 border-l-primary-500',
    success: 'border-l-4 border-l-success-500',
    warning: 'border-l-4 border-l-warning-500',
    danger: 'border-l-4 border-l-danger-500',
  }

  const trendColor = trend && trend > 0 ? 'text-success-600' : 'text-danger-600'

  return (
    <Card className={`${variantStyles[variant]} overflow-hidden`}>
      <CardBody className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-neutral-600 mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">{value}</span>
            {unit && <span className="text-sm text-neutral-500">{unit}</span>}
          </div>
          {trend !== undefined && (
            <p className={`text-xs mt-2 ${trendColor}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        {icon && <div className="text-3xl opacity-20 ml-4">{icon}</div>}
      </CardBody>
    </Card>
  )
}
