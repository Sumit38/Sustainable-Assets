import { ImportedAsset } from '@/lib/calculations/metricCalculator'
import { needsAction } from '@/lib/calculations/dashboardInsights'
import {
  EMISSION_PROFILES,
  GRID_FACTORS,
  LEGACY_AGE_YEARS,
  WORLD_AVERAGE_GRID_FACTOR,
} from '@/lib/data/emissionReference'
import { CARBON_EMISSION_FACTORS, LANDFILL_CAPTURE_RATE, METHANE_GWP_MULTIPLIER } from '@/lib/data/impactFactors'

export type Source = 'file' | 'reference' | 'none'

export interface Footprint {
  kWh: number
  scope1: number
  scope2: number
  scope3: number
  total: number
}

export interface AssetEmissions {
  asset: ImportedAsset
  overUsed: boolean
  modelled: boolean
  gridFactor: number
  gridIsWorldAverage: boolean
  now: Footprint
  sources: { kWh: Source; scope1: Source; scope2: Source; scope3: Source }
  after?: Footprint & { replacementClass: string; suggestedName?: string }
}

const ZERO: Footprint = { kWh: 0, scope1: 0, scope2: 0, scope3: 0, total: 0 }

function ageYears(asset: ImportedAsset) {
  const made = new Date(asset.dateOfManufacture)
  return isNaN(made.getTime()) ? Infinity : (Date.now() - made.getTime()) / (365.25 * 86400000)
}

export function assetEmissions(asset: ImportedAsset): AssetEmissions {
  const profile = EMISSION_PROFILES[asset.assetType]
  const grid = GRID_FACTORS[asset.country]
  const gridFactor = grid ?? WORLD_AVERAGE_GRID_FACTOR
  const legacy = ageYears(asset) >= LEGACY_AGE_YEARS
  const hours = asset.usageHoursPerYear ?? profile?.hoursPerYear

  let kWh: number | undefined
  if (asset.powerWatts !== undefined && hours !== undefined) kWh = (asset.powerWatts * hours) / 1000
  else if (profile && hours !== undefined) kWh = ((legacy ? profile.legacyPowerW : profile.currentPowerW) * hours) / 1000

  const fileEnergy = asset.powerWatts !== undefined || asset.usageHoursPerYear !== undefined
  const sources = {
    kWh: (fileEnergy && kWh !== undefined ? 'file' : profile ? 'reference' : 'none') as Source,
    scope1: (asset.scope1Tco2e !== undefined ? 'file' : profile ? 'reference' : 'none') as Source,
    scope2: (asset.scope2Tco2e !== undefined ? 'file' : kWh !== undefined ? 'reference' : 'none') as Source,
    scope3: (asset.scope3Tco2e !== undefined ? 'file' : profile ? 'reference' : 'none') as Source,
  }

  const scope1 = asset.scope1Tco2e ?? (profile ? profile.scope1KgPerYear / 1000 : 0)
  const scope2 = asset.scope2Tco2e ?? (kWh !== undefined ? (kWh * gridFactor) / 1000 : 0)
  const scope3 = asset.scope3Tco2e ?? (profile ? profile.embodiedKg / profile.lifetimeYears / 1000 : 0)
  const now: Footprint = { kWh: kWh ?? 0, scope1, scope2, scope3, total: scope1 + scope2 + scope3 }

  const overUsed = needsAction(asset)
  let after: AssetEmissions['after']
  const sameModel = asset.replacementProduct?.trim().toLowerCase() === asset.productName?.trim().toLowerCase()
  if (overUsed && profile) {
    const r = profile.replacement
    const kWhA = (r.powerW * (hours ?? 0)) / 1000
    const s1 = r.scope1KgPerYear / 1000
    const s2 = (kWhA * gridFactor) / 1000
    const s3 = r.embodiedKg / r.lifetimeYears / 1000
    after = { kWh: kWhA, scope1: s1, scope2: s2, scope3: s3, total: s1 + s2 + s3, replacementClass: r.label, suggestedName: sameModel ? undefined : asset.replacementProduct }
  }

  return {
    asset,
    overUsed,
    modelled: !!profile || Object.values(sources).some(s => s === 'file'),
    gridFactor,
    gridIsWorldAverage: grid === undefined,
    now,
    sources,
    after,
  }
}

