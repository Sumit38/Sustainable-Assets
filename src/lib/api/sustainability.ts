import { supabase } from '@/lib/db/supabase'
import {
  AssetMaterial,
  EnvironmentalMetrics,
  AssetHealthImpact,
  OrganizationSustainabilityIndex,
  SustainabilityAlert,
  EOLPathway,
  ConditionStatus,
} from '@/types/sustainability'
import {
  calculateEOLCo2e,
  calculateHealthRiskScore,
  calculateDiseaseRiskProbabilities,
  calculateOverallHealthRiskScore,
  calculateHealthCost,
  calculateGlobalPollutionIndex,
  calculateOrganizationalHealthScore,
  calculateOverallSustainabilityScore,
  calculateAssetAge,
  determineConditionStatus,
} from './sustainability-calculations'

// ============================================================================
// 1. ASSET MATERIALS - Create & Retrieve
// ============================================================================

export async function createAssetMaterials(
  assetId: string,
  materials: Omit<AssetMaterial, 'id' | 'createdAt'>[]
): Promise<AssetMaterial[]> {
  const { data, error } = await supabase
    .from('asset_materials')
    .insert(
      materials.map((m) => ({
        asset_id: assetId,
        material_type: m.materialType,
        weight_kg: m.weightKg,
        emission_factor: m.emissionFactor,
      }))
    )
    .select()

  if (error) throw error
  return data || []
}

export async function getAssetMaterials(assetId: string): Promise<AssetMaterial[]> {
  const { data, error } = await supabase
    .from('asset_materials')
    .select('*')
    .eq('asset_id', assetId)

  if (error) throw error
  return (data || []).map((row) => ({
    id: row.id,
    assetId: row.asset_id,
    materialType: row.material_type,
    weightKg: row.weight_kg,
    emissionFactor: row.emission_factor,
    createdAt: row.created_at,
  }))
}

// ============================================================================
// 2. ENVIRONMENTAL METRICS - Calculate & Store
// ============================================================================

export async function calculateAndStoreEnvironmentalMetrics(
  assetId: string,
  eolPathway: EOLPathway,
  transportDistanceKm?: number
): Promise<EnvironmentalMetrics> {
  const materials = await getAssetMaterials(assetId)

  if (materials.length === 0) {
    throw new Error('No materials defined for asset')
  }

  const metrics = calculateEOLCo2e(materials, eolPathway, transportDistanceKm)
  metrics.assetId = assetId

  const { data, error } = await supabase
    .from('asset_environmental_metrics')
    .upsert([
      {
        asset_id: assetId,
        eol_pathway: eolPathway,
        total_weight_kg: metrics.totalWeightKg,
        scope2_emission: metrics.scope2Emission,
        scope3_emission: metrics.scope3Emission,
        total_eol_co2e: metrics.totalEolCo2e,
        transport_distance_km: transportDistanceKm,
        transport_co2e: metrics.transportCo2e,
        avoided_emissions: metrics.avoidedEmissions,
      },
    ])
    .select()

  if (error) throw error
  return metrics
}

export async function getEnvironmentalMetrics(
  assetId: string
): Promise<EnvironmentalMetrics | null> {
  const { data, error } = await supabase
    .from('asset_environmental_metrics')
    .select('*')
    .eq('asset_id', assetId)
    .single()

  if (error) return null

  return {
    id: data.id,
    assetId: data.asset_id,
    eolPathway: data.eol_pathway,
    totalWeightKg: data.total_weight_kg,
    scope2Emission: data.scope2_emission,
    scope3Emission: data.scope3_emission,
    totalEolCo2e: data.total_eol_co2e,
    transportDistanceKm: data.transport_distance_km,
    transportCo2e: data.transport_co2e,
    avoidedEmissions: data.avoided_emissions,
    lastCalculated: data.last_calculated,
    updatedAt: data.updated_at,
  }
}

// ============================================================================
// 3. HEALTH IMPACT ASSESSMENT
// ============================================================================

