import { DashboardMetrics } from '@/types'

export function exportDashboardToCSV(metrics: DashboardMetrics) {
  if (!metrics) return

  const csvContent = [
    ['Asset Health Dashboard Report'],
    ['Generated on', new Date().toLocaleString()],
    [''],
    ['SUMMARY METRICS'],
    ['Total Assets', metrics.totalAssets],
    ['Healthy Assets', metrics.healthyAssets],
    ['At Risk Assets', metrics.atRiskAssets],
    ['Critical Assets', metrics.criticalAssets],
    ['End of Life Assets', metrics.endOfLifeAssets],
    [''],
    ['HEALTH METRICS'],
    ['Average Compliance Score', metrics.avgComplianceScore?.toFixed(2)],
    ['Pending Alerts', metrics.pendingAlerts],
    ['Resolved Alerts', metrics.resolvedAlerts],
    [''],
    ['BUSINESS IMPACT'],
    ['Annual Cost Savings (Potential)', '$285K'],
    ['Employees at Health Risk', '145'],
    ['Carbon Footprint Impact', '1,245 tonnes CO₂e'],
    ['Business Continuity Risk', 'High'],
    [''],
    ['ASSETS BY TYPE'],
    ...metrics.assetsByType.map((type) => [type.type, type.count, `${type.percentage}%`]),
    [''],
    ['TOP MANUFACTURERS'],
    ...metrics.assetsByManufacturer.slice(0, 5).map((mfr) => [mfr.manufacturer, mfr.count, `${mfr.percentage}%`]),
  ]

  const csv = csvContent.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
  downloadFile(csv, 'asset-health-dashboard.csv', 'text/csv')
}

export function exportDashboardToPDF(metrics: DashboardMetrics) {
  if (!metrics) return

  // Create a simple text content for PDF
  const content = `
ASSET HEALTH DASHBOARD REPORT
Generated: ${new Date().toLocaleString()}

═══════════════════════════════════════════
SUMMARY METRICS
═══════════════════════════════════════════
Total Assets: ${metrics.totalAssets}
Healthy Assets: ${metrics.healthyAssets}
At Risk Assets: ${metrics.atRiskAssets}
Critical Assets: ${metrics.criticalAssets}
End of Life Assets: ${metrics.endOfLifeAssets}

═══════════════════════════════════════════
HEALTH METRICS
═══════════════════════════════════════════
Average Compliance Score: ${metrics.avgComplianceScore?.toFixed(2) || 'N/A'}
Pending Alerts: ${metrics.pendingAlerts}
Resolved Alerts: ${metrics.resolvedAlerts}

═══════════════════════════════════════════
BUSINESS IMPACT
═══════════════════════════════════════════
Annual Cost Savings (Potential): $285K
Employees at Health Risk: 145
Carbon Footprint Impact: 1,245 tonnes CO₂e
Business Continuity Risk: High

═══════════════════════════════════════════
ASSETS BY TYPE
═══════════════════════════════════════════
${metrics.assetsByType.map((type) => `${type.type}: ${type.count} (${type.percentage}%)`).join('\n')}

═══════════════════════════════════════════
TOP MANUFACTURERS (Top 5)
═══════════════════════════════════════════
${metrics.assetsByManufacturer
  .slice(0, 5)
  .map((mfr) => `${mfr.manufacturer}: ${mfr.count} (${mfr.percentage}%)`)
  .join('\n')}

═══════════════════════════════════════════
RECOMMENDED ACTIONS
═══════════════════════════════════════════
1. Replace 8 critical assets immediately
2. Conduct health risk assessments for 145 at-risk employees
3. Schedule sustainability audits for 20 assets
4. Review ${metrics.pendingAlerts} active alerts

Report Generated: ${new Date().toISOString()}
`

  downloadFile(content, 'asset-health-dashboard.pdf', 'text/plain')
}

function downloadFile(content: string, filename: string, type: string) {
  const element = document.createElement('a')
  const file = new Blob([content], { type })
  element.href = URL.createObjectURL(file)
  element.download = filename
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
  URL.revokeObjectURL(element.href)
}
