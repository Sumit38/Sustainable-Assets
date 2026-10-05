'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, ReferenceLine } from 'recharts'
import { PageHeader } from '@/components/common/PageHeader'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { AssetDrawer } from '@/components/assets/AssetDrawer'
import { Kpi, NoData, Panel, Pagination, Pill, Empty } from '@/components/common/ui'
import { useDashboard } from '@/lib/context/dashboardContext'
import { ImportedAsset } from '@/lib/calculations/metricCalculator'
import { ComplianceStandard, getApplicableStandards, standardLabel } from '@/lib/data/complianceMatrix'
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

const PAGE_SIZE = 20
const SCORE_BUCKETS = [
  { label: '0–39', min: 0, max: 40, color: '#ef4444' },
  { label: '40–59', min: 40, max: 60, color: '#f97316' },
  { label: '60–79', min: 60, max: 80, color: '#eab308' },
  { label: '80–89', min: 80, max: 90, color: '#4ade80' },
  { label: '90–100', min: 90, max: 101, color: '#16a34a' },
]
const rateColor = (r: number) => (r >= 90 ? '#16a34a' : r >= 75 ? '#eab308' : '#ef4444')
const rateTone = (r: number) => (r >= 90 ? 'text-success-600' : r >= 75 ? 'text-warning-600' : 'text-danger-600')
const shortRegion = (r: string) => r.split(' (')[0]

type ListView = 'all' | 'compliant' | 'below'

