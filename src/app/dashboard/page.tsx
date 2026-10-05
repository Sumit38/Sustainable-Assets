'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { InfoTip } from '@/components/common/InfoTip'
import { StoryCard } from '@/components/dashboard/StoryCard'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { ImportPanel } from '@/components/dashboard/ImportPanel'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ShieldAlert, ShieldCheck, HeartPulse, Leaf, BatteryCharging, Upload, Check, X } from 'lucide-react'
import { validateAndProcessCSV, ExtendedImportedAsset } from '@/lib/import/csvProcessor'
import { calculateMetrics } from '@/lib/calculations/metricCalculator'
import { useDashboard } from '@/lib/context/dashboardContext'
import { summariseEmissions } from '@/lib/calculations/emissionsModel'
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
} from '@/lib/calculations/dashboardInsights'

const HEALTH_SLICES = [
  { key: 'healthy', name: 'Healthy', color: '#22c55e' },
  { key: 'at-risk', name: 'At risk', color: '#eab308' },
  { key: 'critical', name: 'Critical', color: '#ef4444' },
  { key: 'end-of-life', name: 'Past end of life', color: '#6b7280' },
] as const

const rateTone = (r: number) => (r >= 90 ? 'text-success-600' : r >= 75 ? 'text-warning-600' : 'text-danger-600')
const rateBar = (r: number) => (r >= 90 ? 'bg-success-500' : r >= 75 ? 'bg-warning-500' : 'bg-danger-500')

const fmtT = (v: number) => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2))
const pctChange = (now: number, after: number) => {
  const p = now > 0 ? Math.round(((after - now) / now) * 100) : 0
  return `${p > 0 ? '+' : ''}${p}%`
}

const TIMELINE_COLORS = ['#dc2626', '#f97316', '#eab308', '#0ea5e9', '#22c55e']

const STORY = [
  {
    icon: <ShieldAlert className="w-5 h-5" />,
    title: 'Compliance',
    text: 'See what share of your assets meets compliance targets, and the fines the rest could trigger.',
    tone: 'bg-danger-50 text-danger-600',
  },
  {
    icon: <HeartPulse className="w-5 h-5" />,
    title: 'Employee health',
    text: 'See which employees work with worn-out assets that can cause injuries or health issues.',
    tone: 'bg-warning-50 text-warning-600',
  },
  {
    icon: <Leaf className="w-5 h-5" />,
    title: 'Sustainability',
    text: 'Measure the carbon footprint of assets that should already have been replaced.',
    tone: 'bg-success-50 text-success-600',
  },
  {
    icon: <BatteryCharging className="w-5 h-5" />,
    title: 'Lithium recovery (DLE)',
    text: 'Discover how much lithium your retiring devices can return, so less needs to be mined.',
    tone: 'bg-primary-50 text-primary-600',
  },
]

