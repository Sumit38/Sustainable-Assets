'use client'

import React, { useMemo, useRef, useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker, Sphere, Graticule } from 'react-simple-maps'
import { geoCentroid } from 'd3-geo'

export interface CountryEmissions {
  country: string
  assets: number
  total: number
  kWh: number
  intensity: number
}

type Metric = 'total' | 'kWh' | 'intensity'

const METRICS: Record<Metric, { label: string; unit: string; light: string; dark: string; value: (c: CountryEmissions) => number; format: (v: number) => string }> = {
  total: { label: 'Emissions', unit: 't CO₂e / yr', light: '#fee2e2', dark: '#b91c1c', value: c => c.total, format: v => v.toFixed(v < 10 ? 2 : 1) },
  kWh: { label: 'Electricity', unit: 'MWh / yr', light: '#e0f2fe', dark: '#0369a1', value: c => c.kWh / 1000, format: v => v.toFixed(v < 10 ? 2 : 1) },
  intensity: { label: 'Emissions per MWh', unit: 't CO₂e / MWh', light: '#fef3c7', dark: '#b45309', value: c => c.intensity, format: v => v.toFixed(2) },
}

const ATLAS_NAMES: Record<string, string> = {
  'United States': 'United States of America',
  USA: 'United States of America',
  UK: 'United Kingdom',
  'Czech Republic': 'Czechia',
  UAE: 'United Arab Emirates',
}

function mix(a: string, b: string, t: number) {
  const p = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
  const [x, y] = [p(a), p(b)]
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`
}

export function EmissionsMap({ data }: { data: CountryEmissions[] }) {
  const [metric, setMetric] = useState<Metric>('total')
  const [hover, setHover] = useState<{ c: CountryEmissions; x: number; y: number } | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const m = METRICS[metric]

  const byAtlasName = useMemo(() => new Map(data.map(d => [ATLAS_NAMES[d.country] ?? d.country, d])), [data])
  const max = Math.max(0, ...data.map(m.value))
  const ranked = [...data].sort((a, b) => m.value(b) - m.value(a))

  const onMove = (c: CountryEmissions) => (e: React.MouseEvent) => {
    const r = box.current?.getBoundingClientRect()
    if (r) setHover({ c, x: e.clientX - r.left, y: e.clientY - r.top })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1" role="tablist" aria-label="Map metric">
          {(Object.keys(METRICS) as Metric[]).map(k => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={metric === k}
              onClick={() => setMetric(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${metric === k ? 'bg-primary-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
            >
              {METRICS[k].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>0</span>
          <span className="w-28 h-2.5 rounded-full" style={{ background: `linear-gradient(to right, ${m.light}, ${m.dark})` }} />
          <span>
            {m.format(max)} {m.unit}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div ref={box} className="relative xl:col-span-2 rounded-lg border border-neutral-200 bg-sky-50/40 overflow-hidden">
          <ComposableMap projection="geoEqualEarth" projectionConfig={{ scale: 150 }} width={800} height={400} style={{ width: '100%', height: 'auto' }}>
            <Sphere id="sphere" fill="transparent" stroke="#e2e8f0" strokeWidth={0.5} />
            <Graticule stroke="#e2e8f0" strokeWidth={0.4} />
            <Geographies geography="/maps/countries-50m.json">
              {({ geographies }) => (
                <>
                  {geographies.map(geo => {
                    const d = byAtlasName.get(geo.properties.name)
                    const v = d ? m.value(d) : 0
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseMove={d ? onMove(d) : undefined}
                        onMouseLeave={() => setHover(null)}
                        style={{
                          default: { fill: d ? mix(m.light, m.dark, max > 0 ? v / max : 0) : '#f1f5f9', stroke: '#cbd5e1', strokeWidth: 0.3, outline: 'none' },
                          hover: { fill: d ? m.dark : '#f1f5f9', stroke: '#64748b', strokeWidth: 0.5, outline: 'none' },
                          pressed: { outline: 'none' },
                        }}
                      />
                    )
                  })}
                  {geographies
                    .filter(geo => byAtlasName.has(geo.properties.name))
                    .map(geo => {
                      const d = byAtlasName.get(geo.properties.name)!
                      const v = m.value(d)
                      return (
                        <Marker key={`m-${geo.rsmKey}`} coordinates={geoCentroid(geo) as [number, number]}>
                          <circle
                            r={3 + (max > 0 ? Math.sqrt(v / max) * 9 : 0)}
                            fill={m.dark}
                            fillOpacity={0.55}
                            stroke="#fff"
                            strokeWidth={1}
                            onMouseMove={onMove(d)}
                            onMouseLeave={() => setHover(null)}
                            style={{ cursor: 'pointer' }}
                          />
                        </Marker>
                      )
                    })}
                </>
              )}
            </Geographies>
          </ComposableMap>

          {hover && (
            <div
              className="pointer-events-none absolute z-10 bg-white border border-neutral-200 rounded-lg shadow-lg px-3 py-2 text-xs space-y-0.5"
              style={{ left: Math.min(hover.x + 12, (box.current?.clientWidth ?? 0) - 200), top: hover.y + 12 }}
            >
              <p className="font-semibold text-neutral-900">{hover.c.country}</p>
              <p className="text-neutral-700">{hover.c.assets} assets</p>
              <p className="text-neutral-700">Emissions: {METRICS.total.format(hover.c.total)} t CO₂e / yr</p>
              <p className="text-neutral-700">Electricity: {METRICS.kWh.format(hover.c.kWh / 1000)} MWh / yr</p>
              <p className="text-neutral-700">Per MWh: {hover.c.intensity.toFixed(2)} t CO₂e</p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-neutral-200">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
            {m.label} by country
          </p>
          <ul className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
            {ranked.map(c => {
              const v = m.value(c)
              return (
                <li key={c.country} className="px-3 py-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-neutral-800">{c.country}</span>
                    <span className="font-semibold text-neutral-900 whitespace-nowrap">
                      {m.format(v)} <span className="text-xs font-normal text-neutral-500">{m.unit}</span>
                    </span>
                  </div>
                  <div className="h-1.5 mt-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${max > 0 ? (v / max) * 100 : 0}%`, background: m.dark }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
