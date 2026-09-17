'use client'

import React from 'react'
import { Card, CardBody } from '@/components/common/Card'
import { TrendingUp, TrendingDown, DollarSign, Users, Leaf, AlertTriangle } from 'lucide-react'

interface BusinessKPIProps {
  label: string
  value: string | number
  unit?: string
  icon: React.ReactNode
  variant: 'positive' | 'negative' | 'neutral' | 'warning'
  trend?: {
    direction: 'up' | 'down'
    percentage: number
  }
  description?: string
  submetric?: {
    label: string
    value: string | number
  }
}

export function BusinessKPI({
  label,
  value,
  unit,
  icon,
  variant,
  trend,
  description,
  submetric,
}: BusinessKPIProps) {
  const variantStyles = {
    positive: 'bg-success-50 border-success-200',
    negative: 'bg-danger-50 border-danger-200',
    neutral: 'bg-neutral-50 border-neutral-200',
    warning: 'bg-warning-50 border-warning-200',
  }

  const iconStyles = {
    positive: 'text-success-600',
    negative: 'text-danger-600',
    neutral: 'text-neutral-600',
    warning: 'text-warning-600',
  }

  const valueStyles = {
    positive: 'text-success-700',
    negative: 'text-danger-700',
    neutral: 'text-neutral-900',
    warning: 'text-warning-700',
  }

  return (
    <Card className={`border-2 ${variantStyles[variant]}`}>
      <CardBody>
        <div className="flex items-start justify-between mb-4">
          <div className={`${iconStyles[variant]} w-10 h-10 flex items-center justify-center bg-white rounded-lg`}>
            {icon}
          </div>
          {trend && (
            <div className="flex items-center gap-1">
              {trend.direction === 'up' ? (
                <TrendingUp className="w-4 h-4 text-success-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-danger-600" />
              )}
              <span
                className={`text-sm font-semibold ${
                  trend.direction === 'up' ? 'text-success-600' : 'text-danger-600'
                }`}
              >
                {trend.percentage}%
              </span>
            </div>
          )}
        </div>

        <p className="text-sm font-medium text-neutral-600 mb-2">{label}</p>

        <div className="mb-3">
          <div className={`text-3xl font-bold ${valueStyles[variant]}`}>
            {value}
            {unit && <span className="text-lg font-normal text-neutral-500 ml-1">{unit}</span>}
          </div>
        </div>

        {submetric && (
          <div className="mb-3 p-2 bg-white bg-opacity-60 rounded">
            <p className="text-xs text-neutral-600">{submetric.label}</p>
            <p className="text-sm font-semibold text-neutral-900">{submetric.value}</p>
          </div>
        )}

        {description && <p className="text-xs text-neutral-600 leading-relaxed">{description}</p>}
      </CardBody>
    </Card>
  )
}

// Business Impact Summary Card
interface BusinessImpactCardProps {
  title: string
  metrics: Array<{
    label: string
    value: string | number
    icon: React.ReactNode
    color: 'green' | 'red' | 'blue' | 'orange'
  }>
}

export function BusinessImpactCard({ title, metrics }: BusinessImpactCardProps) {
  const colorMap = {
    green: 'bg-success-100 text-success-700',
    red: 'bg-danger-100 text-danger-700',
    blue: 'bg-primary-100 text-primary-700',
    orange: 'bg-warning-100 text-warning-700',
  }

  return (
    <Card>
      <CardBody>
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, idx) => (
            <div key={idx} className={`p-4 rounded-lg ${colorMap[metric.color]}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6">{metric.icon}</div>
                <p className="text-xs font-medium">{metric.label}</p>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
