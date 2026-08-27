import React from 'react'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  const badgeClass = `badge-${variant}`
  return <span className={`badge ${badgeClass} ${className}`}>{children}</span>
}
