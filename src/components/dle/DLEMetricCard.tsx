'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardBody } from '@/components/common/Card'

interface DLEMetricCardProps {
  label: string
  value: string | number
  unit?: string
  icon: React.ReactNode
  description: string
  calculation: string
  color: 'success' | 'primary' | 'warning' | 'green'
}

const colorMap = {
  success: { text: 'text-success-600', icon: 'text-success-300', bg: 'bg-success-50' },
  primary: { text: 'text-primary-600', icon: 'text-primary-300', bg: 'bg-primary-50' },
  warning: { text: 'text-warning-600', icon: 'text-warning-300', bg: 'bg-warning-50' },
  green: { text: 'text-green-600', icon: 'text-green-300', bg: 'bg-green-50' },
}

export function DLEMetricCard({
  label,
  value,
  unit,
  icon,
  description,
  calculation,
  color,
}: DLEMetricCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const colors = colorMap[color]

  return (
    <Card className="h-full flex flex-col">
      <CardBody className="flex flex-col h-full">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-600 mb-2">{label}</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-3xl font-bold ${colors.text}`}>{value}</span>
              {unit && <span className="text-sm text-neutral-500">{unit}</span>}
            </div>
          </div>
          <div className={`${colors.icon} opacity-40`}>{icon}</div>
        </div>

        {/* Description */}
        <p className="text-sm text-neutral-700 mb-3 leading-relaxed">{description}</p>

        {/* Show More Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded transition-colors self-start mt-auto"
        >
          {isExpanded ? (
            <>
              Hide Details
              <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              How it's calculated
              <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>

        {/* Expanded Calculation Section */}
        {isExpanded && (
          <div className={`mt-3 pt-3 border-t border-neutral-200 ${colors.bg} rounded p-3`}>
            <p className="text-xs font-semibold text-neutral-700 mb-2">Calculation Logic:</p>
            <p className="text-xs text-neutral-700 leading-relaxed">{calculation}</p>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
