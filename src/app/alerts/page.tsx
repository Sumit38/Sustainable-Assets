'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Search, CheckCircle2, RotateCcw, ShieldAlert, CalendarClock, HeartPulse, FileWarning } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { AssetDrawer } from '@/components/assets/AssetDrawer'
import { Kpi, NoData, Pagination, Pill } from '@/components/common/ui'
import { useDashboard } from '@/lib/context/dashboardContext'
import { useAuth } from '@/lib/auth/authContext'
import { ImportedAsset } from '@/lib/calculations/metricCalculator'
import {
  COMPLIANCE_THRESHOLD,
  DashboardFilters,
  EMPTY_FILTERS,
  filterAssets,
  filterOptions,
  filtersFromQuery,
  isPastEndOfLife,
} from '@/lib/calculations/dashboardInsights'

const PAGE_SIZE = 15
const SOON_DAYS = 180

type AlertType = 'eol' | 'critical' | 'support-soon' | 'compliance'
interface AssetAlert {
  id: string
  type: AlertType
  severity: 'critical' | 'warning'
  title: string
  detail: string
  asset: ImportedAsset
}

const TYPES: Record<AlertType, { label: string; icon: React.ReactNode }> = {
  eol: { label: 'Past end of support', icon: <ShieldAlert className="w-4 h-4" /> },
  critical: { label: 'Critical condition', icon: <HeartPulse className="w-4 h-4" /> },
  'support-soon': { label: 'Support ending soon', icon: <CalendarClock className="w-4 h-4" /> },
  compliance: { label: 'Low compliance', icon: <FileWarning className="w-4 h-4" /> },
}

function buildAlerts(assets: ImportedAsset[]): AssetAlert[] {
  const today = Date.now()
  const out: AssetAlert[] = []
  for (const a of assets) {
    const end = new Date(a.lastDateOfSupport).getTime()
    const days = isNaN(end) ? null : Math.ceil((end - today) / 86400000)
    if (isPastEndOfLife(a)) {
      out.push({
        id: `eol-${a.assetId}`,
        type: 'eol',
        severity: 'critical',
        title: 'Still in use after end of support',
        detail: days !== null && days < 0 ? `Support ended ${-days} days ago (${a.lastDateOfSupport})` : 'Marked end-of-life',
        asset: a,
      })
    } else if (days !== null && days <= SOON_DAYS) {
      out.push({
        id: `soon-${a.assetId}`,
        type: 'support-soon',
        severity: 'warning',
        title: 'Support ends soon',
        detail: `Support ends in ${days} days (${a.lastDateOfSupport})`,
        asset: a,
      })
    }
    if (a.healthStatus === 'critical') {
      out.push({ id: `crit-${a.assetId}`, type: 'critical', severity: 'critical', title: 'Critical condition', detail: 'Marked critical in your file', asset: a })
    }
    if (a.complianceScore < COMPLIANCE_THRESHOLD) {
      out.push({
        id: `comp-${a.assetId}`,
        type: 'compliance',
        severity: a.complianceScore < 50 ? 'critical' : 'warning',
        title: 'Below compliance target',
        detail: `Compliance score ${a.complianceScore} (target ${COMPLIANCE_THRESHOLD})`,
        asset: a,
      })
    }
  }
  return out.sort((x, y) => (x.severity === y.severity ? 0 : x.severity === 'critical' ? -1 : 1))
}

