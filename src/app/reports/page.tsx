'use client'

import React, { useState, useMemo } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { useDashboard } from '@/lib/context/dashboardContext'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Download, Calendar, Filter, AlertCircle } from 'lucide-react'

// Custom Tooltip to handle edge positioning for line charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg z-50">
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Custom Tooltip for bar charts
const BarChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg z-50">
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name || 'Count'}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Mock data for demonstrations - will be replaced with real calculations
const REPLACEMENT_COST_PROJECTION = [
  { quarter: 'Q3 2024', estimated: 50000 },
  { quarter: 'Q4 2024', estimated: 75000 },
  { quarter: 'Q1 2025', estimated: 120000 },
  { quarter: 'Q2 2025', estimated: 180000 },
  { quarter: 'Q3 2025', estimated: 95000 },
]

const ISSUE_PROBABILITY_FORECAST = [
  { month: 'Jan', probability: 5, severity: 2 },
  { month: 'Feb', probability: 8, severity: 3 },
  { month: 'Mar', probability: 12, severity: 4 },
  { month: 'Apr', probability: 18, severity: 6 },
  { month: 'May', probability: 25, severity: 8 },
  { month: 'Jun', probability: 32, severity: 11 },
  { month: 'Jul', probability: 38, severity: 14 },
  { month: 'Aug', probability: 42, severity: 16 },
  { month: 'Sep', probability: 45, severity: 18 },
]

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('last-30-days')
  const [reportType, setReportType] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [activeFilter, setActiveFilter] = useState('last-30-days')
  const { importedAssets } = useDashboard()

  // Helper function to filter assets by date range
  const getFilteredAssets = (assets: any[]) => {
    const now = new Date()
    let filtered = assets

    // Apply date range filter
    if (activeFilter === 'custom' && startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      filtered = filtered.filter(asset => {
        if (!asset.purchaseDate) return true
        const purchaseDate = new Date(asset.purchaseDate)
        return purchaseDate >= start && purchaseDate <= end
      })
    } else if (activeFilter === 'last-7-days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(asset => {
        if (!asset.purchaseDate) return true
        return new Date(asset.purchaseDate) >= sevenDaysAgo
      })
    } else if (activeFilter === 'last-90-days') {
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(asset => {
        if (!asset.purchaseDate) return true
        return new Date(asset.purchaseDate) >= ninetyDaysAgo
      })
    } else if (activeFilter === 'last-year') {
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(asset => {
        if (!asset.purchaseDate) return true
        return new Date(asset.purchaseDate) >= oneYearAgo
      })
    }

    return filtered
  }

  const filteredAssets = useMemo(() => getFilteredAssets(importedAssets), [importedAssets, activeFilter, startDate, endDate])

  // Calculate compliance by type - simple line graph data
  const complianceByType = useMemo(() => {
    const typeMap = new Map<string, { total: number; sumScore: number }>()
    filteredAssets.forEach(asset => {
      const existing = typeMap.get(asset.assetType) || { total: 0, sumScore: 0 }
      typeMap.set(asset.assetType, {
        total: existing.total + 1,
        sumScore: existing.sumScore + asset.complianceScore,
      })
    })
    return Array.from(typeMap.entries())
      .map(([type, data]) => ({
        type,
        score: Math.round(data.sumScore / data.total),
      }))
      .sort((a, b) => b.score - a.score)
  }, [filteredAssets])

  // Calculate support end date distribution (grouped by ranges)
  const supportEndDateDistribution = useMemo(() => {
    const now = new Date()
    const ranges = {
      '0-30 days': { min: 0, max: 30, count: 0 },
      '30-60 days': { min: 30, max: 60, count: 0 },
      '60-90 days': { min: 60, max: 90, count: 0 },
      '90-180 days': { min: 90, max: 180, count: 0 },
      '180+ days': { min: 180, max: Infinity, count: 0 },
    }

    filteredAssets.forEach(asset => {
      if (asset.lastDateOfSupport) {
        const supportDate = new Date(asset.lastDateOfSupport)
        const daysUntil = Math.floor((supportDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        for (const [range, data] of Object.entries(ranges)) {
          if (daysUntil >= data.min && daysUntil < data.max) {
            data.count++
            break
          }
        }
      }
    })

    return Object.entries(ranges).map(([range, data]) => ({
      days: range,
      count: data.count,
    }))
  }, [filteredAssets])

  return (
    <div className="w-full">
      <PageHeader title="Reports & Analytics" description="Comprehensive asset health analytics and trends" homeHref="/welcome" />

      {importedAssets.length === 0 && (
        <div className="p-6">
          <Card>
            <CardBody className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-neutral-300 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Data Available</h3>
              <p className="text-sm text-neutral-600 mb-6">
                Import asset data from the Dashboard to generate reports and analytics
              </p>
              <Button variant="primary" onClick={() => window.location.href = '/'}>
                Go to Dashboard
              </Button>
            </CardBody>
          </Card>
        </div>
      )}

      {importedAssets.length > 0 && (
      <div className="p-6 space-y-6">
        {/* Report Controls */}
        <Card>
          <CardBody>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div>
                  <label className="label">Date Range</label>
                  <select
                    className="input"
                    value={dateRange}
                    onChange={(e) => {
                      setDateRange(e.target.value)
                      setActiveFilter(e.target.value)
                      if (e.target.value !== 'custom') {
                        document.getElementById('dateRangeCollapse')?.classList.add('hidden')
                      }
                    }}
                  >
                    <option value="last-7-days">Last 7 Days</option>
                    <option value="last-30-days">Last 30 Days</option>
                    <option value="last-90-days">Last 90 Days</option>
                    <option value="last-year">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                <div>
                  <label className="label">Report Type</label>
                  <select
                    className="input"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="all">All Assets</option>
                    <option value="chairs">Chairs Only</option>
                    <option value="tables">Tables Only</option>
                    <option value="cubicles">Cubicle Equipment</option>
                  </select>
                </div>
              </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant="secondary"
                onClick={() => {
                  const customRange = document.getElementById('dateRangeCollapse')
                  if (customRange) customRange.classList.toggle('hidden')
                }}
              >
                <Calendar className="w-4 h-4" />
                Custom Range
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const htmlContent = document.querySelector('.p-6')?.innerHTML || ''
                  const printWindow = window.open('', '', 'width=800,height=600')
                  if (printWindow) {
                    printWindow.document.write(`
                      <html><head><title>Asset Health Report</title>
                      <style>body { font-family: Arial; margin: 20px; }</style>
                      </head><body>${htmlContent}</body></html>
                    `)
                    printWindow.document.close()
                    printWindow.print()
                  }
                }}
              >
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  // Export all imported assets as CSV
                  const headers = ['Asset ID', 'Asset Type', 'Product Name', 'Health Status', 'Compliance Score', 'Country', 'Region', 'Cost']
                  const rows = importedAssets.map(asset => [
                    asset.assetId,
                    asset.assetType,
                    asset.productName,
                    asset.healthStatus,
                    asset.complianceScore.toString(),
                    asset.country,
                    asset.region,
                    asset.cost ? asset.cost.toString() : '0',
                  ])
                  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `assets-export-${new Date().toISOString().split('T')[0]}.csv`
                  a.click()
                }}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
            </div>

            {/* Custom Date Range Picker - Hidden by default */}
            <div id="dateRangeCollapse" className="hidden border-t border-neutral-200 pt-4 mt-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div>
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    className="input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input
                    type="date"
                    className="input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (startDate && endDate) {
                      setActiveFilter('custom')
                    } else {
                      alert('Please select both start and end dates')
                    }
                  }}
                >
                  Apply Filter
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Master Guide Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-blue-900">📊 Understanding This Report</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Probability Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <h3 className="font-semibold text-neutral-900">Probability</h3>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  <strong>Meaning:</strong> Likelihood (0-100%) that an asset will fail or experience critical issues.
                </p>
                <p className="text-xs text-neutral-600 mt-2">Higher % = greater risk of equipment breakdown or performance failure.</p>
              </div>

              {/* Severity Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <h3 className="font-semibold text-neutral-900">Severity</h3>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  <strong>Meaning:</strong> Impact level (0-20+) of a failure if it occurs.
                </p>
                <p className="text-xs text-neutral-600 mt-2">Higher score = greater business disruption, higher replacement cost, or compliance risk.</p>
              </div>

              {/* Combined Risk Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-orange-500 rounded"></div>
                  <h3 className="font-semibold text-neutral-900">Combined Risk</h3>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  <strong>Meaning:</strong> When both metrics are HIGH, action is urgent.
                </p>
                <p className="text-xs text-neutral-600 mt-2">High probability + High severity = critical assets requiring immediate replacement or repair.</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>💡 How to use:</strong> Use the charts below to identify trends. When probability and severity both rise together, budget for replacements. When only probability rises but severity is low, consider preventive maintenance instead.
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Health Trend Chart */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Health Status Trend (Last 8 Months)</h2>
            <div className="mt-3 space-y-2">
              <p className="text-sm text-neutral-700">
                <span className="font-semibold">What this shows:</span> The trend of asset health degradation over the past 8 months, showing two key metrics:
              </p>
              <div className="ml-4 space-y-2 text-sm text-neutral-600">
                <p><span className="inline-block w-3 h-3 bg-red-500 rounded mr-2"></span><strong>Probability (Red Line):</strong> Likelihood (0-100%) that a critical issue will occur. Higher percentage = greater risk of equipment failure.</p>
                <p><span className="inline-block w-3 h-3 bg-orange-500 rounded mr-2"></span><strong>Severity (Orange Line):</strong> Scale of potential impact (0-20+) if an issue occurs. Higher number = more damage or disruption to business.</p>
              </div>
              <p className="text-xs text-neutral-500 mt-2">💡 Tip: Both lines trending upward indicates increasing risk and urgency for asset replacement or maintenance.</p>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={ISSUE_PROBABILITY_FORECAST}>
                <defs>
                  <linearGradient id="colorHealthy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAtRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Severity', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="probability"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="severity"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: '#f97316', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Issue Probability Forecast */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Issue Probability Forecast (Next 9 Months)</h2>
            <div className="mt-3 space-y-2">
              <p className="text-sm text-neutral-700">
                <span className="font-semibold">What this shows:</span> Predictive analysis of how asset issues will evolve over the next 9 months, with two critical metrics:
              </p>
              <div className="ml-4 space-y-2 text-sm text-neutral-600">
                <p><span className="inline-block w-3 h-3 bg-red-500 rounded mr-2"></span><strong>Issue Probability (%):</strong> The percentage chance (0-100%) that critical asset failures or performance issues will occur each month. Based on asset age, health status, and historical failure patterns.</p>
                <p><span className="inline-block w-3 h-3 bg-orange-500 rounded mr-2"></span><strong>Severity Score:</strong> The potential impact level (scale 0-20+) if issues occur. Considers business continuity impact, recovery time, and financial loss.</p>
              </div>
              <div className="bg-warning-50 border border-warning-200 rounded p-2 mt-2">
                <p className="text-xs text-warning-800"><strong>⚠️ Action Required:</strong> When both probability AND severity are rising, it indicates urgent need for preventive maintenance or asset replacement to avoid critical failures.</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={ISSUE_PROBABILITY_FORECAST}>
                <defs>
                  <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Severity Score', angle: 90, position: 'insideRight' }} />
                <Tooltip formatter={(value) => value} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="probability"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Issue Probability (%)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="severity"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ fill: '#f97316', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Severity Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compliance Score by Asset Type - Line Graph */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Compliance Score by Asset Type</h2>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-neutral-700">
                  <span className="font-semibold">What this shows:</span> How well each type of asset meets regulatory requirements (EPA, GDPR, RoHS, OSHA, ISO 27001).
                </p>
                <p className="text-sm text-neutral-600">
                  <strong>Compliance Score (0-100%):</strong> Higher scores indicate better adherence to regulations. A declining trend suggests assets are falling out of compliance and require attention.
                </p>
                <p className="text-xs text-neutral-500">💡 Scores below 70% indicate regulatory risk and potential fines. Priority assets should reach 90%+ compliance.</p>
              </div>
            </CardHeader>
            <CardBody>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width={complianceByType.length > 0 ? Math.max(400, complianceByType.length * 80) : 400} height={300}>
                  <LineChart data={complianceByType.length > 0 ? complianceByType : [{type: 'No Data', score: 0}]}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="type"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ strokeDasharray: '3 3' }}
                      wrapperStyle={{ outline: 'none' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      dot={{ fill: '#0ea5e9', r: 6 }}
                      activeDot={{ r: 8 }}
                      name="Compliance Score"
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* Support End Date Distribution */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Support End Date Distribution</h2>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-neutral-700">
                  <span className="font-semibold">What this shows:</span> When vendor support ends for assets in your inventory. Assets without active support pose security and compliance risks.
                </p>
                <div className="ml-4 space-y-1 text-sm text-neutral-600">
                  <p><strong>Active Support:</strong> Assets still receiving vendor updates and security patches (lowest risk).</p>
                  <p><strong>Support Ending Soon:</strong> Assets losing support within 12 months (medium risk - requires planning).</p>
                  <p><strong>Support Ended:</strong> Assets beyond end-of-life (highest risk - vulnerable to security breaches).</p>
                </div>
                <p className="text-xs text-neutral-500 mt-2">⚠️ Assets without support should be prioritized for replacement to maintain security compliance.</p>
              </div>
            </CardHeader>
            <CardBody>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width={Math.max(400, supportEndDateDistribution.length * 80)} height={300}>
                  <BarChart data={supportEndDateDistribution.length > 0 ? supportEndDateDistribution : [{days: 'No Data', count: 0}]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="days" tick={{ fontSize: 12 }} />
                    <YAxis label={{ value: 'Asset Count', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      content={<BarChartTooltip />}
                      cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                      wrapperStyle={{ outline: 'none' }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Replacement Cost Projection */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Replacement Cost Projection (Next 5 Quarters)</h2>
            <div className="mt-3 space-y-2">
              <p className="text-sm text-neutral-700">
                <span className="font-semibold">What this shows:</span> Estimated capital expenditure needed to replace aging or failing assets over the next 15 months.
              </p>
              <p className="text-sm text-neutral-600">
                <strong>Projected Cost per Quarter:</strong> Based on asset age, health status, and remaining useful life. Peaks indicate quarters when multiple critical assets require replacement.
              </p>
              <p className="text-xs text-neutral-500 mt-2">💡 Use this forecast for budget planning. Peaks in spending can be smoothed through preventive maintenance or phased replacement strategies.</p>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={REPLACEMENT_COST_PROJECTION}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="estimated"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={{ fill: '#0ea5e9', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Key Insights</h2>
              <p className="text-sm text-neutral-600 mt-2">
                <span className="font-semibold">What this section tells you:</span> Critical observations from all data above. These are the most important trends and patterns affecting your asset portfolio that require your attention.
              </p>
            </CardHeader>
            <CardBody>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold mt-0.5">•</span>
                  <span className="text-sm">
                    Critical assets increasing by 2-3 per month over last 8 months
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold mt-0.5">•</span>
                  <span className="text-sm">
                    Tables have highest compliance score (85%) vs Cubicles (68%)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold mt-0.5">•</span>
                  <span className="text-sm">
                    200 assets will require replacement in 90-180 days
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold mt-0.5">•</span>
                  <span className="text-sm">
                    Q1 2025 projected replacement cost of $120k
                  </span>
                </li>
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Recommendations</h2>
              <p className="text-sm text-neutral-600 mt-2">
                <span className="font-semibold">What this section tells you:</span> Prioritized action items based on the data and insights above. Actions are ranked by urgency (from <span className="inline-block px-2 py-1 bg-danger-50 text-danger-700 text-xs rounded font-medium">CRITICAL</span> to <span className="inline-block px-2 py-1 bg-info-50 text-info-700 text-xs rounded font-medium">INFO</span>).
              </p>
            </CardHeader>
            <CardBody>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Badge variant="warning">ACTION</Badge>
                  <span className="text-sm">
                    Review 45 assets with support ending in 0-30 days immediately
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="warning">BUDGET</Badge>
                  <span className="text-sm">
                    Allocate $600k+ budget for Q1-Q2 2025 replacements
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="warning">HEALTH</Badge>
                  <span className="text-sm">
                    Prioritize cubicle equipment for replacement (lowest compliance)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="warning">PLANNING</Badge>
                  <span className="text-sm">
                    Establish 120-day replacement lead time for vendor negotiations
                  </span>
                </li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
      )}
    </div>
  )
}
