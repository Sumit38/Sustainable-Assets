'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { Printer, Download, Lightbulb, ListChecks } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { Kpi, NoData, Panel, Empty, buttonStyles, downloadCsv } from '@/components/common/ui'
import { useDashboard } from '@/lib/context/dashboardContext'
import { getAssetProfile } from '@/lib/data/assetMaterialDatabase'
import {
  ALL,
  COMPLIANCE_THRESHOLD,
  DashboardFilters,
  EMPTY_FILTERS,
  computeInsights,
  filterAssets,
  filterOptions,
  filtersFromQuery,
  formatMoney,
  isPastEndOfLife,
  needsAction,
} from '@/lib/calculations/dashboardInsights'

const TIMELINE_COLORS = ['#dc2626', '#f97316', '#eab308', '#0ea5e9', '#22c55e']

function quarterKey(d: Date) {
  return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`
}

export default function ReportsPage() {
  const { importedAssets } = useDashboard()
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS)
  useEffect(() => setFilters(filtersFromQuery(window.location.search)), [])

  const options = useMemo(() => filterOptions(importedAssets), [importedAssets])
  const assets = useMemo(() => filterAssets(importedAssets, filters), [importedAssets, filters])
  const insights = useMemo(() => computeInsights(assets, filters.standard), [assets, filters.standard])

  const budget = useMemo(() => {
    const today = new Date()
    const quarters: Array<{ label: string; cost: number; count: number; withCost: number }> = [{ label: 'Overdue', cost: 0, count: 0, withCost: 0 }]
    const index = new Map<string, number>()
    for (let i = 0; i < 8; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i * 3, 1)
      const key = quarterKey(d)
      if (!index.has(key)) {
        index.set(key, quarters.length)
        quarters.push({ label: key, cost: 0, count: 0, withCost: 0 })
      }
    }
    let withCost = 0
    let reaching = 0
    for (const a of assets) {
      const end = new Date(a.lastDateOfSupport)
      if (isNaN(end.getTime())) continue
      const slot = isPastEndOfLife(a) ? 0 : index.get(quarterKey(end))
      if (slot === undefined) continue
      reaching++
      quarters[slot].count++
      if (typeof a.replacementCost === 'number') {
        quarters[slot].cost += a.replacementCost
        quarters[slot].withCost++
        withCost++
      }
    }
    const next12 = quarters.slice(0, 5).reduce((s, q) => s + q.cost, 0)
    const next12WithCost = quarters.slice(0, 5).reduce((s, q) => s + q.withCost, 0)
    return { quarters, withCost, reaching, next12, next12WithCost }
  }, [assets])

  const byType = useMemo(() => {
    const m = new Map<string, { sum: number; n: number }>()
    for (const a of assets) {
      const t = m.get(a.assetType) ?? { sum: 0, n: 0 }
      t.sum += a.complianceScore
      t.n++
      m.set(a.assetType, t)
    }
    return Array.from(m.entries())
      .map(([type, v]) => ({ type, score: Math.round(v.sum / v.n), n: v.n }))
      .sort((a, b) => a.score - b.score)
  }, [assets])

  if (importedAssets.length === 0) {
    return (
      <div className="w-full">
        <PageHeader title="Reports" description="Executive summary of your asset portfolio" homeHref="/welcome" />
        <div className="p-6">
          <NoData what="reports" />
        </div>
      </div>
    )
  }

  const { compliance, health, lithium, charts } = insights
  const total = assets.length
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0)
  const worstType = byType[0]
  const worstRegion = compliance.regions[0]
  const topReg = compliance.standards[0]
  const soon = charts.timeline[1].count
  const soonCost = budget.quarters.slice(1, 3).reduce((s, q) => s + q.cost, 0)
  const lowest = [...assets].filter(a => a.complianceScore < COMPLIANCE_THRESHOLD).sort((a, b) => a.complianceScore - b.complianceScore).slice(0, 3)

  const findings = [
    `${insights.actionCount} of ${total} assets (${pct(insights.actionCount)}%) need action now: ${compliance.pastEolCount} are past end of support and the rest are marked critical.`,
    `${compliance.nonCompliantCount} assets (${pct(compliance.nonCompliantCount)}%) score below the compliance target of ${COMPLIANCE_THRESHOLD}.`,
    worstType &&
      (worstType.score < COMPLIANCE_THRESHOLD
        ? `${worstType.type} is the weakest asset type, averaging a compliance score of ${worstType.score} across ${worstType.n} assets.`
        : `Every asset type averages at or above the target; the lowest is ${worstType.type} at ${worstType.score}.`),
    worstRegion && worstRegion.nonCompliant > 0 && `${worstRegion.region} has the most non-compliant assets (${worstRegion.nonCompliant} of ${worstRegion.total}).`,
    topReg && topReg.exposure > 0 && `${topReg.name} carries the largest possible fine: up to ${formatMoney(topReg.exposure)} across the countries where ${topReg.count} assets are below target.`,
    `${budget.reaching} assets are overdue or reach end of support in the next two years. Replacement cost for the overdue ones and the next 12 months is ${formatMoney(budget.next12)} (${budget.next12WithCost} assets with a Replacement Cost).`,
    health.employees.withData > 0 && `${health.employees.total.toLocaleString()} employees work with assets in poor condition.`,
  ].filter(Boolean) as string[]

  const recs: Array<{ tag: string; tone: string; text: string }> = []
  if (compliance.pastEolCount > 0) recs.push({ tag: 'Retire', tone: 'bg-danger-50 text-danger-700', text: `Replace or retire the ${compliance.pastEolCount} assets still in use after end of support.` })
  if (lowest.length > 0)
    recs.push({
      tag: 'Remediate',
      tone: 'bg-danger-50 text-danger-700',
      text: `Remediate the ${compliance.nonCompliantCount} non-compliant assets, starting with the lowest scores: ${lowest.map(a => `${a.assetId} (${a.complianceScore})`).join(', ')}.`,
    })
  if (soon > 0)
    recs.push({
      tag: 'Budget',
      tone: 'bg-warning-50 text-warning-700',
      text: `Plan for ${soon} assets reaching end of support within 6 months${soonCost > 0 ? `; their replacement cost is ${formatMoney(soonCost)}` : ''}.`,
    })
  if (health.employees.total > 0)
    recs.push({ tag: 'Health', tone: 'bg-warning-50 text-warning-700', text: `Prioritise replacements that affect people: ${health.employees.total.toLocaleString()} employees are exposed to assets in poor condition.` })
  if (lithium.lithiumAssets > 0)
    recs.push({
      tag: 'Recover',
      tone: 'bg-primary-50 text-primary-700',
      text: `Send the ${lithium.lithiumAssets} retiring lithium-battery devices to certified recycling or DLE to recover about ${lithium.lithiumKg.toFixed(2)} kg of lithium.`,
    })

  const scope = Object.entries(filters).filter(([, v]) => v !== ALL).map(([, v]) => v)

  const exportCsv = () =>
    downloadCsv(
      `assetpulse-report-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Asset ID', 'Product', 'Type', 'Department', 'Region', 'Health', 'Needs Action', 'Compliance Score', 'Last Date of Support', 'Replacement Cost', 'Employees Affected', 'Annual CO2e', 'Lithium Battery'],
      assets.map(a => [
        a.assetId, a.productName, a.assetType, a.department, a.region, isPastEndOfLife(a) ? 'end-of-life' : a.healthStatus,
        needsAction(a) ? 'Yes' : 'No', a.complianceScore, a.lastDateOfSupport, a.replacementCost, a.employeesAffected, a.annualCO2e,
        getAssetProfile(a.assetType)?.isDLESuitable ? 'Yes' : 'No',
      ])
    )

  return (
    <div className="w-full">
      <PageHeader title="Reports" description="Executive summary of your asset portfolio" homeHref="/welcome" />

      <div className="p-6 space-y-6">
        <div className="print:hidden">
          <FilterBar filters={filters} onChange={setFilters} options={options} shown={total} total={importedAssets.length} />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Asset portfolio report</h2>
            <p className="text-sm text-neutral-500">
              Generated {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })} · {total} assets ·{' '}
              {scope.length ? scope.join(' · ') : 'all regions, regulations, types and departments'}
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button type="button" onClick={exportCsv} className={buttonStyles.secondary}>
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button type="button" onClick={() => window.print()} className={buttonStyles.primary}>
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <Kpi label="Need action now" value={insights.actionCount.toString()} sub={`${pct(insights.actionCount)}% of assets`} tone="text-danger-600" />
          <Kpi label="Non-compliant" value={compliance.nonCompliantCount.toString()} sub={`score below ${COMPLIANCE_THRESHOLD}`} tone="text-danger-600" />
          <Kpi label="Possible fines" value={formatMoney(compliance.fineExposure)} sub="statutory maximum, once per law per country" />
          <Kpi
            label="Replacement cost, next 12 months"
            value={formatMoney(budget.next12)}
            sub={`incl. overdue · ${budget.next12WithCost} assets with cost data`}
            info="Sum of the Replacement Cost column for assets that are overdue or whose support ends within the next 12 months. Assets without a Replacement Cost are not estimated."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Key findings" actions={<Lightbulb className="w-4 h-4 text-warning-600" />}>
            <ul className="space-y-2.5">
              {findings.map((f, i) => (
                <li key={i} className="flex gap-3 text-sm text-neutral-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                  {f}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Recommended actions" actions={<ListChecks className="w-4 h-4 text-success-600" />}>
            {recs.length === 0 ? (
              <Empty>No actions needed for this selection.</Empty>
            ) : (
              <ul className="space-y-2.5">
                {recs.map(r => (
                  <li key={r.tag} className="flex gap-3 text-sm text-neutral-700">
                    <span className={`flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded h-fit ${r.tone}`}>{r.tag}</span>
                    {r.text}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <Panel
          title="Replacement budget by quarter"
          info="Replacement Cost of assets grouped by the quarter their support ends. 'Overdue' are assets already past end of support. Uses only the costs in your file."
        >
          {budget.withCost === 0 ? (
            <Empty>Add the “Replacement Cost” column to your file to see the budget.</Empty>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budget.quarters} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} />
                  <YAxis tickFormatter={v => formatMoney(v)} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number, _n, p: any) => [`${formatMoney(v)} (${p.payload.count} assets)`, 'Replacement cost']} />
                  <Bar dataKey="cost" maxBarSize={48} radius={[4, 4, 0, 0]}>
                    {budget.quarters.map((q, i) => (
                      <Cell key={q.label} fill={i === 0 ? '#dc2626' : '#0ea5e9'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Compliance by asset type" info={`Average Compliance Score per asset type, weakest first. The dashed line is the target of ${COMPLIANCE_THRESHOLD}.`}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byType} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="type" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number, _n, p: any) => [`${v} (${p.payload.n} assets)`, 'Avg score']} />
                  <ReferenceLine x={COMPLIANCE_THRESHOLD} stroke="#64748b" strokeDasharray="4 4" />
                  <Bar dataKey="score" maxBarSize={22} radius={[0, 4, 4, 0]}>
                    {byType.map(d => (
                      <Cell key={d.type} fill={d.score < COMPLIANCE_THRESHOLD ? '#ef4444' : '#22c55e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel title="End-of-support timeline" info="How many assets reach their Last Date of Support in each period.">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.timeline} margin={{ left: -16, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v} assets`, 'Support ends']} />
                  <Bar dataKey="count" maxBarSize={48} radius={[4, 4, 0, 0]}>
                    {charts.timeline.map((_, i) => (
                      <Cell key={i} fill={TIMELINE_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
