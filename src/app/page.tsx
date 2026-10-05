'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  ShieldCheck,
  HeartPulse,
  Leaf,
  BatteryCharging,
  Upload,
  Cpu,
  ListChecks,
  Factory,
  Building2,
  Stethoscope,
  Truck,
  Zap,
  Eye,
  ArrowRight,
  FileSpreadsheet,
  Globe2,
  Scale,
  CheckCircle2,
} from 'lucide-react'
import { PRODUCT_NAME, TAGLINE } from '@/lib/brand'

const btnPrimary =
  'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
const btnGhost =
  'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-neutral-300 bg-white text-neutral-800 font-semibold hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500'

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="max-w-3xl mb-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary-600 mb-2">{eyebrow}</p>
      <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">{title}</h2>
      {sub && <p className="text-lg text-neutral-600 mt-3">{sub}</p>}
    </div>
  )
}

const PILLARS: Array<{ icon: ReactNode; tone: string; title: string; question: string; answer: string }> = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    tone: 'bg-success-50 text-success-600',
    title: 'Compliance',
    question: 'Which regulations do our assets fall under, and how compliant are we?',
    answer: 'Compliance rate by region, regulation and department, with the possible fines under each country’s law if gaps aren’t closed.',
  },
  {
    icon: <HeartPulse className="w-6 h-6" />,
    tone: 'bg-warning-50 text-warning-600',
    title: 'Employee health',
    question: 'Who is working with worn-out equipment?',
    answer: 'Employees exposed to assets in poor condition, so replacements that affect people come first.',
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    tone: 'bg-primary-50 text-primary-600',
    title: 'Sustainability',
    question: 'What do over-used assets cost the planet, and what would replacing them save?',
    answer: 'Scope 1, 2 and 3 emissions and electricity, today versus after replacement, plus landfill methane.',
  },
  {
    icon: <BatteryCharging className="w-6 h-6" />,
    tone: 'bg-sky-50 text-sky-600',
    title: 'Lithium recovery',
    question: 'How much lithium can our retiring devices return?',
    answer: 'Recoverable lithium from laptops, tablets, phones and UPS units, and the mining emissions it avoids.',
  },
]

const STEPS = [
  {
    icon: <Upload className="w-5 h-5" />,
    title: 'Upload your asset register',
    text: 'Use the CSV template: asset type, location, support dates and compliance score. Add optional columns for employees, costs, power and emissions to unlock more insight.',
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    title: 'AssetPulse connects the dots',
    text: 'Each asset is checked for end of support, mapped to the regulations of its type and region, and given its Scope 1/2/3 footprint and lithium content.',
  },
  {
    icon: <ListChecks className="w-5 h-5" />,
    title: 'Act on one shared picture',
    text: 'Prioritised alerts, a replacement plan with predicted savings, a justification workflow for exceptions and a printable executive report.',
  },
]

const VERTICALS = [
  { icon: <Factory className="w-5 h-5" />, name: 'Manufacturing' },
  { icon: <Building2 className="w-5 h-5" />, name: 'Facilities & real estate' },
  { icon: <Stethoscope className="w-5 h-5" />, name: 'Healthcare networks' },
  { icon: <Truck className="w-5 h-5" />, name: 'Logistics' },
  { icon: <Zap className="w-5 h-5" />, name: 'Energy & utilities' },
]

const BUYERS = [
  { role: 'COO / Head of Operations', gets: 'Which assets need action now, and where' },
  { role: 'CFO / Finance transformation', gets: 'Replacement budget by quarter and fine exposure' },
  { role: 'Chief Sustainability Officer / ESG', gets: 'Scope 1/2/3 today vs after replacement' },
  { role: 'Chief Risk, Compliance or Facilities Officer', gets: 'Compliance rate by regulation and region' },
]

