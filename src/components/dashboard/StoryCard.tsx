'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { InfoTip } from '@/components/common/InfoTip'

export type Tone = 'danger' | 'warning' | 'success' | 'primary'

const TONES: Record<Tone, { bar: string; icon: string; value: string }> = {
  danger: { bar: 'bg-danger-500', icon: 'bg-danger-50 text-danger-600', value: 'text-danger-700' },
  warning: { bar: 'bg-warning-500', icon: 'bg-warning-50 text-warning-600', value: 'text-warning-700' },
  success: { bar: 'bg-success-500', icon: 'bg-success-50 text-success-600', value: 'text-success-700' },
  primary: { bar: 'bg-primary-500', icon: 'bg-primary-50 text-primary-600', value: 'text-primary-700' },
}

const STAT_TONES = {
  danger: 'text-danger-600',
  warning: 'text-warning-600',
  success: 'text-success-600',
  neutral: 'text-neutral-900',
}

export interface CardStat {
  label: string
  value: string
  tone?: keyof typeof STAT_TONES
}

interface StoryCardProps {
  title: string
  value: string
  unit?: string
  caption: string
  icon: ReactNode
  tone: Tone
  href: string
  info: ReactNode
  stats: CardStat[]
  missingData?: string
}

export function StoryCard({ title, value, unit, caption, icon, tone, href, info, stats, missingData }: StoryCardProps) {
  const t = TONES[tone]

  return (
    <Link
      href={href}
      className="group flex flex-col bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md hover:border-neutral-300 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <span className={`h-1 rounded-t-xl ${t.bar}`} />
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between gap-2 h-10">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 ${t.icon}`}>{icon}</span>
            <h3 className="text-sm font-semibold text-neutral-900 truncate">{title}</h3>
          </div>
          <InfoTip title={title}>{info}</InfoTip>
        </div>

        <div className="mt-4 min-h-[5.5rem]">
          {missingData ? (
            <>
              <p className="text-3xl font-bold text-neutral-300">—</p>
              <p className="text-sm text-neutral-500 mt-1">{missingData}</p>
            </>
          ) : (
            <>
              <p className={`text-3xl font-bold leading-tight ${t.value}`}>
                {value}
                {unit && <span className="text-base font-medium text-neutral-500 ml-1.5">{unit}</span>}
              </p>
              <p className="text-sm text-neutral-600 mt-1">{caption}</p>
            </>
          )}
        </div>

        <dl className="mt-3 pt-3 border-t border-neutral-100 space-y-2 flex-1">
          {stats.map(s => (
            <div key={s.label} className="flex items-baseline justify-between gap-3 text-sm">
              <dt className="text-neutral-500">{s.label}</dt>
              <dd className={`font-semibold whitespace-nowrap ${STAT_TONES[s.tone ?? 'neutral']}`}>{s.value}</dd>
            </div>
          ))}
        </dl>

        <span className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-end gap-1 text-sm font-medium text-primary-600 group-hover:gap-2 transition-all">
          View details <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  )
}
