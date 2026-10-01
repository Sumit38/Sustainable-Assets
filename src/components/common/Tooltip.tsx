'use client'

import React, { useState, ReactNode, useRef } from 'react'
import { Info } from 'lucide-react'

interface TooltipProps {
  content: string | ReactNode
  children?: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  icon?: boolean
}

export function Tooltip({ content, children, side = 'right', icon = true }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)

  const getSideClasses = () => {
    switch (side) {
      case 'top':
        return 'bottom-full mb-2 left-1/2 -translate-x-1/2'
      case 'bottom':
        return 'top-full mt-2 left-1/2 -translate-x-1/2'
      case 'left':
        return 'right-full mr-2 top-1/2 -translate-y-1/2'
      case 'right':
        return 'left-full ml-2 top-1/2 -translate-y-1/2'
      default:
        return 'left-full ml-2 top-1/2 -translate-y-1/2'
    }
  }

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help inline-flex items-center gap-1"
      >
        {children}
        {icon && !children && <Info className="w-4 h-4 text-neutral-400 hover:text-neutral-600 transition-colors" />}
      </div>

      {isVisible && (
        <div
          className={`absolute z-50 ${getSideClasses()} bg-neutral-900 text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg whitespace-normal break-words pointer-events-none`}
        >
          {content}
        </div>
      )}
    </div>
  )
}
