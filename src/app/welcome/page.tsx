'use client'

import React, { ReactNode, useMemo } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  ShieldCheck,
  HeartPulse,
  Leaf,
  BatteryCharging,
  Upload,
  FileSpreadsheet,
  LayoutDashboard,
  ArrowRight,
  BookOpen,
} from 'lucide-react'
import { useDashboard } from '@/lib/context/dashboardContext'
import { useAuth } from '@/lib/auth/authContext'
import { computeInsights, formatMoney, formatNumber, ALL } from '@/lib/calculations/dashboardInsights'
import { summariseEmissions } from '@/lib/calculations/emissionsModel'
import { PRODUCT_NAME, TAGLINE } from '@/lib/brand'

const AREAS: Array<{ icon: ReactNode; tone: string; title: string; question: string; href: string }> = [
  { icon: <ShieldCheck className="w-5 h-5" />, tone: 'bg-success-50 text-success-600', title: 'Compliance', question: 'Which regulations apply to our assets, and how compliant are we?', href: '/compliance' },
  { icon: <HeartPulse className="w-5 h-5" />, tone: 'bg-warning-50 text-warning-600', title: 'Employee health', question: 'Who works with worn-out equipment?', href: '/assets?status=poor' },
  { icon: <Leaf className="w-5 h-5" />, tone: 'bg-primary-50 text-primary-600', title: 'Sustainability', question: 'What do over-used assets emit, and what would replacing them save?', href: '/sustainability' },
  { icon: <BatteryCharging className="w-5 h-5" />, tone: 'bg-sky-50 text-sky-600', title: 'Lithium recovery', question: 'How much lithium can retiring devices return?', href: '/dle' },
]