export async function calculateAndStoreHealthImpact(
  assetId: string,
  assetType: string,
  purchaseDate: string,
  affectedEmployees: number = 1
): Promise<AssetHealthImpact> {
  const ageYears = calculateAssetAge(purchaseDate)
  const condition = determineConditionStatus(ageYears, 70) as ConditionStatus // Default maintenance score

  const riskFactors = calculateHealthRiskScore(assetType, ageYears, condition)
  const overallScore = calculateOverallHealthRiskScore(riskFactors)
  const diseaseRisks = calculateDiseaseRiskProbabilities(
    assetType,
    riskFactors,
    ageYears
  )
  const healthCost = calculateHealthCost(overallScore, affectedEmployees)

  const { data, error } = await supabase
    .from('asset_health_impact')
    .upsert([
      {
        asset_id: assetId,
        asset_age_years: ageYears,
        condition_status: condition,
        ergonomic_risk_score: riskFactors.ergonomicRiskScore,
        chemical_exposure_risk: riskFactors.chemicalExposureRisk,
        safety_risk_score: riskFactors.safetyRiskScore,
        overall_health_risk_score: overallScore,
        musculoskeletal_disorder_probability: diseaseRisks.musculoskeletalDisorder,
        back_pain_probability: diseaseRisks.backPain,
        neck_strain_probability: diseaseRisks.neckStrain,
        eye_strain_probability: diseaseRisks.eyeStrain,
        respiratory_issue_probability: diseaseRisks.respiratoryIssue,
        predicted_health_incidents: Math.ceil(overallScore / 25),
        predicted_annual_health_cost: healthCost,
        affected_employees_count: affectedEmployees,
      },
    ])
    .select()

  if (error) throw error

  return {
    id: data[0].id,
    assetId: data[0].asset_id,
    assetAgeYears: ageYears,
    conditionStatus: condition,
    riskFactors,
    overallHealthRiskScore: overallScore,
    diseaseRisks,
    predictedHealthIncidents: Math.ceil(overallScore / 25),
    predictedAnnualHealthCost: healthCost,
    affectedEmployeesCount: affectedEmployees,
    lastAssessed: new Date().toISOString(),
  }
}

export async function getHealthImpact(assetId: string): Promise<AssetHealthImpact | null> {
  const { data, error } = await supabase
    .from('asset_health_impact')
    .select('*')
    .eq('asset_id', assetId)
    .single()

  if (error) return null

  return {
    id: data.id,
    assetId: data.asset_id,
    assetAgeYears: data.asset_age_years,
    conditionStatus: data.condition_status,
    riskFactors: {
      ergonomicRiskScore: data.ergonomic_risk_score,
      chemicalExposureRisk: data.chemical_exposure_risk,
      safetyRiskScore: data.safety_risk_score,
    },
    overallHealthRiskScore: data.overall_health_risk_score,
    diseaseRisks: {
      musculoskeletalDisorder: data.musculoskeletal_disorder_probability,
      backPain: data.back_pain_probability,
      neckStrain: data.neck_strain_probability,
      eyeStrain: data.eye_strain_probability,
      respiratoryIssue: data.respiratory_issue_probability,
    },
    predictedHealthIncidents: data.predicted_health_incidents,
    predictedAnnualHealthCost: data.predicted_annual_health_cost,
    affectedEmployeesCount: data.affected_employees_count,
    lastAssessed: data.last_assessed,
  }
}

// ============================================================================
// 4. ORGANIZATION SUSTAINABILITY INDEX
// ============================================================================

export async function calculateAndStoreOrganizationIndex(
  organizationId: string,
  metrics: {
    scope2Actual: number
    scope2Replaceable: number
    scope3Actual: number
    scope3Replaceable: number
    energyActual: number
    energyReplaceable: number
    replaceableAssetsCount: number
    totalAssetsCount: number
    totalHealthRiskScore: number
    predictedHealthIncidents: number
    employeesCount: number
    recyclingRate: number
    reuseOpportunityCount: number
    avoidedEmissionsTotal: number
  }
): Promise<OrganizationSustainabilityIndex> {
  const pollutionIndex = calculateGlobalPollutionIndex({
    globalPollutionIndex: 0, // Calculated
    ...metrics,
  })

  const healthScore = calculateOrganizationalHealthScore(
    metrics.totalHealthRiskScore,
    metrics.predictedHealthIncidents,
    metrics.employeesCount
  )

  const { data, error } = await supabase
    .from('organization_sustainability_index')
    .insert([
      {
        organization_id: organizationId,
        global_pollution_index: pollutionIndex,
        scope2_actual: metrics.scope2Actual,
        scope2_replaceable: metrics.scope2Replaceable,
        scope3_actual: metrics.scope3Actual,
        scope3_replaceable: metrics.scope3Replaceable,
        energy_actual: metrics.energyActual,
        energy_replaceable: metrics.energyReplaceable,
        replaceable_assets_count: metrics.replaceableAssetsCount,
        total_assets_count: metrics.totalAssetsCount,
        organizational_health_risk_score: healthScore,
        predicted_health_incidents_annual: metrics.predictedHealthIncidents,
        predicted_health_costs_annual:
          metrics.predictedHealthIncidents * 500, // Average $500 per incident
        recycling_rate: metrics.recyclingRate,
        reuse_opportunity_count: metrics.reuseOpportunityCount,
        avoided_emissions_total: metrics.avoidedEmissionsTotal,
      },
    ])
    .select()

  if (error) throw error

  return {
    id: data[0].id,
    organizationId,
    indexMetrics: {
      globalPollutionIndex: pollutionIndex,
      scope2Actual: metrics.scope2Actual,
      scope2Replaceable: metrics.scope2Replaceable,
      scope3Actual: metrics.scope3Actual,
      scope3Replaceable: metrics.scope3Replaceable,
      energyActual: metrics.energyActual,
      energyReplaceable: metrics.energyReplaceable,
      replaceableAssetsCount: metrics.replaceableAssetsCount,
      totalAssetsCount: metrics.totalAssetsCount,
    },
    healthMetrics: {
      organizationalHealthRiskScore: healthScore,
      predictedHealthIncidentsAnnual: metrics.predictedHealthIncidents,
      predictedHealthCostsAnnual: metrics.predictedHealthIncidents * 500,
      employeesAtRisk: Math.ceil(
        (metrics.employeesCount * metrics.totalHealthRiskScore) / 100
      ),
    },
    performanceMetrics: {
      recyclingRate: metrics.recyclingRate,
      reuseOpportunityCount: metrics.reuseOpportunityCount,
      avoidedEmissionsTotal: metrics.avoidedEmissionsTotal,
    },
    calculatedAt: new Date().toISOString(),
  }
}

