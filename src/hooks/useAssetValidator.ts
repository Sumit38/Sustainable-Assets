import { ImportedAsset } from '@/lib/calculations/metricCalculator'
import { getAssetProfile, MaterialProfile, isDLESuitable, getRecoveryPathway } from '@/lib/data/assetMaterialDatabase'

export interface AssetValidationResult {
  isValid: boolean
  isDLESuitable: boolean
  warnings: string[]
  suggestions: string[]
  profile: MaterialProfile | null
}

export function useAssetValidator() {
  const validateAsset = (asset: ImportedAsset): AssetValidationResult => {
    const profile = getAssetProfile(asset.assetType)

    if (!profile) {
      return {
        isValid: false,
        isDLESuitable: false,
        warnings: [`Unknown asset type: "${asset.assetType}". Please use standard types.`],
        suggestions: ['Check asset type spelling', 'Use predefined asset categories'],
        profile: null,
      }
    }

    const warnings: string[] = []
    const suggestions: string[] = []

    // Asset-specific validations
    if (asset.healthStatus === 'end-of-life' && profile.isDLESuitable) {
      warnings.push('⚠️ Asset is end-of-life and may have degraded materials')
      suggestions.push('✓ Process urgently to maximize recovery value')
    }

    if (!profile.isDLESuitable) {
      warnings.push(
        `❌ "${asset.assetType}" is NOT suitable for DLE (Direct Lithium Extraction)`
      )

      if (profile.category === 'FURNITURE') {
        suggestions.push(
          `✓ Recommend REFURBISHMENT: Value $${profile.recoveryValue.min}-${profile.recoveryValue.max}`
        )
        suggestions.push(`✓ Alternative: Donate to NGOs or resell`)
      } else if (profile.category === 'INFRASTRUCTURE') {
        suggestions.push(
          `✓ Recommend E-WASTE RECYCLING: Value $${profile.recoveryValue.min}-${profile.recoveryValue.max}`
        )
      } else if (profile.hasRareEarths && !profile.isDLESuitable) {
        suggestions.push(
          `✓ Recommend E-WASTE RECYCLING: Contains valuable rare earths`
        )
        suggestions.push(
          `✓ Estimated value: $${profile.recoveryValue.min}-${profile.recoveryValue.max}`
        )
      } else if (profile.category === 'VEHICLE') {
        suggestions.push(
          `✓ Recommend SCRAP METAL RECOVERY: Value $${profile.recoveryValue.min}-${profile.recoveryValue.max}`
        )
      }
    } else {
      // DLE-suitable asset
      suggestions.push(
        `✅ This asset is DLE-SUITABLE! Estimated lithium: ${profile.lithiumContent.min}-${profile.lithiumContent.max}kg`
      )
      suggestions.push(
        `💰 Estimated recovery value: $${profile.recoveryValue.min}-${profile.recoveryValue.max}`
      )
      suggestions.push(
        `🌱 CO₂e savings vs primary mining: ${profile.co2eSavingsVsPrimaryMining}kg`
      )

      if (profile.refurbishmentPotential) {
        suggestions.push(`✓ Note: Some units may also be refurbished before DLE processing`)
      }
    }

    return {
      isValid: true,
      isDLESuitable: profile.isDLESuitable,
      warnings,
      suggestions,
      profile,
    }
  }

  return { validateAsset }
}
