'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Radar } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { AssetDrawer } from '@/components/assets/AssetDrawer'
import { Kpi, NoData, Pagination, Panel, Pill, Empty, PillTone } from '@/components/common/ui'
import { useDashboard } from '@/lib/context/dashboardContext'
import { ImportedAsset } from '@/lib/calculations/metricCalculator'
import { RISK_WEIGHTS, RiskBand, predictedExposure, riskSummary } from '@/lib/calculations/riskModel'
import { standardLabel } from '@/lib/data/complianceMatrix'
import {
  DashboardFilters,
  EMPTY_FILTERS,
  filterAssets,
  filterOptions,
  filtersFromQuery,
  formatMoney,
} from '@/lib/calculations/dashboardInsights'

const PAGE_SIZE = 15
const BAND_TONE: Record<RiskBand, PillTone> = { High: 'danger', Medium: 'warning', Low: 'success' }
const BAND_COLOR: Record<RiskBand, string> = { High: '#ef4444', Medium: '#eab308', Low: '#22c55e' }
const SOURCE_LABEL = { file: 'From your file', reference: 'Reference data', 'self-reported': 'Self-reported' } as const
const pct = (v: number) => `${Math.round(v * 100)}%`

export default function RiskPredictionPage() {
  const { importedAssets, countryFactors } = useDashboard()
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS)
  const [band, setBand] = useState<RiskBand | 'all'>('all')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<ImportedAsset | null>(null)
  useEffect(() => setFilters(filtersFromQuery(window.location.search)), [])
  useEffect(() => setPage(0), [filters, band])

  const options = useMemo(() => filterOptions(importedAssets), [importedAssets])
  const assets = useMemo(() => filterAssets(importedAssets, filters), [importedAssets, filters])
  const summary = useMemo(() => riskSummary(assets), [assets])
  const exposure = useMemo(() => predictedExposure(assets, countryFactors), [assets, countryFactors])

  if (importedAssets.length === 0) {
    return (
      <div className="w-full">
        <PageHeader title="Risk Prediction" description="Predicted compliance risk from objective asset signals" homeHref="/welcome" />
        <div className="p-6">
          <NoData what="predicted compliance risk" />
        </div>
      </div>
    )
  }

  const nonNeutral = Object.keys(countryFactors).length
  const list = summary.risks.filter(r => band === 'all' || r.risk.band === band)
  const bandData = (['High', 'Medium', 'Low'] as RiskBand[]).map(b => ({ band: b, count: summary.bands[b] }))

  return (
    <div className="w-full">
      <PageHeader
        title="Risk Prediction"
        description="Predicted compliance risk from objective asset signals, and the expected fine exposure"
        homeHref="/welcome"
      />

      <div className="p-6 space-y-6">
        <div className="flex gap-3 bg-primary-50 border border-primary-500/20 rounded-xl p-4 text-sm text-primary-800">
          <Radar className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            Each asset gets a predicted risk score from <strong>signals that don&apos;t depend on anyone&apos;s opinion</strong>: support dates, age,
            whether it holds data, and health status. The self-reported compliance score counts only as a small, labelled signal. This
            is a transparent weighted model (every weight is listed in the{' '}
            <Link href="/logic-library#risk-prediction" className="underline font-medium">Logic Library</Link>), not a trained AI model.
            Country enforcement likelihood:{' '}
            <Link href="/settings#country-factors" className="underline font-medium">
              {nonNeutral === 0 ? 'neutral (1.0) for every country' : `${nonNeutral} ${nonNeutral === 1 ? 'country' : 'countries'} adjusted`}
            </Link>
            .
          </p>
        </div>

        <FilterBar filters={filters} onChange={setFilters} options={options} shown={assets.length} total={importedAssets.length} />

        {assets.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center text-neutral-500">No assets match these filters.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <Kpi
                label="High-risk assets"
                value={summary.bands.High.toString()}
                sub={`${pct(summary.bands.High / assets.length)} of ${assets.length} assets`}
                tone="text-danger-600"
                info="Assets with a predicted risk score of 67 or more."
              />
              <Kpi
                label="Average predicted risk"
                value={`${Math.round(summary.average)} / 100`}
                sub={`${summary.bands.Medium} medium · ${summary.bands.Low} low`}
                tone={summary.average >= 67 ? 'text-danger-600' : summary.average >= 34 ? 'text-warning-600' : 'text-success-600'}
                info="Average of every asset's predicted risk score (0–100). The score is the sum of the signal points, capped at 100."
              />
              <Kpi
                label="Expected fine exposure"
                value={exposure.lines.length ? `${formatMoney(exposure.expectedLow)}–${formatMoney(exposure.expectedHigh)}` : '—'}
                sub="likelihood × statutory maximum"
                tone="text-danger-600"
                info="For each law with a fixed maximum fine: statutory maximum × predicted likelihood × country factor. The range runs from the average to the highest predicted likelihood of the assets it covers."
              />
              <Kpi
                label="Statutory maximum"
                value={formatMoney(exposure.statutoryMax)}
                sub={`${exposure.lines.length} laws with a fixed maximum`}
                info="Sum of the fixed maximum fines of every law that covers at least one asset in this selection, once per law per country. The worst case, not a prediction."
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Panel title="Risk distribution" info="How many assets fall in each predicted risk band. Click a bar to filter the asset list below.">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bandData} margin={{ left: -16, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="band" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [`${v} assets`, 'Assets']} />
                      <Bar dataKey="count" maxBarSize={64} radius={[4, 4, 0, 0]} cursor="pointer" onClick={(d: any) => setBand(band === d.band ? 'all' : d.band)}>
                        {bandData.map(d => (
                          <Cell key={d.band} fill={BAND_COLOR[d.band]} fillOpacity={band === 'all' || band === d.band ? 1 : 0.35} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="What drives the risk" info="How many assets trigger each signal, with the points each signal adds and where the signal comes from.">
                {summary.drivers.length === 0 ? (
                  <Empty>No risk signals in this selection.</Empty>
                ) : (
                  <ul className="space-y-2.5">
                    {summary.drivers.map(d => (
                      <li key={d.key}>
                        <div className="flex justify-between gap-3 text-sm mb-1">
                          <span className="text-neutral-800">
                            {d.label} <span className="text-xs text-neutral-400">+{RISK_WEIGHTS[d.key as keyof typeof RISK_WEIGHTS]}</span>
                          </span>
                          <span className="text-neutral-500 whitespace-nowrap">{d.count} assets</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${d.source === 'self-reported' ? 'bg-neutral-400' : 'bg-primary-500'}`} style={{ width: `${(d.count / assets.length) * 100}%` }} />
                          </div>
                          <Pill tone={d.source === 'self-reported' ? 'neutral' : 'primary'}>{SOURCE_LABEL[d.source]}</Pill>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>

            <Panel
              title="Expected fine exposure by country"
              info="One row per law with a fixed maximum fine and the assets it covers. Likelihood = predicted risk of those assets (average – highest). Expected exposure = statutory maximum × likelihood × country factor. Laws without a fixed amount are not included."
            >
              {exposure.lines.length === 0 ? (
                <Empty>No laws with a fixed maximum fine cover the assets in this selection.</Empty>
              ) : (
                <div className="overflow-x-auto -mx-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
                        <th className="px-5 py-2 font-medium">Country</th>
                        <th className="px-3 py-2 font-medium">Law</th>
                        <th className="px-3 py-2 font-medium text-right">Assets</th>
                        <th className="px-3 py-2 font-medium text-right">Likelihood</th>
                        <th className="px-3 py-2 font-medium text-right">Country factor</th>
                        <th className="px-3 py-2 font-medium text-right">Statutory max</th>
                        <th className="px-5 py-2 font-medium text-right">Expected exposure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exposure.lines.map(l => (
                        <tr key={`${l.standard}-${l.country}`} className="border-b border-neutral-100 align-top">
                          <td className="px-5 py-2 text-neutral-900 whitespace-nowrap">{l.country}</td>
                          <td className="px-3 py-2">
                            <p className="text-neutral-900">{l.law.law}</p>
                            <p className="text-xs text-neutral-500">{standardLabel(l.standard)} · {l.law.citation}</p>
                          </td>
                          <td className="px-3 py-2 text-right text-neutral-700">{l.assets}</td>
                          <td className="px-3 py-2 text-right text-neutral-700 whitespace-nowrap">
                            {pct(l.avgLikelihood)}–{pct(l.maxLikelihood)}
                          </td>
                          <td className={`px-3 py-2 text-right whitespace-nowrap ${l.factor !== 1 ? 'text-primary-700 font-semibold' : 'text-neutral-500'}`}>
                            {l.factor.toFixed(1)}
                            {l.factor === 1 && ' (neutral)'}
                          </td>
                          <td className="px-3 py-2 text-right text-neutral-700 whitespace-nowrap">{formatMoney(l.statutoryMax)}</td>
                          <td className="px-5 py-2 text-right font-semibold text-danger-600 whitespace-nowrap">
                            {formatMoney(l.expectedLow)}–{formatMoney(l.expectedHigh)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>

            <Panel
              title={`Assets by predicted risk${band === 'all' ? '' : ` (${band})`}`}
              info="Every asset in this selection, highest predicted risk first, with the signals behind its score. Click an asset for full details."
              actions={
                <div className="flex gap-1" role="tablist" aria-label="Risk band">
                  {(['all', 'High', 'Medium', 'Low'] as const).map(b => (
                    <button
                      key={b}
                      type="button"
                      role="tab"
                      aria-selected={band === b}
                      onClick={() => setBand(b)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${band === b ? 'bg-primary-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                    >
                      {b === 'all' ? 'All' : b} <span className={band === b ? 'text-primary-100' : 'text-neutral-400'}>{b === 'all' ? assets.length : summary.bands[b]}</span>
                    </button>
                  ))}
                </div>
              }
            >
              {list.length === 0 ? (
                <Empty>No assets in this band.</Empty>
              ) : (
                <>
                  <div className="overflow-x-auto -mx-5">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
                          <th className="px-5 py-2 font-medium">Asset</th>
                          <th className="px-3 py-2 font-medium">Country</th>
                          <th className="px-3 py-2 font-medium text-right">Risk</th>
                          <th className="px-5 py-2 font-medium">Why</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(({ asset, risk }) => (
                          <tr key={asset.assetId} className="border-b border-neutral-100 hover:bg-neutral-50 align-top">
                            <td className="px-5 py-2">
                              <button type="button" onClick={() => setSelected(asset)} className="text-left">
                                <span className="block font-medium text-primary-700 hover:underline">{asset.assetId}</span>
                                <span className="block text-xs text-neutral-500 truncate max-w-[200px]">
                                  {asset.assetType} · {asset.productName}
                                </span>
                              </button>
                            </td>
                            <td className="px-3 py-2 text-neutral-700 whitespace-nowrap">{asset.country}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">
                              <span className="font-semibold text-neutral-900 mr-1.5">{risk.score}</span>
                              <Pill tone={BAND_TONE[risk.band]}>{risk.band}</Pill>
                            </td>
                            <td className="px-5 py-2">
                              <div className="flex flex-wrap gap-1">
                                {risk.reasons.length === 0 ? (
                                  <span className="text-xs text-neutral-400">No risk signals</span>
                                ) : (
                                  risk.reasons.map(r => (
                                    <span
                                      key={r.key}
                                      className={`text-[11px] px-1.5 py-0.5 rounded ${r.source === 'self-reported' ? 'bg-neutral-100 text-neutral-600' : 'bg-primary-50 text-primary-800'}`}
                                      title={SOURCE_LABEL[r.source]}
                                    >
                                      {r.label} +{r.points}
                                    </span>
                                  ))
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
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
