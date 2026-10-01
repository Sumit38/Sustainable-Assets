'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Plus, X, Check, Ban, CheckCheck, Search } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Kpi, NoData, Panel, Pill, Empty, PillTone, buttonStyles } from '@/components/common/ui'
import { InfoTip } from '@/components/common/InfoTip'
import { useDashboard } from '@/lib/context/dashboardContext'
import { useAuth } from '@/lib/auth/authContext'
import { COMPLIANCE_STANDARDS, ComplianceStandard, Region, getApplicableStandards } from '@/lib/data/complianceMatrix'
import { COMPLIANCE_THRESHOLD } from '@/lib/calculations/dashboardInsights'

type Status = 'pending' | 'approved' | 'rejected' | 'remediated'

interface Justification {
  id: string
  standard: ComplianceStandard
  assetIds: string[]
  reason: string
  impact: string
  mitigation: string
  plan: string
  targetDate: string
  owner: string
  status: Status
  createdAt: string
  decidedAt?: string
}

const REASONS: Partial<Record<ComplianceStandard, string[]>> = {
  GDPR: ['Legacy system awaiting data migration', 'Third-party vendor dependency being resolved', 'Replacement hardware on order'],
  RoHS: ['Component replacement in progress with supplier', 'Inventory phase-out scheduled', 'Supplier certification pending'],
  EPA: ['Disposal contractor being onboarded', 'Emissions remediation scheduled', 'Regulatory extension requested'],
  OSHA: ['Replacement equipment being procured', 'Hazard controls being implemented', 'Phased safety rollout under way'],
  'ISO 27001': ['Audit scheduled with remediation plan', 'Access-control migration in progress', 'Policy framework being implemented'],
  'PCI DSS': ['Payment system transition in progress', 'Network segmentation under way', 'Audit findings being remediated'],
  HIPAA: ['Infrastructure upgrade in phases', 'Vendor certification pending', 'Security controls being redesigned'],
  'SOC 2': ['Control documentation being completed', 'Monitoring system being implemented'],
  NIST: ['Framework adoption in phases', 'Budget approved, roadmap prepared'],
  CE: ['Conformity re-assessment scheduled', 'Replacement units on order'],
}
const GENERIC_REASONS = ['Budget approved for replacement next cycle', 'Business continuity requires temporary use']
const IMPACTS = ['Critical: operations at risk', 'High: impact within 90 days', 'Medium: impact within 6–12 months', 'Low: manageable long-term']
const MITIGATIONS = [
  'Compensating controls in place and monitored',
  'Access restricted / isolated from critical systems',
  'Enhanced monitoring and alerting',
  'Risk accepted by executive management',
  'Insurance coverage (risk transfer)',
  'No mitigation: risk acknowledged',
]

