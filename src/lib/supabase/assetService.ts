// Supabase Asset Service - Handle data persistence

import { supabase } from '@/lib/db/supabase'
import { ImportedAsset } from '@/lib/calculations/metricCalculator'

/**
 * Save imported assets to Supabase database
 * Called when user uploads CSV file
 */
export async function saveAssetsToDatabase(
  userId: string,
  assets: ImportedAsset[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Database is not configured' }
    }

    // Delete existing assets for this user first
    const { error: deleteError } = await supabase
      .from('imported_assets')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Failed to delete old assets:', deleteError)
      return { success: false, error: deleteError.message }
    }

    // Insert new assets
    const { error } = await supabase
      .from('imported_assets')
      .insert(
        assets.map(asset => ({
          user_id: userId,
          asset_id: asset.assetId,
          asset_type: asset.assetType,
          product_name: asset.productName,
          manufacturer: asset.manufacturer,
          date_of_manufacture: asset.dateOfManufacture,
          last_date_of_support: asset.lastDateOfSupport,
          health_status: asset.healthStatus,
          compliance_score: asset.complianceScore,
          days_until_end_of_support: asset.daysUntilEndOfSupport,
          country: asset.country,
          region: asset.region,
          department: asset.department,
          location: asset.location,
          cost: asset.cost,
          purchase_date: asset.purchaseDate,
          employees_affected: asset.employeesAffected,
          health_issues_per_year: asset.healthIssuesPerYear,
          annual_maintenance_cost: asset.annualMaintenanceCost,
          downtime_hours_per_failure: asset.downtimeHoursPerFailure,
          downtime_cost_per_hour: asset.downtimeCostPerHour,
          replacement_cost: asset.replacementCost,
          annual_co2e: asset.annualCO2e,
          power_watts: asset.powerWatts,
          usage_hours_per_year: asset.usageHoursPerYear,
          replacement_product: asset.replacementProduct,
          scope1_tco2e: asset.scope1Tco2e,
          scope2_tco2e: asset.scope2Tco2e,
          scope3_tco2e: asset.scope3Tco2e,
          created_at: new Date().toISOString(),
        }))
      )

    if (error) {
      console.error('Failed to insert assets to database:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Supabase operation failed:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown database error' }
  }
}

/**
 * Load assets for user from Supabase database
 * Called when user logs in
 */
export async function loadAssetsFromDatabase(
  userId: string
): Promise<ImportedAsset[]> {
  try {
    if (!supabase) {
      return []
    }

    const { data, error } = await supabase
      .from('imported_assets')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.warn('Error loading assets from database:', error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    const num = (v: unknown) => (v === null || v === undefined || v === '' ? undefined : Number(v))
    // Transform database rows to ImportedAsset type
    return data.map(row => ({
      assetId: row.asset_id,
      assetType: row.asset_type,
      productName: row.product_name,
      manufacturer: row.manufacturer,
      dateOfManufacture: row.date_of_manufacture,
      lastDateOfSupport: row.last_date_of_support,
      healthStatus: row.health_status as any,
      complianceScore: row.compliance_score,
      daysUntilEndOfSupport: row.days_until_end_of_support,
      country: row.country,
      region: row.region as any,
      department: row.department,
      location: row.location,
      cost: row.cost,
      purchaseDate: row.purchase_date,
      employeesAffected: num(row.employees_affected),
      healthIssuesPerYear: num(row.health_issues_per_year),
      annualMaintenanceCost: num(row.annual_maintenance_cost),
      downtimeHoursPerFailure: num(row.downtime_hours_per_failure),
      downtimeCostPerHour: num(row.downtime_cost_per_hour),
      replacementCost: num(row.replacement_cost),
      annualCO2e: num(row.annual_co2e),
      powerWatts: num(row.power_watts),
      usageHoursPerYear: num(row.usage_hours_per_year),
      replacementProduct: row.replacement_product ?? undefined,
      scope1Tco2e: num(row.scope1_tco2e),
      scope2Tco2e: num(row.scope2_tco2e),
      scope3Tco2e: num(row.scope3_tco2e),
    }))
  } catch (err) {
    console.warn('Failed to load assets from database:', err)
    return []
  }
}

/**
 * Delete all assets for a user
 */
export async function deleteUserAssets(userId: string): Promise<boolean> {
  try {
    if (!supabase) {
      return true
    }

    const { error } = await supabase
      .from('imported_assets')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.warn('Error deleting assets from database:', error)
      return false
    }

    return true
  } catch (err) {
    console.warn('Failed to delete assets from database:', err)
    return false
  }
}
