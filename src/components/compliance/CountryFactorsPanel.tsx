'use client'

import React from 'react'
import { Scale } from 'lucide-react'
import { useDashboard } from '@/lib/context/dashboardContext'

export function CountryFactorsPanel() {
  const { importedAssets, countryFactors, updateCountryFactors } = useDashboard()
  const countries = Array.from(new Set(importedAssets.map(a => a.country).filter(Boolean))).sort()
  const changed = Object.values(countryFactors).some(v => v !== 1)

  return (
    <section id="country-factors" className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm scroll-mt-28">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary-600" />
          Enforcement likelihood by country
        </h2>
        {changed && (
          <button type="button" onClick={() => updateCountryFactors({})} className="text-sm font-medium text-primary-600 hover:underline">
            Reset all to neutral
          </button>
        )}
      </div>
      <p className="text-sm text-neutral-600 mb-4">
        Used by Risk Prediction to estimate expected fines. <strong>1.0 = neutral</strong>: every country is treated as equally
        likely to enforce. Raise or lower a value only when you have evidence, such as published enforcement statistics or your
        own audit history. Range 0–3.
      </p>
      {countries.length === 0 ? (
        <p className="text-sm text-neutral-500">Upload your asset data to set factors for your countries.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {countries.map(c => {
            const v = countryFactors[c] ?? 1
            return (
              <label key={c} className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${v !== 1 ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'}`}>
                <span className="text-sm text-neutral-800">{c}</span>
                <input
                  type="number"
                  min={0}
                  max={3}
                  step={0.1}
                  value={v}
                  aria-label={`Enforcement factor for ${c}`}
                  onChange={e => {
                    const n = Math.max(0, Math.min(3, parseFloat(e.target.value)))
                    const next = { ...countryFactors }
                    if (isNaN(n) || n === 1) delete next[c]
                    else next[c] = Math.round(n * 10) / 10
                    updateCountryFactors(next)
                  }}
                  className="w-20 rounded-md border border-neutral-300 px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>
            )
          })}
        </div>
      )}
      <p className="text-xs text-neutral-500 mt-3">Saved in this browser for your account.</p>
    </section>
  )
}
