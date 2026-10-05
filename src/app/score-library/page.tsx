'use client'

import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, HeartPulse, Leaf, BatteryCharging, RefreshCcw, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { InfoTip } from '@/components/common/InfoTip'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { NoData } from '@/components/common/ui'
import { useDashboard } from '@/lib/context/dashboardContext'
import { calculateMetrics } from '@/lib/calculations/metricCalculator'
import { methaneAtEndOfLife, summariseEmissions } from '@/lib/calculations/emissionsModel'
import {
  COMPLIANCE_THRESHOLD,
  DashboardFilters,
  EMPTY_FILTERS,
  computeInsights,
  filterAssets,
  filterOptions,
  filtersFromQuery,
  formatMoney,
  formatNumber,
} from '@/lib/calculations/dashboardInsights'

type Tone = 'good' | 'warn' | 'bad' | 'neutral'
const TONE: Record<Tone, string> = {
  good: 'text-success-600',
  warn: 'text-warning-600',
  bad: 'text-danger-600',
  neutral: 'text-neutral-900',
}

interface Score {
  name: string
  value: string
  unit?: string
  tone?: Tone
  info: ReactNode
  logic: string
  missing?: string
  after?: { value: string; now: number; then: number }
}

interface Group {
  title: string
  icon: ReactNode
  accent: string
  scores: Score[]
}

const fmtT = (v: number) => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2))
const rateTone = (r: number): Tone => (r >= 90 ? 'good' : r >= 75 ? 'warn' : 'bad')
const band = (v: number, warn: number, bad: number): Tone => (v >= bad ? 'bad' : v >= warn ? 'warn' : 'good')

function ScoreTile({ s }: { s: Score }) {
  return (
    <div className="flex flex-col rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-neutral-700">{s.name}</p>
        <InfoTip title={s.name}>{s.info}</InfoTip>
      </div>
      {s.missing ? (
        <p className="text-sm text-neutral-500 mt-2 flex-1">
          <span className="block text-2xl font-bold text-neutral-300">—</span>
          {s.missing}
        </p>
      ) : s.after ? (
        <div className="mt-1 flex-1">
          <p className="text-2xl font-bold text-neutral-900">
            {s.value}
            <span className="mx-1.5 text-base font-normal text-neutral-400">→</span>
            <span className={s.after.then < s.after.now ? 'text-success-600' : s.after.then > s.after.now ? 'text-warning-600' : 'text-neutral-900'}>
              {s.after.value}
            </span>
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {s.unit} · now → after replacement
            {s.after.now > 0 && s.after.value !== s.value && (
              <span className={`ml-1 font-semibold ${s.after.then < s.after.now ? 'text-success-600' : 'text-warning-600'}`}>
                {s.after.then < s.after.now ? '' : '+'}
                {Math.round(((s.after.then - s.after.now) / s.after.now) * 100)}%
              </span>
            )}
          </p>
        </div>
      ) : (
        <p className={`text-2xl font-bold mt-1 flex-1 ${TONE[s.tone ?? 'neutral']}`}>
          {s.value}
          {s.unit && <span className="text-sm font-medium text-neutral-500 ml-1">{s.unit}</span>}
        </p>
      )}
      <Link href={`/logic-library#${s.logic}`} className="text-xs font-medium text-primary-600 hover:underline mt-3">
        How it&apos;s calculated →
      </Link>
    </div>
  )
}