export default function AlertsPage() {
  const { importedAssets } = useDashboard()
  const { user } = useAuth()
  const storageKey = `assetpulse-ack-${user?.id ?? 'guest'}`
  const [acked, setAcked] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS)
  const [view, setView] = useState<'open' | 'acked' | 'all'>('open')
  const [type, setType] = useState<AlertType | 'all'>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<ImportedAsset | null>(null)

  useEffect(() => {
    setFilters(filtersFromQuery(window.location.search))
    try {
      setAcked(new Set(JSON.parse(localStorage.getItem(storageKey) || '[]')))
    } catch {
      setAcked(new Set())
    }
  }, [storageKey])
  useEffect(() => setPage(0), [filters, view, type, search])

  const toggleAck = (id: string) => {
    setAcked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(next)))
      } catch {}
      return next
    })
  }

  const options = useMemo(() => filterOptions(importedAssets), [importedAssets])
  const base = useMemo(() => filterAssets(importedAssets, filters), [importedAssets, filters])
  const all = useMemo(() => buildAlerts(base), [base])

  const open = all.filter(a => !acked.has(a.id))
  const list = all.filter(a => {
    if (view === 'open' && acked.has(a.id)) return false
    if (view === 'acked' && !acked.has(a.id)) return false
    if (type !== 'all' && a.type !== type) return false
    const q = search.trim().toLowerCase()
    return !q || [a.asset.assetId, a.asset.productName, a.asset.department].some(v => v?.toLowerCase().includes(q))
  })
  const typeCounts = open.reduce<Record<string, number>>((m, a) => ((m[a.type] = (m[a.type] ?? 0) + 1), m), {})

  if (importedAssets.length === 0) {
    return (
      <div className="w-full">
        <PageHeader title="Alerts" description="Issues that need attention, generated from your asset data" homeHref="/welcome" />
        <div className="p-6">
          <NoData what="alerts" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <PageHeader title="Alerts" description="Issues that need attention, generated from your asset data" homeHref="/welcome" />

      <div className="p-6 space-y-6">
        <FilterBar filters={filters} onChange={setFilters} options={options} shown={base.length} total={importedAssets.length} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Kpi
            label="Open critical"
            value={open.filter(a => a.severity === 'critical').length.toString()}
            tone="text-danger-600"
            sub="past end of support, critical, or compliance below 50"
          />
          <Kpi label="Open warnings" value={open.filter(a => a.severity === 'warning').length.toString()} tone="text-warning-600" sub={`support ending within ${SOON_DAYS} days, or compliance below ${COMPLIANCE_THRESHOLD}`} />
          <Kpi
            label="Acknowledged"
            value={(all.length - open.length).toString()}
            sub="hidden from the open list"
            info="Acknowledging an alert hides it from the open list. It's remembered in this browser only; if the underlying data changes, the alert is recalculated."
          />
        </div>

        <section className="bg-white border border-neutral-200 rounded-xl shadow-sm">
          <div className="p-4 space-y-3 border-b border-neutral-200">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
              <div className="flex gap-1" role="tablist" aria-label="Alert status">
                {([
                  ['open', `Open (${open.length})`],
                  ['acked', `Acknowledged (${all.length - open.length})`],
                  ['all', `All (${all.length})`],
                ] as const).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    role="tab"
                    aria-selected={view === k}
                    onClick={() => setView(k)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${view === k ? 'bg-primary-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="relative lg:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search asset or department…"
                  aria-label="Search alerts"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', ...Object.keys(TYPES)] as Array<AlertType | 'all'>).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                    type === t ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {t !== 'all' && TYPES[t].icon}
                  {t === 'all' ? 'All types' : TYPES[t].label}
                  {t !== 'all' && <span className="text-neutral-400">{typeCounts[t] ?? 0}</span>}
                </button>
              ))}
            </div>
          </div>

          {list.length === 0 ? (
            <p className="text-sm text-neutral-500 py-12 text-center">
              {view === 'open' ? 'Nothing needs attention in this selection.' : 'No alerts here.'}
            </p>
          ) : (
            <div className="p-4">
              <ul className="divide-y divide-neutral-100">
                {list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(al => {
                  const isAcked = acked.has(al.id)
                  return (
                    <li key={al.id} className={`flex items-start gap-3 py-3 ${isAcked ? 'opacity-60' : ''}`}>
                      <span
                        className={`mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${
                          al.severity === 'critical' ? 'bg-danger-50 text-danger-600' : 'bg-warning-50 text-warning-600'
                        }`}
                      >
                        {TYPES[al.type].icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-neutral-900">{al.title}</p>
                          <Pill tone={al.severity === 'critical' ? 'danger' : 'warning'}>{al.severity === 'critical' ? 'Critical' : 'Warning'}</Pill>
                        </div>
                        <p className="text-sm text-neutral-600">{al.detail}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          <button type="button" onClick={() => setSelected(al.asset)} className="font-medium text-primary-700 hover:underline">
                            {al.asset.assetId}
                          </button>{' '}
                          · {al.asset.productName} · {al.asset.department}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleAck(al.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:bg-neutral-100 flex-shrink-0"
                      >
                        {isAcked ? <RotateCcw className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        {isAcked ? 'Reopen' : 'Acknowledge'}
                      </button>
                    </li>
                  )
                })}
              </ul>
              <Pagination page={page} pageSize={PAGE_SIZE} total={list.length} onPage={setPage} />
            </div>
          )}
        </section>
      </div>

      <AssetDrawer asset={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
