'use client'

import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { useDashboard } from '@/lib/context/dashboardContext'
import { SustainabilityMetrics } from '@/components/dashboard/SustainabilityMetrics'
import { MethaneEmissions } from '@/components/dashboard/MethaneEmissions'
import { AlertTriangle, CheckCircle, TrendingDown, Zap, Flame, AlertCircle } from 'lucide-react'

// Mock data - will be replaced with real data from Supabase
const MOCK_SUSTAINABILITY_DATA = {
  pollutionIndex: 0.72,
  healthScore: 65.5,
  co2eEmissions: 2840,
  eolAssets: 45,
  healthRiskAssets: 78,
  employeesAtRisk: 156,
  recyclingRate: 68,
  avoidedEmissions: 1250,
  alerts: [
    {
      id: '1',
      type: 'POLLUTION_INDEX_CRITICAL',
      severity: 'critical',
      message: '72% of Scope 3 emissions from asset recycling exceed baseline',
      assetCount: 45,
      recommendation: 'Accelerate reuse/refurbishment programs',
    },
    {
      id: '2',
      type: 'ERGONOMIC_RISK_HIGH',
      severity: 'warning',
      message: '78 office chairs over 8 years old posing ergonomic health risks',
      assetCount: 78,
      recommendation: 'Replace or refurbish aging office furniture',
    },
    {
      id: '3',
      type: 'HEALTH_INCIDENTS_PREDICTED',
      severity: 'warning',
      message: 'Predicted 12 musculoskeletal disorder cases this year',
      assetCount: 156,
      recommendation: 'Conduct health risk assessment and ergonomic audit',
    },
    {
      id: '4',
      type: 'RECYCLING_OPPORTUNITY',
      severity: 'info',
      message: '250 assets eligible for reuse - avoid 1,250 kg CO₂e',
      assetCount: 250,
      recommendation: 'Implement asset donation program',
    },
  ],
  topRisks: [
    {
      assetType: 'Office Chairs',
      count: 45,
      co2eImpact: 850,
      healthRisk: 'Musculoskeletal disorders',
      recommendation: 'Immediate replacement with ergonomic alternatives',
    },
    {
      assetType: 'Monitors (8+ years)',
      count: 32,
      co2eImpact: 420,
      healthRisk: 'Eye strain, chemical exposure',
      recommendation: 'Upgrade to modern low-emission monitors',
    },
    {
      assetType: 'Cubicle Systems',
      count: 28,
      co2eImpact: 680,
      healthRisk: 'Air quality degradation',
      recommendation: 'Refurbish or relocate to newer spaces',
    },
  ],
  departmentMetrics: [
    {
      name: 'Engineering',
      totalAssets: 450,
      eolAssets: 12,
      healthRiskScore: 58,
      employeesAtRisk: 45,
    },
    {
      name: 'Sales & Marketing',
      totalAssets: 280,
      eolAssets: 18,
      healthRiskScore: 72,
      employeesAtRisk: 56,
    },
    {
      name: 'Operations',
      totalAssets: 320,
      eolAssets: 15,
      healthRiskScore: 65,
      employeesAtRisk: 55,
    },
  ],
  methaneData: {
    totalMethaneKg: 45.8,
    totalCO2eFromMethane: 1282,
    avoidanceOpportunity: 1282,
    highMethaneAssets: [
      {
        id: '1',
        asset_type: 'Office Chairs (Foam)',
        severity: 'critical' as const,
        escaped_methane_kg: 12.3,
        co2e_equivalent: 344,
        recommendation: 'Prioritize recycling over landfill to save 344kg CO₂e',
      },
      {
        id: '2',
        asset_type: 'Cubicle Padding (Foam)',
        severity: 'high' as const,
        escaped_methane_kg: 8.5,
        co2e_equivalent: 238,
        recommendation: 'Consider reuse or refurbishment to avoid methane emissions',
      },
      {
        id: '3',
        asset_type: 'Sofa Units (Fabric)',
        severity: 'high' as const,
        escaped_methane_kg: 6.2,
        co2e_equivalent: 174,
        recommendation: 'Reuse in office lounges or donate - environmental impact reduced by 95%',
      },
    ],
    materialBreakdown: [
      {
        material: 'Foam',
        methane_kg: 28.5,
        co2e_equivalent: 798,
        asset_count: 12,
      },
      {
        material: 'Fabric',
        methane_kg: 10.2,
        co2e_equivalent: 286,
        asset_count: 8,
      },
      {
        material: 'Wood',
        methane_kg: 4.5,
        co2e_equivalent: 126,
        asset_count: 5,
      },
      {
        material: 'Paper',
        methane_kg: 2.6,
        co2e_equivalent: 73,
        asset_count: 3,
      },
    ],
  },
}

