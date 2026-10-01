'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import { PageHeader } from '@/components/common/PageHeader'
import { Kpi, NoData, Panel } from '@/components/common/ui'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { useDashboard } from '@/lib/context/dashboardContext'
import { ComplianceStandard, Region, getApplicableStandards } from '@/lib/data/complianceMatrix'
import {
  ALL,
  COMPLIANCE_THRESHOLD,
  DashboardFilters,
  EMPTY_FILTERS,
  computeInsights,
  filterAssets,
  filterOptions,
  filtersFromQuery,
  filtersToQuery,
  formatMoney,
  formatNumber,
  isPastEndOfLife,
} from '@/lib/calculations/dashboardInsights'

const PAGE_SIZE = 25
const SCORE_BUCKETS = [
  { label: '0–19', min: 0, max: 20 },
  { label: '20–39', min: 20, max: 40 },
  { label: '40–59', min: 40, max: 60 },
  { label: '60–79', min: 60, max: 80 },
  { label: '80–100', min: 80, max: 101 },
]

const shortRegion = (r: string) => r.split(' (')[0]

export default function CompliancePage() {
  const router = useRouter()
  const { importedAssets } = useDashboard()
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS)
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    setFilters(filtersFromQuery(window.location.search))
  }, [])

  const updateFilters = (f: DashboardFilters) => {
    setFilters(f)
    setVisible(PAGE_SIZE)
    window.history.replaceState(null, '', `/compliance${filtersToQuery(f)}`)
  }
  const toggle = (key: keyof DashboardFilters, value: string) =>
    updateFilters({ ...filters, [key]: filters[key] === value ? ALL : value })

  const options = useMemo(() => filterOptions(importedAssets), [importedAssets])
  const filtered = useMemo(() => filterAssets(importedAssets, filters), [importedAssets, filters])
  const { compliance } = useMemo(() => computeInsights(filtered, filters.standard), [filtered, filters.standard])

  const nonCompliant = useMemo(
    () =>
      filtered
        .filter(a => a.complianceScore < COMPLIANCE_THRESHOLD)
        .sort((a, b) => a.complianceScore - b.complianceScore),
    [filtered]
  )

  const avgScore = filtered.length ? filtered.reduce((s, a) => s + a.complianceScore, 0) / filtered.length : 0

  const regionData = compliance.regions.map(r => ({
    region: r.region,
    name: shortRegion(r.region),
    'Non-compliant': r.nonCompliant,
    Compliant: r.total - r.nonCompliant,
  }))

  const fineData = compliance.standards.map(s => ({ standard: s.standard, name: s.standard, exposure: s.exposure, count: s.count }))

  const scoreData = SCORE_BUCKETS.map(b => ({
    label: b.label,
    count: filtered.filter(a => a.complianceScore >= b.min && a.complianceScore < b.max).length,
    failing: b.max <= COMPLIANCE_THRESHOLD,
  }))

  const deptMap = new Map<string, number>()
  for (const a of nonCompliant) deptMap.set(a.department, (deptMap.get(a.department) ?? 0) + 1)
  const deptData = Array.from(deptMap.entries())
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  const back = () => router.push(`/dashboard${filtersToQuery(filters)}`)

  if (importedAssets.length === 0) {
    return (
      <div className="w-full">
        <PageHeader title="Compliance" homeHref="/welcome" showBackButton onBack={back} />
        <div className="p-6">
          <NoData what="compliance details" />
        </div>
      </div>
    )
  }

  const pct = filtered.length ? Math.round((nonCompliant.length / filtered.length) * 100) : 0

  return (
    <div className="w-full">
      <PageHeader
        title="Compliance"
        description="Which assets break which rules, where, and what it could cost"
        homeHref="/welcome"
        showBackButton
        onBack={back}
      />

      <div className="p-6 space-y-6">
        <FilterBar filters={filters} onChange={updateFilters} options={options} shown={filtered.length} total={importedAssets.length} />

        {filtered.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center text-neutral-500">No assets match these filters.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <Kpi
                label="Non-compliant assets"
                value={formatNumber(nonCompliant.length)}
                sub={`${pct}% of ${filtered.length} assets`}
                tone="text-danger-600"
                info={<>Assets whose Compliance Score in your file is below {COMPLIANCE_THRESHOLD}.</>}
              />
              <Kpi
                label="Past end of support"
                value={formatNumber(compliance.pastEolCount)}
                sub="still in use, no longer patched"
                tone="text-neutral-900"
                info="Assets whose Last Date of Support has passed (or are marked end-of-life). They no longer receive safety or security fixes."
              />
              <Kpi
                label="Potential fines"
                value={formatMoney(compliance.fineExposure)}
                sub={filters.standard === ALL ? 'across all regulations' : `${filters.standard} only`}
                tone="text-danger-600"
                info="Each non-compliant asset × the published fine per violation of every regulation that applies to its type and region. Frameworks (ISO 27001, SOC 2, NIST) carry no government fine."
              />
              <Kpi
                label="Average compliance score"
                value={avgScore.toFixed(0)}
                sub={`target: ${COMPLIANCE_THRESHOLD} or above`}
                tone={avgScore < COMPLIANCE_THRESHOLD ? 'text-warning-600' : 'text-success-600'}
                info="Average of the Compliance Score column for the assets in this selection."
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Panel title="Compliance by region" info="Compliant vs non-compliant assets per region. Click a bar to filter the page to that region.">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionData} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar maxBarSize={36} dataKey="Non-compliant" stackId="a" fill="#ef4444" cursor="pointer" onClick={(d: any) => toggle('region', d.region)} />
                      <Bar maxBarSize={36} dataKey="Compliant" stackId="a" fill="#cbd5e1" radius={[0, 4, 4, 0]} cursor="pointer" onClick={(d: any) => toggle('region', d.region)} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel
                title="Potential fines by regulation"
                info="Fine exposure for each regulation that applies to your non-compliant assets. Click a bar to filter the page to that regulation."
              >
                {fineData.length === 0 ? (
                  <p className="text-sm text-neutral-500 py-16 text-center">No non-compliant assets in this selection.</p>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fineData} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tickFormatter={v => formatMoney(v)} tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: number, _n, p: any) => [`${formatMoney(v)} (${p.payload.count} assets)`, 'Potential fines']} />
                        <Bar maxBarSize={36} dataKey="exposure" radius={[0, 4, 4, 0]} cursor="pointer" onClick={(d: any) => toggle('standard', d.standard)}>
                          {fineData.map(d => (
                            <Cell key={d.standard} fill={filters.standard === d.standard ? '#b91c1c' : '#f87171'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Panel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Panel
                title="Compliance score distribution"
                info={`How many assets fall in each score band. Red bands are below the compliance target of ${COMPLIANCE_THRESHOLD}.`}
              >
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreData} margin={{ left: -16, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [`${v} assets`, 'Assets']} />
                      <Bar maxBarSize={36} dataKey="count" radius={[4, 4, 0, 0]}>
                        {scoreData.map(d => (
                          <Cell key={d.label} fill={d.failing ? '#ef4444' : '#22c55e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="Non-compliant assets by department" info="Which teams own the most non-compliant assets. Click a bar to filter the page to that department.">
                {deptData.length === 0 ? (
                  <p className="text-sm text-neutral-500 py-16 text-center">No non-compliant assets in this selection.</p>
                ) : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deptData} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="department" width={120} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: number) => [`${v} assets`, 'Non-compliant']} />
                        <Bar maxBarSize={36} dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} cursor="pointer" onClick={(d: any) => toggle('department', d.department)} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Panel>
            </div>

            <Panel
              title={`Non-compliant assets (${nonCompliant.length})`}
              info="Every asset in this selection with a Compliance Score below the target, lowest score first. These are the assets to fix or replace first."
            >
              {nonCompliant.length === 0 ? (
                <p className="text-sm text-neutral-500 py-6 text-center">All assets in this selection meet the compliance target.</p>
              ) : (
                <>
                  <div className="overflow-x-auto -mx-5">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
                          <th className="px-5 py-2 font-medium">Asset</th>
                          <th className="px-3 py-2 font-medium">Type</th>
                          <th className="px-3 py-2 font-medium">Region</th>
                          <th className="px-3 py-2 font-medium">Department</th>
                          <th className="px-3 py-2 font-medium text-right">Score</th>
                          <th className="px-3 py-2 font-medium">Support ends</th>
                          <th className="px-5 py-2 font-medium">Regulations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nonCompliant.slice(0, visible).map(a => {
                          const regs = getApplicableStandards(a.assetType, a.region as Region)
                          const past = isPastEndOfLife(a)
                          return (
                            <tr key={a.assetId} className="border-b border-neutral-100 hover:bg-neutral-50">
                              <td className="px-5 py-2">
                                <p className="font-medium text-neutral-900">{a.assetId}</p>
                                <p className="text-xs text-neutral-500 truncate max-w-[200px]">{a.productName}</p>
                              </td>
                              <td className="px-3 py-2 text-neutral-700">{a.assetType}</td>
                              <td className="px-3 py-2 text-neutral-700">{shortRegion(a.region)}</td>
                              <td className="px-3 py-2 text-neutral-700">{a.department}</td>
                              <td className="px-3 py-2 text-right font-semibold text-danger-600">{a.complianceScore}</td>
                              <td className={`px-3 py-2 whitespace-nowrap ${past ? 'text-danger-600 font-medium' : 'text-neutral-700'}`}>
                                {a.lastDateOfSupport}
                                {past && ' (ended)'}
                              </td>
                              <td className="px-5 py-2">
                                <div className="flex flex-wrap gap-1">
                                  {regs.length === 0 ? (
                                    <span className="text-xs text-neutral-400">None mapped</span>
                                  ) : (
                                    regs.map((r: ComplianceStandard) => (
                                      <span
                                        key={r}
                                        className={`text-[11px] px-1.5 py-0.5 rounded ${
                                          filters.standard === r ? 'bg-danger-500 text-white' : 'bg-neutral-100 text-neutral-700'
                                        }`}
                                      >
                                        {r}
                                      </span>
                                    ))
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  {visible < nonCompliant.length && (
                    <div className="text-center pt-4">
                      <button
                        type="button"
                        onClick={() => setVisible(v => v + PAGE_SIZE)}
                        className="text-sm font-medium text-primary-600 hover:underline"
                      >
                        Show {Math.min(PAGE_SIZE, nonCompliant.length - visible)} more
                      </button>
                    </div>
                  )}
                </>
              )}
            </Panel>
          </>
        )}
      </div>
    </div>
  )
}
