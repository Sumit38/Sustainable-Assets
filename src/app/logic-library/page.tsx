'use client'

import React, { useEffect, useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Pill, PillTone } from '@/components/common/ui'
import { COMPLIANCE_STANDARDS } from '@/lib/data/complianceMatrix'
import { ASSET_MATERIAL_DATABASE } from '@/lib/data/assetMaterialDatabase'
import { COMPLIANCE_THRESHOLD, formatMoney } from '@/lib/calculations/dashboardInsights'

type Source = 'file' | 'reference' | 'rule'
const SOURCE: Record<Source, { label: string; tone: PillTone }> = {
  file: { label: 'From your file', tone: 'success' },
  reference: { label: 'Reference data', tone: 'primary' },
  rule: { label: 'Fixed rule', tone: 'neutral' },
}

interface Entry {
  id: string
  group: string
  title: string
  summary: string
  formula: string
  inputs: Array<{ name: string; source: Source }>
  notes?: string[]
}

const ENTRIES: Entry[] = [
  {
    id: 'needs-action',
    group: 'Lifecycle',
    title: 'Needs action / past end of support',
    summary: 'Which assets should be replaced or retired now.',
    formula: `Past end of support = Last Date of Support < today  OR  Health Status = end-of-life
Needs action        = Past end of support  OR  Health Status = critical`,
    inputs: [
      { name: 'Last Date of Support', source: 'file' },
      { name: 'Health Status', source: 'file' },
    ],
    notes: ['An asset past its support date is treated as end-of-life even if the file says otherwise.'],
  },
  {
    id: 'compliance',
    group: 'Compliance',
    title: 'Non-compliant assets & violation rate',
    summary: 'How many assets fail the compliance target.',
    formula: `Non-compliant   = Compliance Score < ${COMPLIANCE_THRESHOLD}
Violation rate  = Non-compliant ÷ Total assets × 100
Risk score (0–10) = Violation rate ÷ 10`,
    inputs: [
      { name: 'Compliance Score', source: 'file' },
      { name: `Target of ${COMPLIANCE_THRESHOLD}`, source: 'rule' },
    ],
  },
  {
    id: 'fines',
    group: 'Compliance',
    title: 'Potential fines',
    summary: 'Regulatory penalties non-compliant assets could trigger.',
    formula: `For each non-compliant asset:
  for each regulation that applies to its Asset Type in its Region:
    add that regulation's fine per violation
Potential fines = sum of all of the above`,
    inputs: [
      { name: 'Compliance Score, Asset Type, Region', source: 'file' },
      { name: 'Regulations per type & region', source: 'reference' },
      { name: 'Fine per violation (table below)', source: 'reference' },
    ],
    notes: ['Frameworks (ISO 27001, SOC 2, NIST) have no government fine and count as $0.'],
  },
  {
    id: 'health',
    group: 'Employee health',
    title: 'Employees exposed',
    summary: 'People working with assets in poor condition.',
    formula: `Employees exposed = Σ Employees Affected, for assets that are at risk, critical or past end of life
Share exposed     = Employees exposed ÷ Σ Employees Affected (all assets) × 100`,
    inputs: [
      { name: 'Employees Affected', source: 'file' },
      { name: 'Health Status, Last Date of Support', source: 'file' },
    ],
    notes: ['Assets without an Employees Affected value are left out, not estimated.'],
  },
  {
    id: 'avg-health',
    group: 'Employee health',
    title: 'Average asset health',
    summary: 'A single 0–100 condition score for the portfolio.',
    formula: `Points: healthy 100 · at risk 50 · critical 25 · past end of life 0
Average asset health = average points across assets`,
    inputs: [
      { name: 'Health Status', source: 'file' },
      { name: 'Points per status', source: 'rule' },
    ],
  },
  {
    id: 'carbon',
    group: 'Sustainability',
    title: 'Carbon footprint',
    summary: 'Annual emissions of your assets.',
    formula: `From assets due for replacement = Σ Annual CO2e, for assets that need action
Carbon footprint (all)          = Σ Annual CO2e (all assets) + landfill methane for retiring assets
Methane                         = methane factor of the asset type × global-warming potential`,
    inputs: [
      { name: 'Annual CO2e (tonnes)', source: 'file' },
      { name: 'Methane factor per asset type', source: 'reference' },
    ],
  },
  {
    id: 'gpi',
    group: 'Sustainability',
    title: 'Global Pollution Index (GPI)',
    summary: 'Combined environmental score, 0–100, higher is worse.',
    formula: `Scope 2 ≈ 30% and Scope 3 ≈ 40% of operational CO2e
Each ratio = actual ÷ replaceable baseline (capped at 100%)
GPI = average(Scope 2, Scope 3, Energy ratios) × (assets needing replacement ÷ total) × 100`,
    inputs: [
      { name: 'Annual CO2e', source: 'file' },
      { name: 'Scope 2/3 split', source: 'rule' },
      { name: 'Baselines: 0.5 t, 0.8 t per replaceable asset; 0.3 t per asset', source: 'rule' },
    ],
    notes: ['The Scope 2/3 split and baselines are fixed estimates, not taken from your file.'],
  },
  {
    id: 'lithium',
    group: 'Lithium recovery',
    title: 'Recoverable lithium & mining CO₂e avoided',
    summary: 'Lithium that retiring battery devices can return.',
    formula: `For each battery device that needs action:
  lithium      += average of its type's typical lithium content (min–max)
  CO2e avoided += its type's CO2e saving versus primary mining`,
    inputs: [
      { name: 'Asset Type, Health Status, Last Date of Support', source: 'file' },
      { name: 'Lithium content & CO2e saving per type (table below)', source: 'reference' },
    ],
  },
  {
    id: 'replacement-ratio',
    group: 'Lifecycle',
    title: 'Replacement ratio',
    summary: 'Share of the portfolio that should be replaced.',
    formula: 'Replacement ratio = (critical + past end of life) ÷ total assets × 100',
    inputs: [{ name: 'Health Status, Last Date of Support', source: 'file' }],
  },
  {
    id: 'continuity',
    group: 'Lifecycle',
    title: 'Business continuity risk',
    summary: 'How exposed you are to sudden asset failures.',
    formula: 'Replacement ratio: ≤ 10% Low · > 10% Medium · > 20% High · > 30% Critical',
    inputs: [
      { name: 'Replacement ratio', source: 'file' },
      { name: 'Thresholds', source: 'rule' },
    ],
  },
  {
    id: 'savings',
    group: 'Financial',
    title: 'Savings potential & investment required',
    summary: 'What replacing ageing assets saves and costs.',
    formula: `Failure risk: healthy 5% · at risk 30% · critical 70% · past end of life 100%
Savings    = Σ Annual Maintenance Cost + Σ (Downtime Hours × Downtime Cost per Hour × failure risk)
Investment = Σ Replacement Cost, for critical and past-end-of-life assets`,
    inputs: [
      { name: 'Maintenance, downtime and replacement costs', source: 'file' },
      { name: 'Failure risk per status', source: 'rule' },
    ],
  },
  {
    id: 'roi',
    group: 'Financial',
    title: 'Payback period & 3-year ROI',
    summary: 'How quickly a replacement programme pays for itself.',
    formula: `Payback (months) = Investment ÷ Savings × 12
3-year ROI (%)   = (3 × Savings − Investment) ÷ Investment × 100`,
    inputs: [{ name: 'Savings & investment (above)', source: 'file' }],
  },
]

