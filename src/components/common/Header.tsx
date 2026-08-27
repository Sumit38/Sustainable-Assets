import React from 'react'
import { AlertCircle } from 'lucide-react'

interface HeaderProps {
  title: string
  description?: string
  alerts?: number
}

export function Header({ title, description, alerts }: HeaderProps) {
  return (
    <div className="bg-white border-b border-neutral-200 px-6 py-6 sticky top-0 z-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
          {description && <p className="text-sm text-neutral-600 mt-1">{description}</p>}
        </div>
        {alerts && alerts > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-danger-50 border border-danger-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-danger-600" />
            <span className="text-sm font-medium text-danger-700">{alerts} Active Alerts</span>
          </div>
        )}
      </div>
    </div>
  )
}
