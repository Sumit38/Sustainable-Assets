'use client'

import React, { useState } from 'react'
import { Header } from '@/components/common/Header'
import { Card, CardBody } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
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
  ScatterChart,
  Scatter,
} from 'recharts'
import { Download, Calendar, Filter } from 'lucide-react'

// Mock data
const HEALTH_TREND = [
  { month: 'Jan', healthy: 300, atRisk: 100, critical: 50, endOfLife: 5 },
  { month: 'Feb', healthy: 295, atRisk: 110, critical: 60, endOfLife: 8 },
  { month: 'Mar', healthy: 285, atRisk: 125, critical: 70, endOfLife: 12 },
  { month: 'Apr', healthy: 275, atRisk: 140, critical: 75, endOfLife: 15 },
  { month: 'May', healthy: 265, atRisk: 155, critical: 65, endOfLife: 18 },
  { month: 'Jun', healthy: 255, atRisk: 165, critical: 70, endOfLife: 20 },
  { month: 'Jul', healthy: 250, atRisk: 150, critical: 80, endOfLife: 20 },
  { month: 'Aug', healthy: 250, atRisk: 150, critical: 80, endOfLife: 20 },
]

const COMPLIANCE_BY_TYPE = [
  { type: 'Chair', score: 72 },
  { type: 'Table', score: 85 },
  { type: 'Cubicle Equipment', score: 68 },
]

const SUPPORT_END_DATE_DISTRIBUTION = [
  { days: '0-30', count: 45 },
  { days: '30-90', count: 85 },
  { days: '90-180', count: 120 },
  { days: '180-365', count: 200 },
  { days: '365+', count: 50 },
]

const REPLACEMENT_COST_PROJECTION = [
  { quarter: 'Q3 2024', estimated: 50000 },
  { quarter: 'Q4 2024', estimated: 75000 },
  { quarter: 'Q1 2025', estimated: 120000 },
  { quarter: 'Q2 2025', estimated: 180000 },
  { quarter: 'Q3 2025', estimated: 95000 },
]

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('last-30-days')
  const [reportType, setReportType] = useState('all')

  return (
    <div className="w-full">
      <Header title="Reports & Analytics" description="Comprehensive asset health analytics and trends" />

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
              <AreaChart data={HEALTH_TREND}>
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
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="healthy"
                  stackId="1"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorHealthy)"
                />
                <Area
                  type="monotone"
                  dataKey="atRisk"
                  stackId="1"
                  stroke="#eab308"
                  fillOpacity={1}
                  fill="url(#colorAtRisk)"
                />
                <Area
                  type="monotone"
                  dataKey="critical"
                  stackId="1"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorCritical)"
                />
              </AreaChart>
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
                <BarChart data={COMPLIANCE_BY_TYPE}>
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
                <BarChart data={SUPPORT_END_DATE_DISTRIBUTION}>
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
    </div>
  )
}
