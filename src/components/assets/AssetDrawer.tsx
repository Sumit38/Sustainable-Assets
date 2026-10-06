'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { ImportedAsset } from '@/lib/calculations/metricCalculator'
import { getApplicableStandards } from '@/lib/data/complianceMatrix'
import { getAssetProfile } from '@/lib/data/assetMaterialDatabase'
import { assetRisk } from '@/lib/calculations/riskModel'
import { COMPLIANCE_THRESHOLD, isPastEndOfLife } from '@/lib/calculations/dashboardInsights'
import { HEALTH_LABEL, Pill } from '@/components/common/ui'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-neutral-100 text-sm">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-neutral-900 text-right">{value ?? <span className="text-neutral-300">Not provided</span>}</dd>
    </div>
  )
}

const money = (n?: number) => (n === undefined ? undefined : `$${n.toLocaleString()}`)

export function AssetDrawer({ asset, onClose }: { asset: ImportedAsset | null; onClose: () => void }) {
  useEffect(() => {
    if (!asset) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [asset, onClose])

  if (!asset) return null
  const past = isPastEndOfLife(asset)
  const health = HEALTH_LABEL[past ? 'end-of-life' : asset.healthStatus]
  const regs = getApplicableStandards(asset.assetType, asset.country)
  const profile = getAssetProfile(asset.assetType)
  const risk = assetRisk(asset)

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label={`Asset ${asset.assetId}`}>
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="relative w-full max-w-md h-full bg-white shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-5 py-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-neutral-500">{asset.assetId}</p>
            <h2 className="text-lg font-semibold text-neutral-900">{asset.productName}</h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Pill tone={health.tone}>{health.label}</Pill>
              <Pill tone={asset.complianceScore < COMPLIANCE_THRESHOLD ? 'danger' : 'success'}>
                Compliance {asset.complianceScore}
              </Pill>
              {profile?.isDLESuitable && <Pill tone="primary">Lithium battery</Pill>}
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-6">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-1">Asset</h3>
            <dl>
              <Row label="Type" value={asset.assetType} />
              <Row label="Manufacturer" value={asset.manufacturer} />
              <Row label="Department" value={asset.department} />
              <Row label="Location" value={[asset.location, asset.country].filter(Boolean).join(', ')} />
              <Row label="Region" value={asset.region} />
              <Row label="Purchased" value={asset.purchaseDate} />
              <Row label="Cost" value={money(asset.cost)} />
            </dl>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-1">Lifecycle & compliance</h3>
            <dl>
              <Row label="Manufactured" value={asset.dateOfManufacture} />
              <Row
                label="Support ends"
                value={<span className={past ? 'text-danger-600 font-medium' : ''}>{asset.lastDateOfSupport}{past && ' (ended)'}</span>}
              />
              <Row
                label="Applicable regulations"
                value={regs.length ? <span className="flex flex-wrap justify-end gap-1">{regs.map(r => <Pill key={r}>{r}</Pill>)}</span> : 'None mapped'}
              />
            </dl>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-1">Predicted compliance risk</h3>
            <div className="flex items-center gap-2 py-2">
              <span className="text-2xl font-bold text-neutral-900">{risk.score}</span>
              <span className="text-sm text-neutral-500">/ 100</span>
              <Pill tone={risk.band === 'High' ? 'danger' : risk.band === 'Medium' ? 'warning' : 'success'}>{risk.band}</Pill>
            </div>
            {risk.reasons.length === 0 ? (
              <p className="text-sm text-neutral-500">No risk signals.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {risk.reasons.map(r => (
                  <li key={r.key} className="flex justify-between gap-3">
                    <span className="text-neutral-700">{r.label}</span>
                    <span className="text-neutral-500 whitespace-nowrap">+{r.points}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-1">Impact data (from your file)</h3>
            <dl>
              <Row label="Employees affected" value={asset.employeesAffected} />
              <Row label="Health issues / year" value={asset.healthIssuesPerYear} />
              <Row label="Annual maintenance" value={money(asset.annualMaintenanceCost)} />
              <Row label="Downtime hours / failure" value={asset.downtimeHoursPerFailure} />
              <Row label="Downtime cost / hour" value={money(asset.downtimeCostPerHour)} />
              <Row label="Replacement cost" value={money(asset.replacementCost)} />
              <Row label="Annual CO₂e" value={asset.annualCO2e === undefined ? undefined : `${asset.annualCO2e} t`} />
            </dl>
          </section>
        </div>
      </aside>
    </div>
  )
}
