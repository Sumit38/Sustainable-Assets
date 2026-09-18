import React from 'react'
import Link from 'next/link'
import { AlertCircle, Home, ArrowLeft } from 'lucide-react'
import { Button } from './Button'

interface PageHeaderProps {
  title: string
  description?: string
  alerts?: number
  showHomeButton?: boolean
  homeHref?: string
  showBackButton?: boolean
  onBack?: () => void
}

export function PageHeader({
  title,
  description,
  alerts,
  showHomeButton = true,
  homeHref = '/',
  showBackButton = false,
  onBack,
}: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-neutral-200 px-6 py-6 sticky top-0 z-10">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4 flex-1">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
            {description && <p className="text-sm text-neutral-600 mt-1">{description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {alerts && alerts > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-danger-50 border border-danger-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-danger-600" />
              <span className="text-sm font-medium text-danger-700">{alerts} Active Alerts</span>
            </div>
          )}
          {showHomeButton && (
            <Link href={homeHref}>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
