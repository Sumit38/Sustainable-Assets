'use client'

import React, { useState } from 'react'
import { FactorQuestionnaire } from '@/components/factors/FactorQuestionnaire'
import { ExtendedImportedAsset } from '@/lib/import/csvProcessor'

interface CSVImportWithQuestionnaireProps {
  assets: ExtendedImportedAsset[]
  onComplete: (assetsWithAnswers: ExtendedImportedAsset[]) => void
  onSkip: () => void
}

/**
 * Wrapper component that:
 * 1. Detects which assets have blank factor fields
 * 2. Shows questionnaire modal if fields are blank
 * 3. Stores answers in assets and calls onComplete
 */
export function CSVImportWithQuestionnaire({
  assets,
  onComplete,
  onSkip,
}: CSVImportWithQuestionnaireProps) {
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0)
  const [allAnswers, setAllAnswers] = useState<Record<string, Record<string, number>>>({})

  // Find assets with missing factor fields
  const assetsNeedingFactors = assets.filter(asset => {
    const hasEmployeeData = asset.employeesAffected !== undefined
    const hasHealthData = asset.healthIssuesPerYear !== undefined
    const hasCostData = asset.annualMaintenanceCost !== undefined
    const hasCarbonData = asset.annualCO2e !== undefined || asset.powerWatts !== undefined

    return !hasEmployeeData || !hasHealthData || !hasCostData || !hasCarbonData
  })

  // If no assets need questionnaire, skip directly
  if (assetsNeedingFactors.length === 0) {
    onComplete(assets)
    return null
  }

  const currentAsset = assetsNeedingFactors[currentAssetIndex]

  const handleQuestionnaireComplete = (answers: Record<string, number>) => {
    const newAnswers = { ...allAnswers }
    newAnswers[currentAsset.assetId] = answers

    if (currentAssetIndex < assetsNeedingFactors.length - 1) {
      // Move to next asset
      setAllAnswers(newAnswers)
      setCurrentAssetIndex(currentAssetIndex + 1)
    } else {
      // Done with all assets - attach answers and complete
      const assetsWithAnswers = assets.map(asset => ({
        ...asset,
        questionnaireAnswers: newAnswers[asset.assetId],
      }))
      onComplete(assetsWithAnswers)
    }
  }

  const handleQuestionnaireSkip = () => {
    if (currentAssetIndex < assetsNeedingFactors.length - 1) {
      // Skip this asset and move to next
      setCurrentAssetIndex(currentAssetIndex + 1)
    } else {
      // Done - use whatever answers we collected
      const assetsWithAnswers = assets.map(asset => ({
        ...asset,
        questionnaireAnswers: allAnswers[asset.assetId],
      }))
      onComplete(assetsWithAnswers)
    }
  }

  return (
    <div>
      <FactorQuestionnaire
        missingFields={getMissingFields(currentAsset)}
        onComplete={handleQuestionnaireComplete}
        onSkip={handleQuestionnaireSkip}
      />

      {/* Asset context info */}
      <div className="fixed bottom-4 left-4 text-xs text-neutral-500 bg-white px-3 py-2 rounded border border-neutral-200">
        <p>Asset: {currentAsset.assetId} - {currentAsset.productName}</p>
        <p>
          {currentAssetIndex + 1} of {assetsNeedingFactors.length} assets
        </p>
      </div>
    </div>
  )
}

/**
 * Determine which fields are missing for an asset
 */
function getMissingFields(asset: ExtendedImportedAsset): string[] {
  const missing: string[] = []

  if (asset.employeesAffected === undefined) missing.push('employeesAffected')
  if (asset.healthIssuesPerYear === undefined) missing.push('healthIssuesPerYear')
  if (asset.annualMaintenanceCost === undefined) missing.push('annualMaintenanceCost')
  if (asset.downtimeHoursPerFailure === undefined) missing.push('downtimeHoursPerFailure')
  if (asset.downtimeCostPerHour === undefined) missing.push('downtimeCostPerHour')
  if (asset.replacementCost === undefined) missing.push('replacementCost')
  if (asset.annualCO2e === undefined && asset.powerWatts === undefined) {
    missing.push('annualCO2e')
  }

  return missing
}
