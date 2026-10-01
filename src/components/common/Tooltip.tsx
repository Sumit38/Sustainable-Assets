'use client'

import React, { useState, ReactNode } from 'react'
import { Info } from 'lucide-react'

interface TooltipProps {
  content: string | ReactNode
  children?: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  icon?: boolean
}

export function Tooltip({ content, children, side = 'top', icon = true }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    let top = rect.top - 10
    let left = rect.left + rect.width / 2

    // Adjust position based on side
    if (side === 'bottom') {
      top = rect.bottom + 10
    } else if (side === 'left') {
      left = rect.left - 10
      top = rect.top + rect.height / 2
    } else if (side === 'right') {
      left = rect.right + 10
      top = rect.top + rect.height / 2
    }

    setPosition({ top, left })
    setIsVisible(true)
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help inline-flex items-center gap-1"
      >
        {children}
        {icon && !children && <Info className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />}
      </div>

      {isVisible && (
        <div
          className="fixed z-50 bg-neutral-900 text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform:
              side === 'top'
                ? 'translate(-50%, -100%)'
                : side === 'bottom'
                  ? 'translate(-50%, 0)'
                  : side === 'left'
                    ? 'translate(-100%, -50%)'
                    : 'translate(0, -50%)',
          }}
        >
          <div className="break-words">{content}</div>
          {/* Arrow indicator */}
          <div
            className="absolute w-2 h-2 bg-neutral-900 rotate-45"
            style={{
              ...(side === 'top' && { bottom: '-4px', left: '50%', transform: 'translateX(-50%)' }),
              ...(side === 'bottom' && { top: '-4px', left: '50%', transform: 'translateX(-50%)' }),
              ...(side === 'left' && { right: '-4px', top: '50%', transform: 'translateY(-50%)' }),
              ...(side === 'right' && { left: '-4px', top: '50%', transform: 'translateY(-50%)' }),
            }}
          />
        </div>
      )}
    </div>
  )
}