const add = (a: Footprint, b: Footprint): Footprint => ({
  kWh: a.kWh + b.kWh,
  scope1: a.scope1 + b.scope1,
  scope2: a.scope2 + b.scope2,
  scope3: a.scope3 + b.scope3,
  total: a.total + b.total,
})

export function summariseEmissions(assets: ImportedAsset[]) {
  const rows = assets.map(assetEmissions)
  const overUsed = rows.filter(r => r.overUsed)
  const replaceable = overUsed.filter(r => r.after)

  const fleet = rows.reduce((s, r) => add(s, r.now), ZERO)
  const overUsedNow = overUsed.reduce((s, r) => add(s, r.now), ZERO)
  const replaceableNow = replaceable.reduce((s, r) => add(s, r.now), ZERO)
  const replaceableAfter = replaceable.reduce((s, r) => add(s, r.after!), ZERO)

  const countries = new Map<string, Footprint & { assets: number }>()
  for (const r of rows) {
    const c = countries.get(r.asset.country) ?? { ...ZERO, assets: 0 }
    countries.set(r.asset.country, { ...add(c, r.now), assets: c.assets + 1 })
  }

  const fromFile = (k: keyof AssetEmissions['sources']) => rows.filter(r => r.sources[k] === 'file').length
  const unmodelledTypes = Array.from(new Set(rows.filter(r => !r.modelled).map(r => r.asset.assetType)))
  const worldAverageCountries = Array.from(new Set(rows.filter(r => r.gridIsWorldAverage).map(r => r.asset.country)))

  return {
    rows,
    overUsed,
    replaceable,
    fleet,
    overUsedNow,
    replaceableNow,
    replaceableAfter,
    countries: Array.from(countries.entries()).map(([country, v]) => ({
      country,
      ...v,
      intensity: v.kWh > 0 ? (v.total * 1000) / v.kWh : 0,
    })),
    coverage: {
      scope1FromFile: fromFile('scope1'),
      scope2FromFile: fromFile('scope2'),
      scope3FromFile: fromFile('scope3'),
      energyFromFile: fromFile('kWh'),
      total: rows.length,
      unmodelledTypes,
      worldAverageCountries,
    },
  }
}

export function methaneAtEndOfLife(assets: ImportedAsset[]) {
  const byType = new Map<string, { type: string; assets: number; ch4Kg: number; co2eKg: number }>()
  const noFactor = new Set<string>()
  for (const a of assets.filter(needsAction)) {
    const factor = CARBON_EMISSION_FACTORS[a.assetType]?.methaneGenerationFactor
    if (factor === undefined) {
      noFactor.add(a.assetType)
      continue
    }
    const escaped = factor * (1 - LANDFILL_CAPTURE_RATE)
    const row = byType.get(a.assetType) ?? { type: a.assetType, assets: 0, ch4Kg: 0, co2eKg: 0 }
    row.assets++
    row.ch4Kg += escaped
    row.co2eKg += escaped * METHANE_GWP_MULTIPLIER
    byType.set(a.assetType, row)
  }
  const list = Array.from(byType.values()).sort((a, b) => b.co2eKg - a.co2eKg)
  return {
    byType: list,
    ch4Kg: list.reduce((s, r) => s + r.ch4Kg, 0),
    co2eKg: list.reduce((s, r) => s + r.co2eKg, 0),
    assets: list.reduce((s, r) => s + r.assets, 0),
    noFactorTypes: Array.from(noFactor),
  }
}
