/**
 * Methane (CH₄) Emissions Calculations for Landfill Discard
 * Global Warming Potential: 28-36x CO₂ (using 28 for 100-year timeframe)
 */

// ============================================================================
// METHANE EMISSION FACTORS
// ============================================================================

export const METHANE_FACTORS = {
  // Material degradation rates in landfill (% that becomes CH₄)
  materialMethaneGeneration: {
    Foam: 0.35, // Foam degrades significantly, high methane
    Fabric: 0.28, // Natural fibers decompose
    Wood: 0.25, // Organic material
    Plastic: 0.05, // Minimal degradation
    Steel: 0.0, // No methane generation
    Paper: 0.32, // High organic content
    Leather: 0.30, // Organic material
  },

  // Global Warming Potential (CH₄ vs CO₂)
  gwpCH4: 28, // 1 kg CH₄ = 28 kg CO₂e (100-year timeframe)
  gwpCH4_20year: 84, // For shorter-term analysis

  // Landfill methane capture rates (% of produced methane captured/flared)
  landfillCaptureRate: 0.65, // Average: 65% captured/managed
  // Remaining ~35% escapes to atmosphere
}

// ============================================================================
// METHANE CALCULATIONS
// ============================================================================

export interface MethaneEmissionData {
  materialType: string
  weightKg: number
  methaneGenerationFactor: number
  grossMethaneProducedKg: number
  capturedMethaneKg: number
  escapedMethaneKg: number
  totalCH4eKg: number
  totalCO2eEquivalent: number // Escaped CH₄ converted to CO₂e
  timeframe: '20-year' | '100-year'
}

/**
 * Calculate methane emissions for a material sent to landfill
 */
export function calculateMaterialMethaneEmissions(
  materialType: keyof typeof METHANE_FACTORS.materialMethaneGeneration,
  weightKg: number,
  timeframe: '20-year' | '100-year' = '100-year'
): MethaneEmissionData {
  const generationFactor = METHANE_FACTORS.materialMethaneGeneration[materialType] || 0

  // Total methane produced from degradation
  const grossMethaneProducedKg = weightKg * generationFactor

  // Methane captured by landfill gas collection
  const capturedMethaneKg = grossMethaneProducedKg * METHANE_FACTORS.landfillCaptureRate

  // Methane escaping to atmosphere
  const escapedMethaneKg = grossMethaneProducedKg * (1 - METHANE_FACTORS.landfillCaptureRate)

  // Convert escaped methane to CO₂e
  const gwp = timeframe === '20-year' ? METHANE_FACTORS.gwpCH4_20year : METHANE_FACTORS.gwpCH4
  const totalCO2eEquivalent = escapedMethaneKg * gwp

  return {
    materialType,
    weightKg,
    methaneGenerationFactor: generationFactor,
    grossMethaneProducedKg: parseFloat(grossMethaneProducedKg.toFixed(4)),
    capturedMethaneKg: parseFloat(capturedMethaneKg.toFixed(4)),
    escapedMethaneKg: parseFloat(escapedMethaneKg.toFixed(4)),
    totalCH4eKg: parseFloat(escapedMethaneKg.toFixed(4)),
    totalCO2eEquivalent: parseFloat(totalCO2eEquivalent.toFixed(2)),
    timeframe,
  }
}

/**
 * Calculate total methane for an asset with multiple materials going to landfill
 */
export function calculateTotalAssetMethaneEmissions(
  materials: Array<{
    type: keyof typeof METHANE_FACTORS.materialMethaneGeneration
    weightKg: number
  }>,
  timeframe: '20-year' | '100-year' = '100-year'
): {
  totalGrossMethane: number
  totalCapturedMethane: number
  totalEscapedMethane: number
  totalCO2eEquivalent: number
  byMaterial: MethaneEmissionData[]
} {
  const byMaterial = materials.map((m) => calculateMaterialMethaneEmissions(m.type, m.weightKg, timeframe))

  return {
    totalGrossMethane: parseFloat(
      byMaterial.reduce((sum, m) => sum + m.grossMethaneProducedKg, 0).toFixed(4)
    ),
    totalCapturedMethane: parseFloat(
      byMaterial.reduce((sum, m) => sum + m.capturedMethaneKg, 0).toFixed(4)
    ),
    totalEscapedMethane: parseFloat(
      byMaterial.reduce((sum, m) => sum + m.escapedMethaneKg, 0).toFixed(4)
    ),
    totalCO2eEquivalent: parseFloat(
      byMaterial.reduce((sum, m) => sum + m.totalCO2eEquivalent, 0).toFixed(2)
    ),
    byMaterial,
  }
}

// ============================================================================
// LANDFILL DISCARD SCENARIOS
// ============================================================================

export interface LandfillDiscardScenario {
  assetId: string
  assetType: string
  totalWeightKg: number
  landfillMethaneEmissions: number // kg CH₄e
  landfillCO2eEquivalent: number // kg CO₂e from methane
  totalLandfillImpact: number // kg CO₂e
  comparisonToRecycling: number // How much worse than recycling
  recommendation: string
}

/**
 * Compare landfill impact vs. recycling for an asset
 */