export default function CompliancePage() {
  const router = useRouter()
  const { importedAssets } = useDashboard()
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS)
  const [listView, setListView] = useState<ListView>('all')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<ImportedAsset | null>(null)

  useEffect(() => {
    setFilters(filtersFromQuery(window.location.search))
  }, [])
  useEffect(() => setPage(0), [filters, listView])

  const updateFilters = (f: DashboardFilters) => {
    setFilters(f)
    window.history.replaceState(null, '', `/compliance${filtersToQuery(f)}`)
  }
  const toggle = (key: keyof DashboardFilters, value: string) =>
    updateFilters({ ...filters, [key]: filters[key] === value ? ALL : value })

  const options = useMemo(() => filterOptions(importedAssets), [importedAssets])
  const filtered = useMemo(() => filterAssets(importedAssets, filters), [importedAssets, filters])
  const { compliance } = useMemo(() => computeInsights(filtered, filters.standard), [filtered, filters.standard])

  const list = useMemo(() => {
    const rows = filtered.filter(a =>
      listView === 'compliant' ? a.complianceScore >= COMPLIANCE_THRESHOLD : listView === 'below' ? a.complianceScore < COMPLIANCE_THRESHOLD : true
    )
    return rows.sort((a, b) => b.complianceScore - a.complianceScore)
  }, [filtered, listView])

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

  const regionData = [...compliance.regions]
    .sort((a, b) => b.total - a.total)
    .map(r => ({ region: r.region, name: shortRegion(r.region), rate: r.rate, compliant: r.compliant, total: r.total }))

  const regulationData = compliance.regulations.map(r => ({
    standard: r.standard,
    name: r.short,
    fullName: r.name,
    Compliant: r.compliant,
    'Below target': r.nonCompliant,
    rate: r.rate,
    exposure: r.exposure,
  }))

  const scoreData = SCORE_BUCKETS.map(b => ({
    ...b,
    count: filtered.filter(a => a.complianceScore >= b.min && a.complianceScore < b.max).length,
  }))

  const deptMap = new Map<string, { total: number; compliant: number }>()
  for (const a of filtered) {
    const d = deptMap.get(a.department) ?? { total: 0, compliant: 0 }
    d.total++
    if (a.complianceScore >= COMPLIANCE_THRESHOLD) d.compliant++
    deptMap.set(a.department, d)
  }
  const deptData = Array.from(deptMap.entries())
    .map(([department, d]) => ({ department, rate: Math.round((d.compliant / d.total) * 100), compliant: d.compliant, total: d.total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  const counts = {
    all: filtered.length,
    compliant: compliance.compliantCount,
    below: compliance.nonCompliantCount,
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Compliance"
        description="The regulations your assets fall under in each country, how compliant you are, and the possible fines"
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
                label="Compliance rate"
                value={`${compliance.complianceRate}%`}
                sub={`${formatNumber(compliance.compliantCount)} of ${formatNumber(filtered.length)} assets meet the target`}
                tone={rateTone(compliance.complianceRate)}
                info={`Share of assets whose Compliance Score is ${COMPLIANCE_THRESHOLD} or above.`}
              />
              <Kpi
                label="Regulations in scope"
                value={compliance.regulations.length.toString()}
                sub={`covering ${formatNumber(compliance.assetsInScope)} assets`}
                info="The regulations that apply to your assets, based on each asset's type and region. These are the rules that can affect your organisation."
              />
              <Kpi
                label="Average compliance score"
                value={compliance.avgScore.toFixed(0)}
                sub={`target: ${COMPLIANCE_THRESHOLD} or above`}
                tone={compliance.avgScore >= COMPLIANCE_THRESHOLD ? 'text-success-600' : 'text-warning-600'}
                info="Average of the Compliance Score column for the assets in this selection."
              />
              <Kpi
                label="Possible fines"
                value={formatMoney(compliance.fineExposure)}
                sub={`statutory maximum across ${compliance.countries.filter(c => c.possibleFine > 0).length} countries`}
                tone={compliance.fineExposure > 0 ? 'text-danger-600' : 'text-success-600'}
                info="For each country's law that covers at least one asset below target: the maximum fine stated in that law, counted once per law per country (not per asset). Turnover-based caps and penalties without a fixed amount are listed below but not added. Converted to USD at fixed reference rates."
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Panel
                title="Compliance by regulation"
                info="For each regulation category your assets fall under: how many assets it covers, and how many of those meet the target. Each country applies its own law within a category. Hover a bar for possible fines; click it to filter the page."
              >
                {regulationData.length === 0 ? (
                  <Empty>No regulations apply to the assets in this selection.</Empty>
                ) : (
                  <div style={{ height: Math.max(220, regulationData.length * 38 + 50) }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={regulationData} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                        <Tooltip
                          content={({ active, payload }: any) => {
                            if (!active || !payload?.length) return null
                            const d = payload[0].payload
                            return (
                              <div className="bg-white border border-neutral-200 rounded-lg shadow-lg px-3 py-2 text-xs space-y-0.5">
                                <p className="font-semibold text-neutral-900">{d.fullName}</p>
                                <p className="text-neutral-700">{d.rate}% compliant · {d.Compliant} of {d.Compliant + d['Below target']} assets</p>
                                <p className="text-neutral-500">
                                  {d.exposure > 0 ? `Possible fines: ${formatMoney(d.exposure)}` : 'No fixed statutory fine'}
                                </p>
                              </div>
                            )
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="Compliant" stackId="a" fill="#22c55e" maxBarSize={24} cursor="pointer" onClick={(d: any) => toggle('standard', d.standard)} />
                        <Bar dataKey="Below target" stackId="a" fill="#fca5a5" maxBarSize={24} radius={[0, 4, 4, 0]} cursor="pointer" onClick={(d: any) => toggle('standard', d.standard)} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Panel>

              <Panel title="Compliance rate by region" info={`Share of each region's assets that meet the target of ${COMPLIANCE_THRESHOLD}. Click a bar to filter the page to that region.`}>
                <div style={{ height: Math.max(220, regionData.length * 44 + 40) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionData} layout="vertical" margin={{ left: 8, right: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number, _n, p: any) => [`${v}% (${p.payload.compliant} of ${p.payload.total} assets)`, 'Compliant']} />
                      <ReferenceLine x={90} stroke="#64748b" strokeDasharray="4 4" />
                      <Bar dataKey="rate" maxBarSize={28} radius={[0, 4, 4, 0]} cursor="pointer" onClick={(d: any) => toggle('region', d.region)}>
                        {regionData.map(d => (
                          <Cell key={d.region} fill={rateColor(d.rate)} fillOpacity={filters.region === ALL || filters.region === d.region ? 1 : 0.35} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Dashed line: 90% compliance. Green 90%+, amber 75–89%, red below 75%.</p>
              </Panel>
            </div>

            <Panel
              title="Possible fines by country"
              info="Each country's own law for every regulation category that covers at least one asset below target there, with its legal reference and the penalty exactly as the law states it. Only fixed statutory maximums without conditions are added to the possible fine, once per law per country. Values change over time: confirm with legal counsel."
            >
              {compliance.countries.every(c => c.lines.length === 0) ? (
                <Empty>No assets below target in this selection, so no fines apply.</Empty>
              ) : (
                <div className="space-y-3">
                  {compliance.countries
                    .filter(c => c.lines.length > 0)
                    .map(c => (
                      <details key={c.country} className="group rounded-lg border border-neutral-200" open={compliance.countries.filter(x => x.lines.length > 0).length <= 2}>
                        <summary className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 cursor-pointer list-none">
                          <span className="font-medium text-neutral-900">
                            {c.country}
                            <span className="ml-2 text-xs font-normal text-neutral-500">
                              {c.total - c.compliant} of {c.total} assets below target · {c.lines.length} laws
                            </span>
                          </span>
                          <span className={`text-sm font-semibold ${c.possibleFine > 0 ? 'text-danger-600' : 'text-neutral-500'}`}>
                            {c.possibleFine > 0 ? `up to ${formatMoney(c.possibleFine)}` : 'No fixed statutory fine'}
                          </span>
                        </summary>
                        <div className="overflow-x-auto border-t border-neutral-100">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs uppercase tracking-wide text-neutral-500">
                                <th className="px-4 py-2 font-medium">Category</th>
                                <th className="px-3 py-2 font-medium">Law & reference</th>
                                <th className="px-3 py-2 font-medium">Penalty (as stated in law)</th>
                                <th className="px-3 py-2 font-medium text-right">Assets</th>
                                <th className="px-4 py-2 font-medium text-right">Possible fine</th>
                              </tr>
                            </thead>
                            <tbody>
                              {c.lines.map(l => (
                                <tr key={l.standard} className="border-t border-neutral-100 align-top">
                                  <td className="px-4 py-2 text-neutral-700 whitespace-nowrap">{standardLabel(l.standard)}</td>
                                  <td className="px-3 py-2">
                                    <p className="text-neutral-900">{l.law.law}</p>
                                    <p className="text-xs text-neutral-500">{l.law.citation}</p>
                                  </td>
                                  <td className="px-3 py-2 text-neutral-700">
                                    {l.law.penalty}
                                    {l.law.condition && <p className="text-xs text-warning-700 mt-0.5">{l.law.condition}</p>}
                                  </td>
                                  <td className="px-3 py-2 text-right text-neutral-700">{l.assetsBelowTarget}</td>
                                  <td className="px-4 py-2 text-right font-semibold whitespace-nowrap">
                                    {l.possibleFineUSD > 0 ? (
                                      <span className="text-danger-600">{formatMoney(l.possibleFineUSD)}</span>
                                    ) : (
                                      <span className="text-xs font-normal text-neutral-500">
                                        {l.law.kind === 'framework' ? 'No fine' : l.law.kind === 'contractual' ? 'Contractual' : l.law.condition ? 'Conditional' : 'Not fixed'}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    ))}
                  <p className="text-xs text-neutral-500">
                    Amounts converted to USD at fixed reference rates. &ldquo;Not fixed&rdquo; = penalty set case by case or by national law;
                    &ldquo;Conditional&rdquo; = applies only to some organisations; neither is added to the total.
                  </p>
                </div>
              )}
            </Panel>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Panel title="Compliance score distribution" info={`How many assets fall in each score band. Bands from ${COMPLIANCE_THRESHOLD} up meet the target.`}>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreData} margin={{ left: -16, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [`${v} assets`, 'Assets']} />
                      <Bar dataKey="count" maxBarSize={56} radius={[4, 4, 0, 0]}>
                        {scoreData.map(d => (
                          <Cell key={d.label} fill={d.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="Compliance rate by department" info="Share of each department's assets that meet the target. Click a bar to filter the page to that department.">
                <div style={{ height: Math.max(224, deptData.length * 30 + 40) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptData} layout="vertical" margin={{ left: 8, right: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="department" width={120} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number, _n, p: any) => [`${v}% (${p.payload.compliant} of ${p.payload.total} assets)`, 'Compliant']} />
                      <Bar dataKey="rate" maxBarSize={20} radius={[0, 4, 4, 0]} cursor="pointer" onClick={(d: any) => toggle('department', d.department)}>
                        {deptData.map(d => (
                          <Cell key={d.department} fill={rateColor(d.rate)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>

            <Panel
              title="Assets in scope"
              info="Every asset in this selection with its compliance score and the regulations that apply to it. Click an asset for full details."
              actions={
                <div className="flex gap-1" role="tablist" aria-label="Compliance status">
                  {([
                    ['all', 'All'],
                    ['compliant', 'Compliant'],
                    ['below', 'Below target'],
                  ] as const).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      role="tab"
                      aria-selected={listView === k}
                      onClick={() => setListView(k)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${listView === k ? 'bg-primary-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                    >
                      {label} <span className={listView === k ? 'text-primary-100' : 'text-neutral-400'}>{counts[k]}</span>
                    </button>
                  ))}
                </div>
              }
            >
              {list.length === 0 ? (
                <Empty>No assets here.</Empty>
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
                          <th className="px-3 py-2 font-medium">Status</th>
                          <th className="px-5 py-2 font-medium">Regulations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(a => {
                          const regs = getApplicableStandards(a.assetType, a.country)
                          const ok = a.complianceScore >= COMPLIANCE_THRESHOLD
                          return (
                            <tr key={a.assetId} className="border-b border-neutral-100 hover:bg-neutral-50">
                              <td className="px-5 py-2">
                                <button type="button" onClick={() => setSelected(a)} className="text-left">
                                  <span className="block font-medium text-primary-700 hover:underline">{a.assetId}</span>
                                  <span className="block text-xs text-neutral-500 truncate max-w-[200px]">{a.productName}</span>
                                </button>
                              </td>
                              <td className="px-3 py-2 text-neutral-700">{a.assetType}</td>
                              <td className="px-3 py-2 text-neutral-700">{shortRegion(a.region)}</td>
                              <td className="px-3 py-2 text-neutral-700">{a.department}</td>
                              <td className={`px-3 py-2 text-right font-semibold ${ok ? 'text-success-600' : 'text-danger-600'}`}>{a.complianceScore}</td>
                              <td className="px-3 py-2">
                                <div className="flex flex-wrap gap-1">
                                  <Pill tone={ok ? 'success' : 'danger'}>{ok ? 'Compliant' : 'Below target'}</Pill>
                                  {isPastEndOfLife(a) && <Pill tone="neutral">Support ended</Pill>}
                                </div>
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
                                          filters.standard === r ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-700'
                                        }`}
                                      >
                                        {standardLabel(r)}
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
                  <Pagination page={page} pageSize={PAGE_SIZE} total={list.length} onPage={setPage} />
                </>
              )}
            </Panel>
          </>
        )}
      </div>

      <AssetDrawer asset={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
