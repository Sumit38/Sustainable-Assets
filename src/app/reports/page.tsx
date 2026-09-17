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
  const { importedAssets } = useDashboard()

  // Calculate compliance by type from imported assets
  const complianceByType = useMemo(() => {
    const typeMap = new Map<string, { total: number; sumScore: number }>()
    importedAssets.forEach(asset => {
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
  }, [importedAssets])

  return (
    <div className="w-full">
      <PageHeader title="Reports & Analytics" description="Comprehensive asset health analytics and trends" homeHref="/" />

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
          <CardBody className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div>
                <label className="label">Date Range</label>
                <select
                  className="input"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="last-7-days">Last 7 Days</option>
                  <option value="last-30-days">Last 30 Days</option>
                  <option value="last-90-days">Last 90 Days</option>
                  <option value="last-year">Last Year</option>
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

            <div className="flex gap-2">
              <Button variant="secondary">
                <Calendar className="w-4 h-4" />
                Custom Range
              </Button>
              <Button variant="primary">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button variant="secondary">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Health Trend Chart */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Health Status Trend (Last 8 Months)</h2>
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
            <p className="text-sm text-neutral-600 mt-1">Predicted probability of critical issues and severity levels</p>
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
          {/* Compliance by Type */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Compliance Score by Asset Type</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={complianceByType.length > 0 ? complianceByType : [{type: 'No Data', score: 0}]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="score" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Support End Date Distribution */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Support End Date Distribution</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={REPLACEMENT_COST_PROJECTION}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="days" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        {/* Replacement Cost Projection */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Replacement Cost Projection (Next 5 Quarters)</h2>
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
