// Calculation Engine for Business Impact and Compliance Metrics

import {
  getApplicableStandards,
  COMPLIANCE_STANDARDS,
  ComplianceStandard,
  REGIONS,
  Region,
  possibleFines,
} from '@/lib/data/complianceMatrix'
import {
  getHealthImpactFactor,
  getCostFactor,
  getCarbonFactor,
  calculateMethaneCO2e,
} from '@/lib/data/impactFactors'

const COMPLIANCE_TARGET = 80

export interface ImportedAsset {
  assetId: string
  assetType: string
  productName: string
  manufacturer: string
  dateOfManufacture: string
  lastDateOfSupport: string
  healthStatus: 'healthy' | 'at-risk' | 'critical' | 'end-of-life'
  complianceScore: number
  daysUntilEndOfSupport: number
  country: string
  region: Region
  department: string
  location: string
  cost: number
  purchaseDate: string

  // Optional extended template fields for impact factors
  employeesAffected?: number
  healthIssuesPerYear?: number
  annualMaintenanceCost?: number
  downtimeHoursPerFailure?: number
  downtimeCostPerHour?: number
  replacementCost?: number
  annualCO2e?: number
  powerWatts?: number
  usageHoursPerYear?: number
  replacementProduct?: string
  scope1Tco2e?: number
  scope2Tco2e?: number
  scope3Tco2e?: number
}

export interface CalculatedMetrics {
  // Business Impact
  annualCostSavings: number
  employeesAtHealthRisk: number
  carbonFootprintTonnes: number
  businessContinuityRisk: string
  globalPollutionIndex: number // Based on scopes & energy efficiency

  // Compliance
  globalComplianceViolationRate: number
  potentialFineExposure: number
  assetsViolatingStandards: number
  globalComplianceRiskScore: number

  // By Region
  violationsByRegion: Record<Region, number>
  criticalStandardsViolated: Array<{
    standard: ComplianceStandard
    assetsNonCompliant: number
    possibleFine: number
    risk: string
  }>

  // Actions
  immediateActions: Array<{
    action: string
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM'
    count: number
    estimatedCost: number
  }>

  // ROI
  year1Savings: number
  paybackPeriodMonths: number
  threeYearROI: number
  investmentRequired: number

  // Score Library - Supplementary Metrics
  scope2EmissionIndex: number
  scope3EmissionIndex: number
  energyEfficiencyIndex: number
  assetReplacementRatio: number
  averageAssetHealth: number
  healthRiskPercentage: number
  complianceRiskByRegion: Record<string, number>
}

/**
 * Check if an asset's support has ended
 * This is critical for:
 * - Marking assets as end-of-life even if user hasn't updated status
 * - Calculating methane emissions from decomposition
 * - Determining replacement urgency
 * - Compliance risk (unsupported assets cannot be patched)
 */
function isAssetPastEndOfLife(lastDateOfSupport: string): boolean {
  const eolDate = new Date(lastDateOfSupport)
  const today = new Date()
  return today > eolDate
}

