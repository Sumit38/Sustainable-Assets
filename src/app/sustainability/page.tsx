'use client'

import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import { ArrowRight, Leaf } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { InfoTip } from '@/components/common/InfoTip'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { AssetDrawer } from '@/components/assets/AssetDrawer'
import { EmissionsMap } from '@/components/sustainability/EmissionsMap'
import { HEALTH_LABEL, NoData, Pagination, Panel, Pill, Empty } from '@/components/common/ui'
import { useDashboard } from '@/lib/context/dashboardContext'
import { ImportedAsset } from '@/lib/calculations/metricCalculator'
import { methaneAtEndOfLife, summariseEmissions } from '@/lib/calculations/emissionsModel'
import {
  DashboardFilters,
  EMPTY_FILTERS,
  computeInsights,
  filterAssets,
  filterOptions,
  filtersFromQuery,
  isPastEndOfLife,
} from '@/lib/calculations/dashboardInsights'

const PAGE_SIZE = 8
const TIMELINE_COLORS = ['#dc2626', '#f97316', '#eab308', '#0ea5e9', '#22c55e']

const t = (v: number) => (Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2))
const mwh = (kWh: number) => t(kWh / 1000)
const change = (now: number, after: number) => (now > 0 ? Math.round(((after - now) / now) * 100) : 0)

function CompareKpi({ label, unit, nowValue, afterValue, format, info, source }: { label: string; unit: string; nowValue: number; afterValue: number; format: (v: number) => string; info: ReactNode; source: string }) {
  const n = nowValue
  const a = afterValue
  const now = format(n)
  const after = format(a)
  const pct = change(n, a)
  const better = a < n
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-neutral-700">{label}</p>
        <InfoTip title={label}>{info}</InfoTip>
      </div>
      <div className="mt-2 flex items-end gap-2 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-neutral-400">Now</p>
          <p className="text-2xl font-bold text-neutral-900 leading-tight">{now}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-neutral-400 mb-1.5" />
        <div>
          <p className="text-[11px] uppercase tracking-wide text-neutral-400">After replacement</p>
          <p className={`text-2xl font-bold leading-tight ${better ? 'text-success-600' : a > n ? 'text-warning-600' : 'text-neutral-900'}`}>{after}</p>
        </div>
      </div>
      <p className="text-xs text-neutral-500 mt-1">{unit}</p>
      <div className="mt-auto pt-3 flex items-center justify-between gap-2 text-xs">
        <span className={`font-semibold ${better ? 'text-success-600' : a > n ? 'text-warning-600' : 'text-neutral-500'}`}>
          {now === after ? 'No change' : `${pct > 0 ? '+' : ''}${pct}%`}
        </span>
        <span className="text-neutral-400 truncate">{source}</span>
      </div>
    </div>
  )
}

