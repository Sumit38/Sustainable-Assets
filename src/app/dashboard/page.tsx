'use client'

import React, { useMemo, useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { InfoTip } from '@/components/common/InfoTip'
import { StoryCard } from '@/components/dashboard/StoryCard'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { ImportPanel } from '@/components/dashboard/ImportPanel'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ShieldAlert, HeartPulse, Leaf, BatteryCharging, Upload, Check, X } from 'lucide-react'
import { validateAndProcessCSV, ExtendedImportedAsset } from '@/lib/import/csvProcessor'
import { calculateMetrics } from '@/lib/calculations/metricCalculator'
import { useDashboard } from '@/lib/context/dashboardContext'
import {
  ALL,
  COMPLIANCE_THRESHOLD,
  DashboardFilters,
  EMPTY_FILTERS,
  computeInsights,
  filterAssets,
  filterOptions,
  formatMoney,
  formatNumber,
} from '@/lib/calculations/dashboardInsights'

const HEALTH_SLICES = [
  { key: 'healthy', name: 'Healthy', color: '#22c55e' },
  { key: 'at-risk', name: 'At risk', color: '#eab308' },
  { key: 'critical', name: 'Critical', color: '#ef4444' },
  { key: 'end-of-life', name: 'Past end of life', color: '#6b7280' },
] as const

const TIMELINE_COLORS = ['#dc2626', '#f97316', '#eab308', '#0ea5e9', '#22c55e']

