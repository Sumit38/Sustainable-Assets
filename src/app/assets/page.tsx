'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Search, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { AssetDrawer } from '@/components/assets/AssetDrawer'
import { HEALTH_LABEL, Kpi, NoData, Pagination, Pill, buttonStyles, downloadCsv } from '@/components/common/ui'
import { useDashboard } from '@/lib/context/dashboardContext'
import { ImportedAsset } from '@/lib/calculations/metricCalculator'
import {
  COMPLIANCE_THRESHOLD,
  DashboardFilters,
  EMPTY_FILTERS,
  filterAssets,
  filterOptions,
  filtersFromQuery,
  formatMoney,
  isPastEndOfLife,
  needsAction,
} from '@/lib/calculations/dashboardInsights'

const PAGE_SIZE = 20
type SortKey = 'assetId' | 'assetType' | 'department' | 'health' | 'complianceScore' | 'lastDateOfSupport'
const HEALTH_ORDER: Record<string, number> = { 'end-of-life': 0, critical: 1, 'at-risk': 2, healthy: 3 }
const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'action', label: 'Needs action' },
  { key: 'poor', label: 'Poor condition' },
  { key: 'end-of-life', label: 'Past end of life' },
  { key: 'critical', label: 'Critical' },
  { key: 'at-risk', label: 'At risk' },
  { key: 'healthy', label: 'Healthy' },
]

const effHealth = (a: ImportedAsset) => (isPastEndOfLife(a) ? 'end-of-life' : a.healthStatus)