export async function getLatestOrganizationIndex(
  organizationId: string
): Promise<OrganizationSustainabilityIndex | null> {
  const { data, error } = await supabase
    .from('organization_sustainability_index')
    .select('*')
    .eq('organization_id', organizationId)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return null

  return {
    id: data.id,
    organizationId,
    indexMetrics: {
      globalPollutionIndex: data.global_pollution_index,
      scope2Actual: data.scope2_actual,
      scope2Replaceable: data.scope2_replaceable,
      scope3Actual: data.scope3_actual,
      scope3Replaceable: data.scope3_replaceable,
      energyActual: data.energy_actual,
      energyReplaceable: data.energy_replaceable,
      replaceableAssetsCount: data.replaceable_assets_count,
      totalAssetsCount: data.total_assets_count,
    },
    healthMetrics: {
      organizationalHealthRiskScore: data.organizational_health_risk_score,
      predictedHealthIncidentsAnnual: data.predicted_health_incidents_annual,
      predictedHealthCostsAnnual: data.predicted_health_costs_annual,
      employeesAtRisk: Math.ceil(
        (data.total_assets_count * data.organizational_health_risk_score) / 100
      ),
    },
    performanceMetrics: {
      recyclingRate: data.recycling_rate,
      reuseOpportunityCount: data.reuse_opportunity_count,
      avoidedEmissionsTotal: data.avoided_emissions_total,
    },
    calculatedAt: data.calculated_at,
  }
}

// ============================================================================
// 5. SUSTAINABILITY ALERTS
// ============================================================================

export async function createSustainabilityAlert(
  organizationId: string,
  alert: Omit<SustainabilityAlert, 'id' | 'createdAt' | 'resolvedAt'>
): Promise<SustainabilityAlert> {
  const { data, error } = await supabase
    .from('sustainability_alerts')
    .insert([
      {
        organization_id: organizationId,
        alert_type: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        affected_assets_count: alert.affectedAssetsCount,
        environmental_impact: alert.environmentalImpact,
        health_impact_count: alert.healthImpactCount,
        action_required: alert.actionRequired,
      },
    ])
    .select()

  if (error) throw error

  return {
    id: data[0].id,
    organizationId,
    alertType: data[0].alert_type,
    severity: data[0].severity,
    message: data[0].message,
    affectedAssetsCount: data[0].affected_assets_count,
    environmentalImpact: data[0].environmental_impact,
    healthImpactCount: data[0].health_impact_count,
    actionRequired: data[0].action_required,
    createdAt: data[0].created_at,
  }
}

export async function getSustainabilityAlerts(
  organizationId: string,
  limit: number = 10
): Promise<SustainabilityAlert[]> {
  const { data, error } = await supabase
    .from('sustainability_alerts')
    .select('*')
    .eq('organization_id', organizationId)
    .is('resolved_at', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data || []).map((row) => ({
    id: row.id,
    organizationId: row.organization_id,
    alertType: row.alert_type,
    severity: row.severity,
    message: row.message,
    affectedAssetsCount: row.affected_assets_count,
    environmentalImpact: row.environmental_impact,
    healthImpactCount: row.health_impact_count,
    actionRequired: row.action_required,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  }))
}
