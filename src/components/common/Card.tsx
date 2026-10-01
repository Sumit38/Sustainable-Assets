import React from 'react'
import { Tooltip } from './Tooltip'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  tooltip?: string | React.ReactNode
}

export function Card({ children, className = '', onClick, tooltip }: CardProps) {
  return (
    <div
      className={`card ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : -1}
    >
      {tooltip && (
        <div className="absolute top-2 right-2 z-10">
          <Tooltip content={tooltip} side="left" />
        </div>
      )}
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  tooltip?: string | React.ReactNode
}

export function CardHeader({ children, className = '', onClick, tooltip }: CardHeaderProps) {
  return (
    <div className={`card-header ${className}`} onClick={onClick} role={onClick ? 'button' : undefined}>
      <div className="flex items-center gap-2 justify-between">
        <div className="flex-1">{children}</div>
        {tooltip && <Tooltip content={tooltip} side="left" />}
      </div>
    </div>
  )
}

interface CardBodyProps {
  children: React.ReactNode
  className?: string
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`card-body ${className}`}>{children}</div>
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return <div className={`card-footer ${className}`}>{children}</div>
}
