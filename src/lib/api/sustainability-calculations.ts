import {
  AssetMaterial,
  EnvironmentalMetrics,
  AssetHealthImpact,
  HealthRiskFactors,
  DiseaseRiskProbabilities,
  OrganizationSustainabilityIndex,
  SustainabilityIndexMetrics,
} from '@/types/sustainability'

// ============================================================================
// 1. ENVIRONMENTAL CALCULATIONS - CO₂e Emissions
// ============================================================================

export function calculateMaterialCo2e(materials: AssetMaterial[]): number {
  return materials.reduce((total, material) => {
    return total + material.weightKg * material.emissionFactor
  }, 0)
}

export function calculateEOLCo2e(
  materials: AssetMaterial[],
  eolPathway: string,
  transportDistanceKm?: number
): EnvironmentalMetrics {
  const totalWeight = materials.reduce((sum, m) => sum + m.weightKg, 0)

  // Scope 3 emissions from material processing
  const scope3Emission = calculateMaterialCo2e(materials)

  // Transport emissions (Scope 3)
  // Average: 0.21 kg CO2e per kg per 100km
  const transportCo2e = transportDistanceKm
    ? (totalWeight * transportDistanceKm * 0.21) / 100
    : 0

  // Reuse avoids 95% of emissions, Refurbish avoids 70%, Recycle avoids 40%
  const avoidanceRates: Record<string, number> = {
    reuse: 0.95,
    refurbish: 0.70,
    recycle: 0.40,
    incinerate: 0.0,
    landfill: 0.0,
  }

  const avoidedEmissions = scope3Emission * (avoidanceRates[eolPathway] || 0)
  const totalEolCo2e = scope3Emission + transportCo2e - avoidedEmissions

  return {
    id: '',
    assetId: '',
    eolPathway,
    totalWeightKg: totalWeight,
    scope2Emission: 0, // Would be calculated if in-house processing
    scope3Emission,
    totalEolCo2e: Math.max(0, totalEolCo2e), // Can't be negative
    transportDistanceKm,
    transportCo2e,
    avoidedEmissions,
    lastCalculated: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// ============================================================================
// 2. HEALTH IMPACT CALCULATIONS
// ============================================================================

export function calculateHealthRiskScore(
  assetType: string,
  ageYears: number,
  condition: string
): HealthRiskFactors {
  // Base risk increases with age
  const ageRiskFactor = Math.min(100, (ageYears / 10) * 50) // Max 50 points for age

  // Asset-specific health risks
  const assetTypeRisks: Record<string, HealthRiskFactors> = {
    Chair: {
      ergonomicRiskScore: 60,
      chemicalExposureRisk: 30,
      safetyRiskScore: 20,
    },
    Table: {
      ergonomicRiskScore: 40,
      chemicalExposureRisk: 25,
      safetyRiskScore: 30,
    },
    Desk: {
      ergonomicRiskScore: 50,
      chemicalExposureRisk: 20,
      safetyRiskScore: 15,
    },
    Monitor: {
      ergonomicRiskScore: 40,
      chemicalExposureRisk: 35,
      safetyRiskScore: 25,
    },
    CubicleEquipment: {
      ergonomicRiskScore: 45,
      chemicalExposureRisk: 40,
      safetyRiskScore: 20,
    },
  }

  const baseRisks = assetTypeRisks[assetType] || {
    ergonomicRiskScore: 30,
    chemicalExposureRisk: 25,
    safetyRiskScore: 20,
  }

  // Condition multiplier
  const conditionMultipliers: Record<string, number> = {
    New: 0.5,
    Good: 0.7,
    Fair: 0.85,
    Poor: 1.0,
    EOL: 1.2, // 20% increase for EOL assets
  }

  const multiplier = conditionMultipliers[condition] || 1.0

  return {
    ergonomicRiskScore: Math.min(
      100,
      baseRisks.ergonomicRiskScore * multiplier + ageRiskFactor
    ),
    chemicalExposureRisk: Math.min(
      100,
      baseRisks.chemicalExposureRisk * multiplier + ageRiskFactor * 0.5
    ),
    safetyRiskScore: Math.min(
      100,
      baseRisks.safetyRiskScore * multiplier + ageRiskFactor * 0.3
    ),
  }
}

export function calculateDiseaseRiskProbabilities(
  assetType: string,
  riskFactors: HealthRiskFactors,
  ageYears: number
): DiseaseRiskProbabilities {
  // Base disease probabilities increase with age
  const ageFactor = Math.min(1, ageYears / 15) // Saturates at 15 years

  // Asset-specific disease risks
  if (assetType === 'Chair' || assetType === 'Desk') {
    return {
      musculoskeletalDisorder:
        (riskFactors.ergonomicRiskScore / 100) * 70 * (0.5 + ageFactor),
      backPain: (riskFactors.ergonomicRiskScore / 100) * 60 * (0.5 + ageFactor),
      neckStrain: (riskFactors.ergonomicRiskScore / 100) * 50 * (0.5 + ageFactor),
      eyeStrain: 5 + ageFactor * 10,
      respiratoryIssue:
        (riskFactors.chemicalExposureRisk / 100) * 30 * (0.5 + ageFactor),
    }
  } else if (assetType === 'Monitor') {
    return {
      musculoskeletalDisorder:
        (riskFactors.ergonomicRiskScore / 100) * 40 * (0.5 + ageFactor),
      backPain: 10 + ageFactor * 15,
      neckStrain: (riskFactors.ergonomicRiskScore / 100) * 65 * (0.5 + ageFactor),
      eyeStrain: (riskFactors.ergonomicRiskScore / 100) * 75 * (0.5 + ageFactor),
      respiratoryIssue: 5 + ageFactor * 5,
    }
  } else {
    return {
      musculoskeletalDisorder:
        (riskFactors.ergonomicRiskScore / 100) * 30 * (0.5 + ageFactor),
      backPain: (riskFactors.ergonomicRiskScore / 100) * 25 * (0.5 + ageFactor),
      neckStrain: (riskFactors.ergonomicRiskScore / 100) * 20 * (0.5 + ageFactor),
      eyeStrain: 10 + ageFactor * 15,
      respiratoryIssue:
        (riskFactors.chemicalExposureRisk / 100) * 25 * (0.5 + ageFactor),
    }
  }
}

export function calculateOverallHealthRiskScore(
  riskFactors: HealthRiskFactors
): number {
  // Weighted average: ergonomic 40%, chemical 35%, safety 25%
  return (
    riskFactors.ergonomicRiskScore * 0.4 +
    riskFactors.chemicalExposureRisk * 0.35 +
    riskFactors.safetyRiskScore * 0.25
  )
}

export function calculateHealthCost(
  overallRiskScore: number,
  affectedEmployees: number
): number {
  // Risk score to cost mapping
  // Low risk (<30): $200/employee/year
  // Medium (30-60): $500/employee/year
  // High (60-80): $1000/employee/year
  // Critical (>80): $2000/employee/year

  let costPerEmployee = 200
  if (overallRiskScore > 80) costPerEmployee = 2000
  else if (overallRiskScore > 60) costPerEmployee = 1000
  else if (overallRiskScore > 30) costPerEmployee = 500

  return costPerEmployee * affectedEmployees
}

// ============================================================================
// 3. GLOBAL POLLUTION ENVIRONMENTAL INDEX
// ============================================================================

export function calculateGlobalPollutionIndex(
  metrics: SustainabilityIndexMetrics
): number {
  // Avoid division by zero
  if (metrics.scope2Replaceable === 0 || metrics.scope3Replaceable === 0) {
    return 0
  }

  const scope2Ratio = metrics.scope2Actual / metrics.scope2Replaceable
  const scope3Ratio = metrics.scope3Actual / metrics.scope3Replaceable
  const energyRatio = metrics.energyActual / metrics.energyReplaceable

  // Average of all three ratios
  const averageRatio = (scope2Ratio + scope3Ratio + energyRatio) / 3

  // Asset replacement factor
  const assetReplacementFactor =
    metrics.replaceableAssetsCount / metrics.totalAssetsCount

  // Global Pollution Index = averageRatio × assetReplacementFactor
  const index = Math.min(1, averageRatio * assetReplacementFactor)

  return parseFloat(index.toFixed(4))
}

export function getPollutionIndexStatus(index: number): {
  level: string
  color: string
  description: string
} {
  if (index > 0.8) {
    return {
      level: 'CRITICAL',
      color: '#ef4444',
      description: 'Critical environmental impact - immediate action needed',
    }
  } else if (index > 0.6) {
    return {
      level: 'HIGH',
      color: '#f97316',
      description: 'High environmental impact - urgent action required',
    }
  } else if (index > 0.4) {
    return {
      level: 'MEDIUM',
      color: '#eab308',
      description: 'Moderate environmental impact - planning needed',
    }
  } else {
    return {
      level: 'LOW',
      color: '#22c55e',
      description: 'Low environmental impact - on track',
    }
  }
}

// ============================================================================
// 4. ORGANIZATIONAL SUSTAINABILITY SCORE
// ============================================================================

export function calculateOrganizationalHealthScore(
  totalHealthRiskScore: number,
  predictedIncidents: number,
  totalEmployees: number
): number {
  // Normalize risk score (0-100 → 0-1)
  const riskNormalized = totalHealthRiskScore / 100

  // Incident ratio
  const incidentRatio = Math.min(1, predictedIncidents / totalEmployees)

  // Combined score: health = 1 - (riskNormalized + incidentRatio) / 2
  return Math.max(0, (1 - (riskNormalized + incidentRatio) / 2) * 100)
}

export function calculateOverallSustainabilityScore(
  pollutionIndex: number,
  healthScore: number,
  recyclingRate: number
): number {
  // Environmental contribution: inverse of pollution index
  const environmentalScore = (1 - pollutionIndex) * 100

  // Health contribution
  const healthContribution = healthScore

  // Recycling/reuse contribution
  const circularScore = recyclingRate * 100

  // Overall: 40% environmental, 35% health, 25% circular economy
  return (
    environmentalScore * 0.4 + healthContribution * 0.35 + circularScore * 0.25
  )
}

// ============================================================================
// 5. HELPER FUNCTIONS
// ============================================================================

export function getHealthRiskLevel(score: number): string {
  if (score >= 80) return 'Critical'
  if (score >= 60) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}

export function formatCo2e(co2e: number): string {
  if (co2e >= 1000) {
    return `${(co2e / 1000).toFixed(2)} tonnes CO₂e`
  }
  return `${co2e.toFixed(2)} kg CO₂e`
}

export function calculateAssetAge(purchaseDate: string): number {
  const purchase = new Date(purchaseDate)
  const now = new Date()
  return Math.floor((now.getTime() - purchase.getTime()) / (365 * 24 * 60 * 60 * 1000))
}

export function determineConditionStatus(
  ageYears: number,
  maintenanceScore: number
): string {
  if (ageYears > 10) return 'EOL'
  if (ageYears > 8 || maintenanceScore < 30) return 'Poor'
  if (ageYears > 5 || maintenanceScore < 60) return 'Fair'
  if (ageYears > 2) return 'Good'
  return 'New'
}
