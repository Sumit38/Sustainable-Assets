'use client'

import React, { useEffect, useState } from 'react'
import { Header } from '@/components/common/Header'
import { Card, CardBody, CardHeader } from '@/components/common/Card'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusIndicator } from '@/components/common/StatusIndicator'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { DashboardMetrics, AssetWithHealthStatus } from '@/types'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Package, AlertTriangle, TrendingUp, Shield } from 'lucide-react'

const HEALTH_COLORS = {
  healthy: '#22c55e',
  'at-risk': '#eab308',
  critical: '#ef4444',
  'end-of-life': '#6b7280',
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardMetrics()
  }, [])

  async function loadDashboardMetrics() {
    try {
      setLoading(true)
      // Mock data for now - will be replaced with actual API call
      const mockMetrics: DashboardMetrics = {
        totalAssets: 500,
        healthyAssets: 250,
        atRiskAssets: 150,
        criticalAssets: 80,
        endOfLifeAssets: 20,
        avgComplianceScore: 78,
        pendingAlerts: 45,
        resolvedAlerts: 123,
        assetsByType: [
          { type: 'Chair', count: 250, percentage: 50 },
          { type: 'Table', count: 150, percentage: 30 },
          { type: 'Cubicle Equipment', count: 100, percentage: 20 },
        ],
        assetsByManufacturer: [
          { manufacturer: 'Godrej Interio', count: 120, percentage: 24 },
          { manufacturer: 'IKEA', count: 100, percentage: 20 },
          { manufacturer: 'Herman Miller', count: 90, percentage: 18 },
          { manufacturer: 'Durian', count: 80, percentage: 16 },
          { manufacturer: 'Featherlite', count: 60, percentage: 12 },
          { manufacturer: 'Zuari', count: 40, percentage: 8 },
          { manufacturer: 'Nilkamal', count: 10, percentage: 2 },
        ],
        assetsBySupportStatus: [
          { status: 'active', count: 350, percentage: 70 },
          { status: 'ending-soon', count: 130, percentage: 26 },
          { status: 'ended', count: 20, percentage: 4 },
        ],
      }
      setMetrics(mockMetrics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="w-full p-6">
        <Header title="Dashboard" alerts={0} />
        <div className="p-6 text-center text-danger-600">{error || 'Failed to load metrics'}</div>
      </div>
    )
  }

  const healthData = [
    { name: 'Healthy', value: metrics.healthyAssets, fill: HEALTH_COLORS.healthy },
    { name: 'At Risk', value: metrics.atRiskAssets, fill: HEALTH_COLORS['at-risk'] },
    { name: 'Critical', value: metrics.criticalAssets, fill: HEALTH_COLORS.critical },
    { name: 'End of Life', value: metrics.endOfLifeAssets, fill: HEALTH_COLORS['end-of-life'] },
  ]

  return (
    <div className="w-full">
      <Header title="Dashboard" description="Real-time admin asset health overview" alerts={metrics.pendingAlerts} />

      <div className="p-6 space-y-6">
        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Assets"
            value={metrics.totalAssets}
            icon="📦"
            variant="default"
          />
          <StatCard
            label="Healthy"
            value={metrics.healthyAssets}
            unit="assets"
            icon="✅"
            variant="success"
          />
          <StatCard
            label="Avg Compliance"
            value={`${metrics.avgComplianceScore}%`}
            icon="🛡️"
            variant="warning"
          />
          <StatCard
            label="Pending Alerts"
            value={metrics.pendingAlerts}
            icon="⚠️"
            variant="danger"
          />
        </div>

        {/* Health Overview and Support Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Health Distribution */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Asset Health Distribution</h2>
              <Shield className="w-5 h-5 text-primary-600" />
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={healthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} assets`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Support Status */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Support Status</h2>
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.assetsBySupportStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        {/* Asset Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets by Type */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600" />
                Assets by Type
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {metrics.assetsByType.map((type) => (
                  <div key={type.type}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-700">{type.type}</span>
                      <span className="text-sm text-neutral-600">{type.count} ({type.percentage}%)</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${type.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Top Manufacturers */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Top Manufacturers</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {metrics.assetsByManufacturer.slice(0, 5).map((mfr) => (
                  <div
                    key={mfr.manufacturer}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-neutral-900">{mfr.manufacturer}</p>
                      <p className="text-xs text-neutral-500">{mfr.count} assets</p>
                    </div>
                    <Badge variant="neutral">{mfr.percentage}%</Badge>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">View Critical Assets</Button>
              <Button variant="secondary">Generate Report</Button>
              <Button variant="secondary">Export Data</Button>
              <Button variant="ghost">View Full Alert Log</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
