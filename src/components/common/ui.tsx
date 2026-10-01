'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { InfoTip } from '@/components/common/InfoTip'

export function Kpi({
  label,
  value,
  sub,
  info,
  tone = 'text-neutral-900',
  icon,
}: {
  label: string
  value: string
  sub?: string
  info?: ReactNode
  tone?: string
  icon?: ReactNode
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-neutral-400">{icon}</span>}
          <p className="text-sm font-medium text-neutral-600">{label}</p>
        </div>
        {info && <InfoTip title={label}>{info}</InfoTip>}
      </div>
      <p className={`text-2xl font-bold mt-1 ${tone}`}>{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
    </div>
  )
}

export function Panel({
  title,
  info,
  actions,
  children,
  className = '',
}: {
  title: string
  info?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`bg-white border border-neutral-200 rounded-xl p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="font-semibold text-neutral-900">{title}</h2>
        <div className="flex items-center gap-2">
          {actions}
          {info && <InfoTip title={title}>{info}</InfoTip>}
        </div>
      </div>
      {children}
    </section>
  )
}

export function NoData({ what }: { what: string }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center shadow-sm">
      <Inbox className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
      <p className="font-medium text-neutral-800">No asset data yet</p>
      <p className="text-sm text-neutral-500 mt-1">Upload your asset list on the Dashboard to see {what}.</p>
      <Link href="/dashboard" className="inline-block mt-4 text-sm font-medium text-primary-600 hover:underline">
        Go to Dashboard →
      </Link>
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-neutral-500 py-10 text-center">{children}</p>
}

const PILL_TONES = {
  danger: 'bg-danger-50 text-danger-700',
  warning: 'bg-warning-50 text-warning-700',
  success: 'bg-success-50 text-success-700',
  primary: 'bg-primary-50 text-primary-700',
  neutral: 'bg-neutral-100 text-neutral-700',
}

export type PillTone = keyof typeof PILL_TONES

export function Pill({ tone = 'neutral', children }: { tone?: PillTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${PILL_TONES[tone]}`}>
      {children}
    </span>
  )
}

export const HEALTH_LABEL: Record<string, { label: string; tone: PillTone }> = {
  healthy: { label: 'Healthy', tone: 'success' },
  'at-risk': { label: 'At risk', tone: 'warning' },
  critical: { label: 'Critical', tone: 'danger' },
  'end-of-life': { label: 'Past end of life', tone: 'neutral' },
}

export function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number
  pageSize: number
  total: number
  onPage: (p: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (total === 0) return null
  const from = page * pageSize + 1
  const to = Math.min(total, (page + 1) * pageSize)
  const btn =
    'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed'
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <p className="text-sm text-neutral-500">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} disabled={page === 0} onClick={() => onPage(page - 1)}>
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <span className="text-sm text-neutral-500">
          Page {page + 1} of {pages}
        </span>
        <button type="button" className={btn} disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export const buttonStyles = {
  primary:
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 disabled:opacity-50',
  secondary:
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 text-sm font-medium hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50',
}

export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number | undefined>>) {
  const esc = (v: string | number | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [headers, ...rows].map(r => r.map(esc).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