export default function SustainabilityPage() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'alerts' | 'details' | 'methane'>('overview')
  const { importedAssets, calculatedMetrics } = useDashboard()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'danger'
      case 'warning':
        return 'warning'
      default:
        return 'neutral'
    }
  }

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical' || severity === 'warning') {
      return <AlertTriangle className="w-5 h-5" />
    }
    return <CheckCircle className="w-5 h-5" />
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Sustainability & Health Impact"
        description="Environmental emissions and organizational health risk dashboard"
        alerts={MOCK_SUSTAINABILITY_DATA.alerts.filter((a) => a.severity !== 'info').length}
        homeHref="/"
      />

      {importedAssets.length === 0 && (
        <div className="p-6">
          <Card>
            <CardBody className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-neutral-300 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Sustainability Data</h3>
              <p className="text-sm text-neutral-600 mb-6">
                Import asset data from the Dashboard to view sustainability and health impact metrics
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
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-neutral-200 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'alerts', label: `Alerts (${MOCK_SUSTAINABILITY_DATA.alerts.length})` },
            { id: 'methane', label: 'Methane (CH₄)' },
            { id: 'details', label: 'Department Details' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            <SustainabilityMetrics
              pollutionIndex={MOCK_SUSTAINABILITY_DATA.pollutionIndex}
              healthScore={MOCK_SUSTAINABILITY_DATA.healthScore}
              co2eEmissions={MOCK_SUSTAINABILITY_DATA.co2eEmissions}
              eolAssets={MOCK_SUSTAINABILITY_DATA.eolAssets}
              healthRiskAssets={MOCK_SUSTAINABILITY_DATA.healthRiskAssets}
              employeesAtRisk={MOCK_SUSTAINABILITY_DATA.employeesAtRisk}
              recyclingRate={MOCK_SUSTAINABILITY_DATA.recyclingRate}
              avoidedEmissions={MOCK_SUSTAINABILITY_DATA.avoidedEmissions}
            />

            {/* Top Risks */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-danger-600" />
                  Top Asset Risks
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {MOCK_SUSTAINABILITY_DATA.topRisks.map((risk, index) => (
                    <div key={index} className="border border-neutral-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">{risk.assetType}</p>
                          <p className="text-2xl font-bold text-danger-600 mt-1">{risk.count}</p>
                          <p className="text-xs text-neutral-500">Assets</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">CO₂e Impact</p>
                          <p className="text-2xl font-bold text-warning-600 mt-1">{risk.co2eImpact}</p>
                          <p className="text-xs text-neutral-500">kg CO₂e</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">Health Risk</p>
                          <p className="text-sm text-neutral-700 mt-2">{risk.healthRisk}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm font-semibold text-neutral-900 mb-2">Recommendation</p>
                          <p className="text-sm text-neutral-700 bg-primary-50 p-2 rounded">
                            {risk.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Alerts Tab */}
        {selectedTab === 'alerts' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Active Alerts & Recommendations</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {MOCK_SUSTAINABILITY_DATA.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === 'critical'
                        ? 'border-l-danger-600 bg-danger-50'
                        : alert.severity === 'warning'
                          ? 'border-l-warning-600 bg-warning-50'
                          : 'border-l-success-600 bg-success-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-neutral-900">{alert.message}</p>
                            <p className="text-sm text-neutral-600 mt-1">
                              Affects {alert.assetCount} assets
                            </p>
                          </div>
                          <Badge variant={getSeverityColor(alert.severity) as any}>
                            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                          </Badge>
                        </div>
                        <div className="mt-3 p-3 bg-white bg-opacity-60 rounded">
                          <p className="text-sm font-medium text-neutral-700">Action:</p>
                          <p className="text-sm text-neutral-600 mt-1">{alert.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Methane Emissions Tab */}
        {selectedTab === 'methane' && (
          <MethaneEmissions
            methaneByMaterial={MOCK_SUSTAINABILITY_DATA.methaneData.materialBreakdown}
            highMethaneAssets={MOCK_SUSTAINABILITY_DATA.methaneData.highMethaneAssets}
            totalMethaneKg={MOCK_SUSTAINABILITY_DATA.methaneData.totalMethaneKg}
            totalCO2eFromMethane={MOCK_SUSTAINABILITY_DATA.methaneData.totalCO2eFromMethane}
            avoidanceOpportunity={MOCK_SUSTAINABILITY_DATA.methaneData.avoidanceOpportunity}
          />
        )}

        {/* Department Details Tab */}
        {selectedTab === 'details' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Department Sustainability Metrics</h3>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-neutral-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-900">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-900">Total Assets</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-900">EOL Assets</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-900">Health Risk</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-900">At Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_SUSTAINABILITY_DATA.departmentMetrics.map((dept, index) => (
                      <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-3 px-4 font-medium text-neutral-900">{dept.name}</td>
                        <td className="py-3 px-4 text-neutral-700">{dept.totalAssets}</td>
                        <td className="py-3 px-4">
                          <Badge variant="danger">{dept.eolAssets}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-neutral-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  dept.healthRiskScore > 70
                                    ? 'bg-danger-600'
                                    : dept.healthRiskScore > 50
                                      ? 'bg-warning-600'
                                      : 'bg-success-600'
                                }`}
                                style={{ width: `${dept.healthRiskScore}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold">{dept.healthRiskScore}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-neutral-900">
                          {dept.employeesAtRisk}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
      )}
    </div>
  )
}