export default function Dashboard() {
  const { importedAssets, setDashboardData } = useDashboard()
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS)
  const [showImport, setShowImport] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)

  useEffect(() => {
    setFilters(filtersFromQuery(window.location.search))
  }, [])

  const options = useMemo(() => filterOptions(importedAssets), [importedAssets])
  const filtered = useMemo(() => filterAssets(importedAssets, filters), [importedAssets, filters])
  const insights = useMemo(() => computeInsights(filtered, filters.standard), [filtered, filters.standard])
  const emissions = useMemo(() => summariseEmissions(filtered), [filtered])

  const setFilter = (key: keyof DashboardFilters, value: string) =>
    setFilters(f => ({ ...f, [key]: f[key] === value ? ALL : value }))

  async function handleFileUpload(file: File) {
    setUploading(true)
    setImportError(null)
    setImportSuccess(null)
    try {
      const result = validateAndProcessCSV(await file.text())
      if (!result.success) {
        const lines = result.errors.slice(0, 5).map(e => `Row ${e.row}: ${e.field} - ${e.error}`).join('\n')
        setImportError(`Import failed: ${result.errors.length} errors found\n\n${lines}${result.errors.length > 5 ? '\n...' : ''}`)
        return
      }
      if (result.assetsImported === 0) {
        setImportError(['No valid assets found in the CSV file.', ...result.warnings].join(' '))
        return
      }
      const assets = result.assets as ExtendedImportedAsset[]
      const saveResult = await setDashboardData(assets, calculateMetrics(assets))
      if (!saveResult.success) {
        setImportError(
          `Data is shown for this session but was NOT saved to the database, so it will disappear after you log out.\n\nReason: ${saveResult.error}`
        )
        setShowImport(true)
        return
      }
      setFilters(EMPTY_FILTERS)
      setShowImport(false)
      setImportSuccess([`Imported and saved ${assets.length} assets.`, ...result.warnings].join(' '))
    } catch (err) {
      setImportError(`Upload error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  const importPanel = (
    <ImportPanel uploading={uploading} success={null} error={importError} onFile={handleFileUpload} />
  )

  if (importedAssets.length === 0) {
    return (
      <div className="w-full">
        <PageHeader title="Dashboard" description="Asset risk, health and sustainability at a glance" homeHref="/welcome" />
        <div className="p-6 space-y-6 max-w-5xl">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">See what your ageing assets are really costing you</h2>
            <p className="text-neutral-600 mt-2">
              Keeping assets past their end of life creates hidden risks. Upload your asset list and AssetPulse shows them
              across four areas:
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STORY.map(s => (
              <div key={s.title} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
                <span className={`flex items-center justify-center w-9 h-9 rounded-lg ${s.tone}`}>{s.icon}</span>
                <p className="font-semibold text-neutral-900 mt-3">{s.title}</p>
                <p className="text-sm text-neutral-600 mt-1">{s.text}</p>
              </div>
            ))}
          </div>
          {importPanel}
        </div>
      </div>
    )
  }

  const { compliance, health, sustainability, lithium, charts } = insights
  const query = filtersToQuery(filters)
  const healthData = HEALTH_SLICES.map(s => ({ name: s.name, value: charts.health[s.key], color: s.color })).filter(d => d.value > 0)
  const maxType = Math.max(1, ...charts.byType.map(t => t.total))

  return (
    <div className="w-full">
      <PageHeader title="Dashboard" description="Asset risk, health and sustainability at a glance" homeHref="/welcome" />

      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-neutral-700">
            <strong className="text-2xl text-danger-600">{insights.actionCount}</strong>
            <span className="ml-2">of {insights.total} assets need action now (critical or past end of life)</span>
          </p>
          <button
            type="button"
            onClick={() => setShowImport(s => !s)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {showImport ? <X className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            {showImport ? 'Close import' : 'Import new data'}
          </button>
        </div>

        {importSuccess && !showImport && (
          <div className="bg-success-50 border border-success-500/30 rounded-lg px-4 py-3 flex items-center justify-between text-sm text-success-700">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" /> {importSuccess}
            </span>
            <button type="button" aria-label="Dismiss" onClick={() => setImportSuccess(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {showImport && importPanel}

        <FilterBar filters={filters} onChange={setFilters} options={options} shown={filtered.length} total={importedAssets.length} />

        {filtered.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center text-neutral-500">
            No assets match these filters.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StoryCard
                title="Compliance"
                value={`${compliance.complianceRate}%`}
                unit="compliant"
                caption={`${formatNumber(compliance.compliantCount)} of ${formatNumber(insights.total)} assets meet the target score of ${COMPLIANCE_THRESHOLD}`}
                icon={<ShieldCheck className="w-5 h-5" />}
                tone={compliance.complianceRate >= 90 ? 'success' : compliance.complianceRate >= 75 ? 'warning' : 'danger'}
                href={`/compliance${query}`}
                stats={[
                  { label: 'Regulations in scope', value: `${compliance.regulations.length} · ${formatNumber(compliance.assetsInScope)} assets` },
                  { label: 'Average compliance score', value: compliance.avgScore.toFixed(0), tone: compliance.avgScore >= COMPLIANCE_THRESHOLD ? 'success' : 'warning' },
                  { label: 'Possible fines', value: formatMoney(compliance.fineExposure), tone: compliance.fineExposure > 0 ? 'danger' : 'success' },
                ]}
                info={
                  <>
                    <strong>Compliance rate:</strong> share of assets whose <em>Compliance Score</em> is {COMPLIANCE_THRESHOLD} or
                    above.
                    <br />
                    <br />
                    <strong>Regulations in scope:</strong> the regulation categories your assets fall under, based on each
                    asset&apos;s type and the law of the country it is in.
                    <br />
                    <br />
                    <strong>Possible fines:</strong> for each law that covers at least one of the{' '}
                    {formatNumber(compliance.nonCompliantCount)} assets below target, the maximum fine stated in that law,
                    counted once per law per country (not per asset). See the Compliance page for each country&apos;s law.
                  </>
                }
              />
              <StoryCard
                title="Employee health"
                value={formatNumber(health.employees.total)}
                unit="employees"
                caption="work with assets in poor condition"
                icon={<HeartPulse className="w-5 h-5" />}
                tone="warning"
                href={`/assets${query ? `${query}&` : '?'}status=poor`}
                missingData={
                  health.poorConditionCount > 0 && health.employees.withData === 0
                    ? 'Add the “Employees Affected” column to your file to see who is exposed.'
                    : undefined
                }
                stats={[
                  { label: 'Assets in poor condition', value: formatNumber(health.poorConditionCount), tone: health.poorConditionCount > 0 ? 'warning' : 'success' },
                  {
                    label: 'Share of employees',
                    value: health.allEmployees.total > 0 ? `${Math.round((health.employees.total / health.allEmployees.total) * 100)}%` : '—',
                  },
                  {
                    label: 'Health issues / year',
                    value: health.healthIssues.withData > 0 ? formatNumber(health.healthIssues.total) : 'Not provided',
                  },
                ]}
                info={
                  <>
                    The total of the <em>Employees Affected</em> column for every asset that is at risk, critical or past end of
                    life. Faulty or ageing devices cause eye strain, overheating, battery swelling and electrical-safety risks, so these people should be
                    prioritised.
                    <br />
                    <br />
                    Uses only the numbers in your file. Assets without this column are left out, not estimated.
                  </>
                }
              />
              <StoryCard
                title="Sustainability"
                value={fmtT(emissions.replaceableNow.total)}
                unit="t CO₂e / yr"
                caption="emitted by over-used assets (Scope 1 + 2 + 3)"
                icon={<Leaf className="w-5 h-5" />}
                tone="success"
                href={`/sustainability${query}`}
                stats={[
                  {
                    label: 'After replacement',
                    value:
                      emissions.replaceable.length > 0
                        ? `${fmtT(emissions.replaceableAfter.total)} t (${pctChange(emissions.replaceableNow.total, emissions.replaceableAfter.total)})`
                        : '—',
                    tone: emissions.replaceableAfter.total < emissions.replaceableNow.total ? 'success' : 'neutral',
                  },
                  { label: 'Electricity, over-used assets', value: `${fmtT(emissions.replaceableNow.kWh / 1000)} MWh / yr` },
                  { label: 'Whole-fleet emissions', value: `${fmtT(emissions.fleet.total)} t / yr` },
                ]}
                info={
                  <>
                    Yearly Scope 1 + 2 + 3 emissions of assets that are critical or past end of life, and what they would be after
                    replacing them with current-generation models.
                    <br />
                    <br />
                    Uses your Scope and Power columns where provided; otherwise typical ratings per asset type and national grid
                    factors. Details on the Sustainability page.
                  </>
                }
              />
              <StoryCard
                title="Lithium recovery (DLE)"
                value={lithium.lithiumKg.toFixed(2)}
                unit="kg"
                caption="lithium recoverable now from retiring devices"
                icon={<BatteryCharging className="w-5 h-5" />}
                tone="primary"
                href={`/dle${query}`}
                missingData={
                  lithium.lithiumAssets === 0
                    ? 'No retiring devices with lithium batteries yet (laptops, tablets, phones, UPS systems).'
                    : undefined
                }
                stats={[
                  { label: 'Retiring battery devices', value: formatNumber(lithium.lithiumAssets) },
                  { label: 'Lithium across fleet', value: `${lithium.fleetLithiumKg.toFixed(2)} kg` },
                  { label: 'Mining CO₂e avoided', value: `${formatNumber(lithium.miningCo2eAvoidedKg)} kg`, tone: 'success' },
                ]}
                info={
                  <>
                    Laptops, tablets, phones and UPS systems due for retirement contain lithium batteries.
                    Recovering it through Direct Lithium Extraction (DLE) and recycling means less new lithium has to be mined.
                    <br />
                    <br />
                    Uses the typical lithium content of each device type from AssetPulse&apos;s materials reference, not a column
                    in your file.
                  </>
                }
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-neutral-900">Compliance by region</h2>
                  <InfoTip title="Compliance by region">
                    Share of each region&apos;s assets that meet the compliance target of {COMPLIANCE_THRESHOLD}, and which
                    regulations apply there. Click a region to filter the whole dashboard to it.
                  </InfoTip>
                </div>
                <div className="space-y-2">
                  {[...compliance.regions].sort((a, b) => b.total - a.total).map(r => (
                    <button
                      type="button"
                      key={r.region}
                      onClick={() => setFilter('region', r.region)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        filters.region === r.region ? 'border-primary-500 bg-primary-50' : 'border-transparent hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex justify-between items-baseline gap-3 text-sm mb-1.5">
                        <span className="font-medium text-neutral-900">{r.region}</span>
                        <span className="text-neutral-500 whitespace-nowrap">
                          <span className={`font-semibold ${rateTone(r.rate)}`}>{r.rate}%</span> · {r.compliant} of {r.total} compliant
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${rateBar(r.rate)}`} style={{ width: `${r.rate}%` }} />
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-neutral-900">Regulations in scope</h2>
                  <InfoTip title="Regulations in scope">
                    Regulation categories your assets fall under, based on asset type and country, with how many assets each
                    covers and how many are compliant. Each country applies its own law within a category. Frameworks such as
                    ISO 27001, SOC 2 and NIST carry no government fine. Click a category to filter by it.
                  </InfoTip>
                </div>
                {compliance.regulations.length === 0 ? (
                  <p className="text-sm text-neutral-500 py-6 text-center">No regulations apply to the assets in this selection.</p>
                ) : (
                  <div className="space-y-2">
                    {compliance.regulations.slice(0, 6).map(s => (
                      <button
                        type="button"
                        key={s.standard}
                        onClick={() => setFilter('standard', s.standard)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          filters.standard === s.standard ? 'border-primary-500 bg-primary-50' : 'border-neutral-100 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex justify-between items-baseline gap-3 text-sm mb-1.5">
                          <span className="font-medium text-neutral-900">{s.name}</span>
                          <span className="text-neutral-500 whitespace-nowrap">
                            <span className={`font-semibold ${rateTone(s.rate)}`}>{s.rate}%</span> · {s.compliant} of {s.inScope} assets
                          </span>
                        </div>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${rateBar(s.rate)}`} style={{ width: `${s.rate}%` }} />
                        </div>
                        <p className="text-xs text-neutral-500 mt-1.5">
                          {s.nonCompliant === 0
                            ? 'Fully compliant: no fine exposure'
                            : s.exposure > 0
                              ? `Possible fines if not fixed: ${formatMoney(s.exposure)}`
                              : 'No fixed statutory fine (framework, contract or set nationally)'}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-neutral-900">Asset condition</h2>
                  <InfoTip title="Asset condition">
                    Health status from your file. Any asset whose support date has passed counts as “Past end of life”,
                    whatever status it was given.
                  </InfoTip>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:w-1/2 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={healthData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                          {healthData.map(d => (
                            <Cell key={d.name} fill={d.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => `${v} assets`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="w-full sm:w-1/2 space-y-2 text-sm">
                    {HEALTH_SLICES.map(s => (
                      <li key={s.key} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-neutral-700">
                          <span className="w-3 h-3 rounded-sm" style={{ background: s.color }} />
                          {s.name}
                        </span>
                        <span className="font-semibold text-neutral-900">{charts.health[s.key]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-neutral-900">End-of-support timeline</h2>
                  <InfoTip title="End-of-support timeline">
                    How many assets reach their Last Date of Support in each period. The red bar is assets already
                    unsupported; the orange bar shows what to budget for in the next six months.
                  </InfoTip>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.timeline} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [`${v} assets`, 'Support ends']} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {charts.timeline.map((_, i) => (
                          <Cell key={i} fill={TIMELINE_COLORS[i]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            <section className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-neutral-900">Where to act first</h2>
                <InfoTip title="Where to act first">
                  Asset types ranked by how many need action (critical or past end of life). Click a type to filter the
                  dashboard to it.
                </InfoTip>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {charts.byType.slice(0, 8).map(t => (
                  <button
                    type="button"
                    key={t.type}
                    onClick={() => setFilter('assetType', t.type)}
                    className={`text-left p-2 rounded-lg border transition-colors ${
                      filters.assetType === t.type ? 'border-primary-500 bg-primary-50' : 'border-transparent hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-neutral-900">{t.type}</span>
                      <span className="text-neutral-500">
                        <span className="text-danger-600 font-semibold">{t.action}</span> of {t.total} need action
                      </span>
                    </div>
                    <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-neutral-300" style={{ width: `${(t.total / maxType) * 100}%` }} />
                      <div className="absolute inset-y-0 left-0 bg-danger-500" style={{ width: `${(t.action / maxType) * 100}%` }} />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
