'use client'

import React from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { useDashboard } from '@/lib/context/dashboardContext'
import { AlertCircle, TrendingUp, TrendingDown, Leaf, Users, Shield, Zap } from 'lucide-react'

export default function ScoreLibraryPage() {
  const { importedAssets, calculatedMetrics } = useDashboard()

  if (!calculatedMetrics) {
    return (
      <div className="w-full">
        <PageHeader
          title="Score Library"
          description="All calculated metrics and supplementary scores"
          homeHref="/"
        />
        <div className="p-6">
          <Card>
            <CardBody className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-neutral-300 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Data Available</h3>
              <p className="text-sm text-neutral-600 mb-6">
                Import asset data from the Dashboard to see all calculated scores
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  const scores = [
    {
      category: 'Environmental Impact',
      icon: <Leaf className="w-6 h-6" />,
      color: 'text-green-600',
      metrics: [
        {
          name: 'Global Pollution Index',
          value: calculatedMetrics.globalPollutionIndex,
          unit: '/100',
          range: { min: 0, max: 100 },
          description: 'Comprehensive environmental & compliance score',
          interpretation: calculatedMetrics.globalPollutionIndex === 0
            ? 'Check Console'
            : calculatedMetrics.globalPollutionIndex > 70
            ? 'Critical'
            : calculatedMetrics.globalPollutionIndex > 40
            ? 'Moderate'
            : 'Good',
          note: calculatedMetrics.globalPollutionIndex === 0
            ? 'No replaceable asset found - Organization shows lack of awareness for asset lifecycle management. Import assets with end-of-life dates to calculate GPI.'
            : undefined,
        },
        {
          name: 'Scope 2 Emission Index',
          value: calculatedMetrics.scope2EmissionIndex,
          unit: '/100',
          range: { min: 0, max: 100 },
          description: 'Indirect emissions from electricity & energy',
          note: undefined,
        },
        {
          name: 'Scope 3 Emission Index',
          value: calculatedMetrics.scope3EmissionIndex,
          unit: '/100',
          range: { min: 0, max: 100 },
          description: 'Other indirect emissions (suppliers, waste)',
          note: undefined,
        },
        {
          name: 'Energy Efficiency Index',
          value: calculatedMetrics.energyEfficiencyIndex,
          unit: '/100',
          range: { min: 0, max: 100 },
          description: 'Normalized energy consumption rating',
          note: undefined,
        },
        {
          name: 'Carbon Footprint',
          value: calculatedMetrics.carbonFootprintTonnes,
          unit: 'tonnes CO₂e',
          range: { min: 0, max: null },
          description: 'Annual emissions from all scopes + methane',
          note: undefined,
        },
      ],
    },
    {
      category: 'Organizational Health',
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-600',
      metrics: [
        {
          name: 'Average Asset Health',
          value: calculatedMetrics.averageAssetHealth,
          unit: '%',
          range: { min: 0, max: 100 },
          description: 'Overall health status of asset portfolio (0=Poor, 100=Excellent)',
          note: undefined,
        },
        {
          name: 'Health Risk Percentage',
          value: calculatedMetrics.healthRiskPercentage,
          unit: '%',
          range: { min: 0, max: 100 },
          description: 'Percentage of employees at health risk from aged assets',
          note: undefined,
        },
        {
          name: 'Employees at Health Risk',
          value: calculatedMetrics.employeesAtHealthRisk,
          unit: 'people',
          range: { min: 0, max: null },
          description: 'Estimated count of employees exposed to health hazards',
          note: undefined,
        },
      ],
    },
    {
      category: 'Asset Management',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-orange-600',
      metrics: [
        {
          name: 'Asset Replacement Ratio',
          value: calculatedMetrics.assetReplacementRatio,
          unit: '%',
          range: { min: 0, max: 100 },
          description: 'Percentage of assets needing replacement (critical/EOL)',
          note: undefined,
        },
        {
          name: 'Business Continuity Risk',
          value: calculatedMetrics.businessContinuityRisk,
          unit: 'status',
          range: null,
          description: `Risk level based on critical assets: ${calculatedMetrics.businessContinuityRisk}`,
          note: undefined,
        },
      ],
    },
    {
      category: 'Compliance & Risk',
      icon: <Shield className="w-6 h-6" />,
      color: 'text-red-600',
      metrics: [
        {
          name: 'Global Compliance Violation Rate',
          value: calculatedMetrics.globalComplianceViolationRate,
          unit: '%',
          range: { min: 0, max: 100 },
          description: 'Percentage of assets violating compliance standards',
          note: undefined,
        },
        {
          name: 'Compliance Risk Score',
          value: calculatedMetrics.globalComplianceRiskScore,
          unit: '/100',
          range: { min: 0, max: 100 },
          description: 'Overall compliance risk across all regions and standards',
          note: undefined,
        },
        {
          name: 'Assets Violating Standards',
          value: calculatedMetrics.assetsViolatingStandards,
          unit: 'assets',
          range: { min: 0, max: importedAssets.length },
          description: 'Count of assets not meeting applicable compliance standards',
          note: undefined,
        },
        {
          name: 'Potential Fine Exposure',
          value: calculatedMetrics.potentialFineExposure,
          unit: '$',
          range: { min: 0, max: null },
          description: 'Maximum potential fines from current compliance violations',
          note: undefined,
        },
      ],
    },
    {
      category: 'Financial Impact',
      icon: <Zap className="w-6 h-6" />,
      color: 'text-purple-600',
      metrics: [
        {
          name: 'Annual Cost Savings (Potential)',
          value: calculatedMetrics.annualCostSavings,
          unit: '$',
          range: { min: 0, max: null },
          description: 'Potential savings from preventing failures and optimizing maintenance',
          note: undefined,
        },
        {
          name: 'Investment Required',
          value: calculatedMetrics.investmentRequired,
          unit: '$',
          range: { min: 0, max: null },
          description: 'Capital needed for critical/end-of-life asset replacement',
          note: undefined,
        },
        {
          name: '1-Year Savings',
          value: calculatedMetrics.year1Savings,
          unit: '$',
          range: { min: 0, max: null },
          description: 'Projected first-year savings from asset optimization',
          note: undefined,
        },
        {
          name: 'Payback Period',
          value: calculatedMetrics.paybackPeriodMonths,
          unit: 'months',
          range: { min: 0, max: null },
          description: 'Time to recover investment through operational savings',
          note: undefined,
        },
        {
          name: '3-Year ROI',
          value: calculatedMetrics.threeYearROI,
          unit: '%',
          range: { min: 0, max: null },
          description: 'Return on investment over three-year period',
          note: undefined,
        },
      ],
    },
  ]

  const getScoreColor = (value: any, range: any) => {
    if (typeof value !== 'number' || !range || !range.max) return 'text-neutral-600'

    const percentage = (value / range.max) * 100
    if (percentage > 70) return 'text-red-600'
    if (percentage > 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Score Library"
        description="Comprehensive view of all calculated metrics and supplementary scores"
        homeHref="/"
      />

      <div className="p-6 space-y-6 max-w-6xl">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📚 Score Library Overview</h3>
          <p className="text-sm text-blue-800">
            Below are all calculated metrics organized by category. These scores are computed from
            your imported asset data and provide a comprehensive view of your organization's asset
            health, environmental impact, and compliance status.
          </p>
        </div>

        {scores.map((category, catIdx) => (
          <Card key={catIdx}>
            <CardHeader className="flex items-center gap-3 pb-4 border-b border-neutral-200">
              <div className={category.color}>{category.icon}</div>
              <h2 className="text-xl font-semibold text-neutral-900">{category.category}</h2>
            </CardHeader>

            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.metrics.map((metric, metIdx) => (
                  <div
                    key={metIdx}
                    className="p-4 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-neutral-900">{metric.name}</h4>
                      {metric.range && metric.range.max && (
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(metric.value, metric.range)}`}>
                            {typeof metric.value === 'number'
                              ? metric.value.toFixed(0)
                              : metric.value ?? '0'}
                          </div>
                          {metric.value !== 0 && metric.value !== null && metric.value !== undefined && <span className="text-xs text-neutral-500">{metric.unit}</span>}
                        </div>
                      )}
                      {metric.range && !metric.range.max && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-neutral-900">
                            {typeof metric.value === 'number'
                              ? `$${(metric.value / 1000).toFixed(0)}K`
                              : metric.value ?? '$0K'}
                          </div>
                          {metric.value !== 0 && metric.value !== null && metric.value !== undefined && <span className="text-xs text-neutral-500">{metric.unit}</span>}
                        </div>
                      )}
                      {!metric.range && (
                        <Badge variant="neutral">{metric.value}</Badge>
                      )}
                    </div>

                    <p className="text-sm text-neutral-600 mb-3">{metric.description}</p>

                    {metric.note && (
                      <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                        ℹ️ {metric.note}
                      </div>
                    )}

                    {metric.interpretation && (
                      <div className="inline-block">
                        <Badge
                          variant={
                            metric.interpretation === 'Critical'
                              ? 'danger'
                              : metric.interpretation === 'Moderate'
                                ? 'warning'
                                : metric.interpretation === 'Check Console'
                                ? 'neutral'
                                : 'success'
                          }
                        >
                          {metric.interpretation}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}

        {calculatedMetrics.complianceRiskByRegion && Object.keys(calculatedMetrics.complianceRiskByRegion).length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-neutral-900">Compliance by Region</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(calculatedMetrics.complianceRiskByRegion).map(([region, risk]) => (
                  <div key={region} className="p-4 rounded-lg border border-neutral-200">
                    <h4 className="font-semibold text-neutral-900 mb-2">{region}</h4>
                    <p className="text-sm text-neutral-600">
                      Violations: <span className="font-bold text-neutral-900">{risk}</span>
                    </p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
          <h3 className="font-semibold text-green-900 mb-2">✨ Using These Scores</h3>
          <ul className="space-y-1 text-sm text-green-800">
            <li>• Use the Global Pollution Index as your primary sustainability KPI</li>
            <li>• Monitor Asset Replacement Ratio to plan capital budgets</li>
            <li>• Track Health Risk Percentage to justify employee wellness investments</li>
            <li>• Review Compliance scores to ensure regulatory adherence</li>
            <li>• Use financial metrics to build ROI cases for asset replacement programs</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
