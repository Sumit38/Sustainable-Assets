import { ImportedAsset } from '@/lib/calculations/metricCalculator'
import {
  COMPLIANCE_STANDARDS,
  ComplianceStandard,
  Region,
  getApplicableStandards,
} from '@/lib/data/complianceMatrix'
import { getAssetProfile } from '@/lib/data/assetMaterialDatabase'

export const ALL = 'all'

export interface DashboardFilters {
  region: string
  standard: string
  assetType: string
  department: string
}

export const EMPTY_FILTERS: DashboardFilters = {
  region: ALL,
  standard: ALL,
  assetType: ALL,
  department: ALL,
}

export const COMPLIANCE_THRESHOLD = 80

type HealthBucket = 'healthy' | 'at-risk' | 'critical' | 'end-of-life'

function supportEndDate(asset: ImportedAsset): Date | null {
  const d = new Date(asset.lastDateOfSupport)
  return isNaN(d.getTime()) ? null : d
}

export function isPastEndOfLife(asset: ImportedAsset, today = new Date()): boolean {
  const end = supportEndDate(asset)
  return asset.healthStatus === 'end-of-life' || (end !== null && end < today)
}

export function needsAction(asset: ImportedAsset): boolean {
  return isPastEndOfLife(asset) || asset.healthStatus === 'critical'
}

function effectiveHealth(asset: ImportedAsset): HealthBucket {
  return isPastEndOfLife(asset) ? 'end-of-life' : asset.healthStatus
}

function standardsFor(asset: ImportedAsset): ComplianceStandard[] {
  return getApplicableStandards(asset.assetType, asset.region as Region)
}

export function filterAssets(assets: ImportedAsset[], f: DashboardFilters): ImportedAsset[] {
  return assets.filter(a =>
    (f.region === ALL || a.region === f.region) &&
    (f.assetType === ALL || a.assetType === f.assetType) &&
    (f.department === ALL || a.department === f.department) &&
    (f.standard === ALL || standardsFor(a).includes(f.standard as ComplianceStandard))
  )
}

export function filterOptions(assets: ImportedAsset[]) {
  const uniq = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort()
  return {
    regions: uniq(assets.map(a => a.region)),
    standards: uniq(assets.flatMap(standardsFor)),
    assetTypes: uniq(assets.map(a => a.assetType)),
    departments: uniq(assets.map(a => a.department)),
  }
}

function sumProvided(assets: ImportedAsset[], pick: (a: ImportedAsset) => number | undefined) {
  let total = 0
  let withData = 0
  for (const a of assets) {
    const v = pick(a)
    if (typeof v === 'number' && !isNaN(v)) {
      total += v
      withData++
    }
  }
  return { total, withData, of: assets.length }
}

export function computeInsights(assets: ImportedAsset[], selectedStandard: string) {
  const pastEol = assets.filter(a => isPastEndOfLife(a))
  const actionAssets = assets.filter(needsAction)
  const poorCondition = assets.filter(a => effectiveHealth(a) !== 'healthy')
  const nonCompliant = assets.filter(a => a.complianceScore < COMPLIANCE_THRESHOLD)

  // Compliance: each non-compliant asset counts once per regulation that applies to it
  const byStandard = new Map<ComplianceStandard, number>()
  const byRegion = new Map<string, { total: number; nonCompliant: number; pastEol: number }>()
  for (const a of assets) {
    const r = byRegion.get(a.region) ?? { total: 0, nonCompliant: 0, pastEol: 0 }
    r.total++
    if (a.complianceScore < COMPLIANCE_THRESHOLD) r.nonCompliant++
    if (isPastEndOfLife(a)) r.pastEol++
    byRegion.set(a.region, r)
  }
  for (const a of nonCompliant) {
    for (const s of standardsFor(a)) {
      if (selectedStandard !== ALL && s !== selectedStandard) continue
      byStandard.set(s, (byStandard.get(s) ?? 0) + 1)
    }
  }
  const standards = Array.from(byStandard.entries())
    .map(([standard, count]) => {
      const info = COMPLIANCE_STANDARDS[standard]
      return {
        standard,
        name: info.name,
        count,
        finePerViolation: info.finePerViolation,
        exposure: count * info.finePerViolation,
        risk: info.risk,
      }
    })
    .sort((a, b) => b.exposure - a.exposure || b.count - a.count)
  const fineExposure = standards.reduce((s, x) => s + x.exposure, 0)

  const employees = sumProvided(poorCondition, a => a.employeesAffected)
  const healthIssues = sumProvided(poorCondition, a => a.healthIssuesPerYear)
  const co2e = sumProvided(actionAssets, a => a.annualCO2e)

  let lithiumKg = 0
  let miningCo2eAvoidedKg = 0
  let lithiumAssets = 0
  for (const a of actionAssets) {
    const p = getAssetProfile(a.assetType)
    if (!p?.isDLESuitable) continue
    lithiumKg += (p.lithiumContent.min + p.lithiumContent.max) / 2
    miningCo2eAvoidedKg += p.co2eSavingsVsPrimaryMining
    lithiumAssets++
  }

  const health: Record<HealthBucket, number> = { healthy: 0, 'at-risk': 0, critical: 0, 'end-of-life': 0 }
  for (const a of assets) health[effectiveHealth(a)]++

  const today = new Date()
  const monthsLeft = (a: ImportedAsset) => {
    const end = supportEndDate(a)
    return end ? (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44) : null
  }
  const timeline = [
    { label: 'Already ended', test: (m: number) => m < 0 },
    { label: '< 6 months', test: (m: number) => m >= 0 && m < 6 },
    { label: '6–12 months', test: (m: number) => m >= 6 && m < 12 },
    { label: '1–2 years', test: (m: number) => m >= 12 && m < 24 },
    { label: '2+ years', test: (m: number) => m >= 24 },
  ].map(b => ({
    label: b.label,
    count: assets.filter(a => {
      const m = monthsLeft(a)
      return m !== null && b.test(m)
    }).length,
  }))

  const typeMap = new Map<string, { total: number; action: number }>()
  for (const a of assets) {
    const t = typeMap.get(a.assetType) ?? { total: 0, action: 0 }
    t.total++
    if (needsAction(a)) t.action++
    typeMap.set(a.assetType, t)
  }
  const byType = Array.from(typeMap.entries())
    .map(([type, v]) => ({ type, ...v }))
    .sort((a, b) => b.action - a.action || b.total - a.total)

  return {
    total: assets.length,
    actionCount: actionAssets.length,
    compliance: {
      pastEolCount: pastEol.length,
      nonCompliantCount: nonCompliant.length,
      fineExposure,
      standards,
      regions: Array.from(byRegion.entries())
        .map(([region, v]) => ({ region, ...v }))
        .sort((a, b) => b.nonCompliant - a.nonCompliant),
    },
    health: {
      poorConditionCount: poorCondition.length,
      employees,
      healthIssues,
    },
    sustainability: { co2eTonnes: co2e },
    lithium: { lithiumKg, miningCo2eAvoidedKg, lithiumAssets },
    charts: { health, timeline, byType },
  }
}

export type DashboardInsights = ReturnType<typeof computeInsights>

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

export function formatMoney(n: number) {
  return `$${compact.format(n)}`
}

export function formatNumber(n: number) {
  return compact.format(n)
}
