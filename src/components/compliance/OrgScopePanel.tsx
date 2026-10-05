'use client'

import React from 'react'
import { Building2 } from 'lucide-react'
import { useDashboard } from '@/lib/context/dashboardContext'
import { ORG_SCOPE_OPTIONS } from '@/lib/data/complianceMatrix'

export function OrgScopePanel({ compact = false }: { compact?: boolean }) {
  const { orgProfile, updateOrgProfile } = useDashboard()
  const on = ORG_SCOPE_OPTIONS.filter(o => orgProfile[o.key]).length

  const list = (
    <ul className="space-y-2">
      {ORG_SCOPE_OPTIONS.map(o => (
        <li key={o.key}>
          <label className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3 cursor-pointer hover:bg-neutral-50">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 accent-primary-600"
              checked={orgProfile[o.key]}
              onChange={e => updateOrgProfile({ ...orgProfile, [o.key]: e.target.checked })}
            />
            <span>
              <span className="block text-sm font-medium text-neutral-900">{o.label}</span>
              <span className="block text-xs text-neutral-500 mt-0.5">{o.help}</span>
            </span>
          </label>
        </li>
      ))}
    </ul>
  )

  const intro = (
    <p className="text-sm text-neutral-600 mb-3">
      Laws such as GDPR, India&apos;s DPDP Act or e-waste rules apply automatically based on each asset&apos;s country. Frameworks
      and sector rules only apply to some organisations, so they&apos;re included only when you switch them on here.
    </p>
  )

  if (compact) {
    return (
      <details className="bg-white border border-neutral-200 rounded-xl shadow-sm group">
        <summary className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 cursor-pointer list-none">
          <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <Building2 className="w-4 h-4 text-primary-600" />
            Your organisation&apos;s compliance scope
          </span>
          <span className="text-xs text-neutral-500">
            {on === 0 ? 'Laws only; no frameworks switched on' : `${on} framework${on > 1 ? 's' : ''} / sector rules switched on`} ·{' '}
            <span className="text-primary-600 font-medium group-open:hidden">Edit</span>
            <span className="text-primary-600 font-medium hidden group-open:inline">Close</span>
          </span>
        </summary>
        <div className="px-5 pb-5">
          {intro}
          {list}
        </div>
      </details>
    )
  }

  return (
    <section className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
      <h2 className="font-semibold text-neutral-900 flex items-center gap-2 mb-2">
        <Building2 className="w-5 h-5 text-primary-600" />
        Your organisation&apos;s compliance scope
      </h2>
      {intro}
      {list}
      <p className="text-xs text-neutral-500 mt-3">Saved in this browser for your account. Changes update every page immediately.</p>
    </section>
  )
}
