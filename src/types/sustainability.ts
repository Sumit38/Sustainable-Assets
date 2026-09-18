/* Sustainability and Health Impact Types */

export type MaterialType = 'Steel' | 'Plastic' | 'Foam' | 'Fabric' | 'Wood'
export type EOLPathway = 'reuse' | 'refurbish' | 'recycle' | 'incinerate' | 'landfill'
export type ConditionStatus = 'New' | 'Good' | 'Fair' | 'Poor' | 'EOL'

// Environmental Tracking
export interface AssetMaterial {
  id: string
  assetId: string
  materialType: MaterialType
  weightKg: number
  emissionFactor: number // kg CO2e per kg
  createdAt: string
}

export interface EnvironmentalMetrics {
  id: string
  assetId: string
  eolPathway?: EOLPathway
  totalWeightKg?: number
  scope2Emission: number // kg CO2e
  scope3Emission: number // kg CO2e
  totalEolCo2e: number
  transportDistanceKm?: number
  transportCo2e?: number
  avoidedEmissions?: number // if reused/refurbished
  lastCalculated: string
  updatedAt: string
}

// Health Impact Assessment
export interface HealthRiskFactors {
  ergonomicRiskScore: number // 0-100
  chemicalExposureRisk: number // 0-100
  safetyRiskScore: number // 0-100
}

export interface DiseaseRiskProbabilities {
  musculoskeletalDisorder: number // percentage
  backPain: number
  neckStrain: number
  eyeStrain: number
  respiratoryIssue: number
}

export interface AssetHealthImpact {
  id: string
  assetId: string
  assetAgeYears: number
  conditionStatus: ConditionStatus
  riskFactors: HealthRiskFactors
  overallHealthRiskScore: number // 0-100
  diseaseRisks: DiseaseRiskProbabilities
  predictedHealthIncidents: number
  predictedAnnualHealthCost: number
  affectedEmployeesCount: number
  lastAssessed: string
}

// Organizational Sustainability Index
export interface SustainabilityIndexMetrics {
  globalPollutionIndex: number // 0-1, >0.8 is critical
  scope2Actual: number
  scope2Replaceable: number
  scope3Actual: number
  scope3Replaceable: number
  energyActual: number
  energyReplaceable: number
  replaceableAssetsCount: number
  totalAssetsCount: number
}

export interface HealthMetricsIndex {
  organizationalHealthRiskScore: number // 0-100
  predictedHealthIncidentsAnnual: number
  predictedHealthCostsAnnual: number
  employeesAtRisk: number
}

export interface SustainabilityPerformance {
  recyclingRate: number // percentage
  reuseOpportunityCount: number
  avoidedEmissionsTotal: number // kg CO2e
}

export interface OrganizationSustainabilityIndex {
  id: string
  organizationId: string
  indexMetrics: SustainabilityIndexMetrics
  healthMetrics: HealthMetricsIndex
  performanceMetrics: SustainabilityPerformance
  calculatedAt: string
}

// Sustainability Alerts
export type SustainabilityAlertType =
  | 'HIGH_EOL_EMISSIONS'
  | 'SCOPE3_EXCEEDED'
  | 'RECYCLING_OVERDUE'
  | 'ERGONOMIC_RISK_HIGH'
  | 'CHEMICAL_EXPOSURE'
  | 'HEALTH_INCIDENT_PREDICTED'
  | 'URGENT_REPLACEMENT'
  | 'POLLUTION_INDEX_CRITICAL'

export interface SustainabilityAlert {
  id: string
  organizationId: string
  alertType: SustainabilityAlertType
  severity: 'critical' | 'warning' | 'info'
  message: string
  affectedAssetsCount: number
  environmentalImpact?: number // kg CO2e
  healthImpactCount?: number
  actionRequired: boolean
  createdAt: string
  resolvedAt?: string
}

// Department-Level Metrics
export interface DepartmentSustainability {
  id: string
  organizationId: string
  departmentName: string
  totalAssets: number
  eolAssetsCount: number
  atRiskAssetsCount: number
  totalCo2eEmissions: number
  healthRiskScore: number
  employeesAtRisk: number
  calculatedAt: string
}

// Dashboard Summary
export interface SustainabilityDashboard {
  environmentalScore: number // 0-100 (inverse of pollution index)
  healthScore: number // 0-100
  overallSustainabilityScore: number // 0-100 (combined)
  keyMetrics: {
    totalCo2eEmissions: number
    eolAssets: number
    healthRiskAssets: number
    employeesAtRisk: number
    recyclingRate: number
    avoidedEmissions: number
  }
  alerts: SustainabilityAlert[]
  topRisks: Array<{
    type: 'environmental' | 'health' | 'combined'
    asset: string
    riskLevel: 'critical' | 'high' | 'medium' | 'low'
    impact: number
  }>
}
