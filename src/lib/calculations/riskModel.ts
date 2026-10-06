import { ImportedAsset } from '@/lib/calculations/metricCalculator'
import { COMPLIANCE_THRESHOLD, isPastEndOfLife } from '@/lib/calculations/dashboardInsights'
import {
  ComplianceStandard,
  LawEntry,
  countsTowardFine,
  getApplicableStandards,
  holdsPersonalData,
  lawFor,
  maxFineUSD,
} from '@/lib/data/complianceMatrix'
import { EMISSION_PROFILES } from '@/lib/data/emissionReference'

/**
 * Predictive compliance risk: a transparent weighted model over objective asset signals.
 * The self-reported compliance score is included only as a low-weight, clearly labelled signal.
 */
export const RISK_WEIGHTS = {
  pastSupport: 35,
  supportWithin6Months: 20,
  supportWithin12Months: 10,
  beyondLifetime: 15,
  nearLifetime: 8,
  holdsPersonalData: 15,
  critical: 15,
  atRisk: 8,
  selfReportedBelowTarget: 10,
}

export const DEFAULT_LIFETIME_YEARS = 5
export type RiskBand = 'Low' | 'Medium' | 'High'
export type SignalSource = 'file' | 'reference' | 'self-reported'

export interface RiskReason {
  key: keyof typeof RISK_WEIGHTS
  label: string
  points: number
  source: SignalSource
}

export interface AssetRisk {
  score: number
  likelihood: number
  band: RiskBand
  reasons: RiskReason[]
}

export const bandFor = (score: number): RiskBand => (score >= 67 ? 'High' : score >= 34 ? 'Medium' : 'Low')

function monthsToSupportEnd(asset: ImportedAsset): number | null {
  const end = new Date(asset.lastDateOfSupport)
  return isNaN(end.getTime()) ? null : (end.getTime() - Date.now()) / (86400000 * 30.44)
}

function ageYears(asset: ImportedAsset): number | null {
  const made = new Date(asset.dateOfManufacture)
  return isNaN(made.getTime()) ? null : (Date.now() - made.getTime()) / (365.25 * 86400000)
}

export function assetRisk(asset: ImportedAsset): AssetRisk {
  const reasons: RiskReason[] = []
  const add = (key: keyof typeof RISK_WEIGHTS, label: string, source: SignalSource) =>
    reasons.push({ key, label, points: RISK_WEIGHTS[key], source })

  const months = monthsToSupportEnd(asset)
  if (isPastEndOfLife(asset)) add('pastSupport', 'Past end of vendor support (no security patches)', 'file')
  else if (months !== null && months < 6) add('supportWithin6Months', 'Support ends within 6 months', 'file')
  else if (months !== null && months < 12) add('supportWithin12Months', 'Support ends within 12 months', 'file')

  if (asset.assetType !== 'Software') {
    const age = ageYears(asset)
    const lifetime = EMISSION_PROFILES[asset.assetType]?.lifetimeYears ?? DEFAULT_LIFETIME_YEARS
    if (age !== null && age >= lifetime) add('beyondLifetime', `Older than its typical ${lifetime}-year lifetime`, 'reference')
    else if (age !== null && age >= lifetime * 0.75) add('nearLifetime', `Near the end of its typical ${lifetime}-year lifetime`, 'reference')
  }

  if (holdsPersonalData(asset.assetType)) add('holdsPersonalData', 'Holds data: in scope of data-protection law', 'reference')

  if (asset.healthStatus === 'critical') add('critical', 'Health status: critical', 'file')
  else if (asset.healthStatus === 'at-risk') add('atRisk', 'Health status: at risk', 'file')

  if (asset.complianceScore < COMPLIANCE_THRESHOLD) add('selfReportedBelowTarget', `Self-reported compliance score below ${COMPLIANCE_THRESHOLD}`, 'self-reported')

  const score = Math.min(100, reasons.reduce((s, r) => s + r.points, 0))
  reasons.sort((a, b) => b.points - a.points)
  return { score, likelihood: score / 100, band: bandFor(score), reasons }
}

export type CountryFactors = Record<string, number>

export interface ExposureLine {
  standard: ComplianceStandard
  country: string
  law: LawEntry
  assets: number
  avgLikelihood: number
  maxLikelihood: number
  factor: number
  statutoryMax: number
  expectedLow: number
  expectedHigh: number
}

/**
 * Expected fine exposure per (law, country): statutory maximum × likelihood × country factor.
 * Range runs from the average to the highest predicted likelihood of the assets in scope.
 * Only laws with a fixed statutory maximum are included.
 */
export function predictedExposure(assets: ImportedAsset[], factors: CountryFactors) {
  const groups = new Map<string, { standard: ComplianceStandard; country: string; law: LawEntry; likelihoods: number[] }>()
  for (const a of assets) {
    const { likelihood } = assetRisk(a)
    for (const s of getApplicableStandards(a.assetType, a.country)) {
      const law = lawFor(s, a.country)
      if (!countsTowardFine(law)) continue
      const key = `${s}|${a.country}`
      const g = groups.get(key) ?? { standard: s, country: a.country, law: law!, likelihoods: [] }
      g.likelihoods.push(likelihood)
      groups.set(key, g)
    }
  }

  const lines: ExposureLine[] = Array.from(groups.values()).map(g => {
    const avg = g.likelihoods.reduce((x, y) => x + y, 0) / g.likelihoods.length
    const max = Math.max(...g.likelihoods)
    const factor = factors[g.country] ?? 1
    const statutoryMax = maxFineUSD(g.law)
    return {
      standard: g.standard,
      country: g.country,
      law: g.law,
      assets: g.likelihoods.length,
      avgLikelihood: avg,
      maxLikelihood: max,
      factor,
      statutoryMax,
      expectedLow: Math.min(1, avg * factor) * statutoryMax,
      expectedHigh: Math.min(1, max * factor) * statutoryMax,
    }
  })
  lines.sort((a, b) => b.expectedHigh - a.expectedHigh)

  return {
    lines,
    expectedLow: lines.reduce((s, l) => s + l.expectedLow, 0),
    expectedHigh: lines.reduce((s, l) => s + l.expectedHigh, 0),
    statutoryMax: lines.reduce((s, l) => s + l.statutoryMax, 0),
  }
}

export function riskSummary(assets: ImportedAsset[]) {
  const risks = assets.map(a => ({ asset: a, risk: assetRisk(a) }))
  const bands: Record<RiskBand, number> = { Low: 0, Medium: 0, High: 0 }
  const drivers = new Map<string, { label: string; key: string; count: number; source: SignalSource }>()
  for (const { risk } of risks) {
    bands[risk.band]++
    for (const r of risk.reasons) {
      const d = drivers.get(r.key) ?? { label: r.label.replace(/\d+-year/, 'N-year'), key: r.key, count: 0, source: r.source }
      d.count++
      drivers.set(r.key, d)
    }
  }
  return {
    risks: risks.sort((a, b) => b.risk.score - a.risk.score),
    bands,
    average: risks.length ? risks.reduce((s, r) => s + r.risk.score, 0) / risks.length : 0,
    drivers: Array.from(drivers.values()).sort((a, b) => b.count - a.count),
  }
}
