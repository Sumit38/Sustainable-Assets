'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { useDashboard } from '@/lib/context/dashboardContext'
import { isDLESuitable, getAssetProfile } from '@/lib/data/assetMaterialDatabase'
import { TrendingUp, Battery, Droplet, DollarSign, AlertTriangle, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import { DLEMetricCard } from '@/components/dle/DLEMetricCard'

export default function DLEPage() {
  const { importedAssets, calculatedMetrics } = useDashboard()

  // Filter DLE-suitable vs non-DLE assets
  const dleSuitableAssets = importedAssets.filter(asset => isDLESuitable(asset.assetType))
  const nonDLEAssets = importedAssets.filter(asset => !isDLESuitable(asset.assetType))

  // Calculate realistic DLE metrics ONLY for DLE-suitable assets
  const calculateDLEMetrics = () => {
    let totalLithium = 0
    let totalValue = 0
    let totalCO2e = 0

    dleSuitableAssets.forEach(asset => {
      const profile = getAssetProfile(asset.assetType)
      if (profile) {
        const avgLithium = (profile.lithiumContent.min + profile.lithiumContent.max) / 2
        const avgValue = (profile.recoveryValue.min + profile.recoveryValue.max) / 2
        totalLithium += avgLithium
        totalValue += avgValue
        totalCO2e += profile.co2eSavingsVsPrimaryMining
      }
    })

    return {
      totalRecoverableLithium: totalLithium.toFixed(2),
      dleSuitableAssets: dleSuitableAssets.length,
      totalLithiumValue: Math.round(totalValue),
      co2eSavingsVsDLE: totalCO2e,
      dleCandidatePercentage: importedAssets.length > 0 ? ((dleSuitableAssets.length / importedAssets.length) * 100).toFixed(1) : 0,
    }
  }

  const dleMetrics = calculateDLEMetrics()

  // Calculate portfolio composition
  const portfolioComposition = {
    electronics: importedAssets.filter(a => ['Laptop', 'Tablet', 'Smartphone', 'Desktop Computer', 'Monitor', 'Server', 'UPS System', 'Network Router'].includes(a.assetType)).length,
    furniture: importedAssets.filter(a => ['Chair', 'Table', 'Desk', 'Filing Cabinet', 'Cubicle System'].includes(a.assetType)).length,
    other: importedAssets.filter(a => !['Laptop', 'Tablet', 'Smartphone', 'Desktop Computer', 'Monitor', 'Server', 'UPS System', 'Network Router', 'Chair', 'Table', 'Desk', 'Filing Cabinet', 'Cubicle System'].includes(a.assetType)).length,
  }

  // ===== SCENARIO 1: No assets imported =====
  if (importedAssets.length === 0) {
    return (
      <div className="w-full">
        <PageHeader
          title="Asset Recovery Analytics"
          description="Optimize your asset portfolio with DLE and alternative recovery strategies"
          homeHref="/welcome"
        />
        <div className="p-6 max-w-6xl">
          <Card className="bg-blue-50 border-blue-200">
            <CardBody className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Assets Uploaded</h3>
              <p className="text-sm text-neutral-600 mb-6">
                Upload your asset inventory to see recovery opportunities including DLE analytics, refurbishment options, and more.
              </p>
              <Link href="/dashboard">
                <Button variant="primary">Go to Dashboard & Import Assets</Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  // ===== SCENARIO 2: Only non-DLE assets (No DLE-suitable items) =====
  if (dleSuitableAssets.length === 0) {
    return (
      <div className="w-full">
        <PageHeader
          title="Asset Recovery Analytics"
          description="Optimize your asset portfolio with alternative recovery strategies"
          homeHref="/welcome"
        />
        <div className="p-6 space-y-6 max-w-6xl">
          {/* Alert: No DLE-suitable assets */}
          <Card className="bg-warning-50 border-warning-200">
            <CardBody>
              <div className="flex gap-4">
                <AlertTriangle className="w-6 h-6 text-warning-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-warning-900 mb-2">ℹ️ No DLE-Suitable Assets Detected</h3>
                  <p className="text-sm text-warning-800 mb-2">
                    Your portfolio consists of <strong>{portfolioComposition.furniture} furniture items</strong> and <strong>{portfolioComposition.other} other assets</strong>.
                    Direct Lithium Extraction is not applicable to your current asset mix.
                  </p>
                  <p className="text-sm text-warning-800">
                    However, you still have significant recovery opportunities through alternative pathways!
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Portfolio Composition */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Your Asset Composition</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                  <p className="text-sm text-neutral-600 mb-2">Electronics</p>
                  <p className="text-3xl font-bold text-neutral-900">{portfolioComposition.electronics}</p>
                  <p className="text-xs text-neutral-500">{((portfolioComposition.electronics / importedAssets.length) * 100).toFixed(0)}% of portfolio</p>
                </div>
                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                  <p className="text-sm text-neutral-600 mb-2">Furniture</p>
                  <p className="text-3xl font-bold text-neutral-900">{portfolioComposition.furniture}</p>
                  <p className="text-xs text-neutral-500">{((portfolioComposition.furniture / importedAssets.length) * 100).toFixed(0)}% of portfolio</p>
                </div>
                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                  <p className="text-sm text-neutral-600 mb-2">Other Assets</p>
                  <p className="text-3xl font-bold text-neutral-900">{portfolioComposition.other}</p>
                  <p className="text-xs text-neutral-500">{((portfolioComposition.other / importedAssets.length) * 100).toFixed(0)}% of portfolio</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Empty DLE Cards (Greyed out) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 opacity-50">
            <Card>
              <CardBody>
                <p className="text-xs text-neutral-500 mb-2">Recoverable Lithium</p>
                <p className="text-3xl font-bold text-neutral-300">—</p>
                <p className="text-xs text-neutral-400">Not applicable</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-xs text-neutral-500 mb-2">DLE-Suitable Assets</p>
                <p className="text-3xl font-bold text-neutral-300">0</p>
                <p className="text-xs text-neutral-400">None detected</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-xs text-neutral-500 mb-2">DLE Recovery Value</p>
                <p className="text-3xl font-bold text-neutral-300">$0</p>
                <p className="text-xs text-neutral-400">Not applicable</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-xs text-neutral-500 mb-2">CO₂e Savings (DLE)</p>
                <p className="text-3xl font-bold text-neutral-300">—</p>
                <p className="text-xs text-neutral-400">Not applicable</p>
              </CardBody>
            </Card>
          </div>

          {/* Alternative Recovery Strategies */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">💰 Alternative Recovery Strategies</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="p-4 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-neutral-900">Refurbishment</h4>
                      <p className="text-sm text-neutral-600">Extend asset lifecycle through refurbishment and resale</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">${portfolioComposition.furniture * 40}</p>
                      <p className="text-xs text-neutral-500">{portfolioComposition.furniture} assets</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-neutral-900">Donation</h4>
                      <p className="text-sm text-neutral-600">Partner with NGOs for charitable furniture donation programs</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">Tax Deduction</p>
                      <p className="text-xs text-neutral-500">+Social Impact</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-neutral-900">Scrap Metal Recovery</h4>
                      <p className="text-sm text-neutral-600">Capture value from metal components in furniture</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-warning-600">${portfolioComposition.furniture * 15}</p>
                      <p className="text-xs text-neutral-500">Metal recovery</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Recommendation */}
          <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <CardHeader>
              <h3 className="text-lg font-semibold text-primary-900">📊 Next Steps</h3>
            </CardHeader>
            <CardBody className="space-y-2 text-sm text-primary-900">
              <p>✓ Focus on REFURBISHMENT: Extend asset lifecycle through refurbishment programs</p>
              <p>✓ DONATE: Partner with NGOs for furniture donation and get tax benefits</p>
              <p>✓ SCRAP RECOVERY: Capture value from metal components</p>
              <p>✓ If you acquire electronics in future, DLE will become applicable</p>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  // ===== SCENARIO 3: Mixed portfolio OR DLE-suitable assets =====
  return (
    <div className="w-full">
      <PageHeader
        title="Asset Recovery Analytics"
        description="Maximize recovery value with DLE and alternative recovery strategies"
        homeHref="/welcome"
      />

      <div className="p-6 space-y-6 max-w-6xl">
        {/* Portfolio Alert if Mixed */}
        {nonDLEAssets.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardBody>
              <p className="text-sm text-blue-800">
                📊 Your portfolio has <strong>{dleSuitableAssets.length} DLE-suitable</strong> asset(s) and <strong>{nonDLEAssets.length} non-DLE</strong> asset(s).
                Below shows recovery strategies for your complete asset mix.
              </p>
            </CardBody>
          </Card>
        )}

        {/* DLE SECTION - Only shows if dleSuitableAssets.length > 0 */}
        {dleSuitableAssets.length > 0 && (
          <>
            {/* DLE Overview */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Battery className="w-8 h-8 text-primary-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary-900 mb-2">DLE (Direct Lithium Extraction)</h3>
                  <p className="text-sm text-primary-800 mb-3">
                    {dleSuitableAssets.length} of your assets are suitable for Direct Lithium Extraction. DLE is a faster, more sustainable alternative to traditional lithium mining, reducing water consumption by 95% and extracting lithium within hours instead of years.
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
                      <p className="text-primary-700">Lower CO₂</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DLE Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <DLEMetricCard
                label="Recoverable Lithium"
                value={dleMetrics.totalRecoverableLithium}
                unit="kg"
                icon={<Battery className="w-8 h-8" />}
                color="success"
                description={`Sum of lithium from ${dleMetrics.dleSuitableAssets} DLE-suitable assets in your portfolio.`}
                calculation="Sum of (asset lithium content min-max average × quantity) for all DLE-suitable assets from materials database. Includes Laptops, Tablets, Smartphones, UPS Systems, and Electric Vehicles."
              />

              <DLEMetricCard
                label="DLE-Suitable Assets"
                value={dleMetrics.dleSuitableAssets}
                unit={`${dleMetrics.dleCandidatePercentage}% of inventory`}
                icon={<CheckCircle className="w-8 h-8" />}
                color="primary"
                description="Assets containing lithium batteries that can be processed through Direct Lithium Extraction."
                calculation="Count of assets where isDLESuitable = true. Includes: Laptops, Tablets, Smartphones, UPS Systems, and Electric Vehicles. Excluded: Monitors, Desktops, Servers, Furniture, and non-battery electronics."
              />

              <DLEMetricCard
                label="DLE Recovery Value"
                value={`$${dleMetrics.totalLithiumValue}`}
                unit="at current rates"
                icon={<DollarSign className="w-8 h-8" />}
                color="warning"
                description="Estimated monetary value recoverable through DLE processing at current market prices."
                calculation="Sum of (asset recovery value min-max average) for all DLE-suitable assets from materials database. Based on lithium market pricing (~$10-15k/kg). Values from: Laptops ($800-1200), Tablets ($200-500), Smartphones ($50-300), UPS Systems ($500-2000), EVs ($5000-15000)."
              />

              <DLEMetricCard
                label="CO₂e Savings"
                value={dleMetrics.co2eSavingsVsDLE}
                unit="kg vs primary mining"
                icon={<Droplet className="w-8 h-8" />}
                color="green"
                description="Carbon emissions prevented by using DLE instead of traditional primary lithium mining."
                calculation="Sum of (asset co2eSavingsVsPrimaryMining) for all DLE-suitable assets. DLE reduces mining emissions by ~95% vs traditional extraction. Also avoids evaporation pond water loss (95% reduction in water consumption)."
              />
            </div>

            {/* DLE-Suitable Assets List */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">✅ DLE-Suitable Assets in Your Portfolio</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {dleSuitableAssets.map(asset => {
                    const profile = getAssetProfile(asset.assetType)
                    return (
                      <div key={asset.assetId} className="p-3 bg-success-50 rounded-lg border border-success-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-neutral-900">{asset.productName}</p>
                            <p className="text-xs text-neutral-600">{asset.assetType}</p>
                          </div>
                          <Badge variant="success">✅ DLE Ready</Badge>
                        </div>
                        {profile && (
                          <div className="mt-2 text-xs text-neutral-600 space-y-1">
                            <p>Est. Lithium: {profile.lithiumContent.min}-{profile.lithiumContent.max}kg</p>
                            <p>Est. Value: ${profile.recoveryValue.min}-${profile.recoveryValue.max}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardBody>
            </Card>
          </>
        )}

        {/* NON-DLE RECOVERY STRATEGIES */}
        {nonDLEAssets.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">
                  🔄 Alternative Recovery Pathways ({nonDLEAssets.length} assets)
                </h3>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-neutral-600 mb-4">
                  While not suitable for DLE, these assets have value through other recovery pathways:
                </p>
                <div className="space-y-3">
                  {nonDLEAssets.map(asset => {
                    const profile = getAssetProfile(asset.assetType)
                    return (
                      <div key={asset.assetId} className="p-3 bg-warning-50 rounded-lg border border-warning-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-neutral-900">{asset.productName}</p>
                            <p className="text-xs text-neutral-600">{asset.assetType}</p>
                          </div>
                          <Badge variant="warning">{profile?.recoveryPathway || 'UNKNOWN'}</Badge>
                        </div>
                        {profile && (
                          <p className="text-xs text-neutral-600">
                            💰 Est. Value: ${profile.recoveryValue.min}-${profile.recoveryValue.max} via {profile.recoveryPathway}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardBody>
            </Card>
          </>
        )}

        {/* Supply Chain Risk Section - Only show if DLE assets exist */}
        {dleSuitableAssets.length > 0 && (
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
        )}

        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-success-50 to-success-100 border-success-200">
          <CardHeader>
            <h3 className="text-lg font-semibold text-success-900">📊 Total Recovery Value</h3>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-bold text-success-600 mb-2">
              ${(dleMetrics.totalLithiumValue + (nonDLEAssets.length * 50)).toLocaleString()}
            </div>
            <p className="text-sm text-success-800">
              Combined value from DLE ({dleSuitableAssets.length} assets) + Alternative pathways ({nonDLEAssets.length} assets)
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
