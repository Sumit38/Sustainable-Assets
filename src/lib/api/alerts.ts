import { supabase } from '@/lib/db/supabase'
import { Alert, AlertType, AlertSeverity } from '@/types'
import { differenceInDays } from 'date-fns'

export async function fetchAlerts(limit = 50, offset = 0) {
  const { data, error, count } = await supabase
    .from('alerts')
    .select('*', { count: 'exact' })
    .is('resolved_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data: data || [], count: count || 0 }
}

export async function fetchAlertsByAsset(assetId: string) {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('asset_id', assetId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createAlert(
  assetId: string,
  type: AlertType,
  severity: AlertSeverity,
  title: string,
  message: string,
  daysUntilAction: number
): Promise<Alert> {
  const { data, error } = await supabase
    .from('alerts')
    .insert([
      {
        asset_id: assetId,
        type,
        severity,
        title,
        message,
        days_until_action: daysUntilAction,
        created_at: new Date().toISOString(),
        resolved_at: null,
        action_taken: false,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function resolveAlert(id: string, actionTaken: boolean = false): Promise<Alert> {
  const { data, error } = await supabase
    .from('alerts')
    .update({ resolved_at: new Date().toISOString(), action_taken: actionTaken })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAlert(id: string): Promise<void> {
  const { error } = await supabase.from('alerts').delete().eq('id', id)

  if (error) throw error
}

/* Alert Generation */
export async function generateAlertsForAsset(asset: any) {
  const daysUntilEnd = differenceInDays(new Date(asset.lastDateOfSupport), new Date())

  if (daysUntilEnd < 0) {
    await createAlert(
      asset.id,
      'support-ending',
      'critical',
      'Support Ended',
      `Support for ${asset.productName} ended ${Math.abs(daysUntilEnd)} days ago`,
      0
    )
  } else if (daysUntilEnd < 30) {
    await createAlert(
      asset.id,
      'support-ending',
      'critical',
      'Support Ending Soon',
      `Support for ${asset.productName} ends in ${daysUntilEnd} days`,
      daysUntilEnd
    )
  } else if (daysUntilEnd < 90) {
    await createAlert(
      asset.id,
      'support-ending',
      'warning',
      'Support Ending',
      `Support for ${asset.productName} ends in ${daysUntilEnd} days`,
      daysUntilEnd
    )
  }

  if (asset.potentialHealthImpact && asset.potentialHealthImpact.toLowerCase() !== 'no major health risk') {
    const severity = asset.potentialHealthImpact.toLowerCase().includes('pain') ? 'critical' : 'warning'
    await createAlert(
      asset.id,
      'health-risk',
      severity,
      'Health Risk Detected',
      `${asset.productName} has a health risk: ${asset.potentialHealthImpact}`,
      0
    )
  }
}

export async function getAlertStats() {
  const { data: alertData, error } = await supabase.from('alerts').select('severity, resolved_at')

  if (error) throw error

  const stats = {
    total: alertData?.length || 0,
    pending: alertData?.filter((a) => !a.resolved_at).length || 0,
    critical: alertData?.filter((a) => a.severity === 'critical' && !a.resolved_at).length || 0,
    warning: alertData?.filter((a) => a.severity === 'warning' && !a.resolved_at).length || 0,
  }

  return stats
}
