'use client'

import React, { ReactNode, useState } from 'react'
import { Info } from 'lucide-react'

interface InfoTipProps {
  title?: string
  children: ReactNode
  align?: 'left' | 'right'
}

export function InfoTip({ title, children, align = 'right' }: InfoTipProps) {
  const [open, setOpen] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={title ? `About ${title}` : 'More information'}
        className="p-1 rounded-full text-neutral-400 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        onClick={e => {
          // Inside clickable cards: show the explanation instead of navigating
          e.preventDefault()
          e.stopPropagation()
          setOpen(o => !o)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <Info className="w-4 h-4" />
      </button>
      {open && (
        <span
          role="tooltip"
          className={`absolute z-30 top-full mt-2 w-72 max-w-[80vw] rounded-lg bg-neutral-900 text-white text-xs leading-relaxed p-3 shadow-xl text-left font-normal ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {title && <span className="block font-semibold mb-1">{title}</span>}
          {children}
        </span>
      )}
    </span>
  )
}