const ROLES: Array<{ role: string; start: Array<{ label: string; href: string }> }> = [
  { role: 'Operations leader', start: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Alerts', href: '/alerts' }] },
  { role: 'Finance', start: [{ label: 'Reports', href: '/reports' }, { label: 'Score Library', href: '/score-library' }] },
  { role: 'Sustainability / ESG', start: [{ label: 'Sustainability', href: '/sustainability' }, { label: 'DLE Analytics', href: '/dle' }] },
  { role: 'Risk & compliance', start: [{ label: 'Compliance', href: '/compliance' }, { label: 'Risk Justification', href: '/risk-justification' }] },
  { role: 'Asset / facilities manager', start: [{ label: 'Assets', href: '/assets' }, { label: 'Alerts', href: '/alerts' }] },
  { role: 'Sustainability analyst', start: [{ label: 'Sustainability', href: '/sustainability' }, { label: 'Logic Library', href: '/logic-library' }] },
]

export default function WelcomePage() {
  const { importedAssets } = useDashboard()
  const { user } = useAuth()
  const hasData = importedAssets.length > 0
  const ins = useMemo(() => (hasData ? computeInsights(importedAssets, ALL) : null), [hasData, importedAssets])
  const em = useMemo(() => (hasData ? summariseEmissions(importedAssets) : null), [hasData, importedAssets])
  const name = user?.email?.split('@')[0]

  return (
    <div className="min-h-screen bg-neutral-50">
      <section className="bg-gradient-to-b from-primary-50 to-neutral-50 border-b border-neutral-200">
        <div className="page-header max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-primary-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </span>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{PRODUCT_NAME}</p>
              <p className="text-sm font-medium text-primary-700">{TAGLINE}</p>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mt-8">{name ? `Welcome, ${name}` : 'Welcome'}</h1>
          <p className="text-neutral-600 mt-2 max-w-2xl">
            {hasData
              ? `Your register of ${formatNumber(importedAssets.length)} assets is loaded. Here's where things stand, and where to go next.`
              : 'Upload your asset register and AssetPulse shows your compliance position, the people and emissions affected by ageing assets, and what replacing them would change.'}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {hasData && ins && em ? (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Your portfolio at a glance</h2>
              <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
                Open dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Compliance rate', value: `${ins.compliance.complianceRate}%`, sub: `${formatMoney(ins.compliance.fineExposure)} potential fines`, href: '/compliance' },
                { label: 'Employees exposed', value: formatNumber(ins.health.employees.total), sub: `${ins.health.poorConditionCount} assets in poor condition`, href: '/assets?status=poor' },
                {
                  label: 'Emissions after replacement',
                  value: em.replaceableNow.total > 0 ? `${Math.round(((em.replaceableAfter.total - em.replaceableNow.total) / em.replaceableNow.total) * 100)}%` : '—',
                  sub: `for ${em.replaceable.length} over-used assets`,
                  href: '/sustainability',
                },
                { label: 'Lithium recoverable', value: `${ins.lithium.lithiumKg.toFixed(2)} kg`, sub: `from ${ins.lithium.lithiumAssets} retiring devices`, href: '/dle' },
              ].map(k => (
                <Link key={k.label} href={k.href} className="rounded-xl bg-white border border-neutral-200 p-4 shadow-sm hover:shadow-md hover:border-neutral-300 transition">
                  <p className="text-sm text-neutral-600">{k.label}</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{k.value}</p>
                  <p className="text-xs text-neutral-500 mt-1">{k.sub}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Get started in three steps</h2>
            <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: <FileSpreadsheet className="w-5 h-5" />,
                  title: 'Download the template',
                  text: 'The Extended template adds employee, cost, power and emissions columns for richer results.',
                  action: <a href="/Asset_Template_Extended.csv" download className="text-sm font-medium text-primary-600 hover:underline">Download Extended template</a>,
                },
                {
                  icon: <Upload className="w-5 h-5" />,
                  title: 'Upload your register',
                  text: 'Fill in what you know. Required columns cover asset type, location, support dates and compliance score.',
                  action: <Link href="/dashboard" className="text-sm font-medium text-primary-600 hover:underline">Upload on the Dashboard</Link>,
                },
                {
                  icon: <LayoutDashboard className="w-5 h-5" />,
                  title: 'Explore the four areas',
                  text: 'Compliance, employee health, sustainability and lithium recovery, filtered by region, regulation and team.',
                  action: <Link href="/dashboard" className="text-sm font-medium text-primary-600 hover:underline">Open Dashboard</Link>,
                },
              ].map((s, i) => (
                <li key={s.title} className="rounded-xl bg-white border border-neutral-200 p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">{s.icon}</span>
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Step {i + 1}</span>
                  </div>
                  <h3 className="font-semibold text-neutral-900 mt-3">{s.title}</h3>
                  <p className="text-sm text-neutral-600 mt-1">{s.text}</p>
                  <div className="mt-3">{s.action}</div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">What {PRODUCT_NAME} answers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AREAS.map(a => (
              <Link key={a.title} href={a.href} className="group flex items-start gap-4 rounded-xl bg-white border border-neutral-200 p-5 shadow-sm hover:shadow-md hover:border-neutral-300 transition">
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${a.tone}`}>{a.icon}</span>
                <span className="flex-1">
                  <span className="block font-semibold text-neutral-900">{a.title}</span>
                  <span className="block text-sm text-neutral-600 mt-1">{a.question}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 mt-1" />
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-1">Start here for your role</h2>
          <p className="text-sm text-neutral-600 mb-4">The two pages most useful to each team. Everything else is one click away in the menu.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES.map(r => (
              <div key={r.role} className="rounded-xl bg-white border border-neutral-200 p-4 shadow-sm">
                <p className="font-medium text-neutral-900">{r.role}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {r.start.map(s => (
                    <Link key={s.href} href={s.href} className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:border-primary-500 hover:text-primary-700">
                      {s.label} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-primary-600 mt-0.5" />
            <p className="text-sm text-neutral-700">
              <strong>Every number is traceable.</strong> Each figure is labelled as coming from your file, reference data or a fixed rule, and every formula is in the Logic Library.
            </p>
          </div>
          <Link href="/logic-library" className="text-sm font-medium text-primary-600 hover:underline whitespace-nowrap">
            Open Logic Library →
          </Link>
        </section>
      </div>
    </div>
  )
}