const GROUPS = Array.from(new Set(ENTRIES.map(e => e.group)))

export default function LogicLibraryPage() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<Set<string>>(new Set())

  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id) return
    setOpen(new Set([id]))
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }, [])

  const q = query.trim().toLowerCase()
  const shown = ENTRIES.filter(e => !q || [e.title, e.summary, e.formula, e.group].some(t => t.toLowerCase().includes(q)))
  const toggle = (id: string) =>
    setOpen(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const standards = Object.values(COMPLIANCE_STANDARDS).sort((a, b) => b.finePerViolation - a.finePerViolation)
  const battery = Object.values(ASSET_MATERIAL_DATABASE).filter(p => p.isDLESuitable)

  return (
    <div className="w-full">
      <PageHeader title="Logic Library" description="How every AssetPulse number is calculated, and where its inputs come from" homeHref="/welcome" />

      <div className="p-6 space-y-6 max-w-5xl">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="flex flex-wrap gap-2 text-xs text-neutral-600 items-center">
            <span>Input sources:</span>
            {(Object.keys(SOURCE) as Source[]).map(s => (
              <Pill key={s} tone={SOURCE[s].tone}>{SOURCE[s].label}</Pill>
            ))}
          </div>
          <div className="relative md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search formulas…"
              aria-label="Search formulas"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {GROUPS.map(group => {
          const items = shown.filter(e => e.group === group)
          if (items.length === 0) return null
          return (
            <section key={group}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">{group}</h2>
              <div className="bg-white border border-neutral-200 rounded-xl shadow-sm divide-y divide-neutral-100">
                {items.map(e => {
                  const isOpen = open.has(e.id) || !!q
                  return (
                    <div key={e.id} id={e.id} className="scroll-mt-32">
                      <button
                        type="button"
                        onClick={() => toggle(e.id)}
                        aria-expanded={isOpen}
                        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-neutral-50"
                      >
                        <div>
                          <p className="font-medium text-neutral-900">{e.title}</p>
                          <p className="text-sm text-neutral-500">{e.summary}</p>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-neutral-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 space-y-3">
                          <pre className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-xs leading-relaxed font-mono text-neutral-800 whitespace-pre-wrap">
                            {e.formula}
                          </pre>
                          <div className="flex flex-wrap gap-2">
                            {e.inputs.map(i => (
                              <span key={i.name} className="inline-flex items-center gap-2 text-xs text-neutral-700 border border-neutral-200 rounded-lg px-2 py-1">
                                {i.name}
                                <Pill tone={SOURCE[i.source].tone}>{SOURCE[i.source].label}</Pill>
                              </span>
                            ))}
                          </div>
                          {e.notes?.map(n => (
                            <p key={n} className="text-xs text-neutral-500">
                              Note: {n}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        {shown.length === 0 && <p className="text-sm text-neutral-500 text-center py-6">No formulas match “{query}”.</p>}

        <section id="fine-table" className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-neutral-900 mb-1">Reference: fines per regulation</h2>
          <p className="text-sm text-neutral-500 mb-3">The values AssetPulse uses for potential fines. Frameworks carry no government fine.</p>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
                  <th className="px-5 py-2 font-medium">Regulation</th>
                  <th className="px-3 py-2 font-medium">Region</th>
                  <th className="px-3 py-2 font-medium">Risk</th>
                  <th className="px-3 py-2 font-medium text-right">Fine per violation</th>
                  <th className="px-5 py-2 font-medium text-right">Stated maximum</th>
                </tr>
              </thead>
              <tbody>
                {standards.map(s => (
                  <tr key={s.id} className="border-b border-neutral-100">
                    <td className="px-5 py-2 text-neutral-900">{s.name}</td>
                    <td className="px-3 py-2 text-neutral-600">{s.region.split(' (')[0]}</td>
                    <td className="px-3 py-2"><Pill tone={s.risk === 'CRITICAL' ? 'danger' : s.risk === 'HIGH' ? 'warning' : 'neutral'}>{s.risk}</Pill></td>
                    <td className="px-3 py-2 text-right font-medium text-neutral-900">{s.finePerViolation ? formatMoney(s.finePerViolation) : 'Framework, no fine'}</td>
                    <td className="px-5 py-2 text-right text-neutral-600">{s.maxFinePossible ? formatMoney(s.maxFinePossible) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="lithium-table" className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-neutral-900 mb-1">Reference: lithium per battery device</h2>
          <p className="text-sm text-neutral-500 mb-3">Typical lithium content used when your file doesn&apos;t record battery size.</p>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
                  <th className="px-5 py-2 font-medium">Device type</th>
                  <th className="px-3 py-2 font-medium text-right">Lithium (kg)</th>
                  <th className="px-5 py-2 font-medium text-right">CO₂e avoided vs mining</th>
                </tr>
              </thead>
              <tbody>
                {battery.map(p => (
                  <tr key={p.assetType} className="border-b border-neutral-100">
                    <td className="px-5 py-2 text-neutral-900">{p.assetType}</td>
                    <td className="px-3 py-2 text-right text-neutral-700">{p.lithiumContent.min}–{p.lithiumContent.max}</td>
                    <td className="px-5 py-2 text-right text-neutral-700">{p.co2eSavingsVsPrimaryMining} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