const STATUS: Record<Status, { label: string; tone: PillTone }> = {
  pending: { label: 'Pending approval', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  remediated: { label: 'Remediated', tone: 'primary' },
}

const EMPTY_FORM = { standard: '', assetIds: [] as string[], reason: '', impact: '', mitigation: '', plan: '', targetDate: '', owner: '' }
const field = 'w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500'
const label = 'block text-xs font-medium text-neutral-600 mb-1'

export default function RiskJustificationPage() {
  const { importedAssets } = useDashboard()
  const { user } = useAuth()
  const storageKey = `assetpulse-justifications-${user?.id ?? 'guest'}`
  const [items, setItems] = useState<Justification[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [assetQuery, setAssetQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(storageKey) || '[]'))
    } catch {
      setItems([])
    }
  }, [storageKey])

  const save = (next: Justification[]) => {
    setItems(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {}
  }

  const nonCompliantByStd = useMemo(() => {
    const m = new Map<ComplianceStandard, string[]>()
    for (const a of importedAssets) {
      if (a.complianceScore >= COMPLIANCE_THRESHOLD) continue
      for (const s of getApplicableStandards(a.assetType, a.region as Region)) m.set(s, [...(m.get(s) ?? []), a.assetId])
    }
    return m
  }, [importedAssets])

  const coverage = Array.from(nonCompliantByStd.entries())
    .map(([std, ids]) => {
      const covered = new Set(
        items.filter(j => j.standard === std && j.status !== 'rejected').flatMap(j => (j.assetIds.length ? j.assetIds : ids))
      )
      return { std, total: ids.length, covered: ids.filter(id => covered.has(id)).length }
    })
    .sort((a, b) => b.total - b.covered - (a.total - a.covered))

  const candidates = form.standard ? nonCompliantByStd.get(form.standard as ComplianceStandard) ?? [] : []
  const shownCandidates = candidates.filter(id => id.toLowerCase().includes(assetQuery.toLowerCase()))
  const today = new Date().toISOString().slice(0, 10)
  const isOverdue = (j: Justification) => (j.status === 'pending' || j.status === 'approved') && j.targetDate < today

  const submit = () => {
    if (!form.standard || !form.reason || !form.targetDate || !form.owner.trim()) {
      setError('Regulation, justification, target date and owner are required.')
      return
    }
    save([
      { id: crypto.randomUUID(), ...form, standard: form.standard as ComplianceStandard, owner: form.owner.trim(), status: 'pending', createdAt: new Date().toISOString() },
      ...items,
    ])
    setForm(EMPTY_FORM)
    setAssetQuery('')
    setError(null)
    setShowForm(false)
  }

  const setStatus = (id: string, status: Status) =>
    save(items.map(j => (j.id === id ? { ...j, status, decidedAt: new Date().toISOString() } : j)))

  const remove = (id: string) => {
    if (window.confirm('Delete this justification? This cannot be undone.')) save(items.filter(j => j.id !== id))
  }

  const visible = items.filter(j => statusFilter === 'all' || j.status === statusFilter)
  const uncovered = coverage.reduce((s, c) => s + (c.total - c.covered), 0)

  return (
    <div className="w-full">
      <PageHeader
        title="Risk Justification"
        description="Document why non-compliant assets are temporarily accepted, who owns the fix, and by when"
        homeHref="/welcome"
      />

      <div className="p-6 space-y-6">
        {importedAssets.length === 0 && items.length === 0 ? (
          <NoData what="which regulations need a justification" />
        ) : (
          <>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <Kpi label="Pending approval" value={items.filter(j => j.status === 'pending').length.toString()} tone="text-warning-600" />
              <Kpi label="Approved" value={items.filter(j => j.status === 'approved').length.toString()} tone="text-success-600" />
              <Kpi
                label="Overdue"
                value={items.filter(isOverdue).length.toString()}
                tone="text-danger-600"
                sub="past target date, not remediated"
              />
              <Kpi
                label="Not yet justified"
                value={uncovered.toString()}
                sub="non-compliant asset × regulation pairs"
                info="For each regulation, non-compliant assets that no pending or approved justification covers. A justification with no assets selected covers all of them."
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Panel title="Coverage by regulation" info="How many non-compliant assets under each regulation already have a justification." className="xl:col-span-1">
                {coverage.length === 0 ? (
                  <Empty>No non-compliant assets in your data.</Empty>
                ) : (
                  <ul className="space-y-3">
                    {coverage.map(c => (
                      <li key={c.std}>
                        <div className="flex justify-between text-sm mb-1">
                          <button
                            type="button"
                            className="font-medium text-neutral-900 hover:text-primary-700"
                            onClick={() => {
                              setForm({ ...EMPTY_FORM, standard: c.std })
                              setShowForm(true)
                            }}
                          >
                            {c.std}
                          </button>
                          <span className="text-neutral-500">
                            {c.covered} / {c.total}
                          </span>
                        </div>
                        <div className="h-2 bg-danger-50 rounded-full overflow-hidden">
                          <div className="h-full bg-success-500" style={{ width: `${(c.covered / c.total) * 100}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <div className="xl:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1">
                    {(['all', 'pending', 'approved', 'rejected', 'remediated'] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === s ? 'bg-primary-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                      >
                        {s === 'all' ? `All (${items.length})` : `${STATUS[s].label} (${items.filter(j => j.status === s).length})`}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <InfoTip title="Where is this saved?" align="right">
                      Justifications are saved in this browser for your account. To share them with your team they need a database table;
                      ask and it can be added.
                    </InfoTip>
                    <button type="button" className={buttonStyles.primary} onClick={() => setShowForm(s => !s)}>
                      {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {showForm ? 'Cancel' : 'New justification'}
                    </button>
                  </div>
                </div>

                {showForm && (
                  <section className="bg-white border-2 border-primary-500/40 rounded-xl p-5 shadow-sm space-y-4">
                    <h2 className="font-semibold text-neutral-900">New justification</h2>
                    {error && <p className="text-sm text-danger-700 bg-danger-50 rounded-lg px-3 py-2">{error}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="block">
                        <span className={label}>Regulation *</span>
                        <select
                          className={field}
                          value={form.standard}
                          onChange={e => setForm({ ...form, standard: e.target.value, assetIds: [], reason: '' })}
                        >
                          <option value="">Select…</option>
                          {(Object.keys(COMPLIANCE_STANDARDS) as ComplianceStandard[]).map(s => (
                            <option key={s} value={s}>
                              {COMPLIANCE_STANDARDS[s].name}
                              {nonCompliantByStd.get(s) ? ` · ${nonCompliantByStd.get(s)!.length} non-compliant` : ''}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className={label}>Justification *</span>
                        <select className={field} value={form.reason} disabled={!form.standard} onChange={e => setForm({ ...form, reason: e.target.value })}>
                          <option value="">Select…</option>
                          {[...(REASONS[form.standard as ComplianceStandard] ?? []), ...GENERIC_REASONS].map(r => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {form.standard && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={label}>
                            Affected assets ({form.assetIds.length ? `${form.assetIds.length} selected` : `all ${candidates.length} non-compliant`})
                          </span>
                          {form.assetIds.length > 0 && (
                            <button type="button" className="text-xs text-primary-600 hover:underline" onClick={() => setForm({ ...form, assetIds: [] })}>
                              Clear selection
                            </button>
                          )}
                        </div>
                        {candidates.length === 0 ? (
                          <p className="text-sm text-neutral-500">No non-compliant assets under this regulation.</p>
                        ) : (
                          <div className="border border-neutral-200 rounded-lg">
                            <div className="relative border-b border-neutral-200">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                              <input
                                value={assetQuery}
                                onChange={e => setAssetQuery(e.target.value)}
                                placeholder="Filter asset IDs…"
                                aria-label="Filter asset IDs"
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-t-lg focus:outline-none"
                              />
                            </div>
                            <div className="max-h-40 overflow-y-auto p-2 grid grid-cols-2 sm:grid-cols-4 gap-1">
                              {shownCandidates.map(id => (
                                <label key={id} className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-neutral-50">
                                  <input
                                    type="checkbox"
                                    checked={form.assetIds.includes(id)}
                                    onChange={e =>
                                      setForm({ ...form, assetIds: e.target.checked ? [...form.assetIds, id] : form.assetIds.filter(x => x !== id) })
                                    }
                                  />
                                  {id}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-neutral-500 mt-1">Leave empty to cover every non-compliant asset under this regulation.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="block">
                        <span className={label}>Risk if not fixed</span>
                        <select className={field} value={form.impact} onChange={e => setForm({ ...form, impact: e.target.value })}>
                          <option value="">Select…</option>
                          {IMPACTS.map(o => <option key={o}>{o}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className={label}>Current mitigation</span>
                        <select className={field} value={form.mitigation} onChange={e => setForm({ ...form, mitigation: e.target.value })}>
                          <option value="">Select…</option>
                          {MITIGATIONS.map(o => <option key={o}>{o}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className={label}>Target fix date *</span>
                        <input type="date" className={field} value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} />
                      </label>
                      <label className="block">
                        <span className={label}>Owner *</span>
                        <input className={field} placeholder="e.g. IT Security, Facilities" value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} />
                      </label>
                    </div>
                    <label className="block">
                      <span className={label}>Remediation plan</span>
                      <textarea className={`${field} min-h-20`} placeholder="Steps to bring these assets into compliance…" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} />
                    </label>
                    <div className="flex justify-end gap-2">
                      <button type="button" className={buttonStyles.secondary} onClick={() => setShowForm(false)}>Cancel</button>
                      <button type="button" className={buttonStyles.primary} onClick={submit}>Submit for approval</button>
                    </div>
                  </section>
                )}

                {visible.length === 0 ? (
                  <div className="bg-white border border-neutral-200 rounded-xl shadow-sm">
                    <Empty>
                      {items.length === 0 ? 'No justifications yet. Start with a regulation in the coverage list.' : 'None with this status.'}
                    </Empty>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {visible.map(j => {
                      const overdue = isOverdue(j)
                      return (
                        <li key={j.id} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-neutral-900">{COMPLIANCE_STANDARDS[j.standard]?.name ?? j.standard}</h3>
                                <Pill tone={STATUS[j.status].tone}>{STATUS[j.status].label}</Pill>
                                {overdue && <Pill tone="danger">Overdue</Pill>}
                              </div>
                              <p className="text-sm text-neutral-700 mt-1">{j.reason}</p>
                            </div>
                            <p className="text-xs text-neutral-500">Created {new Date(j.createdAt).toLocaleDateString()}</p>
                          </div>
                          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                            <div><dt className="text-xs text-neutral-500">Assets</dt><dd className="text-neutral-900">{j.assetIds.length ? j.assetIds.length : 'All non-compliant'}</dd></div>
                            <div><dt className="text-xs text-neutral-500">Owner</dt><dd className="text-neutral-900">{j.owner}</dd></div>
                            <div><dt className="text-xs text-neutral-500">Target date</dt><dd className={overdue ? 'text-danger-600 font-medium' : 'text-neutral-900'}>{j.targetDate}</dd></div>
                            <div><dt className="text-xs text-neutral-500">Risk</dt><dd className="text-neutral-900">{j.impact || '—'}</dd></div>
                          </dl>
                          {(j.mitigation || j.plan) && (
                            <div className="mt-3 text-sm text-neutral-600 space-y-1">
                              {j.mitigation && <p><span className="text-neutral-500">Mitigation:</span> {j.mitigation}</p>}
                              {j.plan && <p><span className="text-neutral-500">Plan:</span> {j.plan}</p>}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-neutral-100">
                            {j.status === 'pending' && (
                              <>
                                <button type="button" onClick={() => setStatus(j.id, 'approved')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-success-50 text-success-700 hover:bg-success-500 hover:text-white">
                                  <Check className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button type="button" onClick={() => setStatus(j.id, 'rejected')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-danger-50 text-danger-700 hover:bg-danger-500 hover:text-white">
                                  <Ban className="w-3.5 h-3.5" /> Reject
                                </button>
                              </>
                            )}
                            {j.status === 'approved' && (
                              <button type="button" onClick={() => setStatus(j.id, 'remediated')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white">
                                <CheckCheck className="w-3.5 h-3.5" /> Mark remediated
                              </button>
                            )}
                            <button type="button" onClick={() => remove(j.id)} className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:bg-neutral-100">
                              Delete
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
