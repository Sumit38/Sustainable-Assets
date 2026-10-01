/**
 * Smart Factor Calculator
 *
 * Gets impact factors from three sources (in order of priority):
 * 1. User-provided actual data (from extended template)
 * 2. User-answered Q&A responses (calculated from questions)
 * 3. Industry standard defaults (fallback)
 *
 * Also tracks confidence level: actual / calculated / estimated
 */

import { getHealthImpactFactor, getCostFactor, getCarbonFactor } from './impactFactors'

export type DataSource = 'actual' | 'calculated' | 'estimated'

export interface FactorWithSource {
  value: number
  source: DataSource
  detail?: string
}

export interface FactorCalculationResult {
  healthFactor: FactorWithSource
  costFactor: FactorWithSource
  carbonFactor: FactorWithSource
  overallConfidence: 'high' | 'medium' | 'low'
}

/**
 * Calculate health impact factor with fallback
 */
export function getHealthFactor(
  assetType: string,
  providedEmployeesAffected?: number,
  providedHealthIssuesPerYear?: number,
  questionnaireAnswers?: Record<string, number>
): FactorWithSource {
  // Priority 1: User-provided actual data
  if (
    providedEmployeesAffected !== undefined &&
    providedEmployeesAffected > 0 &&
    providedHealthIssuesPerYear !== undefined &&
    providedHealthIssuesPerYear >= 0
  ) {
    return {
      value: (providedEmployeesAffected * providedHealthIssuesPerYear) / 10,
      source: 'actual',
      detail: `${providedEmployeesAffected} employees × ${providedHealthIssuesPerYear} issues/year`,
    }
  }

  // Priority 2: User-answered questionnaire
  if (questionnaireAnswers) {
    const employees = questionnaireAnswers.employeesAffected
    const issues = questionnaireAnswers.healthIssuesPerYear

    if (employees !== undefined && issues !== undefined) {
      return {
        value: (employees * issues) / 10,
        source: 'calculated',
        detail: `From your answers: ${employees} employees × ${issues} issues/year`,
      }
    }
  }

  // Priority 3: Industry standard
  const defaultFactor = getHealthImpactFactor(assetType)
  return {
    value: defaultFactor.affectedEmployeesPerAsset,
    source: 'estimated',
    detail: `Industry standard for ${assetType}`,
  }
}

/**
 * Calculate cost impact factor with fallback
 */
export function getCostImpactFactor(
  assetType: string,
  providedMaintenanceCost?: number,
  providedDowntimeHours?: number,
  providedDowntimeCostPerHour?: number,
  providedReplacementCost?: number,
  questionnaireAnswers?: Record<string, number>
): FactorWithSource {
  // Priority 1: User-provided actual data
  if (
    providedMaintenanceCost !== undefined &&
    providedMaintenanceCost > 0
  ) {
    return {
      value: providedMaintenanceCost,
      source: 'actual',
      detail: `Provided annual maintenance cost: $${providedMaintenanceCost}`,
    }
  }

  // Priority 2: User-answered questionnaire
  if (questionnaireAnswers?.annualMaintenanceCost !== undefined) {
    return {
      value: questionnaireAnswers.annualMaintenanceCost,
      source: 'calculated',
      detail: `From your answer: $${questionnaireAnswers.annualMaintenanceCost}/year`,
    }
  }

  // Priority 3: Industry standard
  const defaultFactor = getCostFactor(assetType)
  return {
    value: defaultFactor.annualMaintenanceCost,
    source: 'estimated',
    detail: `Industry standard for ${assetType}`,
  }
}

/**
 * Calculate carbon impact factor with fallback
 */
