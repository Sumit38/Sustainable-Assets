'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/authContext'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/common/Card'
import { StatCard } from '@/components/dashboard/StatCard'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { BusinessKPI, BusinessImpactCard } from '@/components/dashboard/BusinessKPI'
import { DashboardMetrics, AssetWithHealthStatus, AssetTypeCount, AssetType } from '@/types'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Package, AlertTriangle, TrendingUp, Shield, DollarSign, Users, Leaf, Heart, Zap, Download, Upload, FileText, Bell, File, Check, AlertCircle } from 'lucide-react'
import { exportDashboardToCSV, exportDashboardToPDF } from '@/lib/export/dashboardExport'
import { validateAndProcessCSV } from '@/lib/import/csvProcessor'
import { calculateMetrics, CalculatedMetrics } from '@/lib/calculations/metricCalculator'
import { ImportedAsset } from '@/lib/calculations/metricCalculator'
import { useDashboard } from '@/lib/context/dashboardContext'

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
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const { importedAssets, calculatedMetrics, setDashboardData, loadDashboardData } = useDashboard()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const kpisRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Redirect to landing if not authenticated
    if (!authLoading && !user) {
      router.push('/landing')
      return
    }

    if (user) {
      // Load persisted data from context
      loadDashboardData()
      loadDashboardMetrics()
    }
  }, [authLoading, user, router])

  async function loadDashboardMetrics() {
    try {
      setLoading(true)

      // Calculate asset counts by health status
      const healthy = importedAssets.filter(a => a.healthStatus === 'healthy').length
      const atRisk = importedAssets.filter(a => a.healthStatus === 'at-risk').length
      const critical = importedAssets.filter(a => a.healthStatus === 'critical').length
      const endOfLife = importedAssets.filter(a => a.healthStatus === 'end-of-life').length
      const total = importedAssets.length

      // Calculate asset distribution by type
      const typeMap = new Map<string, number>()
      importedAssets.forEach(asset => {
        typeMap.set(asset.assetType, (typeMap.get(asset.assetType) || 0) + 1)
      })
      const assetsByType: AssetTypeCount[] = Array.from(typeMap.entries())
        .map(([type, count]) => ({
          type: type as AssetType,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count)

      // Calculate asset distribution by manufacturer
      const mfgMap = new Map<string, number>()
      importedAssets.forEach(asset => {
        mfgMap.set(asset.manufacturer, (mfgMap.get(asset.manufacturer) || 0) + 1)
      })
      const assetsByManufacturer = Array.from(mfgMap.entries())
        .map(([manufacturer, count]) => ({
          manufacturer,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count)

      // Calculate support status (End of Life Timeline)
      const assetsBySupportStatus = [
        {
          status: 'active',
          count: healthy + atRisk,
          percentage: total > 0 ? Math.round(((healthy + atRisk) / total) * 100) : 0,
        },
        {
          status: 'ending-soon',
          count: critical,
          percentage: total > 0 ? Math.round((critical / total) * 100) : 0,
        },
        {
          status: 'ended',
          count: endOfLife,
          percentage: total > 0 ? Math.round((endOfLife / total) * 100) : 0,
        },
      ]

      const mockMetrics: DashboardMetrics = {
        totalAssets: total,
        healthyAssets: healthy,
        atRiskAssets: atRisk,
        criticalAssets: critical,
        endOfLifeAssets: endOfLife,
        avgComplianceScore: total > 0
          ? Math.round(importedAssets.reduce((sum, a) => sum + a.complianceScore, 0) / total)
          : 0,
        pendingAlerts: importedAssets.filter(a => a.healthStatus !== 'healthy').length,
        resolvedAlerts: 0,
        assetsByType,
        assetsByManufacturer,
        assetsBySupportStatus,
      }
      setMetrics(mockMetrics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(file: File) {
    setUploading(true)
    setImportError(null)
    setImportSuccess(null)

    try {
      const fileContent = await file.text()
      const result = validateAndProcessCSV(fileContent)

      if (!result.success) {
        const errorMessages = result.errors
          .slice(0, 5)
          .map(e => `Row ${e.row}: ${e.field} - ${e.error}`)
          .join('\n')
        setImportError(`Import failed: ${result.errors.length} errors found\n\n${errorMessages}${result.errors.length > 5 ? '\n...' : ''}`)
        return
      }

      if (result.assetsImported === 0) {
        setImportError('No valid assets found in the CSV file')
        return
      }

      // Calculate metrics from imported assets
      const metrics = calculateMetrics(result.assets)

      // Save to context (persists to localStorage)
      setDashboardData(result.assets, metrics)

      setImportSuccess(`Successfully imported ${result.assetsImported} assets! Metrics calculated.`)

      // Reload dashboard with new metrics
      await loadDashboardMetrics()

      // Auto-scroll to KPIs
      setTimeout(() => {
        kpisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    } catch (err) {
      setImportError(`Upload error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
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
        <PageHeader title="Dashboard" alerts={0} showHomeButton={false} />
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
      <PageHeader title="Dashboard" description="Real-time asset health overview" alerts={metrics.pendingAlerts} showHomeButton={true} homeHref="/welcome" />

      <div className="p-6 space-y-6">
        {/* Business Impact KPIs */}
        {calculatedMetrics ? (
          <div ref={kpisRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <BusinessKPI
              label="Annual Cost Savings (Potential)"
              value={`$${(calculatedMetrics.annualCostSavings / 1000).toFixed(0)}`}
              unit="K"
              icon={<DollarSign className="w-6 h-6" />}
              variant="positive"
              description="From predictive maintenance & avoiding failures"
            />
            <BusinessKPI
              label="Employees at Health Risk"
              value={calculatedMetrics.employeesAtHealthRisk}
              icon={<Heart className="w-6 h-6" />}
              variant="negative"
              description="From aging/poor condition assets"
            />
            <BusinessKPI
              label="Global Pollution Index"
              value={calculatedMetrics.globalPollutionIndex}
              unit="/100"
              icon={<Leaf className="w-6 h-6" />}
              variant={
                calculatedMetrics.globalPollutionIndex > 70
                  ? 'negative'
                  : calculatedMetrics.globalPollutionIndex > 40
                    ? 'warning'
                    : 'positive'
              }
              description="Comprehensive environmental & compliance score"
              zeroNote="No replaceable asset found - Organization shows lack of awareness for asset lifecycle management"
            />
            <BusinessKPI
              label="Business Continuity Risk"
              value={calculatedMetrics.businessContinuityRisk}
              icon={<AlertTriangle className="w-6 h-6" />}
              variant={calculatedMetrics.businessContinuityRisk === 'Critical' ? 'negative' : calculatedMetrics.businessContinuityRisk === 'High' ? 'warning' : 'positive'}
              description="Based on critical and end-of-life assets"
            />
          </div>
        ) : (
          <Card>
            <CardBody className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">📊 Business Impact Metrics</h3>
                <p className="text-sm text-neutral-600">Cost savings, health impact, and carbon footprint will be calculated once you import asset data</p>
              </div>
              <DollarSign className="w-12 h-12 text-primary-500 flex-shrink-0" />
            </CardBody>
          </Card>
        )}

        {/* Global Compliance & Regulatory Risk Metrics */}
        {calculatedMetrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t-4 border-danger-500 pt-6">
            <BusinessKPI
              label="Global Compliance Violation Rate"
              value={calculatedMetrics.globalComplianceViolationRate}
              unit="%"
              icon={<AlertTriangle className="w-6 h-6" />}
              variant="negative"
              description="Assets violating international standards"
            />
            <BusinessKPI
              label="Potential Compliance Fine Exposure"
              value={`$${(calculatedMetrics.potentialFineExposure / 1000000).toFixed(1)}`}
              unit="M"
              icon={<DollarSign className="w-6 h-6" />}
              variant="negative"
              description="Estimated regulatory penalties"
            />
            <BusinessKPI
              label="Assets Violating Standards"
              value={calculatedMetrics.assetsViolatingStandards}
              icon={<Shield className="w-6 h-6" />}
              variant="negative"
              description="EPA, RoHS, ISO, OSHA, GDPR violations"
            />
            <BusinessKPI
              label="Global Compliance Risk Score"
              value={calculatedMetrics.globalComplianceRiskScore}
              unit="/10"
              icon={<AlertTriangle className="w-6 h-6" />}
              variant="negative"
              description={calculatedMetrics.globalComplianceRiskScore > 7 ? 'Critical - Immediate action required' : 'Requires attention'}
            />
          </div>
        ) : (
          <div className="border-t-4 border-warning-500 pt-6">
            <Card>
              <CardBody className="flex items-center justify-between p-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">🔐 Global Compliance & Regulatory Risk Metrics</h3>
                  <p className="text-sm text-neutral-600">Import asset data to calculate compliance violations by region (GDPR, EPA, OSHA, RoHS, ISO 27001)</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-warning-500 flex-shrink-0" />
              </CardBody>
            </Card>
          </div>
        )}

        {/* Compliance by Region & Standards */}
        {calculatedMetrics && calculatedMetrics.assetsViolatingStandards > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-danger-600" />
                  Compliance Violations by Region
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {[
                    { region: 'Europe (GDPR, RoHS)', violations: calculatedMetrics.violationsByRegion['Europe (GDPR/RoHS)'] },
                    { region: 'North America (EPA, OSHA)', violations: calculatedMetrics.violationsByRegion['North America (EPA/OSHA)'] },
                    { region: 'Asia Pacific (Local Regs)', violations: calculatedMetrics.violationsByRegion['Asia Pacific (Local Regs)'] },
                    { region: 'Other Regions', violations: calculatedMetrics.violationsByRegion['Other Regions'] },
                  ]
                    .filter(item => item.violations > 0)
                    .map((item) => {
                      const percentage = calculatedMetrics.assetsViolatingStandards > 0
                        ? (item.violations / calculatedMetrics.assetsViolatingStandards) * 100
                        : 0
                      const impact = percentage > 25 ? 'Critical' : 'High'
                      return (
                        <div key={item.region} className="p-3 bg-neutral-50 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium text-sm text-neutral-900">{item.region}</span>
                            <Badge variant={impact === 'Critical' ? 'danger' : 'warning'}>{impact}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex-1 bg-neutral-200 rounded-full h-2 mr-3">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  impact === 'Critical' ? 'bg-danger-500' : 'bg-warning-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-neutral-900">{item.violations} violations</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-danger-600" />
                  Critical Compliance Standards Violated
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {calculatedMetrics.criticalStandardsViolated
                    .slice(0, 5)
                    .map((item) => (
                      <div key={item.standard} className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-sm text-danger-900">{item.standard}</p>
                            <p className="text-xs text-danger-700 mt-1">{item.assetsNonCompliant} assets non-compliant</p>
                          </div>
                          <Badge variant="danger">{item.risk}</Badge>
                        </div>
                        <p className="text-xs text-danger-700 font-medium">💰 Fine: ${item.finePerViolation.toLocaleString()}/violation</p>
                      </div>
                    ))}
                </div>
              </CardBody>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-neutral-400" />
                  Compliance Violations by Region
                </h2>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertTriangle className="w-8 h-8 text-neutral-300 mb-2" />
                  <p className="text-sm text-neutral-600">No data imported yet</p>
                  <p className="text-xs text-neutral-500 mt-1">Download template and import asset data to see regional compliance violations</p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-neutral-400" />
                  Critical Compliance Standards
                </h2>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Shield className="w-8 h-8 text-neutral-300 mb-2" />
                  <p className="text-sm text-neutral-600">No data imported yet</p>
                  <p className="text-xs text-neutral-500 mt-1">Import assets from different regions to calculate which standards apply (GDPR, EPA, OSHA, RoHS, ISO)</p>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Business Impact Actions & ROI */}
        {calculatedMetrics && calculatedMetrics.immediateActions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">🎯 Immediate Actions (Next 30 Days)</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {calculatedMetrics.immediateActions.map((action) => (
                    <div key={action.action} className="p-3 bg-neutral-50 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-sm text-neutral-900">{action.action}</p>
                        <Badge variant={action.priority === 'CRITICAL' ? 'danger' : 'warning'}>{action.count}</Badge>
                      </div>
                      <p className="text-xs text-neutral-600">Est. ${(action.estimatedCost / 1000).toFixed(0)}K</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">📈 Expected Year 1 Outcomes</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Cost Savings</span>
                    <span className="font-semibold text-sm text-success-600">${(calculatedMetrics.year1Savings / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Health Issues Prevented</span>
                    <span className="font-semibold text-sm text-success-600">{Math.round(calculatedMetrics.employeesAtHealthRisk * 0.3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Carbon Reduction</span>
                    <span className="font-semibold text-sm text-success-600">~35%</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-2 mt-2">
                    <p className="text-xs text-neutral-600">Payback: <span className="font-semibold text-neutral-900">{calculatedMetrics.paybackPeriodMonths} months</span></p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">💰 3-Year ROI</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Investment Required</span>
                    <span className="font-semibold text-sm text-neutral-900">${(calculatedMetrics.investmentRequired / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Year 1 Savings</span>
                    <span className="font-semibold text-sm text-success-600">${(calculatedMetrics.year1Savings / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">3-Year Total</span>
                    <span className="font-semibold text-sm text-success-600">${(calculatedMetrics.year1Savings * 3 / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="bg-success-50 border border-success-200 rounded p-2 mt-2">
                    <p className="text-xs font-semibold text-success-900">ROI: {calculatedMetrics.threeYearROI}%</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        ) : (
          <Card>
            <CardBody className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">🎯 Immediate Actions & ROI Projections</h3>
                <p className="text-sm text-neutral-600">Once data is imported, system will calculate recommended actions, projected outcomes, and ROI over 1-3 years</p>
              </div>
              <TrendingUp className="w-12 h-12 text-success-500 flex-shrink-0" />
            </CardBody>
          </Card>
        )}

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

          {/* Support Status - End of Life Timeline */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">End of Life Timeline</h2>
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.assetsBySupportStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} assets`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', r: 6 }}
                    activeDot={{ r: 8 }}
                    name="Assets at Risk"
                  />
                </LineChart>
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

        {/* Import Data & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Import Data */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="w-5 h-5 text-success-600" />
                Import Asset Data
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {importSuccess && (
                <div className="bg-success-50 border border-success-200 rounded-lg p-4 flex gap-3">
                  <Check className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-success-900">{importSuccess}</p>
                    <p className="text-xs text-success-700 mt-1">Dashboard updated with calculated metrics</p>
                  </div>
                </div>
              )}

              {importError && (
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-danger-900">Import Failed</p>
                    <p className="text-xs text-danger-700 mt-1 whitespace-pre-wrap">{importError}</p>
                  </div>
                </div>
              )}

              <div className={`border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-neutral-900">Drag & drop your CSV file here</p>
                <p className="text-xs text-neutral-600 mt-1">or click to select from computer</p>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileUpload(file)
                    }
                  }}
                  id="csv-upload"
                  disabled={uploading}
                />
                <label htmlFor="csv-upload" className="block mt-3">
                  <Button variant="secondary" size="sm" className="mx-auto" onClick={() => document.getElementById('csv-upload')?.click()} disabled={uploading}>
                    {uploading ? 'Processing...' : 'Browse Files'}
                  </Button>
                </label>
              </div>
              <p className="text-xs text-neutral-600 mb-4">
                Accepted format: CSV with 15 columns (Asset ID, Type, Manufacturer, Health Status, Compliance Score, Country, Region, etc.)
              </p>
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm text-primary-900 mb-1">Need help with data format?</p>
                    <p className="text-xs text-primary-700">Download the standard template to ensure your data structure matches requirements</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = '/Admin_Asset_Template.csv'
                      link.download = 'Admin_Asset_Template.csv'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <File className="w-4 h-4" />
                    Download Template (CSV)
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  onClick={() => router.push('/assets')}
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  View Critical Assets
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/reports')}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Generate Report
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/alerts')}
                  className="flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  View Full Alert Log
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
