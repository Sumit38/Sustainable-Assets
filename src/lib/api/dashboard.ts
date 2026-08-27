import { supabase } from '@/lib/db/supabase'
import { DashboardMetrics, AssetWithHealthStatus } from '@/types'
import { getAssetWithHealthStatus } from './assets'

export async function calculateDashboardMetrics(): Promise<DashboardMetrics> {
  const { data: assets, error } = await supabase.from('assets').select('*')

  if (error) throw error

  const assetsWithHealth = (assets || []).map(getAssetWithHealthStatus)

  const metrics: DashboardMetrics = {
    totalAssets: assetsWithHealth.length,
    healthyAssets: assetsWithHealth.filter((a) => a.healthStatus === 'healthy').length,
    atRiskAssets: assetsWithHealth.filter((a) => a.healthStatus === 'at-risk').length,
    criticalAssets: assetsWithHealth.filter((a) => a.healthStatus === 'critical').length,
    endOfLifeAssets: assetsWithHealth.filter((a) => a.healthStatus === 'end-of-life').length,
    avgComplianceScore: Math.round(
      assetsWithHealth.reduce((sum, a) => sum + a.complianceScore, 0) / assetsWithHealth.length
    ),
    pendingAlerts: 0,
    resolvedAlerts: 0,
    assetsByType: getAssetsByType(assetsWithHealth),
    assetsByManufacturer: getAssetsByManufacturer(assetsWithHealth),
    assetsBySupportStatus: getAssetsBySupportStatus(assetsWithHealth),
  }

  const { data: alerts } = await supabase
    .from('alerts')
    .select('resolved_at')

  if (alerts) {
    metrics.pendingAlerts = alerts.filter((a) => !a.resolved_at).length
    metrics.resolvedAlerts = alerts.filter((a) => a.resolved_at).length
  }

  return metrics
}

function getAssetsByType(assets: AssetWithHealthStatus[]) {
  const types = new Map<string, number>()

  assets.forEach((asset) => {
    types.set(asset.assetType, (types.get(asset.assetType) || 0) + 1)
  })

  const total = assets.length
  return Array.from(types.entries()).map(([type, count]) => ({
    type: type as any,
    count,
    percentage: Math.round((count / total) * 100),
  }))
}

function getAssetsByManufacturer(assets: AssetWithHealthStatus[]) {
  const manufacturers = new Map<string, number>()

  assets.forEach((asset) => {
    manufacturers.set(asset.manufacturer, (manufacturers.get(asset.manufacturer) || 0) + 1)
  })

  const total = assets.length
  return Array.from(manufacturers.entries())
    .map(([manufacturer, count]) => ({
      manufacturer,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

function getAssetsBySupportStatus(assets: AssetWithHealthStatus[]) {
  const active = assets.filter((a) => a.daysUntilEndOfSupport > 90).length
  const endingSoon = assets.filter((a) => a.daysUntilEndOfSupport > 0 && a.daysUntilEndOfSupport <= 90).length
  const ended = assets.filter((a) => a.daysUntilEndOfSupport <= 0).length

  const total = assets.length
  return [
    { status: 'active' as const, count: active, percentage: Math.round((active / total) * 100) },
    { status: 'ending-soon' as const, count: endingSoon, percentage: Math.round((endingSoon / total) * 100) },
    { status: 'ended' as const, count: ended, percentage: Math.round((ended / total) * 100) },
  ]
}

export async function getHealthTrends(days: number = 30) {
  const { data: assets, error } = await supabase.from('assets').select('created_at, lastDateOfSupport')

  if (error) throw error

  const now = new Date()
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  const trends = []
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]

    const criticalCount = (assets || []).filter((a) => {
      const supportEnd = new Date(a.lastDateOfSupport)
      const daysUntil = Math.floor((supportEnd.getTime() - date.getTime()) / (24 * 60 * 60 * 1000))
      return daysUntil >= 0 && daysUntil < 30
    }).length

    trends.push({
      date: dateStr,
      critical: criticalCount,
    })
  }

  return trends
}