const STORY = [
  {
    icon: <ShieldAlert className="w-5 h-5" />,
    title: 'Compliance risk',
    text: 'Find assets still in use after their end of support, and the regulatory fines they could trigger.',
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

  const options = useMemo(() => filterOptions(importedAssets), [importedAssets])
  const filtered = useMemo(() => filterAssets(importedAssets, filters), [importedAssets, filters])
  const insights = useMemo(() => computeInsights(filtered, filters.standard), [filtered, filters.standard])

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
        setImportError('No valid assets found in the CSV file')
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
      setImportSuccess(`Imported and saved ${assets.length} assets.`)
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
              in four steps:
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STORY.map((s, i) => (
              <div key={s.title} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
                <span className={`flex items-center justify-center w-9 h-9 rounded-lg ${s.tone}`}>{s.icon}</span>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mt-3">Step {i + 1}</p>
                <p className="font-semibold text-neutral-900">{s.title}</p>
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
  const healthData = HEALTH_SLICES.map(s => ({ name: s.name, value: charts.health[s.key], color: s.color })).filter(d => d.value > 0)
  const maxRegion = Math.max(1, ...compliance.regions.map(r => r.total))
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
                step={1}
                title="Compliance risk"
                value={formatNumber(compliance.pastEolCount)}
                unit="assets"
                caption="still in use after end of support"
                icon={<ShieldAlert className="w-5 h-5" />}
                tone="danger"
                href="/alerts"
                footnote={`${formatMoney(compliance.fineExposure)} potential fines`}
                info={
                  <>
                    Assets whose <em>Last Date of Support</em> has passed, or that are marked end-of-life, but are still in
                    use. Unsupported assets no longer get safety or security fixes, which is how compliance breaches start.
                    <br />
                    <br />
                    <strong>Potential fines:</strong> {compliance.nonCompliantCount} assets score below {COMPLIANCE_THRESHOLD}.
                    Each is counted once for every regulation that applies to its type and region, multiplied by that
                    regulation&apos;s published fine per violation.
                  </>
                }
              />
              <StoryCard
                step={2}
                title="Employee health"
                value={formatNumber(health.employees.total)}
                unit="employees"
                caption="work with assets in poor condition"
                icon={<HeartPulse className="w-5 h-5" />}
                tone="warning"
                href="/assets"
                missingData={
                  health.poorConditionCount > 0 && health.employees.withData === 0
                    ? 'Add the “Employees Affected” column to your file to see who is exposed.'
                    : undefined
                }
                footnote={
                  health.healthIssues.withData > 0
                    ? `${formatNumber(health.healthIssues.total)} health issues reported / yr`
                    : `From ${health.employees.withData} of ${health.employees.of} assets with data`
                }
                info={
                  <>
                    The total of the <em>Employees Affected</em> column for every asset that is at risk, critical or past
                    end of life. Worn chairs, desks and equipment cause ergonomic and safety problems, so these people
                    should be prioritised.
                    <br />
                    <br />
                    Uses only the numbers in your file. Assets without this column are left out, not estimated.
                  </>
                }
              />
              <StoryCard
                step={3}
                title="Sustainability"
                value={sustainability.co2eTonnes.total.toFixed(1)}
                unit="t CO₂e / yr"
                caption="emitted by assets due for replacement"
                icon={<Leaf className="w-5 h-5" />}
                tone="success"
                href="/sustainability"
                missingData={
                  insights.actionCount > 0 && sustainability.co2eTonnes.withData === 0
                    ? 'Add the “Annual CO2e” column to your file to see the footprint.'
                    : undefined
                }
                footnote={`From ${sustainability.co2eTonnes.withData} of ${sustainability.co2eTonnes.of} assets with data`}
                info={
                  <>
                    The total of the <em>Annual CO2e</em> column (tonnes per year) for assets that are critical or past
                    end of life. Old equipment usually uses more energy than modern replacements, so this is the footprint
                    you could cut by replacing them.
                  </>
                }
              />
              <StoryCard
                step={4}
                title="Lithium recovery (DLE)"
                value={lithium.lithiumKg.toFixed(2)}
                unit="kg"
                caption="lithium recoverable from retiring devices"
                icon={<BatteryCharging className="w-5 h-5" />}
                tone="primary"
                href="/dle"
                missingData={
                  lithium.lithiumAssets === 0
                    ? 'None of the assets due for retirement contain lithium batteries (laptops, tablets, phones, UPS, EVs).'
                    : undefined
                }
                footnote={`${lithium.lithiumAssets} devices · ${formatNumber(lithium.miningCo2eAvoidedKg)} kg CO₂e mining avoided`}
                info={
                  <>
                    Laptops, tablets, phones, UPS systems and electric vehicles due for retirement contain lithium batteries.
                    Recovering it through Direct Lithium Extraction (DLE) and recycling means less new lithium has to be
                    mined.
                    <br />
                    <br />
                    Uses the typical lithium content of each device type from AssetPulse&apos;s materials reference, not a
                    column in your file.
                  </>
                }
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-neutral-900">Compliance by region</h2>
                  <InfoTip title="Compliance by region">
                    For each region: how many assets score below {COMPLIANCE_THRESHOLD} (red) and how many are past end of
                    support (grey). Click a region to filter the whole dashboard to it.
                  </InfoTip>
                </div>
                <div className="space-y-2">
                  {compliance.regions.map(r => (
                    <button
                      type="button"
                      key={r.region}
                      onClick={() => setFilter('region', r.region)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        filters.region === r.region ? 'border-primary-500 bg-primary-50' : 'border-transparent hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-neutral-900">{r.region}</span>
                        <span className="text-neutral-500">
                          <span className="text-danger-600 font-semibold">{r.nonCompliant}</span> non-compliant ·{' '}
                          {r.pastEol} past EOL · {r.total} total
                        </span>
                      </div>
                      <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-neutral-300" style={{ width: `${(r.total / maxRegion) * 100}%` }} />
                        <div className="absolute inset-y-0 left-0 bg-danger-500" style={{ width: `${(r.nonCompliant / maxRegion) * 100}%` }} />
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-neutral-900">Regulations at risk</h2>
                  <InfoTip title="Regulations at risk">
                    Regulations that apply to your non-compliant assets, ordered by potential fine. Frameworks such as ISO
                    27001, SOC 2 and NIST have no government fines, so they show $0. Click a regulation to filter by it.
                  </InfoTip>
                </div>
                {compliance.standards.length === 0 ? (
                  <p className="text-sm text-neutral-500 py-6 text-center">No non-compliant assets in this selection.</p>
                ) : (
                  <div className="space-y-2">
                    {compliance.standards.slice(0, 6).map(s => (
                      <button
                        type="button"
                        key={s.standard}
                        onClick={() => setFilter('standard', s.standard)}
                        className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg border text-left transition-colors ${
                          filters.standard === s.standard ? 'border-primary-500 bg-primary-50' : 'border-neutral-100 hover:bg-neutral-50'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{s.name}</p>
                          <p className="text-xs text-neutral-500">
                            {s.count} assets × {formatMoney(s.finePerViolation)} per violation
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-danger-600">{formatMoney(s.exposure)}</p>
                          <p
                            className={`text-[10px] font-semibold uppercase ${
                              s.risk === 'CRITICAL' ? 'text-danger-600' : s.risk === 'HIGH' ? 'text-warning-600' : 'text-neutral-500'
                            }`}
                          >
                            {s.risk}
                          </p>
                        </div>
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
