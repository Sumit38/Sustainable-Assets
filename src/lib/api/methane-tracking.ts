import { supabase } from '@/lib/db/supabase'
import {
  calculateTotalAssetMethaneEmissions,
  compareLandfillVsRecycling,
  calculateOrganizationLandfillImpact,
  getMethaneImpactLevel,
  METHANE_FACTORS,
} from './methane-calculations'

// ============================================================================
// ASSET METHANE EMISSIONS - Calculate & Store
// ============================================================================

export async function calculateAndStoreMethaneEmissions(
  assetId: string,
  totalWeightKg: number,
  materials: Array<{ type: string; weightKg: number }>,
  eolPathway: string = 'landfill',
  directCO2eFromProcessing: number = 0
) {
  // Only calculate if landfill discard
  if (eolPathway !== 'landfill') {
    return null
  }

  // Type-safe material calculation
  const typedMaterials = materials.map((m) => ({
    type: m.type as keyof typeof METHANE_FACTORS.materialMethaneGeneration,
    weightKg: m.weightKg,
  }))

  const methaneCalc = calculateTotalAssetMethaneEmissions(typedMaterials, '100-year')
  const comparison = compareLandfillVsRecycling(
    'Asset',
    totalWeightKg,
    typedMaterials,
    directCO2eFromProcessing
  )

  const { data, error } = await supabase
    .from('asset_methane_emissions')
    .upsert([
      {
        asset_id: assetId,
        eol_pathway: eolPathway,
        total_weight_kg: totalWeightKg,
        gross_methane_produced_kg: methaneCalc.totalGrossMethane,
        captured_methane_kg: methaneCalc.totalCapturedMethane,
        escaped_methane_kg: methaneCalc.totalEscapedMethane,
        methane_co2e_equivalent: methaneCalc.totalCO2eEquivalent,
        methane_co2e_20year: methaneCalc.totalEscapedMethane * 84, // 20-year GWP
        compared_to_recycling: comparison.comparisonToRecycling,
        recommendation: comparison.recommendation,
        material_breakdown: materials,
      },
    ])
    .select()

  if (error) throw error

  return {
    assetId,
    methaneEmissions: methaneCalc,
    comparison,
  }
}

export async function getMethaneEmissions(assetId: string) {
  const { data, error } = await supabase
    .from('asset_methane_emissions')
    .select('*')
    .eq('asset_id', assetId)
    .single()

  if (error) return null
  return data
}

// ============================================================================
// ORGANIZATION LANDFILL IMPACT
// ============================================================================

export async function calculateAndStoreOrganizationLandfillImpact(
  organizationId: string
) {
  // Get all assets destined for landfill
  const { data: landfillAssets, error: fetchError } = await supabase
    .from('asset_methane_emissions')
    .select('total_weight_kg, material_breakdown')
    .eq('eol_pathway', 'landfill')

  if (fetchError || !landfillAssets) throw fetchError || new Error('No landfill assets found')

  // Calculate impact
  const typedAssets = landfillAssets.map((a) => ({
    weightKg: a.total_weight_kg || 0,
    materials: (a.material_breakdown as Array<{ type: 'Foam' | 'Fabric' | 'Wood' | 'Plastic' | 'Steel' | 'Paper' | 'Leather'; weightKg: number }>) || [],
  }))

  const impact = calculateOrganizationLandfillImpact(typedAssets)

  // Get high-methane asset details
  const { data: highMethaneAssets } = await supabase
    .from('asset_methane_emissions')
    .select('asset_id, escaped_methane_kg')
    .eq('eol_pathway', 'landfill')
    .gt('escaped_methane_kg', 10)

  const { data: mediumMethaneAssets } = await supabase
    .from('asset_methane_emissions')
    .select('asset_id, escaped_methane_kg')
    .eq('eol_pathway', 'landfill')
    .gte('escaped_methane_kg', 5)
    .lt('escaped_methane_kg', 10)

  const { data: stored, error: storeError } = await supabase
    .from('organization_landfill_impact')
    .insert([
      {
        organization_id: organizationId,
        total_assets_to_landfill: impact.totalAssetsToLandfill,
        total_weight_to_landfill_kg: impact.totalWeightToLandfill,
        total_methane_emissions_kg: impact.totalMethaneEmissions,
        total_co2e_from_methane: impact.totalCO2eFromMethane,
        avoidance_opportunity_kg: impact.avoidanceOpportunity,
        high_methane_assets: highMethaneAssets?.length || 0,
        medium_methane_assets: mediumMethaneAssets?.length || 0,
        methane_alert_count:
          (highMethaneAssets?.length || 0) + (mediumMethaneAssets?.length || 0),
      },
    ])
    .select()

  if (storeError) throw storeError

  return {
    organizationId,
    landfillImpact: impact,
    storedRecord: stored?.[0],
  }
}

export async function getOrganizationLandfillImpact(organizationId: string) {
  const { data, error } = await supabase
    .from('organization_landfill_impact')
    .select('*')
    .eq('organization_id', organizationId)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data
}

// ============================================================================
// METHANE SOURCE ANALYSIS
// ============================================================================

