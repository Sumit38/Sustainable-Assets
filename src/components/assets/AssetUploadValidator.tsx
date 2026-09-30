'use client'

import { ImportedAsset } from '@/lib/calculations/metricCalculator'
import { Card, CardBody } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { useAssetValidator } from '@/hooks/useAssetValidator'
import { AlertTriangle, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'

interface AssetUploadValidatorProps {
  asset: ImportedAsset
}

export function AssetUploadValidator({ asset }: AssetUploadValidatorProps) {
  const { validateAsset } = useAssetValidator()
  const validation = validateAsset(asset)

  if (!validation.isValid) {
    return (
      <div className="p-4 rounded-lg border-2 border-danger-200 bg-danger-50 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-neutral-900">{asset.productName}</h4>
            <p className="text-sm text-neutral-600">{asset.assetType}</p>
          </div>
          <Badge variant="danger">❌ Invalid</Badge>
        </div>

        <div className="bg-white rounded p-3 border-l-4 border-l-danger-600">
          {validation.warnings.map((w, i) => (
            <p key={i} className="text-sm text-danger-900 mb-2">
              {w}
            </p>
          ))}
        </div>

        <div className="space-y-1 text-sm text-neutral-600">
          {validation.suggestions.map((s, i) => (
            <p key={i}>• {s}</p>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-lg border-2 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-neutral-900">{asset.productName}</h4>
          <p className="text-sm text-neutral-600">{asset.assetType}</p>
        </div>
        <div>
          {validation.isDLESuitable ? (
            <Badge variant="success">✅ DLE-Suitable</Badge>
          ) : (
            <Badge variant="warning">⚠️ Not DLE-Suitable</Badge>
          )}
        </div>
      </div>

      {/* Warnings (if any) */}
      {validation.warnings.length > 0 && (
        <div className="bg-warning-50 border-l-4 border-l-warning-600 p-3 rounded">
          <div className="flex gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-warning-900">Warnings:</p>
          </div>
          {validation.warnings.map((w, i) => (
            <p key={i} className="text-sm text-warning-800 mb-1 pl-6">
              {w}
            </p>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {validation.suggestions.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-l-primary-600 p-3 rounded">
          <div className="flex gap-2 mb-2">
            {validation.isDLESuitable ? (
              <CheckCircle className="w-4 h-4 text-success-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-semibold text-primary-900">
              {validation.isDLESuitable ? 'DLE Opportunity:' : 'Recommendations:'}
            </p>
          </div>
          {validation.suggestions.map((s, i) => (
            <p key={i} className="text-sm text-primary-800 mb-1 pl-6">
              {s}
            </p>
          ))}
        </div>
      )}

      {/* Material Profile Details */}
      {validation.profile && (
        <div className="bg-neutral-50 p-3 rounded grid grid-cols-2 gap-3 text-xs">
          <div className="border-r border-neutral-200 pr-3">
            <p className="text-neutral-500 mb-1">Category</p>
            <p className="font-semibold text-neutral-900">{validation.profile.category}</p>
          </div>

          <div>
            <p className="text-neutral-500 mb-1">Recovery Pathway</p>
            <p className="font-semibold text-neutral-900">{validation.profile.recoveryPathway}</p>
          </div>

          {validation.isDLESuitable && (
            <>
              <div className="border-r border-neutral-200 pr-3">
                <p className="text-neutral-500 mb-1">Lithium Content</p>
                <p className="font-semibold text-success-600">
                  {validation.profile.lithiumContent.min}-{validation.profile.lithiumContent.max}kg
                </p>
              </div>

              <div>
                <p className="text-neutral-500 mb-1">Recovery Value</p>
                <p className="font-semibold text-warning-600">
                  ${validation.profile.recoveryValue.min}-${validation.profile.recoveryValue.max}
                </p>
              </div>

              <div className="border-r border-neutral-200 pr-3 col-span-1">
                <p className="text-neutral-500 mb-1">CO₂e Savings</p>
                <p className="font-semibold text-green-600">
                  {validation.profile.co2eSavingsVsPrimaryMining}kg
                </p>
              </div>

              <div>
                <p className="text-neutral-500 mb-1">Recovery Yield</p>
                <p className="font-semibold text-neutral-900">
                  {validation.profile.estimatedRecoveryYield}%
                </p>
              </div>
            </>
          )}

          {!validation.isDLESuitable && (
            <div className="col-span-2">
              <p className="text-neutral-500 mb-1">Recovery Value (Alternative Pathway)</p>
              <p className="font-semibold text-neutral-900">
                ${validation.profile.recoveryValue.min}-${validation.profile.recoveryValue.max}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Note */}
      {validation.profile && (
        <div className="bg-neutral-100 p-2 rounded text-xs text-neutral-700 italic">
          💡 {validation.profile.notes}
        </div>
      )}
    </div>
  )
}
