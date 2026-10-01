import React, { useState } from 'react'
import { Card, CardBody } from '@/components/common/Card'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number | string
  unit?: string
  icon?: React.ReactNode
  trend?: number
  variant?: 'default' | 'success' | 'warning' | 'danger'
  description?: string
  calculation?: string | React.ReactNode
}

export function StatCard({ label, value, unit, icon, trend, variant = 'default', description, calculation }: StatCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const variantStyles = {
    default: 'border-l-4 border-l-primary-500',
    success: 'border-l-4 border-l-success-500',
    warning: 'border-l-4 border-l-warning-500',
    danger: 'border-l-4 border-l-danger-500',
  }

  const trendColor = trend && trend > 0 ? 'text-success-600' : 'text-danger-600'

  return (
    <Card className={`${variantStyles[variant]} overflow-visible`}>
      <CardBody className="flex flex-col gap-3">
        {/* Top Row: Label, Value, Icon, Show More Button */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-neutral-600 font-medium mb-2">{label}</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-neutral-900">{value}</span>
              {unit && <span className="text-sm text-neutral-500">{unit}</span>}
            </div>
            {trend !== undefined && (
              <p className={`text-xs ${trendColor}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {icon && <div className="text-3xl opacity-20 flex-shrink-0">{icon}</div>}
            {(description || calculation) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded transition-colors flex-shrink-0"
                title={isExpanded ? 'Show less' : 'Show more details'}
              >
                {isExpanded ? (
                  <>
                    Less
                    <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    More
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Description (always visible if provided) */}
        {description && <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>}

        {/* Expanded Calculation Section */}
        {isExpanded && calculation && (
          <div className="pt-3 border-t border-neutral-200">
            <div className="bg-neutral-50 rounded p-3">
              <p className="text-xs font-semibold text-neutral-700 mb-2">How this is calculated:</p>
              <div className="text-xs text-neutral-700 leading-relaxed">
                {typeof calculation === 'string' ? <p>{calculation}</p> : calculation}
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
