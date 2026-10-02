'use client'

import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ShieldAlert, HeartPulse, Leaf, BatteryCharging, RefreshCcw, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { InfoTip } from '@/components/common/InfoTip'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { NoData } from '@/components/common/ui'
import { useDashboard } from '@/lib/context/dashboardContext'
import { calculateMetrics } from '@/lib/calculations/metricCalculator'
import { summariseEmissions } from '@/lib/calculations/emissionsModel'
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
}

interface Group {
  title: string
  icon: ReactNode
  accent: string
  scores: Score[]
}

const fmtT = (v: number) => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2))
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
  const hasCo2 = has(a => a.annualCO2e)
  const hasMaint = has(a => a.annualMaintenanceCost)
  const hasReplacement = has(a => a.replacementCost)

  const groups: Group[] = [
    {
      title: 'Compliance risk',
      icon: <ShieldAlert className="w-5 h-5" />,
      accent: 'bg-danger-50 text-danger-600',
      scores: [
        {
          name: 'Non-compliant assets',
          value: formatNumber(m.assetsViolatingStandards),
          unit: 'assets',
          tone: m.assetsViolatingStandards > 0 ? 'bad' : 'good',
          info: `Assets with a Compliance Score below ${COMPLIANCE_THRESHOLD}. Same figure as the dashboard's Compliance risk card.`,
          logic: 'compliance',
        },
        {
          name: 'Violation rate',
          value: `${m.globalComplianceViolationRate}`,
          unit: '%',
          tone: band(m.globalComplianceViolationRate, 10, 25),
          info: 'Non-compliant assets as a share of all assets in this selection.',
          logic: 'compliance',
        },
        {
          name: 'Potential fines',
          value: formatMoney(m.potentialFineExposure),
          tone: m.potentialFineExposure > 0 ? 'bad' : 'good',
          info: 'Each non-compliant asset × the published fine per violation of every regulation that applies to its type and region.',
          logic: 'fines',
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
        {
          name: 'Over-used assets: emissions',
          value: fmtT(em.overUsedNow.total),
          unit: 't CO₂e / yr',
          info: "Scope 1 + 2 + 3 per year for assets that are critical or past end of life. Same figure as the dashboard's Sustainability card.",
          logic: 'emissions',
        },
        {
          name: 'After replacement',
          value: em.replaceable.length ? fmtT(em.replaceableAfter.total) : '—',
          unit: em.replaceable.length ? 't CO₂e / yr' : undefined,
          tone: em.replaceableAfter.total < em.replaceableNow.total ? 'good' : 'neutral',
          info: 'Predicted Scope 1 + 2 + 3 per year if the over-used assets are replaced with current-generation models.',
          logic: 'emissions',
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
          name: 'Global Pollution Index',
          value: `${m.globalPollutionIndex}`,
          unit: '/ 100',
          tone: band(m.globalPollutionIndex, 40, 70),
          info: 'Combines emission and energy ratios with the share of assets due for replacement. Higher is worse. Uses an estimated Scope 2/3 split.',
          logic: 'gpi',
          missing: hasCo2 ? undefined : 'Add the “Annual CO2e” column to see this.',
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
          info: 'Lithium in retiring battery devices (laptops, tablets, phones, UPS, EVs), from typical content per device type.',
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
      <PageHeader title="Score Library" description="Every AssetPulse score in one place, with how each one is calculated" homeHref="/welcome" />

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