export function getCarbonImpactFactor(
  assetType: string,
  providedAnnualCO2e?: number,
  providedPowerWatts?: number,
  questionnaireAnswers?: Record<string, number>
): FactorWithSource {
  // Priority 1: User-provided actual data (direct CO2e)
  if (providedAnnualCO2e !== undefined && providedAnnualCO2e > 0) {
    return {
      value: providedAnnualCO2e,
      source: 'actual',
      detail: `Provided annual CO2e: ${providedAnnualCO2e.toFixed(3)} tonnes`,
    }
  }

  // Priority 2: User-provided power data (calculate CO2e)
  if (providedPowerWatts !== undefined && providedPowerWatts > 0) {
    // Simplified calculation: Watts × 24 hours × 365 days × 0.0005 kg CO2e per Wh
    const annualCO2e = (providedPowerWatts * 24 * 365 * 0.0005) / 1000
    return {
      value: annualCO2e,
      source: 'calculated',
      detail: `Calculated from ${providedPowerWatts}W: ${annualCO2e.toFixed(3)} tonnes/year`,
    }
  }

  // Priority 3: User-answered questionnaire
  if (questionnaireAnswers?.annualCO2e !== undefined) {
    return {
      value: questionnaireAnswers.annualCO2e,
      source: 'calculated',
      detail: `From your answer: ${questionnaireAnswers.annualCO2e.toFixed(3)} tonnes/year`,
    }
  }

  // Priority 4: Industry standard
  const defaultFactor = getCarbonFactor(assetType)
  return {
    value: defaultFactor.scopeOneEmissions + defaultFactor.scopeTwoEmissions + defaultFactor.scopeThreeEmissions,
    source: 'estimated',
    detail: `Industry standard for ${assetType}`,
  }
}

/**
 * Get complete factor calculation with confidence assessment
 */
export function calculateFactorsWithConfidence(
  assetType: string,
  userProvidedData: {
    employeesAffected?: number
    healthIssuesPerYear?: number
    annualMaintenanceCost?: number
    downtimeHours?: number
    downtimeCostPerHour?: number
    replacementCost?: number
    annualCO2e?: number
    powerWatts?: number
  },
  questionnaireAnswers?: Record<string, number>
): FactorCalculationResult {
  const healthFactor = getHealthFactor(
    assetType,
    userProvidedData.employeesAffected,
    userProvidedData.healthIssuesPerYear,
    questionnaireAnswers
  )

  const costFactor = getCostImpactFactor(
    assetType,
    userProvidedData.annualMaintenanceCost,
    userProvidedData.downtimeHours,
    userProvidedData.downtimeCostPerHour,
    userProvidedData.replacementCost,
    questionnaireAnswers
  )

  const carbonFactor = getCarbonImpactFactor(
    assetType,
    userProvidedData.annualCO2e,
    userProvidedData.powerWatts,
    questionnaireAnswers
  )

  // Calculate overall confidence
  const sourceCounts = {
    actual: [healthFactor, costFactor, carbonFactor].filter(f => f.source === 'actual').length,
    calculated: [healthFactor, costFactor, carbonFactor].filter(f => f.source === 'calculated').length,
    estimated: [healthFactor, costFactor, carbonFactor].filter(f => f.source === 'estimated').length,
  }

  let overallConfidence: 'high' | 'medium' | 'low'
  if (sourceCounts.actual >= 2 || sourceCounts.calculated >= 2) {
    overallConfidence = 'high'
  } else if (sourceCounts.actual >= 1 || sourceCounts.calculated >= 1) {
    overallConfidence = 'medium'
  } else {
    overallConfidence = 'low'
  }

  return {
    healthFactor,
    costFactor,
    carbonFactor,
    overallConfidence,
  }
}

/**
 * Get human-friendly confidence labels for dashboard display
 */
export function getConfidenceLabel(source: DataSource): string {
  switch (source) {
    case 'actual':
      return '✅ Actual Data'
    case 'calculated':
      return '⚙️ From Your Answers'
    case 'estimated':
      return '📊 Industry Standard'
    default:
      return 'Unknown'
  }
}

/**
 * Get confidence badge color for UI
 */
export function getConfidenceColor(source: DataSource): string {
  switch (source) {
    case 'actual':
      return 'success' // Green
    case 'calculated':
      return 'primary' // Blue
    case 'estimated':
      return 'warning' // Yellow
    default:
      return 'neutral'
  }
}