export async function analyzeMethaneByMaterial(organizationId: string) {
  // Group assets by material type
  const { data: assetsByMaterial, error } = await supabase
    .from('asset_methane_emissions')
    .select('material_breakdown, escaped_methane_kg, methane_co2e_equivalent')
    .eq('eol_pathway', 'landfill')

  if (error) throw error

  const materialAnalysis: Record<string, { weight: number; methane: number; co2e: number; assets: number }> = {}

  assetsByMaterial?.forEach((asset) => {
    const materials = asset.material_breakdown as Array<{ type: string; weightKg: number }>
    if (!materials) return

    materials.forEach((m) => {
      if (!materialAnalysis[m.type]) {
        materialAnalysis[m.type] = { weight: 0, methane: 0, co2e: 0, assets: 0 }
      }
      materialAnalysis[m.type].weight += m.weightKg
      materialAnalysis[m.type].methane += asset.escaped_methane_kg || 0
      materialAnalysis[m.type].co2e += asset.methane_co2e_equivalent || 0
      materialAnalysis[m.type].assets += 1
    })
  })

  // Store analysis
  const analysisData = Object.entries(materialAnalysis).map(([material, data]) => ({
    organization_id: organizationId,
    material_type: material,
    total_weight_kg: data.weight,
    methane_generation_rate:
      METHANE_FACTORS.materialMethaneGeneration[
        material as keyof typeof METHANE_FACTORS.materialMethaneGeneration
      ] || 0,
    total_methane_produced_kg: data.methane,
    total_co2e_equivalent: data.co2e,
    asset_count: data.assets,
    high_risk_assets: 0, // Can be calculated separately if needed
  }))

  const { data: stored, error: storeError } = await supabase
    .from('methane_source_analysis')
    .insert(analysisData)
    .select()

  if (storeError) throw storeError
  return stored
}

// ============================================================================
// METHANE ALERTS
// ============================================================================

export async function createMethaneAlert(
  organizationId: string,
  assetId: string | null,
  alertType: string,
  methaneImpactKg: number,
  co2eEquivalent: number
) {
  const impactLevel = getMethaneImpactLevel(methaneImpactKg, co2eEquivalent)

  const { data, error } = await supabase
    .from('methane_alerts')
    .insert([
      {
        organization_id: organizationId,
        asset_id: assetId,
        alert_type: alertType,
        severity: impactLevel.severity,
        methane_impact_kg: methaneImpactKg,
        co2e_equivalent: co2eEquivalent,
        message: `${impactLevel.level}: Asset produces ${methaneImpactKg.toFixed(2)}kg CH₄ (${co2eEquivalent.toFixed(0)}kg CO₂e)`,
        recommendation:
          methaneImpactKg > 10
            ? 'URGENT: Reconsider landfill. Prioritize recycling, reuse, or refurbishment.'
            : 'Review alternatives to landfill discard.',
        action_required: true,
      },
    ])
    .select()

  if (error) throw error
  return data?.[0]
}

export async function getMethaneAlerts(
  organizationId: string,
  limit: number = 20
) {
  const { data, error } = await supabase
    .from('methane_alerts')
    .select('*')
    .eq('organization_id', organizationId)
    .is('resolved_at', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function resolveMethaneAlert(alertId: string) {
  const { data, error } = await supabase
    .from('methane_alerts')
    .update({ resolved_at: new Date().toISOString(), action_required: false })
    .eq('id', alertId)
    .select()

  if (error) throw error
  return data?.[0]
}

// ============================================================================
// LANDFILL ALTERNATIVES ANALYSIS
// ============================================================================

export async function analyzeAlternativesToLandfill(
  assetId: string,
  totalWeightKg: number,
  materials: Array<{ type: string; weightKg: number }>,
  landfillMethaneImpactKg: number
) {
  const typedMaterials = materials.map((m) => ({
    type: m.type as keyof typeof METHANE_FACTORS.materialMethaneGeneration,
    weightKg: m.weightKg,
  }))

  // Estimate savings from alternatives
  // Reuse: saves 95% of both CO₂e and methane
  // Recycling: saves 40% of processing CO₂e + 100% of methane
  // Refurbish: saves 70% + 100% of methane

  const landfillCO2e = landfillMethaneImpactKg * 28

  const alternatives = {
    reuse: {
      benefit: landfillCO2e * 0.95,
      reduction: 95,
    },
    recycling: {
      benefit: landfillCO2e * 0.9, // Processing CO₂e less, but avoid all methane
      reduction: 90,
    },
    refurbishing: {
      benefit: landfillCO2e * 0.92,
      reduction: 92,
    },
  }

  const bestOption = Object.entries(alternatives).reduce((prev, [key, val]) =>
    val.benefit > prev.benefit ? { name: key, ...val } : prev
  )

  const { data, error } = await supabase
    .from('landfill_alternatives')
    .upsert([
      {
        asset_id: assetId,
        current_plan: 'landfill',
        methane_cost_kg_co2e: landfillCO2e,
        reuse_benefit_kg_co2e: alternatives.reuse.benefit,
        recycling_benefit_kg_co2e: alternatives.recycling.benefit,
        refurbishing_benefit_kg_co2e: alternatives.refurbishing.benefit,
        best_alternative: bestOption.name,
        impact_reduction_percentage: bestOption.reduction,
        recommended_action: `Switch to ${bestOption.name} to reduce environmental impact by ${bestOption.reduction}%`,
      },
    ])
    .select()

  if (error) throw error
  return data?.[0]
}