export function compareLandfillVsRecycling(
  assetType: string,
  totalWeightKg: number,
  materials: Array<{ type: keyof typeof METHANE_FACTORS.materialMethaneGeneration; weightKg: number }>,
  directCO2eFromProcessing: number // Normal Scope 3 from recycling
): LandfillDiscardScenario {
  const methaneCalc = calculateTotalAssetMethaneEmissions(materials, '100-year')
  const landfillCO2eTotal = directCO2eFromProcessing + methaneCalc.totalCO2eEquivalent

  const comparisonRatio = landfillCO2eTotal / Math.max(1, directCO2eFromProcessing)

  return {
    assetId: '',
    assetType,
    totalWeightKg,
    landfillMethaneEmissions: methaneCalc.totalEscapedMethane,
    landfillCO2eEquivalent: methaneCalc.totalCO2eEquivalent,
    totalLandfillImpact: landfillCO2eTotal,
    comparisonToRecycling: parseFloat((comparisonRatio * 100).toFixed(1)),
    recommendation:
      methaneCalc.totalEscapedMethane > 5
        ? `CRITICAL: Landfill discard produces ${methaneCalc.totalEscapedMethane.toFixed(2)}kg CH₄ (${methaneCalc.totalCO2eEquivalent.toFixed(0)}kg CO₂e). Prioritize recycling/reuse.`
        : `Landfill discard produces ${methaneCalc.totalCO2eEquivalent.toFixed(0)}kg CO₂e from methane. Consider alternatives.`,
  }
}

// ============================================================================
// METHANE METRICS & ANALYSIS
// ============================================================================

export function getMethaneImpactLevel(
  escapedMethaneKg: number,
  co2eEquivalent: number
): { level: string; color: string; severity: 'critical' | 'high' | 'medium' | 'low' } {
  if (escapedMethaneKg > 10 || co2eEquivalent > 250) {
    return {
      level: 'CRITICAL - High Methane Producer',
      color: '#991b1b',
      severity: 'critical',
    }
  } else if (escapedMethaneKg > 5 || co2eEquivalent > 100) {
    return {
      level: 'HIGH - Significant Methane Risk',
      color: '#dc2626',
      severity: 'high',
    }
  } else if (escapedMethaneKg > 2 || co2eEquivalent > 40) {
    return {
      level: 'MEDIUM - Moderate Methane Impact',
      color: '#f97316',
      severity: 'medium',
    }
  } else {
    return {
      level: 'LOW - Minimal Methane Impact',
      color: '#22c55e',
      severity: 'low',
    }
  }
}

/**
 * Calculate organizational landfill methane impact
 */
export function calculateOrganizationLandfillImpact(
  landfillAssets: Array<{
    weightKg: number
    materials: Array<{ type: keyof typeof METHANE_FACTORS.materialMethaneGeneration; weightKg: number }>
  }>
): {
  totalAssetsToLandfill: number
  totalWeightToLandfill: number
  totalMethaneEmissions: number // kg CH₄
  totalMethaneAsGasEmissions: number // kg CH₄e (same as above)
  totalCO2eFromMethane: number // kg CO₂e equivalent
  totalLandfillImpact: number // kg CO₂e
  avoidanceOpportunity: number // kg CO₂e if all recycled instead
} {
  const allMethane = landfillAssets.map((asset) => calculateTotalAssetMethaneEmissions(asset.materials, '100-year'))

  const totalMethane = allMethane.reduce((sum, m) => sum + m.totalEscapedMethane, 0)
  const totalCO2e = allMethane.reduce((sum, m) => sum + m.totalCO2eEquivalent, 0)
  const totalWeight = landfillAssets.reduce((sum, a) => sum + a.weightKg, 0)

  // Avoiding landfill saves all methane emissions
  const avoidanceOpportunity = totalCO2e

  return {
    totalAssetsToLandfill: landfillAssets.length,
    totalWeightToLandfill: totalWeight,
    totalMethaneEmissions: parseFloat(totalMethane.toFixed(4)),
    totalMethaneAsGasEmissions: parseFloat(totalMethane.toFixed(4)),
    totalCO2eFromMethane: parseFloat(totalCO2e.toFixed(2)),
    totalLandfillImpact: parseFloat(totalCO2e.toFixed(2)),
    avoidanceOpportunity: parseFloat(avoidanceOpportunity.toFixed(2)),
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function formatMethaneEmissions(ch4Kg: number): string {
  if (ch4Kg < 0.01) return `${(ch4Kg * 1000).toFixed(1)} g CH₄`
  if (ch4Kg < 1) return `${(ch4Kg * 1000).toFixed(0)} g CH₄`
  return `${ch4Kg.toFixed(2)} kg CH₄`
}

export function formatMethaneAsCO2e(co2eKg: number): string {
  if (co2eKg >= 1000) return `${(co2eKg / 1000).toFixed(1)} tonnes CO₂e`
  return `${co2eKg.toFixed(0)} kg CO₂e`
}

/**
 * Get high-methane materials (for dashboard warnings)
 */
export function getHighMethaneRiskMaterials(): Array<{
  material: string
  generationFactor: number
  risk: string
}> {
  return [
    { material: 'Foam', generationFactor: 0.35, risk: 'CRITICAL' },
    { material: 'Paper', generationFactor: 0.32, risk: 'HIGH' },
    { material: 'Leather', generationFactor: 0.3, risk: 'HIGH' },
    { material: 'Fabric', generationFactor: 0.28, risk: 'MEDIUM' },
    { material: 'Wood', generationFactor: 0.25, risk: 'MEDIUM' },
  ]
}