export default function SustainabilityPage() {
  const { importedAssets } = useDashboard()
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS)
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<ImportedAsset | null>(null)
  useEffect(() => setFilters(filtersFromQuery(window.location.search)), [])
  useEffect(() => setPage(0), [filters])

  const options = useMemo(() => filterOptions(importedAssets), [importedAssets])
  const assets = useMemo(() => filterAssets(importedAssets, filters), [importedAssets, filters])
  const em = useMemo(() => summariseEmissions(assets), [assets])
  const methane = useMemo(() => methaneAtEndOfLife(assets), [assets])
  const timeline = useMemo(() => computeInsights(assets, filters.standard).charts.timeline, [assets, filters.standard])

  if (importedAssets.length === 0) {
    return (
      <div className="w-full">
        <PageHeader title="Sustainability" description="Emissions from over-used assets, and what replacing them would save" homeHref="/welcome" />
        <div className="p-6">
          <NoData what="sustainability figures" />
        </div>
      </div>
    )
  }

  const { replaceableNow: now, replaceableAfter: after, coverage } = em
  const srcLabel = (fromFile: number) =>
    fromFile === 0 ? 'Calculated' : fromFile === coverage.total ? 'From your file' : `${fromFile} from file, rest calculated`

  const scopeChart = [
    { name: 'Scope 1', Now: +now.scope1.toFixed(3), 'After replacement': +after.scope1.toFixed(3) },
    { name: 'Scope 2', Now: +now.scope2.toFixed(3), 'After replacement': +after.scope2.toFixed(3) },
    { name: 'Scope 3', Now: +now.scope3.toFixed(3), 'After replacement': +after.scope3.toFixed(3) },
  ]

  const suggestions = [...em.replaceable].sort((a, b) => b.now.total - b.after!.total - (a.now.total - a.after!.total))

  return (
    <div className="w-full">
      <PageHeader title="Sustainability" description="Emissions from over-used assets, and what replacing them would save" homeHref="/welcome" />

      <div className="p-6 space-y-6">
        <FilterBar filters={filters} onChange={setFilters} options={options} shown={assets.length} total={importedAssets.length} />

        <div className="flex gap-3 bg-success-50 border border-success-500/20 rounded-xl p-4 text-sm text-success-700">
          <Leaf className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            <strong>{em.overUsed.length}</strong> of {assets.length} assets are <strong>over-used</strong> (critical or past end of life).
            The figures below compare their yearly emissions and electricity today with replacing them by current-generation models.
            {em.overUsed.length !== em.replaceable.length && (
              <> {em.overUsed.length - em.replaceable.length} over-used assets have no reference model ({coverage.unmodelledTypes.join(', ')}) and are left out of the comparison.</>
            )}
          </p>
        </div>

        {em.replaceable.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm">
            <Empty>No over-used assets in this selection, so there is nothing to replace yet.</Empty>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              <CompareKpi
                label="Scope 1 emissions"
                unit="t CO₂e per year"
                nowValue={now.scope1}
                afterValue={after.scope1}
                format={t}
                source={srcLabel(coverage.scope1FromFile)}
                info="Direct emissions from fuel the asset burns itself, e.g. petrol vehicles. Office electronics and furniture have none. Uses your Scope 1 tCO2e column where provided."
              />
              <CompareKpi
                label="Scope 2 emissions"
                unit="t CO₂e per year"
                nowValue={now.scope2}
                afterValue={after.scope2}
                format={t}
                source={srcLabel(coverage.scope2FromFile)}
                info="Emissions from the electricity the asset uses: electricity (kWh) × the country's grid emission factor. Uses your Scope 2 tCO2e column where provided."
              />
              <CompareKpi
                label="Scope 3 emissions"
                unit="t CO₂e per year"
                nowValue={now.scope3}
                afterValue={after.scope3}
                format={t}
                source={srcLabel(coverage.scope3FromFile)}
                info="Manufacturing (embodied) emissions spread over the asset's typical lifetime, so a new asset's footprint counts too. Uses your Scope 3 tCO2e column where provided."
              />
              <CompareKpi
                label="Total carbon emissions"
                unit="t CO₂e per year (Scope 1 + 2 + 3)"
                nowValue={now.total}
                afterValue={after.total}
                format={t}
                source="Sum of the three scopes"
                info="Scope 1 + Scope 2 + Scope 3 for the over-used assets, today and after replacement."
              />
              <CompareKpi
                label="Electricity consumption"
                unit="MWh per year, during usage"
                nowValue={now.kWh}
                afterValue={after.kWh}
                format={mwh}
                source={srcLabel(coverage.energyFromFile)}
                info="Power (W) × usage hours per year. Uses your Power Watts and Usage Hours Per Year columns where provided; otherwise a typical rating for the asset type and its age (4+ years = older model), at 2,000 office hours a year."
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
              <Panel className="lg:col-span-2" title="Emissions by scope" info="Yearly emissions of the over-used assets by scope, today versus after replacement.">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scopeChart} margin={{ left: -8, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => `${t(v)} t CO₂e / yr`} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Now" fill="#94a3b8" maxBarSize={40} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="After replacement" fill="#16a34a" maxBarSize={40} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel
                className="lg:col-span-3"
                title={`Replacement suggestions (${suggestions.length})`}
                info="For each over-used asset: the replacement named in your file (if any) and the current-generation model class used for the prediction, with yearly emissions before and after. Sorted by biggest saving."
              >
                <div className="overflow-x-auto -mx-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
                        <th className="px-5 py-2 font-medium">Asset</th>
                        <th className="px-3 py-2 font-medium">Suggested replacement</th>
                        <th className="px-3 py-2 font-medium text-right">Now</th>
                        <th className="px-3 py-2 font-medium text-right">After</th>
                        <th className="px-5 py-2 font-medium text-right">Saving</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suggestions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(r => {
                        const a = r.asset
                        const h = HEALTH_LABEL[isPastEndOfLife(a) ? 'end-of-life' : a.healthStatus]
                        const saving = r.now.total - r.after!.total
                        return (
                          <tr key={a.assetId} className="border-b border-neutral-100 hover:bg-neutral-50 align-top">
                            <td className="px-5 py-2">
                              <button type="button" onClick={() => setSelected(a)} className="text-left">
                                <span className="block font-medium text-primary-700 hover:underline">{a.assetId}</span>
                                <span className="block text-xs text-neutral-500 truncate max-w-[180px]">{a.productName}</span>
                              </button>
                              <div className="mt-1 flex gap-1">
                                <Pill tone={h.tone}>{h.label}</Pill>
                                <Pill>{a.country}</Pill>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              {r.after!.suggestedName && <p className="text-neutral-900">{r.after!.suggestedName}</p>}
                              <p className={r.after!.suggestedName ? 'text-xs text-neutral-500' : 'text-neutral-900'}>
                                {r.after!.suggestedName ? 'Specs: ' : ''}
                                {r.after!.replacementClass}
                              </p>
                            </td>
                            <td className="px-3 py-2 text-right text-neutral-700 whitespace-nowrap">{t(r.now.total)} t</td>
                            <td className="px-3 py-2 text-right text-neutral-700 whitespace-nowrap">{t(r.after!.total)} t</td>
                            <td className={`px-5 py-2 text-right font-semibold whitespace-nowrap ${saving > 0 ? 'text-success-600' : 'text-warning-600'}`}>
                              {saving > 0 ? '−' : '+'}
                              {t(Math.abs(saving))} t
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} pageSize={PAGE_SIZE} total={suggestions.length} onPage={setPage} />
              </Panel>
            </div>
          </>
        )}

        <Panel
          title="Emissions vs electricity around the world"
          info="Yearly figures for all assets in this selection, by the country they are in. Switch between total emissions, electricity used, and emissions per MWh of electricity. Hover a country for all three."
          actions={
            <span className="text-xs text-neutral-500 hidden sm:inline">
              Whole fleet: <strong className="text-neutral-800">{t(em.fleet.total)} t CO₂e</strong> · <strong className="text-neutral-800">{mwh(em.fleet.kWh)} MWh</strong> / yr
            </span>
          }
        >
          <EmissionsMap data={em.countries} />
        </Panel>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="End-of-life timeline" info="How many assets reach their Last Date of Support in each period. Red: already unsupported and over-used.">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeline} margin={{ left: -16, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v} assets`, 'Support ends']} />
                  <Bar dataKey="count" maxBarSize={48} radius={[4, 4, 0, 0]}>
                    {timeline.map((_, i) => (
                      <Cell key={i} fill={TIMELINE_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel
            title="Methane if over-used assets go to landfill"
            info="Methane (CH₄) released as materials such as foam, fabric and wood decompose in landfill. Assumes 65% is captured at the landfill and the rest escapes; CH₄ is counted at 28× CO₂ (100-year warming potential). Recycling or refurbishing avoids all of it."
          >
            {methane.assets === 0 ? (
              <Empty>
                No over-used assets with a methane factor in this selection
                {methane.noFactorTypes.length > 0 && <> ({methane.noFactorTypes.join(', ')} have no methane reference)</>}.
              </Empty>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-lg bg-neutral-50 p-3">
                    <p className="text-xs text-neutral-500">Methane released</p>
                    <p className="text-xl font-bold text-neutral-900">{methane.ch4Kg.toFixed(2)} kg CH₄</p>
                  </div>
                  <div className="rounded-lg bg-neutral-50 p-3">
                    <p className="text-xs text-neutral-500">Warming impact</p>
                    <p className="text-xl font-bold text-danger-600">{t(methane.co2eKg)} kg CO₂e</p>
                  </div>
                  <div className="rounded-lg bg-success-50 p-3">
                    <p className="text-xs text-success-700">Avoidable by recycling</p>
                    <p className="text-xl font-bold text-success-700">100%</p>
                  </div>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={methane.byType} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} unit=" kg" />
                      <YAxis type="category" dataKey="type" width={80} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number, _n, p: any) => [`${t(v)} kg CO₂e (${p.payload.assets} assets)`, 'Methane impact']} />
                      <Bar dataKey="co2eKg" fill="#ea580c" maxBarSize={22} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {methane.noFactorTypes.length > 0 && (
                  <p className="text-xs text-neutral-500 mt-2">No methane reference for: {methane.noFactorTypes.join(', ')}.</p>
                )}
              </>
            )}
          </Panel>
        </div>

        <section className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm text-sm text-neutral-600 space-y-2">
          <h2 className="font-semibold text-neutral-900">Where these numbers come from</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Your own <em>Scope 1/2/3 tCO2e</em>, <em>Power Watts</em> and <em>Usage Hours Per Year</em> columns are used wherever filled in
              ({coverage.scope2FromFile} of {coverage.total} assets have Scope 2, {coverage.energyFromFile} have power or hours).
            </li>
            <li>Otherwise AssetPulse calculates them from typical power ratings, manufacturing footprints and lifetimes per asset type, and approximate 2023 national grid factors.</li>
            {coverage.worldAverageCountries.length > 0 && (
              <li>No national grid factor for {coverage.worldAverageCountries.join(', ')}; the world average (0.48 kg CO₂e/kWh) is used.</li>
            )}
            {coverage.unmodelledTypes.length > 0 && <li>No reference model for: {coverage.unmodelledTypes.join(', ')}. Add their scope columns to include them.</li>}
          </ul>
          <Link href="/logic-library#emissions" className="inline-block text-sm font-medium text-primary-600 hover:underline">
            See every formula and reference value →
          </Link>
        </section>
      </div>

      <AssetDrawer asset={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
