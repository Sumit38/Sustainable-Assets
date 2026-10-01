'use client'

import React, { useState, ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface MetricInfoProps {
  label: string
  value: string | number
  unit?: string
  basicDescription: string
  detailedCalculation: string | ReactNode
  icon?: ReactNode
}

export function MetricInfo({
  label,
  value,
  unit,
  basicDescription,
  detailedCalculation,
  icon,
}: MetricInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="w-full border border-neutral-200 rounded-lg bg-white overflow-hidden">
      {/* Main Info Row - Always Visible */}
      <div className="px-6 py-4">
        <div className="flex items-start gap-4">
          {/* Icon and Basic Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {icon && <div className="text-2xl opacity-30">{icon}</div>}
              <div>
                <p className="text-sm font-medium text-neutral-600">{label}</p>
              </div>
            </div>
            <div className="mb-2">
              <span className="text-3xl font-bold text-neutral-900">{value}</span>
              {unit && <span className="text-lg text-neutral-500 ml-2">{unit}</span>}
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed">{basicDescription}</p>
          </div>

          {/* Show More Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex-shrink-0 mt-2"
          >
            {isExpanded ? (
              <>
                Show Less
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show More
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Expanded Details Section */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="bg-neutral-50 rounded-lg p-4">
              <h4 className="font-semibold text-neutral-900 mb-2 text-sm">Calculation Method:</h4>
              <div className="text-sm text-neutral-700 space-y-2 leading-relaxed">
                {typeof detailedCalculation === 'string' ? (
                  <p>{detailedCalculation}</p>
                ) : (
                  detailedCalculation
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
