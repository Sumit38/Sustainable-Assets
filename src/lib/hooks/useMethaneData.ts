import { useState, useEffect } from 'react'
import { getMethaneEmissions, getMethaneAlerts, getOrganizationLandfillImpact } from '@/lib/api/methane-tracking'

export interface MethaneData {
  assetMethane: any | null
  organizationLandfill: any | null
  methaneAlerts: any[]
  isLoading: boolean
  error: Error | null
}

export function useMethaneData(assetId?: string, organizationId?: string) {
  const [data, setData] = useState<MethaneData>({
    assetMethane: null,
    organizationLandfill: null,
    methaneAlerts: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        let assetData = null
        let orgData = null
        let alerts = []

        if (assetId) {
          assetData = await getMethaneEmissions(assetId)
        }

        if (organizationId) {
          orgData = await getOrganizationLandfillImpact(organizationId)
          alerts = await getMethaneAlerts(organizationId, 10)
        }

        setData({
          assetMethane: assetData,
          organizationLandfill: orgData,
          methaneAlerts: alerts,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Failed to fetch methane data'),
        }))
      }
    }

    if (assetId || organizationId) {
      fetchData()
    }
  }, [assetId, organizationId])

  return data
}

// Hook for fetching high-risk methane assets
export interface HighMethaneAsset {
  asset_id: string
  asset_type: string
  total_weight_kg: number
  escaped_methane_kg: number
  methane_co2e_equivalent: number
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  recommendation: string
}

export function useHighMethaneAssets(organizationId?: string) {
  const [assets, setAssets] = useState<HighMethaneAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!organizationId) return

    const fetchAssets = async () => {
      try {
        // This would fetch from a view or API endpoint
        // For now, returning empty array to demonstrate structure
        setAssets([])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch high-risk assets'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssets()
  }, [organizationId])

  return { assets, isLoading, error }
}

// Hook for material breakdown
export interface MaterialMethaneData {
  material_type: string
  total_weight_kg: number
  methane_generation_rate: number
  total_methane_produced_kg: number
  total_co2e_equivalent: number
  asset_count: number
}

export function useMaterialMethaneBreakdown(organizationId?: string) {
  const [materials, setMaterials] = useState<MaterialMethaneData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!organizationId) return

    const fetchMaterials = async () => {
      try {
        // This would fetch from methane_source_analysis table
        // For now, returning empty array to demonstrate structure
        setMaterials([])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch material breakdown'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchMaterials()
  }, [organizationId])

  return { materials, isLoading, error }
}
