'use client'

import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { useDashboard } from '@/lib/context/dashboardContext'
import { TrendingUp, Battery, Droplet, DollarSign, AlertTriangle, CheckCircle, Zap } from 'lucide-react'

export default function DLEPage() {
  const { importedAssets, calculatedMetrics } = useDashboard()

  // Mock DLE calculations (would use actual data in production)
  const dleMetrics = {
    totalRecoverableLithium: 45.2, // kg
    dleSuitableAssets: 23,
    totalLithiumValue: 1240,
    co2eSavingsVsDLE: 450, // kg CO2e vs traditional recycling
    timeSensitiveAssets: 8,
    recoverableValue: 3400,
    dleCandidatePercentage: 18.4,
  }

  const dleAssets = [
    {
      id: 'ASSET-001',
      name: 'Laptop - Dell XPS',
      lithiumContent: 0.08,
      currentValue: 12,
      projectedValue2027: 18,
      condition: 'Good',
      timeSensitivity: 'Urgent (12 months)',
      dleSuitable: true,
    },
    {
      id: 'ASSET-002',
      name: 'Smartphone - iPhone 12',
      lithiumContent: 0.11,
      currentValue: 8,
      projectedValue2027: 14,
      condition: 'Fair',
      timeSensitivity: 'Important (18 months)',
      dleSuitable: true,
    },
    {
      id: 'ASSET-003',
      name: 'Tablet - iPad',
      lithiumContent: 0.15,
      currentValue: 15,
      projectedValue2027: 24,
      condition: 'Good',
      timeSensitivity: 'Normal (24+ months)',
      dleSuitable: true,
    },
  ]

  return (
    <div className="w-full">
      <PageHeader
        title="DLE (Direct Lithium Extraction) Analytics"
        description="Optimize asset recovery strategy for maximum environmental & financial impact"
        homeHref="/"
      />

      <div className="p-6 space-y-6 max-w-6xl">
        {/* DLE Overview */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Battery className="w-8 h-8 text-primary-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-primary-900 mb-2">What is DLE?</h3>
              <p className="text-sm text-primary-800 mb-3">
                Direct Lithium Extraction (DLE) is a faster, more sustainable alternative to traditional lithium mining. Using engineered systems (sorbents, membranes, solvents), DLE can extract lithium from brine within hours instead of 2 years, reducing water consumption by 95% and enabling processing of geothermal fluids, oilfield wastewater, and recycled materials.
              </p>
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="font-semibold text-primary-900">95%</span>
                  <p className="text-primary-700">Less water</p>
                </div>
                <div>
                  <span className="font-semibold text-primary-900">Hours</span>
                  <p className="text-primary-700">vs. 2 years</p>
                </div>
                <div>
                  <span className="font-semibold text-primary-900">73%</span>
                  <p className="text-primary-700">Lower CO₂ footprint</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-2">Recoverable Lithium</p>
                  <p className="text-3xl font-bold text-primary-600">{dleMetrics.totalRecoverableLithium}</p>
                  <p className="text-xs text-neutral-500 mt-1">kg from current inventory</p>
                </div>
                <Battery className="w-8 h-8 text-primary-300" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-2">DLE Suitable Assets</p>
                  <p className="text-3xl font-bold text-success-600">{dleMetrics.dleSuitableAssets}</p>
                  <p className="text-xs text-neutral-500 mt-1">({dleMetrics.dleCandidatePercentage}% of inventory)</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success-300" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-2">Recovery Value (Current)</p>
                  <p className="text-3xl font-bold text-warning-600">${dleMetrics.totalLithiumValue}</p>
                  <p className="text-xs text-neutral-500 mt-1">at current market rates</p>
                </div>
                <DollarSign className="w-8 h-8 text-warning-300" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-2">CO₂e Savings (vs. Primary)</p>
                  <p className="text-3xl font-bold text-green-600">{dleMetrics.co2eSavingsVsDLE}</p>
                  <p className="text-xs text-neutral-500 mt-1">kg CO₂e avoided</p>
                </div>
                <Droplet className="w-8 h-8 text-green-300" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Supply Chain Risk Section */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-600" />
              Supply Chain Risk & Market Dynamics
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-l-4 border-l-danger-500 pl-4">
                <h4 className="font-semibold text-neutral-900 mb-2">Lithium Supply Concentration</h4>
                <p className="text-2xl font-bold text-danger-600 mb-1">72%</p>
                <p className="text-sm text-neutral-600 mb-3">Sourced from China/South America</p>
                <p className="text-xs text-neutral-500">
                  High geopolitical risk. Internal recovery through DLE reduces dependency.
                </p>
              </div>

              <div className="border-l-4 border-l-warning-500 pl-4">
                <h4 className="font-semibold text-neutral-900 mb-2">Price Trajectory (12-month)</h4>
                <p className="text-2xl font-bold text-warning-600 mb-1">+18-24%</p>
                <p className="text-sm text-neutral-600 mb-3">Expected lithium price increase</p>
                <p className="text-xs text-neutral-500">
                  Projected growth driven by EV adoption & battery demand expansion.
                </p>
              </div>

              <div className="border-l-4 border-l-success-500 pl-4">
                <h4 className="font-semibold text-neutral-900 mb-2">DLE Market Maturity</h4>
                <p className="text-2xl font-bold text-success-600 mb-1">2025-2027</p>
                <p className="text-sm text-neutral-600 mb-3">Commercial scale deployment</p>
                <p className="text-xs text-neutral-500">
                  Lilac Solutions, EnergyX, Livent scaling. Optimal recovery window: NOW.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Time-Sensitive Assets */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-danger-600" />
              Time-Sensitive DLE Opportunities
            </h3>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-neutral-600 mb-4">
              Assets with high lithium content approaching end-of-life. Act within optimal window to maximize recovery value.
            </p>
            <div className="space-y-3">
              {dleAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-neutral-900">{asset.name}</h4>
                      {asset.dleSuitable && (
                        <Badge variant="success" className="text-xs">DLE Suitable</Badge>
                      )}
                    </div>
                    <div className="flex gap-4 text-xs text-neutral-600">
                      <span>Lithium: {asset.lithiumContent}kg</span>
                      <span>Current Value: ${asset.currentValue}</span>
                      <span>2027 Value: ${asset.projectedValue2027}</span>
                      <span className="text-warning-700 font-semibold">{asset.timeSensitivity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">${asset.projectedValue2027 - asset.currentValue}</p>
                    <p className="text-xs text-neutral-500">Upside potential</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* DLE Processing Pathways */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">DLE Processing Pathways</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary-600 text-white rounded text-center text-xs font-bold">1</span>
                  Sorbent-Based DLE
                </h4>
                <p className="text-sm text-neutral-600 mb-3">
                  Direct extraction using engineered sorbent materials that selectively capture lithium ions.
                </p>
                <p className="text-xs font-semibold text-primary-600">Technology: Lilac Solutions, EnergyX</p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-warning-600 text-white rounded text-center text-xs font-bold">2</span>
                  Membrane-Based DLE
                </h4>
                <p className="text-sm text-neutral-600 mb-3">
                  Selective membrane separation combined with electrochemical or precipitation methods.
                </p>
                <p className="text-xs font-semibold text-warning-600">Technology: Livent, POSCO</p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-success-600 text-white rounded text-center text-xs font-bold">3</span>
                  Geothermal/Recycled
                </h4>
                <p className="text-sm text-neutral-600 mb-3">
                  DLE processing of geothermal brines, oilfield wastewater, and recycled battery materials.
                </p>
                <p className="text-xs font-semibold text-success-600">Reduces primary mining dependence</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Financial Impact Model */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              DLE ROI Calculator
            </h3>
          </CardHeader>
          <CardBody>
            <div className="bg-neutral-50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary-600">${dleMetrics.recoverableValue}</p>
                  <p className="text-xs text-neutral-600">Total Recovery Value (Current)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning-600">+${Math.round(dleMetrics.recoverableValue * 0.22)}</p>
                  <p className="text-xs text-neutral-600">Projected Gain (22% price increase)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-success-600">${Math.round(dleMetrics.recoverableValue * 0.85)}</p>
                  <p className="text-xs text-neutral-600">After DLE Processing Cost</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-danger-600">${Math.round(dleMetrics.recoverableValue * 0.3)}</p>
                  <p className="text-xs text-neutral-600">vs. Landfill Cost Avoided</p>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <h4 className="font-semibold text-neutral-900 mb-2">Optimal Recovery Window</h4>
                <div className="bg-white rounded p-3 text-sm text-neutral-600">
                  <p className="mb-2">
                    <span className="font-semibold">Recommended Action Timeline:</span>
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>✓ <span className="font-semibold text-success-600">Now-6 months:</span> High-urgency assets (8 units identified)</li>
                    <li>✓ <span className="font-semibold text-warning-600">6-12 months:</span> Standard priority (12 units)</li>
                    <li>✓ <span className="font-semibold text-neutral-600">12+ months:</span> Lower urgency (3 units)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Next Steps */}
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
          <CardHeader>
            <h3 className="text-lg font-semibold text-primary-900">Recommended Next Steps</h3>
          </CardHeader>
          <CardBody className="space-y-2 text-sm text-primary-900">
            <p>1. <span className="font-semibold">Audit your assets:</span> Identify high-value lithium content items approaching EOL</p>
            <p>2. <span className="font-semibold">Partner with DLE provider:</span> Lilac Solutions, EnergyX, or regional partners</p>
            <p>3. <span className="font-semibold">Quantify supply chain risk:</span> Assess lithium concentration dependency (currently 72% China)</p>
            <p>4. <span className="font-semibold">Lock in supply:</span> Secure off-take agreements before prices rise 18-24%</p>
            <p>5. <span className="font-semibold">Track impact:</span> Monitor CO₂e savings and material recovery KPIs quarterly</p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
