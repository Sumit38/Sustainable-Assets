import { supabase } from '@/lib/db/supabase'
import { Asset, AssetWithHealthStatus, HealthStatus, RiskLevel } from '@/types'
import { differenceInDays, isPast } from 'date-fns'

export async function fetchAssets(
  limit = 100,
  offset = 0
): Promise<{ data: Asset[]; count: number }> {
  const { data, error, count } = await supabase
    .from('assets')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data: data || [], count: count || 0 }
}

export async function fetchAssetById(id: string): Promise<Asset> {
  const { data, error } = await supabase.from('assets').select('*').eq('id', id).single()

  if (error) throw error
  return data
}

export async function createAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> {
  const { data, error } = await supabase
    .from('assets')
    .insert([{ ...asset, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAsset(id: string, asset: Partial<Asset>): Promise<Asset> {
  const { data, error } = await supabase
    .from('assets')
    .update({ ...asset, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAsset(id: string): Promise<void> {
  const { error } = await supabase.from('assets').delete().eq('id', id)

  if (error) throw error
}

/* Health Status Calculation */
export function calculateHealthStatus(lastDateOfSupport: string): HealthStatus {
  const today = new Date()
  const supportEndDate = new Date(lastDateOfSupport)
  const daysUntilEnd = differenceInDays(supportEndDate, today)

  if (daysUntilEnd < 0) return 'end-of-life'
  if (daysUntilEnd < 30) return 'critical'
  if (daysUntilEnd < 90) return 'at-risk'
  return 'healthy'
}

export function calculateRiskLevel(healthStatus: HealthStatus, healthImpactText: string): RiskLevel {
  if (healthStatus === 'end-of-life' || healthStatus === 'critical') return 'critical'
  if (healthStatus === 'at-risk') {
    if (healthImpactText.toLowerCase().includes('major') || healthImpactText.toLowerCase().includes('pain')) {
      return 'high'
    }
    return 'medium'
  }
  return 'low'
}

export function calculateDaysUntilEndOfSupport(lastDateOfSupport: string): number {
  return differenceInDays(new Date(lastDateOfSupport), new Date())
}

export function calculateComplianceScore(healthStatus: HealthStatus): number {
  const scores = {
    healthy: 100,
    'at-risk': 70,
    critical: 40,
    'end-of-life': 0,
  }
  return scores[healthStatus]
}

export function getAssetWithHealthStatus(asset: Asset): AssetWithHealthStatus {
  const healthStatus = calculateHealthStatus(asset.lastDateOfSupport)
  const riskLevel = calculateRiskLevel(healthStatus, asset.potentialHealthImpact)
  const daysUntilEndOfSupport = calculateDaysUntilEndOfSupport(asset.lastDateOfSupport)
  const complianceScore = calculateComplianceScore(healthStatus)

  return {
    ...asset,
    healthStatus,
    daysUntilEndOfSupport,
    complianceScore,
    riskLevel,
  }
}

export async function fetchAssetsWithHealthStatus(limit = 100, offset = 0) {
  const { data, count } = await fetchAssets(limit, offset)
  return {
    data: data.map(getAssetWithHealthStatus),
    count,
  }
}
