'use client'

import React from 'react'
import { Filter, X } from 'lucide-react'
import { ALL, DashboardFilters, EMPTY_FILTERS } from '@/lib/calculations/dashboardInsights'
import { standardLabel } from '@/lib/data/complianceMatrix'

interface FilterBarProps {
  filters: DashboardFilters
  onChange: (f: DashboardFilters) => void
  options: { regions: string[]; standards: string[]; assetTypes: string[]; departments: string[] }
  shown: number
  total: number
}

const FIELDS: Array<{ key: keyof DashboardFilters; label: string; allLabel: string; optionKey: keyof FilterBarProps['options'] }> = [
  { key: 'region', label: 'Region', allLabel: 'All regions', optionKey: 'regions' },
  { key: 'standard', label: 'Regulation', allLabel: 'All regulations', optionKey: 'standards' },
  { key: 'assetType', label: 'Asset type', allLabel: 'All asset types', optionKey: 'assetTypes' },
  { key: 'department', label: 'Department', allLabel: 'All departments', optionKey: 'departments' },
]

export function FilterBar({ filters, onChange, options, shown, total }: FilterBarProps) {
  const active = FIELDS.filter(f => filters[f.key] !== ALL).length

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
          <Filter className="w-4 h-4 text-primary-600" />
          Filter this page
        </p>
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span>
            Showing <strong className="text-neutral-900">{shown}</strong> of {total} assets
          </span>
          {active > 0 && (
            <button
              type="button"
              onClick={() => onChange(EMPTY_FILTERS)}
              className="flex items-center gap-1 text-primary-600 hover:underline font-medium"
            >
              <X className="w-3 h-3" /> Clear {active} filter{active > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {FIELDS.map(f => (
          <label key={f.key} className="block">
            <span className="block text-xs font-medium text-neutral-500 mb-1">{f.label}</span>
            <select
              value={filters[f.key]}
              onChange={e => onChange({ ...filters, [f.key]: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                filters[f.key] !== ALL ? 'border-primary-500 text-primary-700 font-medium' : 'border-neutral-300 text-neutral-900'
              }`}
            >
              <option value={ALL}>{f.allLabel}</option>
              {options[f.optionKey].map(o => (
                <option key={o} value={o}>
                  {f.key === 'standard' ? standardLabel(o) : o}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  )
}
