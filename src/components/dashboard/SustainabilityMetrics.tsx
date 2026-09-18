'use client'

import React from 'react'
import { Card, CardBody, CardHeader } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { AlertTriangle, Leaf, Heart, Zap, TrendingUp, Wind } from 'lucide-react'

const COLORS = {
  primary: '#2563eb',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  critical: '#991b1b',
}

interface SustainabilityMetricsProps {
  pollutionIndex: number
  healthScore: number
  co2eEmissions: number
  eolAssets: number
  healthRiskAssets: number
  employeesAtRisk: number
  recyclingRate: number
  avoidedEmissions: number
}

export function SustainabilityMetrics({
  pollutionIndex,
  healthScore,
  co2eEmissions,
  eolAssets,
  healthRiskAssets,
  employeesAtRisk,
  recyclingRate,
  avoidedEmissions,
}: SustainabilityMetricsProps) {
  const getPollutionStatus = (index: number) => {
    if (index > 0.8) return { label: 'Critical', color: COLORS.critical, badgeVariant: 'danger' as const }
    if (index > 0.6) return { label: 'High', color: COLORS.danger, badgeVariant: 'warning' as const }
    if (index > 0.4) return { label: 'Medium', color: COLORS.warning, badgeVariant: 'warning' as const }
    return { label: 'Low', color: COLORS.success, badgeVariant: 'success' as const }
  }

  const getHealthStatus = (score: number) => {
    if (score < 40) return { label: 'Critical', badgeVariant: 'danger' as const }
    if (score < 60) return { label: 'At Risk', badgeVariant: 'warning' as const }
    if (score < 80) return { label: 'Moderate', badgeVariant: 'warning' as const }
    return { label: 'Healthy', badgeVariant: 'success' as const }
  }

  const pollutionStatus = getPollutionStatus(pollutionIndex)
  const healthStatus = getHealthStatus(healthScore)

  const emissionData = [
    { name: 'Actual', value: co2eEmissions },
    { name: 'Avoided (Reuse)', value: avoidedEmissions },
  ]

  const riskDistribution = [
    { name: 'Healthy Assets', value: 100 - healthRiskAssets - eolAssets, fill: COLORS.success },
    { name: 'At-Risk Assets', value: healthRiskAssets, fill: COLORS.warning },
    { name: 'EOL Assets', value: eolAssets, fill: COLORS.danger },
  ]

  return (
    <div className="w-full space-y-6">
      {/* Top Row: Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pollution Index */}
        <Card>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Pollution Index</p>
                <p className="text-3xl font-bold text-neutral-900">{pollutionIndex.toFixed(2)}</p>
                <Badge variant={pollutionStatus.badgeVariant} className="mt-2">
                  {pollutionStatus.label}
                </Badge>
              </div>
              <Wind className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-xs text-neutral-500 mt-3">Global Environmental Index (0-1)</p>
          </CardBody>
        </Card>

        {/* Health Score */}
        <Card>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Health Score</p>
                <p className="text-3xl font-bold text-neutral-900">{healthScore.toFixed(0)}%</p>
                <Badge variant={healthStatus.badgeVariant} className="mt-2">
                  {healthStatus.label}
                </Badge>
              </div>
              <Heart className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-xs text-neutral-500 mt-3">Organizational Well-being</p>
          </CardBody>
        </Card>

        {/* CO₂e Emissions */}
        <Card>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">CO₂e Emissions</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {co2eEmissions >= 1000 ? (co2eEmissions / 1000).toFixed(1) : co2eEmissions.toFixed(0)}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {co2eEmissions >= 1000 ? 'tonnes' : 'kg'}
                </p>
              </div>
              <Zap className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-xs text-neutral-500 mt-3">Total Annual Emissions</p>
          </CardBody>
        </Card>

        {/* Recycling Rate */}
        <Card>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Recycling Rate</p>
                <p className="text-3xl font-bold text-neutral-900">{recyclingRate.toFixed(0)}%</p>
                <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-success-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, recyclingRate)}%` }}
                  />
                </div>
              </div>
              <Leaf className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-xs text-neutral-500 mt-3">Circular Economy Progress</p>
          </CardBody>
        </Card>
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emissions Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Emissions Profile</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={emissionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Asset Risk Distribution */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Asset Health Distribution</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={riskDistribution} cx="50%" cy="50%" labelLine={false} label outerRadius={80} dataKey="value">
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Bottom Row: Risk Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* EOL Assets */}
        <Card className="border-l-4 border-l-danger-500">
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">EOL Assets</p>
                <p className="text-2xl font-bold text-danger-600">{eolAssets}</p>
                <p className="text-xs text-neutral-500 mt-2">Need immediate replacement</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-danger-500" />
            </div>
          </CardBody>
        </Card>

        {/* Health Risk Assets */}
        <Card className="border-l-4 border-l-warning-500">
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Health Risk Assets</p>
                <p className="text-2xl font-bold text-warning-600">{healthRiskAssets}</p>
                <p className="text-xs text-neutral-500 mt-2">Pose health hazards</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-warning-500" />
            </div>
          </CardBody>
        </Card>

        {/* Employees at Risk */}
        <Card className="border-l-4 border-l-primary-500">
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Employees at Risk</p>
                <p className="text-2xl font-bold text-primary-600">{employeesAtRisk}</p>
                <p className="text-xs text-neutral-500 mt-2">From EOL/at-risk assets</p>
              </div>
              <TrendingUp className="w-6 h-6 text-primary-500" />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