export default function ScoreLibraryPage() {
  const { importedAssets } = useDashboard()
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS)
  useEffect(() => setFilters(filtersFromQuery(window.location.search)), [])

  const options = useMemo(() => filterOptions(importedAssets), [importedAssets])
  const assets = useMemo(() => filterAssets(importedAssets, filters), [importedAssets, filters])
  const m = useMemo(() => calculateMetrics(assets), [assets])
  const ins = useMemo(() => computeInsights(assets, filters.standard), [assets, filters.standard])
  const em = useMemo(() => summariseEmissions(assets), [assets])
  const methane = useMemo(() => methaneAtEndOfLife(assets), [assets])

  if (importedAssets.length === 0) {
    return (
      <div className="w-full">
        <PageHeader title="Score Library" description="Every AssetPulse score in one place" homeHref="/welcome" />
        <div className="p-6">
          <NoData what="your scores" />
        </div>
      </div>
    )
  }

  const has = (pick: (a: (typeof assets)[number]) => unknown) => assets.some(a => typeof pick(a) === 'number')
  const hasEmployees = has(a => a.employeesAffected)
  const gpi = em.fleet.total > 0 ? Math.round((em.overUsedNow.total / em.fleet.total) * 100) : 0
  const hasMaint = has(a => a.annualMaintenanceCost)
  const hasReplacement = has(a => a.replacementCost)

  const groups: Group[] = [
    {
      title: 'Compliance',
      icon: <ShieldCheck className="w-5 h-5" />,
      accent: 'bg-success-50 text-success-600',
      scores: [
        {
          name: 'Compliance rate',
          value: `${ins.compliance.complianceRate}`,
          unit: '%',
          tone: rateTone(ins.compliance.complianceRate),
          info: `${ins.compliance.compliantCount} of ${assets.length} assets have a Compliance Score of ${COMPLIANCE_THRESHOLD} or above. Same figure as the dashboard's Compliance card.`,
          logic: 'compliance',
        },
        {
          name: 'Regulations in scope',
          value: `${ins.compliance.regulations.length}`,
          unit: `covering ${formatNumber(ins.compliance.assetsInScope)} assets`,
          info: "The regulations your assets fall under, based on each asset's type and region.",
          logic: 'fines',
        },
        {
          name: 'Average compliance score',
          value: ins.compliance.avgScore.toFixed(0),
          unit: '/ 100',
          tone: ins.compliance.avgScore >= COMPLIANCE_THRESHOLD ? 'good' : 'warn',
          info: `Average Compliance Score across the selection. Target: ${COMPLIANCE_THRESHOLD} or above.`,
          logic: 'compliance',
        },
        {
          name: 'Possible fines',
          value: formatMoney(ins.compliance.fineExposure),
          tone: ins.compliance.fineExposure > 0 ? 'bad' : 'good',
          info: 'For each country law covering at least one asset below target: the maximum fine stated in that law, counted once per law per country. Details per country on the Compliance page.',
          logic: 'fines',
        },
        {
          name: 'Assets below target',
          value: formatNumber(ins.compliance.nonCompliantCount),
          unit: 'assets',
          tone: ins.compliance.nonCompliantCount > 0 ? 'warn' : 'good',
          info: `Assets with a Compliance Score below ${COMPLIANCE_THRESHOLD}.`,
          logic: 'compliance',
        },
        {
          name: 'Past end of support',
          value: formatNumber(ins.compliance.pastEolCount),
          unit: 'assets',
          tone: ins.compliance.pastEolCount > 0 ? 'bad' : 'good',
          info: 'Assets still in use after their Last Date of Support.',
          logic: 'needs-action',
        },
      ],
    },
    {
      title: 'Employee health',
      icon: <HeartPulse className="w-5 h-5" />,
      accent: 'bg-warning-50 text-warning-600',
      scores: [
        {
          name: 'Employees exposed',
          value: formatNumber(m.employeesAtHealthRisk),
          unit: 'employees',
          tone: m.employeesAtHealthRisk > 0 ? 'warn' : 'good',
          info: 'Total of the Employees Affected column for assets that are at risk, critical or past end of life.',
          logic: 'health',
          missing: hasEmployees ? undefined : 'Add the “Employees Affected” column to see this.',
        },
        {
          name: 'Share of employees exposed',
          value: `${m.healthRiskPercentage}`,
          unit: '%',
          tone: band(m.healthRiskPercentage, 20, 40),
          info: 'Employees exposed ÷ all employees listed in the Employees Affected column.',
          logic: 'health',
          missing: hasEmployees ? undefined : 'Add the “Employees Affected” column to see this.',
        },
        {
          name: 'Average asset health',
          value: `${m.averageAssetHealth}`,
          unit: '/ 100',
          tone: m.averageAssetHealth >= 75 ? 'good' : m.averageAssetHealth >= 50 ? 'warn' : 'bad',
          info: 'Healthy = 100, at risk = 50, critical = 25, past end of life = 0, averaged across assets.',
          logic: 'avg-health',
        },
      ],
    },
    {
      title: 'Sustainability',
      icon: <Leaf className="w-5 h-5" />,
      accent: 'bg-success-50 text-success-600',
      scores: [
        ...(['scope1', 'scope2', 'scope3'] as const).map((k, i) => ({
          name: `Scope ${i + 1}: over-used assets`,
          value: fmtT(em.replaceableNow[k]),
          unit: 't CO₂e / yr',
          after: { value: fmtT(em.replaceableAfter[k]), now: em.replaceableNow[k], then: em.replaceableAfter[k] },
          info: [
            'Direct emissions from fuel burned by the asset itself. Electronic assets have none unless your file provides a Scope 1 value.',
            "Emissions from the electricity the asset uses: kWh × the country's grid emission factor.",
            "Manufacturing emissions spread over the asset's lifetime, including the replacement's own manufacturing.",
          ][i],
          logic: 'emissions',
          missing: em.replaceable.length ? undefined : 'No over-used assets in this selection.',
        })),
        {
          name: 'Total emissions: over-used assets',
          value: fmtT(em.replaceableNow.total),
          unit: 't CO₂e / yr',
          after: { value: fmtT(em.replaceableAfter.total), now: em.replaceableNow.total, then: em.replaceableAfter.total },
          info: "Scope 1 + 2 + 3 for over-used assets (critical or past end of life), today and after replacing them with current-generation models. Same figures as the dashboard's Sustainability card.",
          logic: 'emissions',
          missing: em.replaceable.length ? undefined : 'No over-used assets in this selection.',
        },
        {
          name: 'Electricity: over-used assets',
          value: fmtT(em.replaceableNow.kWh / 1000),
          unit: 'MWh / yr',
          after: { value: fmtT(em.replaceableAfter.kWh / 1000), now: em.replaceableNow.kWh, then: em.replaceableAfter.kWh },
          info: 'Electricity used during operation, today and after replacement: power (W) × usage hours per year.',
          logic: 'emissions',
          missing: em.replaceable.length ? undefined : 'No over-used assets in this selection.',
        },
        {
          name: 'Whole-fleet emissions',
          value: fmtT(em.fleet.total),
          unit: 't CO₂e / yr',
          info: 'Scope 1 + 2 + 3 per year for every asset in this selection.',
          logic: 'emissions',
        },
        {
          name: 'Whole-fleet electricity',
          value: fmtT(em.fleet.kWh / 1000),
          unit: 'MWh / yr',
          info: 'Electricity used per year by every asset in this selection.',
          logic: 'emissions',
        },
        {
          name: 'Methane if sent to landfill',
          value: fmtT(methane.co2eKg),
          unit: 'kg CO₂e',
          tone: methane.co2eKg > 0 ? 'warn' : 'good',
          info: `Warming impact of methane from over-used assets decomposing in landfill (${methane.ch4Kg.toFixed(2)} kg CH₄). Avoidable by recycling.${methane.noFactorTypes.length ? ` No methane reference for: ${methane.noFactorTypes.join(', ')}.` : ''}`,
          logic: 'methane',
        },
        {
          name: 'Global Pollution Index',
          value: `${gpi}`,
          unit: '/ 100',
          tone: band(gpi, 20, 40),
          info: 'Share of your whole-fleet emissions that comes from over-used assets. Higher means more of your footprint is caused by assets that should already be replaced.',
          logic: 'gpi',
        },
      ],
    },
    {
      title: 'Lithium recovery',
      icon: <BatteryCharging className="w-5 h-5" />,
      accent: 'bg-primary-50 text-primary-600',
      scores: [
        {
          name: 'Recoverable now',
          value: ins.lithium.lithiumKg.toFixed(2),
          unit: 'kg lithium',
          info: 'Lithium in retiring battery devices (laptops, tablets, phones, UPS systems), from typical content per device type.',
          logic: 'lithium',
        },
        {
          name: 'Lithium across fleet',
          value: ins.lithium.fleetLithiumKg.toFixed(2),
          unit: 'kg lithium',
          info: 'Lithium in all battery devices, including those still in use: your future recovery pipeline.',
          logic: 'lithium',
        },
        {
          name: 'Retiring battery devices',
          value: formatNumber(ins.lithium.lithiumAssets),
          unit: 'devices',
          info: 'Battery devices that are critical or past end of life.',
          logic: 'lithium',
        },
        {
          name: 'Mining CO₂e avoided',
          value: formatNumber(ins.lithium.miningCo2eAvoidedKg),
          unit: 'kg',
          tone: 'good',
          info: 'CO2e saved by recovering lithium from these devices instead of mining it.',
          logic: 'lithium',
        },
      ],
    },
    {
      title: 'Asset lifecycle',
      icon: <RefreshCcw className="w-5 h-5" />,
      accent: 'bg-neutral-100 text-neutral-600',
      scores: [
        {
          name: 'Replacement ratio',
          value: `${m.assetReplacementRatio}`,
          unit: '%',
          tone: band(m.assetReplacementRatio, 10, 20),
          info: 'Critical and past-end-of-life assets as a share of all assets.',
          logic: 'replacement-ratio',
        },
        {
          name: 'Business continuity risk',
          value: m.businessContinuityRisk,
          tone: m.businessContinuityRisk === 'Critical' || m.businessContinuityRisk === 'High' ? 'bad' : m.businessContinuityRisk === 'Medium' ? 'warn' : 'good',
          info: 'Low up to 10% of assets needing replacement, Medium above 10%, High above 20%, Critical above 30%.',
          logic: 'continuity',
        },
      ],
    },
    {
      title: 'Financial impact',
      icon: <Wallet className="w-5 h-5" />,
      accent: 'bg-neutral-100 text-neutral-600',
      scores: [
        {
          name: 'Annual savings potential',
          value: formatMoney(m.annualCostSavings),
          tone: 'good',
          info: 'Maintenance cost plus expected downtime cost that replacing assets would avoid.',
          logic: 'savings',
          missing: hasMaint ? undefined : 'Add the “Annual Maintenance Cost” column to see this.',
        },
        {
          name: 'Investment required',
          value: formatMoney(m.investmentRequired),
          info: 'Replacement Cost of critical and past-end-of-life assets.',
          logic: 'savings',
          missing: hasReplacement ? undefined : 'Add the “Replacement Cost” column to see this.',
        },
        {
          name: 'Payback period',
          value: m.paybackPeriodMonths > 0 ? `${m.paybackPeriodMonths}` : '—',
          unit: m.paybackPeriodMonths > 0 ? 'months' : undefined,
          info: 'Investment required ÷ annual savings potential × 12. Shown as — when either is zero.',
          logic: 'roi',
          missing: hasMaint && hasReplacement ? undefined : 'Needs both Maintenance Cost and Replacement Cost columns.',
        },
        {
          name: '3-year ROI',
          value: m.investmentRequired > 0 ? `${m.threeYearROI}` : '—',
          unit: m.investmentRequired > 0 ? '%' : undefined,
          tone: m.threeYearROI >= 0 ? 'good' : 'bad',
          info: '(3 × annual savings − investment) ÷ investment.',
          logic: 'roi',
          missing: hasMaint && hasReplacement ? undefined : 'Needs both Maintenance Cost and Replacement Cost columns.',
        },
      ],
    },
  ]

  return (
    <div className="w-full">
      <PageHeader title="Score Library" description="Every AssetPulse score in one place, matching the Dashboard, Compliance and Sustainability pages" homeHref="/welcome" />

      <div className="p-6 space-y-6">
        <FilterBar filters={filters} onChange={setFilters} options={options} shown={assets.length} total={importedAssets.length} />

        {assets.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center text-neutral-500">No assets match these filters.</div>
        ) : (
          groups.map(g => (
            <section key={g.title} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className={`flex items-center justify-center w-9 h-9 rounded-lg ${g.accent}`}>{g.icon}</span>
                <h2 className="font-semibold text-neutral-900">{g.title}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {g.scores.map(s => (
                  <ScoreTile key={s.name} s={s} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  )
}