export default function AssetsPage() {
  const { importedAssets } = useDashboard()
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'health', dir: 1 })
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<ImportedAsset | null>(null)

  useEffect(() => {
    setFilters(filtersFromQuery(window.location.search))
    const s = new URLSearchParams(window.location.search).get('status')
    if (s && STATUS_TABS.some(t => t.key === s)) setStatus(s)
  }, [])
  useEffect(() => setPage(0), [filters, status, search, sort])

  const options = useMemo(() => filterOptions(importedAssets), [importedAssets])
  const base = useMemo(() => filterAssets(importedAssets, filters), [importedAssets, filters])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = base.filter(a => {
      const h = effHealth(a)
      if (status === 'action' && !needsAction(a)) return false
      if (status === 'poor' && h === 'healthy') return false
      if (!['all', 'action', 'poor'].includes(status) && h !== status) return false
      if (!q) return true
      return [a.assetId, a.productName, a.manufacturer, a.location].some(v => v?.toLowerCase().includes(q))
    })
    const val = (a: ImportedAsset): string | number =>
      sort.key === 'health' ? HEALTH_ORDER[effHealth(a)] : (a[sort.key] as string | number) ?? ''
    return [...list].sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * sort.dir)
  }, [base, status, search, sort])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: base.length, action: 0, poor: 0 }
    for (const a of base) {
      c[effHealth(a)] = (c[effHealth(a)] ?? 0) + 1
      if (needsAction(a)) c.action++
      if (effHealth(a) !== 'healthy') c.poor++
    }
    return c
  }, [base])

  if (importedAssets.length === 0) {
    return (
      <div className="w-full">
        <PageHeader title="Assets" description="Your full asset inventory" homeHref="/welcome" />
        <div className="p-6">
          <NoData what="your asset inventory" />
        </div>
      </div>
    )
  }

  const totalValue = base.reduce((s, a) => s + (a.cost || 0), 0)
  const avgCompliance = base.length ? base.reduce((s, a) => s + a.complianceScore, 0) / base.length : 0
  const nonCompliant = base.filter(a => a.complianceScore < COMPLIANCE_THRESHOLD).length

  const header = (key: SortKey, label: string, align = 'text-left') => (
    <th className={`px-3 py-3 font-medium ${align}`}>
      <button
        type="button"
        onClick={() => setSort(s => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }))}
        className="inline-flex items-center gap-1 hover:text-neutral-900"
      >
        {label}
        {sort.key !== key ? (
          <ArrowUpDown className="w-3 h-3 opacity-40" />
        ) : sort.dir === 1 ? (
          <ArrowUp className="w-3 h-3" />
        ) : (
          <ArrowDown className="w-3 h-3" />
        )}
      </button>
    </th>
  )

  const exportRows = () =>
    downloadCsv(
      `assetpulse-assets-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Asset ID', 'Product', 'Type', 'Manufacturer', 'Department', 'Location', 'Country', 'Region', 'Health', 'Compliance Score', 'Last Date of Support', 'Cost', 'Employees Affected', 'Annual CO2e'],
      rows.map(a => [
        a.assetId, a.productName, a.assetType, a.manufacturer, a.department, a.location, a.country, a.region,
        HEALTH_LABEL[effHealth(a)].label, a.complianceScore, a.lastDateOfSupport, a.cost, a.employeesAffected, a.annualCO2e,
      ])
    )

  return (
    <div className="w-full">
      <PageHeader title="Assets" description="Your full asset inventory: search, sort and drill into any asset" homeHref="/welcome" />

      <div className="p-6 space-y-6">
        <FilterBar filters={filters} onChange={setFilters} options={options} shown={base.length} total={importedAssets.length} />

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <Kpi label="Assets" value={base.length.toLocaleString()} sub="in this selection" />
          <Kpi
            label="Need action"
            value={counts.action.toLocaleString()}
            sub="critical or past end of life"
            tone="text-danger-600"
            info="Assets marked critical, or whose Last Date of Support has passed."
          />
          <Kpi
            label="Average compliance"
            value={avgCompliance.toFixed(0)}
            sub={`${nonCompliant} below ${COMPLIANCE_THRESHOLD}`}
            tone={avgCompliance < COMPLIANCE_THRESHOLD ? 'text-warning-600' : 'text-success-600'}
          />
          <Kpi label="Asset value" value={formatMoney(totalValue)} sub="sum of the Cost column" />
        </div>

        <section className="bg-white border border-neutral-200 rounded-xl shadow-sm">
          <div className="p-4 flex flex-col lg:flex-row gap-3 lg:items-center justify-between border-b border-neutral-200">
            <div className="flex flex-wrap gap-1" role="tablist" aria-label="Health status">
              {STATUS_TABS.map(t => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={status === t.key}
                  onClick={() => setStatus(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    status === t.key ? 'bg-primary-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {t.label} <span className={status === t.key ? 'text-primary-100' : 'text-neutral-400'}>{counts[t.key] ?? 0}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 lg:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search ID, product, manufacturer…"
                  aria-label="Search assets"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button type="button" onClick={exportRows} className={buttonStyles.secondary} disabled={rows.length === 0}>
                <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {rows.length === 0 ? (
            <p className="text-sm text-neutral-500 py-12 text-center">No assets match.</p>
          ) : (
            <div className="px-4 pb-4">
              <div className="overflow-x-auto -mx-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
                      {header('assetId', 'Asset')}
                      {header('assetType', 'Type')}
                      {header('department', 'Department')}
                      {header('health', 'Health')}
                      {header('complianceScore', 'Compliance', 'text-right')}
                      {header('lastDateOfSupport', 'Support ends')}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(a => {
                      const h = HEALTH_LABEL[effHealth(a)]
                      const past = isPastEndOfLife(a)
                      return (
                        <tr
                          key={a.assetId}
                          onClick={() => setSelected(a)}
                          className="border-b border-neutral-100 hover:bg-primary-50/40 cursor-pointer"
                        >
                          <td className="px-3 py-2.5">
                            <button
                              type="button"
                              className="text-left focus:outline-none focus:underline"
                              onClick={e => {
                                e.stopPropagation()
                                setSelected(a)
                              }}
                            >
                              <span className="block font-medium text-primary-700">{a.assetId}</span>
                              <span className="block text-xs text-neutral-500 truncate max-w-[220px]">{a.productName}</span>
                            </button>
                          </td>
                          <td className="px-3 py-2.5 text-neutral-700">{a.assetType}</td>
                          <td className="px-3 py-2.5 text-neutral-700">{a.department}</td>
                          <td className="px-3 py-2.5">
                            <Pill tone={h.tone}>{h.label}</Pill>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span className={`font-semibold ${a.complianceScore < COMPLIANCE_THRESHOLD ? 'text-danger-600' : 'text-neutral-900'}`}>
                              {a.complianceScore}
                            </span>
                          </td>
                          <td className={`px-3 py-2.5 whitespace-nowrap ${past ? 'text-danger-600 font-medium' : 'text-neutral-700'}`}>
                            {a.lastDateOfSupport}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />
            </div>
          )}
        </section>
      </div>

      <AssetDrawer asset={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