export function calculateMetrics(assets: ImportedAsset[]): CalculatedMetrics {
  // Update health status based on Last Date of Support if needed
  const processedAssets = assets.map(asset => {
    // If asset's Last Date of Support has passed and status isn't already end-of-life, mark as end-of-life
    if (isAssetPastEndOfLife(asset.lastDateOfSupport) && asset.healthStatus !== 'end-of-life') {
      return {
        ...asset,
        healthStatus: 'end-of-life' as const,
        daysUntilEndOfSupport: Math.floor(
          (new Date(asset.lastDateOfSupport).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
      }
    }
    return asset
  })

  if (processedAssets.length === 0) {
    return {
      annualCostSavings: 0,
      employeesAtHealthRisk: 0,
      carbonFootprintTonnes: 0,
      businessContinuityRisk: 'Low',
      globalPollutionIndex: 0,
      globalComplianceViolationRate: 0,
      potentialFineExposure: 0,
      assetsViolatingStandards: 0,
      globalComplianceRiskScore: 0,
      violationsByRegion: Object.fromEntries(REGIONS.map(r => [r, 0])) as Record<Region, number>,
      criticalStandardsViolated: [],
      immediateActions: [],
      year1Savings: 0,
      paybackPeriodMonths: 0,
      threeYearROI: 0,
      investmentRequired: 0,
      scope2EmissionIndex: 0,
      scope3EmissionIndex: 0,
      energyEfficiencyIndex: 0,
      assetReplacementRatio: 0,
      averageAssetHealth: 0,
      healthRiskPercentage: 0,
      complianceRiskByRegion: {},
    }
  }

  // Calculate business impact metrics using processed assets
  const healthMetrics = calculateHealthImpact(processedAssets)
  const costMetrics = calculateCostImpact(processedAssets)
  const carbonMetrics = calculateCarbonImpact(processedAssets)

  // Calculate compliance metrics
  const complianceMetrics = calculateComplianceMetrics(processedAssets)

  // Calculate immediate actions
  const immediateActions = calculateImmediateActions(processedAssets, costMetrics)

  // Calculate ROI
  const roi = calculateROI(processedAssets, costMetrics)

  // Calculate supplementary metrics for Score Library
  const supplementaryMetrics = calculateSupplementaryMetrics(
    processedAssets,
    healthMetrics,
    carbonMetrics,
    complianceMetrics
  )

  // Calculate Global Pollution Index using user-defined formula
  const globalPollutionIndex = calculateGlobalPollutionIndexNew(
    processedAssets,
    supplementaryMetrics
  )

  return {
    annualCostSavings: costMetrics.potentialAnnualSavings,
    employeesAtHealthRisk: healthMetrics.employeesAtRisk,
    carbonFootprintTonnes: carbonMetrics.totalCO2e / 1000,
    businessContinuityRisk: calculateContinuityRisk(processedAssets),
    globalPollutionIndex,
    globalComplianceViolationRate: complianceMetrics.violationRate,
    potentialFineExposure: complianceMetrics.totalFineExposure,
    assetsViolatingStandards: complianceMetrics.totalAssetsViolating,
    globalComplianceRiskScore: complianceMetrics.overallRiskScore,
    violationsByRegion: complianceMetrics.violationsByRegion,
    criticalStandardsViolated: complianceMetrics.criticalStandards,
    immediateActions,
    year1Savings: costMetrics.potentialAnnualSavings,
    paybackPeriodMonths: roi.paybackMonths,
    threeYearROI: roi.threeYearROI,
    investmentRequired: costMetrics.investmentRequired,
    scope2EmissionIndex: supplementaryMetrics.scope2Index,
    scope3EmissionIndex: supplementaryMetrics.scope3Index,
    energyEfficiencyIndex: supplementaryMetrics.energyIndex,
    assetReplacementRatio: supplementaryMetrics.replacementRatio,
    averageAssetHealth: supplementaryMetrics.avgHealth,
    healthRiskPercentage: supplementaryMetrics.healthRiskPct,
    complianceRiskByRegion: supplementaryMetrics.complianceByRegion,
  }
}

function calculateHealthImpact(assets: ImportedAsset[]) {
  let totalEmployeesAtRisk = 0
  let totalHealthIssuesPredicted = 0

  let totalEmployees = 0

  // Uses the file's own numbers only; assets without the column are skipped, not estimated
  for (const asset of assets) {
    if (typeof asset.employeesAffected === 'number') totalEmployees += asset.employeesAffected
    if (asset.healthStatus === 'healthy') continue
    if (typeof asset.employeesAffected === 'number') totalEmployeesAtRisk += asset.employeesAffected
    if (typeof asset.healthIssuesPerYear === 'number') totalHealthIssuesPredicted += asset.healthIssuesPerYear
  }

  return {
    employeesAtRisk: Math.round(totalEmployeesAtRisk),
    healthIssuesPredicted: Math.round(totalHealthIssuesPredicted),
    totalEmployees,
  }
}

function calculateCostImpact(assets: ImportedAsset[]) {
  let totalMaintenanceCosts = 0
  let totalDowntimeCost = 0
  let totalReplacementNeeded = 0
  let investmentRequired = 0

  for (const asset of assets) {
    // Only use provided data - no fallback
    if (asset.annualMaintenanceCost === undefined) {
      continue
    }

    const failureRisk = {
      'healthy': 0.05,
      'at-risk': 0.3,
      'critical': 0.7,
      'end-of-life': 1.0,
    }[asset.healthStatus]

    totalMaintenanceCosts += asset.annualMaintenanceCost
    
    if (asset.downtimeHoursPerFailure !== undefined && asset.downtimeCostPerHour !== undefined) {
      totalDowntimeCost += asset.downtimeHoursPerFailure * asset.downtimeCostPerHour * failureRisk
    }

    if ((asset.healthStatus === 'critical' || asset.healthStatus === 'end-of-life') && asset.replacementCost !== undefined) {
      investmentRequired += asset.replacementCost
      totalReplacementNeeded += asset.replacementCost
    }
  }

  const potentialSavings = totalMaintenanceCosts + totalDowntimeCost
  return {
    potentialAnnualSavings: Math.round(potentialSavings),
    investmentRequired: Math.round(investmentRequired),
    totalMaintenanceCosts: Math.round(totalMaintenanceCosts),
    totalDowntimeCost: Math.round(totalDowntimeCost),
  }
}

function calculateCarbonImpact(assets: ImportedAsset[]) {
  let totalOperationalEmissions = 0
  let totalEndOfLifeEmissions = 0

  for (const asset of assets) {
    // Only use provided data - no fallback
    if (asset.annualCO2e === undefined) {
      continue
    }

    totalOperationalEmissions += asset.annualCO2e * 1000

    const isPastEOL = isAssetPastEndOfLife(asset.lastDateOfSupport)
    if (
      asset.healthStatus === 'critical' ||
      asset.healthStatus === 'end-of-life' ||
      asset.daysUntilEndOfSupport < 0 ||
      isPastEOL
    ) {
      const carbonFactor = getCarbonFactor(asset.assetType)
      const methaneCO2e = calculateMethaneCO2e(carbonFactor.methaneGenerationFactor)
      totalEndOfLifeEmissions += methaneCO2e
    }
  }

  const scope2Estimate = totalOperationalEmissions * 0.3
  const scope3Estimate = totalOperationalEmissions * 0.4

  return {
    totalCO2e: totalOperationalEmissions + totalEndOfLifeEmissions,
    operationalCO2e: totalOperationalEmissions,
    endOfLifeMethane: totalEndOfLifeEmissions,
    scope2: scope2Estimate,
    scope3: scope3Estimate,
  }
}

function calculateComplianceMetrics(assets: ImportedAsset[]) {
  const violationsByRegion = Object.fromEntries(REGIONS.map(r => [r, 0])) as Record<Region, number>
  const counts = new Map<ComplianceStandard, number>()
  let totalAssetsViolating = 0

  for (const asset of assets) {
    if (asset.complianceScore >= COMPLIANCE_TARGET) continue
    totalAssetsViolating++
    if (asset.region in violationsByRegion) violationsByRegion[asset.region]++
    for (const standard of getApplicableStandards(asset.assetType, asset.country)) {
      counts.set(standard, (counts.get(standard) ?? 0) + 1)
    }
  }

  const fines = possibleFines(assets, COMPLIANCE_TARGET)
  const fineByStandard = new Map<ComplianceStandard, number>()
  for (const l of fines.lines) fineByStandard.set(l.standard, (fineByStandard.get(l.standard) ?? 0) + l.possibleFineUSD)

  const criticalStandards = Array.from(counts.entries())
    .map(([std, n]) => ({
      standard: std,
      assetsNonCompliant: n,
      possibleFine: Math.round(fineByStandard.get(std) ?? 0),
      risk: COMPLIANCE_STANDARDS[std].risk,
    }))
    .sort((a, b) => b.possibleFine - a.possibleFine)

  const violationRate = assets.length > 0 ? totalAssetsViolating / assets.length : 0
  const riskScore = Math.min(10, violationRate * 10)

  return {
    violationRate: Math.round(violationRate * 100),
    totalFineExposure: Math.round(fines.total),
    totalAssetsViolating,
    violationsByRegion,
    criticalStandards,
    overallRiskScore: parseFloat(riskScore.toFixed(1)),
  }
}

function calculateImmediateActions(assets: ImportedAsset[], costMetrics: any) {
  const actions = []
  const criticalAssets = assets.filter(a => a.healthStatus === 'critical').length
  const endOfLifeAssets = assets.filter(a => a.healthStatus === 'end-of-life').length
  const atRiskAssets = assets.filter(a => a.healthStatus === 'at-risk').length

  if (criticalAssets > 0) {
    actions.push({
      action: 'Replace Critical Assets',
      priority: 'CRITICAL' as const,
      count: criticalAssets,
      estimatedCost: costMetrics.investmentRequired * 0.7,
    })
  }

  if (endOfLifeAssets > 0) {
    actions.push({
      action: 'Decommission End-of-Life Assets',
      priority: 'CRITICAL' as const,
      count: endOfLifeAssets,
      estimatedCost: endOfLifeAssets * 500, // decommissioning cost
    })
  }

  if (atRiskAssets > 0) {
    actions.push({
      action: 'Schedule Preventive Maintenance',
      priority: 'HIGH' as const,
      count: atRiskAssets,
      estimatedCost: atRiskAssets * 150,
    })
  }

  const healthRiskAssets = assets.filter(a => a.healthStatus !== 'healthy').length
  if (healthRiskAssets > 0) {
    actions.push({
      action: 'Health Risk Assessments',
      priority: 'HIGH' as const,
      count: healthRiskAssets,
      estimatedCost: healthRiskAssets * 250,
    })
  }

  return actions
}

function calculateROI(assets: ImportedAsset[], costMetrics: any) {
  const year1Savings = costMetrics.potentialAnnualSavings
  const investmentRequired = costMetrics.investmentRequired
  const paybackMonths =
    investmentRequired > 0 && year1Savings > 0
      ? Math.round((investmentRequired / year1Savings) * 12)
      : 0

  const threeYearSavings = year1Savings * 3
  const threeYearROI =
    investmentRequired > 0
      ? Math.round(((threeYearSavings - investmentRequired) / investmentRequired) * 100)
      : 0

  return {
    paybackMonths,
    threeYearROI,
  }
}

function calculateContinuityRisk(assets: ImportedAsset[]): string {
  const criticalAssets = assets.filter(a => a.healthStatus === 'critical' || a.healthStatus === 'end-of-life')
  const riskPercentage = (criticalAssets.length / assets.length) * 100

  if (riskPercentage > 30) return 'Critical'
  if (riskPercentage > 20) return 'High'
  if (riskPercentage > 10) return 'Medium'
  return 'Low'
}

/**
 * Calculate supplementary metrics for Score Library
 */
function calculateSupplementaryMetrics(
  assets: ImportedAsset[],
  healthMetrics: any,
  carbonMetrics: any,
  complianceMetrics: any
): any {
  if (assets.length === 0) {
    return {
      scope2Index: 0,
      scope3Index: 0,
      energyIndex: 0,
      replacementRatio: 0,
      avgHealth: 0,
      healthRiskPct: 0,
      complianceByRegion: {},
    }
  }

  const replaceableAssets = assets.filter(
    a => a.healthStatus === 'critical' || a.healthStatus === 'end-of-life'
  ).length
  const replacementRatio = (replaceableAssets / assets.length) * 100

  // Calculate average health score
  const healthScores = {
    healthy: 100,
    'at-risk': 50,
    critical: 25,
    'end-of-life': 0,
  }
  const avgHealth =
    assets.reduce((sum, a) => sum + healthScores[a.healthStatus], 0) / assets.length

  const healthRiskPct = healthMetrics.totalEmployees > 0 ? (healthMetrics.employeesAtRisk / healthMetrics.totalEmployees) * 100 : 0

  // Calculate indices as ratios of actual to replaceable (0-100 scale)
  // Replaceable baseline: typical replacement values for office assets
  const replaceableScope2 = Math.max(1, replaceableAssets * 0.5) // ~0.5 tonnes CO2e per replaceable asset
  const replaceableScope3 = Math.max(1, replaceableAssets * 0.8) // ~0.8 tonnes CO2e per replaceable asset (EOL)
  const replaceableEnergy = Math.max(1, assets.length * 0.3) // ~0.3 tonnes CO2e per asset (annual energy)

  const actualScope2 = Math.max(0, carbonMetrics.scope2 || 0)
  const actualScope3 = Math.max(0, carbonMetrics.scope3 || 0)
  const actualEnergy = Math.max(0, carbonMetrics.operationalCO2e || 0)

  // Calculate ratios (actual / replaceable) normalized to 0-100 scale
  const scope2Index = Math.min(100, Math.max(0, (actualScope2 / replaceableScope2) * 100))
  const scope3Index = Math.min(100, Math.max(0, (actualScope3 / replaceableScope3) * 100))
  const energyIndex = Math.min(100, Math.max(0, (actualEnergy / replaceableEnergy) * 100))

  return {
    scope2Index: isNaN(scope2Index) ? 50 : scope2Index,
    scope3Index: isNaN(scope3Index) ? 50 : scope3Index,
    energyIndex: isNaN(energyIndex) ? 50 : energyIndex,
    replacementRatio: Math.round(replacementRatio),
    avgHealth: Math.round(avgHealth),
    healthRiskPct: Math.round(healthRiskPct),
    complianceByRegion: complianceMetrics.violationsByRegion || {},
  }
}

/**
 * Calculate Global Pollution Index using the specified formula:
 * GPI = Average of [(Actual Scope 2 / Replaceable Scope 2) +
 *                   (Actual Scope 3 / Replaceable Scope 3) +
 *                   (Actual Energy / Replaceable Energy)] ×
 *       (Number of Replaceable Assets / Total Assets)
 */
function calculateGlobalPollutionIndexNew(
  assets: ImportedAsset[],
  supplementaryMetrics: any
): number {
  if (assets.length === 0) {
    console.warn('GPI = 0: No assets imported')
    return 0
  }

  const replaceableAssets = assets.filter(
    a => a.healthStatus === 'critical' || a.healthStatus === 'end-of-life'
  ).length

  // Get the ratios (normalized to 0-1 scale)
  const scope2Ratio = Math.min(1, (supplementaryMetrics.scope2Index / 100) || 0.3)
  const scope3Ratio = Math.min(1, (supplementaryMetrics.scope3Index / 100) || 0.4)
  const energyRatio = Math.min(1, (supplementaryMetrics.energyIndex / 100) || 0.3)

  // Calculate average of ratios (0-1 scale)
  const averageRatio = (scope2Ratio + scope3Ratio + energyRatio) / 3

  // Asset replacement factor (0-1 scale)
  const assetReplacementFactor = Math.min(1, replaceableAssets / Math.max(1, assets.length))

  // Final Global Pollution Index (0-100 scale)
  const gpi = averageRatio * assetReplacementFactor * 100

  const result = Math.max(0, Math.min(100, Math.round(gpi)))

  // Log debug info if GPI is 0
  if (result === 0) {
    console.warn('GPI = 0 - Debug Info:', {
      totalAssets: assets.length,
      replaceableAssets,
      assetReplacementFactor: assetReplacementFactor.toFixed(2),
      scope2Index: supplementaryMetrics.scope2Index,
      scope3Index: supplementaryMetrics.scope3Index,
      energyIndex: supplementaryMetrics.energyIndex,
      averageRatio: averageRatio.toFixed(3),
      reason: assetReplacementFactor === 0 ? 'No critical or end-of-life assets' : 'Indices too low',
    })
  }

  return result
}
