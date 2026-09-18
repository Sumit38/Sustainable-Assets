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
      console.warn('Supabase not configured - assets will only be saved to localStorage')
      return { success: true }
    }

    // Delete existing assets for this user first
    const { error: deleteError } = await supabase
      .from('imported_assets')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      console.warn('Failed to delete old assets:', deleteError)
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
          days_until_eol: asset.daysUntilEndOfSupport,
          country: asset.country,
          region: asset.region,
          department: asset.department,
          location: asset.location,
          cost: asset.cost,
          purchase_date: asset.purchaseDate,
          created_at: new Date().toISOString(),
        }))
      )

    if (error) {
      console.warn('Failed to insert assets to database:', error.message)
      return { success: true }
    }

    return { success: true }
  } catch (err) {
    console.warn('Supabase operation failed, falling back to localStorage:', err)
    return { success: true }
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
      daysUntilEndOfSupport: row.days_until_eol,
      country: row.country,
      region: row.region as any,
      department: row.department,
      location: row.location,
      cost: row.cost,
      purchaseDate: row.purchase_date,
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
