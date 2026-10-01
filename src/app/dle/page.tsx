'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { BatteryCharging } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { AssetDrawer } from '@/components/assets/AssetDrawer'
import { HEALTH_LABEL, Kpi, NoData, Pagination, Panel, Pill, Empty } from '@/components/common/ui'
import { useDashboard } from '@/lib/context/dashboardContext'
import { ImportedAsset } from '@/lib/calculations/metricCalculator'
import { getAssetProfile } from '@/lib/data/assetMaterialDatabase'
import {
  DashboardFilters,
  EMPTY_FILTERS,
  filterAssets,
  filterOptions,
  filtersFromQuery,
  formatNumber,
  isPastEndOfLife,
  needsAction,
} from '@/lib/calculations/dashboardInsights'

const PAGE_SIZE = 15
const PATHWAY_LABEL: Record<string, string> = {
  DLE: 'Lithium extraction (DLE)',
  BATTERY_RECYCLING: 'Battery recycling',
  E_WASTE: 'E-waste recycling',
  REFURBISHMENT: 'Refurbish & reuse',
  SCRAP_METAL: 'Scrap metal',
  DONATION: 'Donation',
  LANDFILL: 'Landfill',
}

const lithiumOf = (a: ImportedAsset) => {
  const p = getAssetProfile(a.assetType)
  return p?.isDLESuitable ? (p.lithiumContent.min + p.lithiumContent.max) / 2 : 0
}

