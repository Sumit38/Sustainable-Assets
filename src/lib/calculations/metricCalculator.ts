// Calculation Engine for Business Impact and Compliance Metrics

import {
  getApplicableStandards,
  COMPLIANCE_STANDARDS,
  ComplianceStandard,
  Region,
} from '@/lib/data/complianceMatrix'
import {
  getHealthImpactFactor,
  getCostFactor,
  getCarbonFactor,
  calculateMethaneCO2e,
} from '@/lib/data/impactFactors'

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
}

export interface CalculatedMetrics {
  // Business Impact
  annualCostSavings: number
  employeesAtHealthRisk: number
  carbonFootprintTonnes: number
  businessContinuityRisk: string

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
    finePerViolation: number
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
      globalComplianceViolationRate: 0,
      potentialFineExposure: 0,
      assetsViolatingStandards: 0,
      globalComplianceRiskScore: 0,
      violationsByRegion: {
        'Europe (GDPR/RoHS)': 0,
        'North America (EPA/OSHA)': 0,
        'Asia Pacific (Local Regs)': 0,
        'Other Regions': 0,
      },
      criticalStandardsViolated: [],
      immediateActions: [],
      year1Savings: 0,
      paybackPeriodMonths: 0,
      threeYearROI: 0,
      investmentRequired: 0,
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

  return {
    annualCostSavings: costMetrics.potentialAnnualSavings,
    employeesAtHealthRisk: healthMetrics.employeesAtRisk,
    carbonFootprintTonnes: carbonMetrics.totalCO2e / 1000,
    businessContinuityRisk: calculateContinuityRisk(processedAssets),
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
  }
}

function calculateHealthImpact(assets: ImportedAsset[]) {
  let totalEmployeesAtRisk = 0
  let totalHealthIssuesPredicted = 0

  for (const asset of assets) {
    if (asset.healthStatus !== 'healthy') {
      const factor = getHealthImpactFactor(asset.assetType)
      const riskMultiplier = {
        'at-risk': 1.5,
        'critical': 2.5,
        'end-of-life': 4.0,
        'healthy': 0,
      }[asset.healthStatus]

      totalEmployeesAtRisk += factor.affectedEmployeesPerAsset * riskMultiplier
      totalHealthIssuesPredicted += factor.healthIssuesPerYear * riskMultiplier
    }
  }

  return {
    employeesAtRisk: Math.round(totalEmployeesAtRisk),
    healthIssuesPredicted: Math.round(totalHealthIssuesPredicted),
  }
}

function calculateCostImpact(assets: ImportedAsset[]) {
  let totalMaintenanceCosts = 0
  let totalDowntimeCost = 0
  let totalReplacementNeeded = 0
  let investmentRequired = 0

  for (const asset of assets) {
    const costFactor = getCostFactor(asset.assetType)
    const failureRisk = {
      'healthy': 0.05,
      'at-risk': 0.3,
      'critical': 0.7,
      'end-of-life': 1.0,
    }[asset.healthStatus]

    totalMaintenanceCosts += costFactor.annualMaintenanceCost
    totalDowntimeCost +=
      costFactor.downtimeHoursPerFailure *
      costFactor.downtimeCostPerHour *
      failureRisk

    if (asset.healthStatus === 'critical' || asset.healthStatus === 'end-of-life') {
      investmentRequired += costFactor.averageReplacementCost
      totalReplacementNeeded += costFactor.averageReplacementCost
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
    const carbonFactor = getCarbonFactor(asset.assetType)

    // Operational emissions (annual)
    totalOperationalEmissions +=
      carbonFactor.scopeOneEmissions +
      carbonFactor.scopeTwoEmissions +
      carbonFactor.scopeThreeEmissions

    // End-of-life methane emissions (for assets that need replacement or are past EOL)
    const isPastEOL = isAssetPastEndOfLife(asset.lastDateOfSupport)
    if (
      asset.healthStatus === 'critical' ||
      asset.healthStatus === 'end-of-life' ||
      asset.daysUntilEndOfSupport < 0 ||
      isPastEOL
    ) {
      const methaneCO2e = calculateMethaneCO2e(carbonFactor.methaneGenerationFactor)
      totalEndOfLifeEmissions += methaneCO2e
    }
  }

  return {
    totalCO2e: totalOperationalEmissions + totalEndOfLifeEmissions,
    operationalCO2e: totalOperationalEmissions,
    endOfLifeMethane: totalEndOfLifeEmissions,
  }
}

function calculateComplianceMetrics(assets: ImportedAsset[]) {
  const violationsByRegion: Record<Region, number> = {
    'Europe (GDPR/RoHS)': 0,
    'North America (EPA/OSHA)': 0,
    'Asia Pacific (Local Regs)': 0,
    'Other Regions': 0,
  }

  const standardViolations: Record<ComplianceStandard, { count: number; criticalAssets: number }> = {}

  let totalAssetsViolating = 0
  let totalFineExposure = 0

  // Initialize standards
  for (const standard of Object.keys(COMPLIANCE_STANDARDS) as ComplianceStandard[]) {
    standardViolations[standard] = { count: 0, criticalAssets: 0 }
  }

  for (const asset of assets) {
    const applicableStandards = getApplicableStandards(asset.assetType, asset.region)

    // Asset violates if compliance score < 80
    if (asset.complianceScore < 80) {
      violationsByRegion[asset.region]++
      totalAssetsViolating++

      // Each non-compliant asset violates all applicable standards
      for (const standard of applicableStandards) {
        standardViolations[standard].count++
        if (asset.healthStatus === 'critical' || asset.healthStatus === 'end-of-life') {
          standardViolations[standard].criticalAssets++
        }
      }
    }
  }

  // Calculate fine exposure
  for (const standard of Object.keys(standardViolations) as ComplianceStandard[]) {
    const violation = standardViolations[standard]
    const standardInfo = COMPLIANCE_STANDARDS[standard]
    totalFineExposure += violation.count * standardInfo.finePerViolation
  }

  // Build critical standards list
  const criticalStandards = (Object.keys(standardViolations) as ComplianceStandard[])
    .filter(std => standardViolations[std].count > 0)
    .map(std => ({
      standard: std,
      assetsNonCompliant: standardViolations[std].count,
      finePerViolation: COMPLIANCE_STANDARDS[std].finePerViolation,
      risk: COMPLIANCE_STANDARDS[std].risk,
    }))
    .sort((a, b) => (b.risk === 'CRITICAL' ? 1 : -1))

  // Calculate overall risk score (0-10)
  const violationRate = assets.length > 0 ? totalAssetsViolating / assets.length : 0
  const riskScore = Math.min(10, violationRate * 10)

  return {
    violationRate: Math.round(violationRate * 100),
    totalFineExposure: Math.round(totalFineExposure),
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
    investmentRequired > 0
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