const CHAMPIONS = [
  { role: 'Asset / facilities manager', gets: 'Full inventory, alerts and replacement list' },
  { role: 'EHS and compliance manager', gets: 'Non-compliant assets and justification workflow' },
  { role: 'Sustainability analyst', gets: 'Emissions by country and transparent formulas' },
  { role: 'Procurement & lifecycle planning', gets: 'End-of-support timeline and recovery routes' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <span className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-white" />
            </span>
            <span className="leading-tight min-w-0">
              <span className="block font-bold">{PRODUCT_NAME}</span>
              <span className="hidden sm:block text-xs text-neutral-500 truncate">{TAGLINE}</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/signin" className="px-4 py-2 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-100">
              Sign in
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 bg-white border border-primary-200 rounded-full px-3 py-1 mb-6">
              <Eye className="w-4 h-4" /> Asset intelligence for multi-site organisations
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              From asset visibility <br className="hidden sm:block" />
              to <span className="text-primary-600">asset intelligence</span>
            </h1>
            <p className="text-lg text-neutral-600 mt-6 max-w-xl">
              {PRODUCT_NAME} turns your asset register into one view of lifecycle risk, compliance, employee health and carbon
              impact, so operations, finance and sustainability teams decide from the same numbers.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/auth/signup" className={btnPrimary}>
                Get started <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#how-it-works" className={btnGhost}>
                See how it works
              </a>
            </div>
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-neutral-600">
              {['Works from a CSV you already have', 'Every number traceable to its source', 'Filters by region, regulation, team'].map(t => (
                <li key={t} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success-600 flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-neutral-900">Dashboard preview</p>
                <span className="text-[11px] font-medium text-neutral-500 bg-neutral-100 rounded-full px-2 py-0.5">Sample data</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <ShieldCheck className="w-4 h-4" />, tone: 'text-warning-600 bg-warning-50', label: 'Compliance', value: '79%', sub: 'assets meet target' },
                  { icon: <HeartPulse className="w-4 h-4" />, tone: 'text-warning-600 bg-warning-50', label: 'Employee health', value: '1.2K', sub: 'employees exposed' },
                  { icon: <Leaf className="w-4 h-4" />, tone: 'text-success-600 bg-success-50', label: 'Sustainability', value: '−22%', sub: 'CO₂e after replacement' },
                  { icon: <BatteryCharging className="w-4 h-4" />, tone: 'text-primary-600 bg-primary-50', label: 'Lithium', value: '0.61 kg', sub: 'recoverable now' },
                ].map(c => (
                  <div key={c.label} className="rounded-xl border border-neutral-200 p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-md flex items-center justify-center ${c.tone}`}>{c.icon}</span>
                      <span className="text-xs font-medium text-neutral-600">{c.label}</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">{c.value}</p>
                    <p className="text-xs text-neutral-500">{c.sub}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-neutral-200 p-3">
                <p className="text-xs font-medium text-neutral-600 mb-2">Compliance by region</p>
                {[
                  ['Asia Pacific', 81],
                  ['North America', 80],
                  ['Europe', 78],
                ].map(([r, v]) => (
                  <div key={r as string} className="flex items-center gap-2 text-xs mb-1.5">
                    <span className="w-24 text-neutral-600">{r}</span>
                    <span className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                      <span className="block h-full bg-warning-500 rounded-full" style={{ width: `${v}%` }} />
                    </span>
                    <span className="w-8 text-right font-semibold">{v}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="The problem"
            title="Asset, compliance and sustainability pain show up together"
            sub="In most organisations they’re tracked in different spreadsheets by different teams, so nobody sees the full cost of keeping an asset too long."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <FileSpreadsheet className="w-6 h-6" />,
                title: 'Assets outlive their support',
                text: 'Equipment stays in service after vendor support ends: no security patches, more failures, and no plan for what replaces it.',
              },
              {
                icon: <Scale className="w-6 h-6" />,
                title: 'Audit evidence is scattered',
                text: 'Which regulations apply to which asset, in which country, is rarely in one place, so exposure is only discovered during an audit.',
              },
              {
                icon: <Globe2 className="w-6 h-6" />,
                title: 'Carbon reporting misses the asset estate',
                text: 'Emissions from old, inefficient equipment and its disposal are hard to quantify, and so are the savings from replacing it.',
              },
            ].map(p => (
              <div key={p.title} className="rounded-xl border border-neutral-200 p-6">
                <span className="w-11 h-11 rounded-lg bg-danger-50 text-danger-600 flex items-center justify-center">{p.icon}</span>
                <h3 className="text-lg font-semibold mt-4">{p.title}</h3>
                <p className="text-neutral-600 mt-2">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 lg:py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="What you get"
            title="One upload. Answers in four areas."
            sub="Each answer comes with filters by region, regulation, asset type and department, and a drill-down to the individual assets behind it."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PILLARS.map(p => (
              <div key={p.title} className="rounded-xl bg-white border border-neutral-200 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className={`w-11 h-11 rounded-lg flex items-center justify-center ${p.tone}`}>{p.icon}</span>
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                </div>
                <p className="mt-4 font-medium text-neutral-900">“{p.question}”</p>
                <p className="mt-2 text-neutral-600">{p.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 lg:py-20 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="How it works" title="From spreadsheet to decision in three steps" />
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-xl border border-neutral-200 p-6">
                <span className="absolute -top-3 left-6 text-xs font-bold text-white bg-primary-600 rounded-full px-2.5 py-1">Step {i + 1}</span>
                <span className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mt-2">{s.icon}</span>
                <h3 className="text-lg font-semibold mt-4">{s.title}</h3>
                <p className="text-neutral-600 mt-2">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-16 lg:py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Who it’s for"
            title="Built for mid-size and large organisations"
            sub="Multiple sites, large asset inventories, formal audit processes and sustainability targets."
          />
          <div className="flex flex-wrap gap-3 mb-10">
            {VERTICALS.map(v => (
              <span key={v.name} className="inline-flex items-center gap-2 rounded-full bg-white border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800">
                <span className="text-primary-600">{v.icon}</span>
                {v.name}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { title: 'For leadership', list: BUYERS },
              { title: 'For the teams who run it day to day', list: CHAMPIONS },
            ].map(g => (
              <div key={g.title} className="rounded-xl bg-white border border-neutral-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">{g.title}</h3>
                <ul className="divide-y divide-neutral-100">
                  {g.list.map(b => (
                    <li key={b.role} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="font-medium text-neutral-900">{b.role}</span>
                      <span className="text-sm text-neutral-600 sm:text-right">{b.gets}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <SectionHeader
              eyebrow="Transparent by design"
              title="No black box. Every figure shows where it came from."
              sub="Auditors and ESG teams need to defend numbers, not just see them. AssetPulse labels every input and publishes every formula."
            />
          </div>
          <div className="rounded-xl border border-neutral-200 p-6 space-y-4">
            {[
              { tag: 'From your file', tone: 'bg-success-50 text-success-700', text: 'Your own values always come first: compliance scores, employees, costs, power and emissions.' },
              { tag: 'Reference data', tone: 'bg-primary-50 text-primary-700', text: 'Published fines, national grid factors and typical device specifications fill gaps, clearly labelled.' },
              { tag: 'Fixed rule', tone: 'bg-neutral-100 text-neutral-700', text: 'Thresholds such as the compliance target are stated openly in the Logic Library.' },
            ].map(r => (
              <div key={r.tag} className="flex gap-3">
                <span className={`h-fit text-[11px] font-semibold rounded-full px-2 py-0.5 whitespace-nowrap ${r.tone}`}>{r.tag}</span>
                <p className="text-neutral-700">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white p-10 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold">Start with the asset register you already have</h2>
            <p className="text-primary-100 mt-4 text-lg max-w-2xl mx-auto">
              Upload it once and see your compliance position, the people and emissions affected by ageing assets, and what replacing them would change.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <Link href="/auth/signup" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-primary-800 font-semibold hover:bg-primary-50">
                Get started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/signin" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-white/40 text-white font-semibold hover:bg-white/10">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-neutral-500">
          <p className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary-600" />
            <span className="font-semibold text-neutral-700">{PRODUCT_NAME}</span> — {TAGLINE}
          </p>
          <p>&copy; {new Date().getFullYear()} {PRODUCT_NAME}</p>
        </div>
      </footer>
    </div>
  )
}
