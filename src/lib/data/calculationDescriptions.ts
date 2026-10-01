// Calculation descriptions for all metrics
// Used to display tooltip explanations when users hover over metric cards

export interface CalculationDescription {
  label: string
  description: string
  formula?: string
}

export const DASHBOARD_CALCULATIONS: Record<string, CalculationDescription> = {
  // Asset Count Metrics
  'total-assets': {
    label: 'Total Assets',
    description: 'Sum of all assets currently in the inventory',
    formula: 'Total Assets = Count of all imported assets',
  },
  'healthy-assets': {
    label: 'Healthy Assets',
    description: 'Assets with health status marked as "healthy"',
    formula: 'Healthy = Count of assets where healthStatus = "healthy"',
  },
  'at-risk-assets': {
    label: 'At-Risk Assets',
    description: 'Assets showing signs of degradation or approaching end-of-life',
    formula: 'At-Risk = Count of assets where healthStatus = "at-risk"',
  },
  'critical-assets': {
    label: 'Critical Assets',
    description: 'Assets in critical condition requiring immediate attention or replacement',
    formula: 'Critical = Count of assets where healthStatus = "critical"',
  },
  'end-of-life-assets': {
    label: 'End-of-Life Assets',
    description: 'Assets that have reached the end of their useful life',
    formula: 'End-of-Life = Count of assets where healthStatus = "end-of-life"',
  },

  // Compliance Metrics
  'compliance-score': {
    label: 'Compliance Score',
    description: 'Overall compliance rating based on regulatory requirements and standards',
    formula: 'Compliance Score = (Assets with compliant status / Total assets) × 100%',
  },
  'compliance-status': {
    label: 'Compliance Status',
    description: 'Current compliance state (Compliant, At-Risk, or Non-Compliant)',
    formula: 'Status = Compliant if score ≥ 90%, At-Risk if 70-89%, Non-Compliant if < 70%',
  },

  // Health Metrics
  'average-health': {
    label: 'Average Health Score',
    description: 'Mean health score across all assets in the portfolio',
    formula: 'Avg Health = (Sum of all asset health scores) / Number of assets',
  },
  'portfolio-health': {
    label: 'Portfolio Health',
    description: 'Overall portfolio health classification based on asset distribution',
    formula: 'Healthy if >80% assets are healthy, Degrading if 50-80%, Critical if <50%',
  },

  // Age & Lifecycle Metrics
  'average-age': {
    label: 'Average Asset Age',
    description: 'Mean age of all assets calculated from purchase/deployment dates',
    formula: 'Avg Age = (Sum of all asset ages) / Number of assets',
  },
  'oldest-asset': {
    label: 'Oldest Asset',
    description: 'Age of the oldest asset in the portfolio',
    formula: 'Oldest = Maximum value among all asset ages',
  },

  // Financial Metrics
  'total-value': {
    label: 'Total Portfolio Value',
    description: 'Sum of current market value across all assets',
    formula: 'Total Value = Sum of (asset cost × depreciation factor based on age)',
  },
  'average-value': {
    label: 'Average Asset Value',
    description: 'Mean market value of assets in the portfolio',
    formula: 'Avg Value = Total Portfolio Value / Number of assets',
  },

  // Environmental Metrics
  'total-co2': {
    label: 'Total CO₂e Emissions',
    description: 'Total carbon footprint from asset manufacturing, usage, and disposal',
    formula: 'Total CO₂e = Sum of (asset type emissions factor × usage period)',
  },
  'per-asset-co2': {
    label: 'Per-Asset CO₂e',
    description: 'Average carbon footprint per asset',
    formula: 'Per-Asset CO₂e = Total CO₂e / Number of assets',
  },
}

// DLE-Specific Calculations
export const DLE_CALCULATIONS: Record<string, CalculationDescription> = {
  'dle-suitable-assets': {
    label: 'DLE-Suitable Assets',
    description: 'Count of assets that contain lithium batteries and are suitable for Direct Lithium Extraction',
    formula: 'DLE-Suitable = Count of assets where isDLESuitable = true (Laptops, Tablets, Smartphones, UPS Systems, EVs)',
  },
  'recoverable-lithium': {
    label: 'Recoverable Lithium',
    description: 'Total lithium mass estimated to be recoverable from all DLE-suitable assets',
    formula: 'Recoverable Lithium = Sum of (asset lithium content min-max average × quantity) for all DLE-suitable assets',
  },
  'dle-recovery-value': {
    label: 'DLE Recovery Value',
    description: 'Estimated monetary value of materials recoverable through DLE process',
    formula: 'DLE Value = Sum of (asset recovery value min-max average) for all DLE-suitable assets',
  },
  'co2-savings-dle': {
    label: 'CO₂e Savings (DLE)',
    description: 'Carbon emissions prevented by using DLE instead of primary lithium mining',
    formula: 'CO₂ Savings = Sum of (asset co2eSavingsVsPrimaryMining) for all DLE-suitable assets',
  },
  'non-dle-assets': {
    label: 'Non-DLE Assets',
    description: 'Count of assets not suitable for DLE but valuable for alternative recovery pathways',
    formula: 'Non-DLE Assets = Total Assets - DLE-Suitable Assets',
  },
  'alternative-recovery-value': {
    label: 'Alternative Recovery Value',
    description: 'Total estimated value from non-DLE recovery pathways (e-waste, refurbishment, scrap metal, donation)',
    formula: 'Alt Value = Sum of recovery values for assets via E-WASTE, REFURBISHMENT, SCRAP_METAL pathways',
  },

  // Portfolio Composition
  'furniture-count': {
    label: 'Furniture Assets',
    description: 'Count of furniture items (chairs, tables, desks, cabinets)',
    formula: 'Furniture = Count of assets where category = "FURNITURE"',
  },
  'electronics-count': {
    label: 'Electronics Assets',
    description: 'Count of electronic devices (laptops, tablets, desktops, servers, monitors)',
    formula: 'Electronics = Count of assets where category = "ELECTRONICS"',
  },
  'infrastructure-count': {
    label: 'Infrastructure Assets',
    description: 'Count of network and infrastructure components (routers, switches, cables)',
    formula: 'Infrastructure = Count of assets where category = "INFRASTRUCTURE"',
  },
}

// Support Status Calculations
export const SUPPORT_STATUS_CALCULATIONS: Record<string, CalculationDescription> = {
  'active-support': {
    label: 'Active Support',
    description: 'Assets that are still in active use and receiving vendor support',
    formula: 'Active = Healthy + At-Risk assets (still within support lifecycle)',
  },
  'ending-soon': {
    label: 'Support Ending Soon',
    description: 'Assets nearing end of vendor support (typically within 12 months)',
    formula: 'Ending Soon = Critical assets (vendor support ending within 1 year)',
  },
  'ended': {
    label: 'Support Ended',
    description: 'Assets that are out of vendor support and may pose security/compliance risks',
    formula: 'Ended = End-of-Life assets (beyond end of support date)',
  },
}

// Get calculation description by metric key
export function getCalculationDescription(key: string): CalculationDescription | null {
  return DASHBOARD_CALCULATIONS[key] || DLE_CALCULATIONS[key] || SUPPORT_STATUS_CALCULATIONS[key] || null
}

// Get all calculation descriptions
export function getAllCalculationDescriptions() {
  return {
    dashboard: DASHBOARD_CALCULATIONS,
    dle: DLE_CALCULATIONS,
    supportStatus: SUPPORT_STATUS_CALCULATIONS,
  }
}