export default function DLEPage() {
  const { importedAssets } = useDashboard()
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS)
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<ImportedAsset | null>(null)
  useEffect(() => setFilters(filtersFromQuery(window.location.search)), [])
  useEffect(() => setPage(0), [filters])

  const options = useMemo(() => filterOptions(importedAssets), [importedAssets])
  const assets = useMemo(() => filterAssets(importedAssets, filters), [importedAssets, filters])

  const data = useMemo(() => {
    const retiring = assets.filter(needsAction)
    const batteryFleet = assets.filter(a => getAssetProfile(a.assetType)?.isDLESuitable)
    const batteryRetiring = batteryFleet.filter(needsAction)
    const sum = (list: ImportedAsset[], f: (a: ImportedAsset) => number) => list.reduce((s, a) => s + f(a), 0)

    const pathways = new Map<string, number>()
    for (const a of retiring) {
      const p = getAssetProfile(a.assetType)?.recoveryPathway
      const label = p ? PATHWAY_LABEL[p] ?? p : 'Not in materials reference'
      pathways.set(label, (pathways.get(label) ?? 0) + 1)
    }

    const byType = new Map<string, { type: string; Retiring: number; 'Still in use': number }>()
    for (const a of batteryFleet) {
      const row = byType.get(a.assetType) ?? { type: a.assetType, Retiring: 0, 'Still in use': 0 }
      row[needsAction(a) ? 'Retiring' : 'Still in use'] += lithiumOf(a)
      byType.set(a.assetType, row)
    }

    const today = new Date()
    const buckets = [
      { label: 'Due now', test: (a: ImportedAsset, m: number) => needsAction(a) || m < 0 },
      { label: '< 1 year', test: (_: ImportedAsset, m: number) => m >= 0 && m < 12 },
      { label: '1–2 years', test: (_: ImportedAsset, m: number) => m >= 12 && m < 24 },
      { label: '2–4 years', test: (_: ImportedAsset, m: number) => m >= 24 && m < 48 },
      { label: '4+ years', test: (_: ImportedAsset, m: number) => m >= 48 },
    ]
    const pipeline = buckets.map(b => ({ label: b.label, kg: 0, devices: 0 }))
    for (const a of batteryFleet) {
      const end = new Date(a.lastDateOfSupport)
      const m = isNaN(end.getTime()) ? Infinity : (end.getTime() - today.getTime()) / (86400000 * 30.44)
      const i = buckets.findIndex(b => b.test(a, m))
      if (i >= 0) {
        pipeline[i].kg += lithiumOf(a)
        pipeline[i].devices++
      }
    }

    return {
      retiring,
      batteryFleet,
      batteryRetiring,
      lithiumNow: sum(batteryRetiring, lithiumOf),
      lithiumFleet: sum(batteryFleet, lithiumOf),
      co2eAvoided: sum(batteryRetiring, a => getAssetProfile(a.assetType)?.co2eSavingsVsPrimaryMining ?? 0),
      pathways: Array.from(pathways.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      byType: Array.from(byType.values()).map(r => ({ ...r, Retiring: +r.Retiring.toFixed(3), 'Still in use': +r['Still in use'].toFixed(3) })),
      pipeline: pipeline.map(p => ({ ...p, kg: +p.kg.toFixed(3) })),
    }
  }, [assets])

  if (importedAssets.length === 0) {
    return (
      <div className="w-full">
        <PageHeader title="DLE Analytics" description="How much lithium your retiring devices can return" homeHref="/welcome" />
        <div className="p-6">
          <NoData what="lithium recovery analytics" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <PageHeader title="DLE Analytics" description="How much lithium your retiring devices can return, so less needs to be mined" homeHref="/welcome" />

      <div className="p-6 space-y-6">
        <div className="flex gap-3 bg-primary-50 border border-primary-500/20 rounded-xl p-4 text-sm text-primary-800">
          <BatteryCharging className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            Laptops, tablets, phones, UPS systems and electric vehicles contain lithium-ion batteries. When they retire, the
            lithium can be recovered through recycling and Direct Lithium Extraction (DLE) instead of being mined again. Lithium
            figures use the typical content of each device type from AssetPulse&apos;s materials reference, since your file
            doesn&apos;t record battery size.
          </p>
        </div>

        <FilterBar filters={filters} onChange={setFilters} options={options} shown={assets.length} total={importedAssets.length} />

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <Kpi
            label="Recoverable now"
            value={`${data.lithiumNow.toFixed(2)} kg`}
            sub={`lithium in ${data.batteryRetiring.length} retiring devices`}
            tone="text-primary-700"
            info="Lithium in battery devices that are critical or past end of life. Same figure as the dashboard card."
          />
          <Kpi
            label="Lithium in your fleet"
            value={`${data.lithiumFleet.toFixed(2)} kg`}
            sub={`across ${data.batteryFleet.length} battery devices`}
            info="Total lithium in all battery devices, including ones still in use. This is your future recovery pipeline."
          />
          <Kpi
            label="Mining CO₂e avoided"
            value={`${formatNumber(data.co2eAvoided)} kg`}
            sub="by recovering instead of mining"
            tone="text-success-600"
            info="CO₂e saved versus primary lithium mining for the retiring devices, using the per-device values in the materials reference."
          />
          <Kpi label="Assets retiring" value={data.retiring.length.toString()} sub="all types, critical or past end of life" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Lithium recovery pipeline" info="Lithium in battery devices, grouped by when their support ends. Shows how much will become recoverable over time.">
            {data.batteryFleet.length === 0 ? (
              <Empty>No lithium-battery devices in this selection.</Empty>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.pipeline} margin={{ left: -8, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} />
                    <YAxis tick={{ fontSize: 11 }} unit=" kg" />
                    <Tooltip formatter={(v: number, _n, p: any) => [`${v} kg (${p.payload.devices} devices)`, 'Lithium']} />
                    <Bar dataKey="kg" fill="#0ea5e9" maxBarSize={48} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          <Panel title="Lithium by device type" info="Lithium per device type, split into retiring devices and devices still in use.">
            {data.byType.length === 0 ? (
              <Empty>No lithium-battery devices in this selection.</Empty>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byType} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} unit=" kg" />
                    <YAxis type="category" dataKey="type" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => `${v} kg`} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Retiring" stackId="a" fill="#0284c7" maxBarSize={28} />
                    <Bar dataKey="Still in use" stackId="a" fill="#bae6fd" maxBarSize={28} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        </div>

        <Panel
          title="Where retiring assets should go"
          info="The recommended end-of-life route for every retiring asset, by type, from the materials reference. Battery devices go to lithium recovery; furniture and other items to refurbishment, recycling or donation."
        >
          {data.pathways.length === 0 ? (
            <Empty>No assets are retiring in this selection.</Empty>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {data.pathways.map(p => (
                <div key={p.name} className="rounded-lg border border-neutral-200 p-3">
                  <p className="text-2xl font-bold text-neutral-900">{p.count}</p>
                  <p className="text-sm text-neutral-600">{p.name}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title={`Retiring battery devices (${data.batteryRetiring.length})`} info="Battery devices that are critical or past end of life: ready to send for lithium recovery.">
          {data.batteryRetiring.length === 0 ? (
            <Empty>No retiring battery devices in this selection. Check the pipeline above for when they&apos;ll become available.</Empty>
          ) : (
            <>
              <div className="overflow-x-auto -mx-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
                      <th className="px-5 py-2 font-medium">Asset</th>
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium">Department</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Support ends</th>
                      <th className="px-5 py-2 font-medium text-right">Lithium (est.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.batteryRetiring.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(a => {
                      const h = HEALTH_LABEL[isPastEndOfLife(a) ? 'end-of-life' : a.healthStatus]
                      return (
                        <tr key={a.assetId} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="px-5 py-2">
                            <button type="button" onClick={() => setSelected(a)} className="text-left">
                              <span className="block font-medium text-primary-700 hover:underline">{a.assetId}</span>
                              <span className="block text-xs text-neutral-500 truncate max-w-[200px]">{a.productName}</span>
                            </button>
                          </td>
                          <td className="px-3 py-2 text-neutral-700">{a.assetType}</td>
                          <td className="px-3 py-2 text-neutral-700">{a.department}</td>
                          <td className="px-3 py-2">
                            <Pill tone={h.tone}>{h.label}</Pill>
                          </td>
                          <td className="px-3 py-2 text-neutral-700 whitespace-nowrap">{a.lastDateOfSupport}</td>
                          <td className="px-5 py-2 text-right font-medium text-neutral-900">{lithiumOf(a).toFixed(3)} kg</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} pageSize={PAGE_SIZE} total={data.batteryRetiring.length} onPage={setPage} />
            </>
          )}
        </Panel>
      </div>

      <AssetDrawer asset={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
