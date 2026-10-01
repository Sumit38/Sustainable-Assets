'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { InfoTip } from '@/components/common/InfoTip'

type Tone = 'danger' | 'warning' | 'success' | 'primary'

const TONES: Record<Tone, { bar: string; icon: string; value: string }> = {
  danger: { bar: 'bg-danger-500', icon: 'bg-danger-50 text-danger-600', value: 'text-danger-700' },
  warning: { bar: 'bg-warning-500', icon: 'bg-warning-50 text-warning-600', value: 'text-warning-700' },
  success: { bar: 'bg-success-500', icon: 'bg-success-50 text-success-600', value: 'text-success-700' },
  primary: { bar: 'bg-primary-500', icon: 'bg-primary-50 text-primary-600', value: 'text-primary-700' },
}

interface StoryCardProps {
  step: number
  title: string
  value: string
  unit?: string
  caption: string
  icon: ReactNode
  tone: Tone
  href: string
  info: ReactNode
  missingData?: string
  footnote?: string
}

export function StoryCard({
  step,
  title,
  value,
  unit,
  caption,
  icon,
  tone,
  href,
  info,
  missingData,
  footnote,
}: StoryCardProps) {
  const t = TONES[tone]

  return (
    <Link
      href={href}
      className="group relative flex flex-col bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md hover:border-neutral-300 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <span className={`h-1 rounded-t-xl ${t.bar}`} />
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className={`flex items-center justify-center w-10 h-10 rounded-lg ${t.icon}`}>{icon}</span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Step {step}</p>
              <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
            </div>
          </div>
          <InfoTip title={title}>{info}</InfoTip>
        </div>

        <div className="mt-4 flex-1">
          {missingData ? (
            <p className="text-sm text-neutral-500">
              <span className="block text-2xl font-bold text-neutral-300 mb-1">—</span>
              {missingData}
            </p>
          ) : (
            <>
              <p className={`text-3xl font-bold ${t.value}`}>
                {value}
                {unit && <span className="text-base font-medium text-neutral-500 ml-1">{unit}</span>}
              </p>
              <p className="text-sm text-neutral-600 mt-1">{caption}</p>
            </>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
          <span className="text-neutral-400 truncate">{footnote}</span>
          <span className="flex items-center gap-1 font-medium text-primary-600 group-hover:gap-2 transition-all flex-shrink-0">
            Details <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
