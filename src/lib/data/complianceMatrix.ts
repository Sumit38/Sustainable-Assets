// Global Compliance Standards Matrix
// Defines which compliance standards apply to each asset type in each region

export type Region = 'Europe (GDPR/RoHS)' | 'North America (EPA/OSHA)' | 'Asia Pacific (Local Regs)' | 'Other Regions'
export type ComplianceStandard = 'GDPR' | 'RoHS' | 'EPA' | 'OSHA' | 'ISO 27001' | 'PCI DSS' | 'HIPAA' | 'SOC 2' | 'NIST' | 'CE'

export interface ComplianceStandardInfo {
  id: ComplianceStandard
  name: string
  description: string
  region: Region
  finePerViolation: number // in USD
  maxFinePossible: number // in USD
  timeToEnforcement: number // in days
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  consequences: string[]
}

export interface AssetTypeCompliance {
  assetType: string
  applicableStandards: ComplianceStandard[]
}

// Compliance Standards by Region
export const COMPLIANCE_STANDARDS: Record<ComplianceStandard, ComplianceStandardInfo> = {
  GDPR: {
    id: 'GDPR',
    name: 'GDPR (Data Protection)',
    description: 'General Data Protection Regulation - EU data protection law',
    region: 'Europe (GDPR/RoHS)',
    finePerViolation: 18000,
    maxFinePossible: 20000000,
    timeToEnforcement: 90,
    risk: 'CRITICAL',
    consequences: ['Legal action', 'Market ban', 'Operational restrictions', 'Reputational damage'],
  },
  RoHS: {
    id: 'RoHS',
    name: 'RoHS (Electronics)',
    description: 'Restriction of Hazardous Substances - EU electronics regulation',
    region: 'Europe (GDPR/RoHS)',
    finePerViolation: 50000,
    maxFinePossible: 500000,
    timeToEnforcement: 60,
    risk: 'CRITICAL',
    consequences: ['Market ban', 'Product recalls', 'Fines per product', 'Supply chain disruption'],
  },
  EPA: {
    id: 'EPA',
    name: 'EPA (Environmental)',
    description: 'Environmental Protection Agency - US environmental regulations',
    region: 'North America (EPA/OSHA)',
    finePerViolation: 25000,
    maxFinePossible: 10000000,
    timeToEnforcement: 45,
    risk: 'CRITICAL',
    consequences: ['Operations shutdown', 'Environmental cleanup costs', 'Criminal liability', 'Permit revocation'],
  },
  OSHA: {
    id: 'OSHA',
    name: 'OSHA (Worker Safety)',
    description: 'Occupational Safety and Health Administration - Worker safety standards',
    region: 'North America (EPA/OSHA)',
    finePerViolation: 15000,
    maxFinePossible: 1000000,
    timeToEnforcement: 30,
    risk: 'HIGH',
    consequences: ['Worker injuries', 'Liability claims', 'Operational shutdown', 'License revocation'],
  },
  'ISO 27001': {
    id: 'ISO 27001',
    name: 'ISO 27001 (Information Security)',
    description: 'International standard for information security management',
    region: 'Europe (GDPR/RoHS)',
    finePerViolation: 100000,
    maxFinePossible: 5000000,
    timeToEnforcement: 120,
    risk: 'HIGH',
    consequences: ['Audit failure', 'Contract penalties', 'Data breach liability', 'Customer trust loss'],
  },
  'PCI DSS': {
    id: 'PCI DSS',
    name: 'PCI DSS (Payment Cards)',
    description: 'Payment Card Industry Data Security Standard',
    region: 'North America (EPA/OSHA)',
    finePerViolation: 50000,
    maxFinePossible: 100000,
    timeToEnforcement: 30,
    risk: 'HIGH',
    consequences: ['Payment processing ban', 'Transaction fees increase', 'Data breach liability'],
  },
  HIPAA: {
    id: 'HIPAA',
    name: 'HIPAA (Healthcare)',
    description: 'Health Insurance Portability and Accountability Act',
    region: 'North America (EPA/OSHA)',
    finePerViolation: 100000,
    maxFinePossible: 50000000,
    timeToEnforcement: 60,
    risk: 'CRITICAL',
    consequences: ['Patient data breach liability', 'License revocation', 'Criminal charges'],
  },
  'SOC 2': {
    id: 'SOC 2',
    name: 'SOC 2 (Service Organization)',
    description: 'Service Organization Control - Audit framework',
    region: 'North America (EPA/OSHA)',
    finePerViolation: 75000,
    maxFinePossible: 2000000,
    timeToEnforcement: 90,
    risk: 'HIGH',
    consequences: ['Contract termination', 'Customer audit failures', 'Business partner loss'],
  },
  NIST: {
    id: 'NIST',
    name: 'NIST (Cybersecurity)',
    description: 'National Institute of Standards and Technology - Cybersecurity framework',
    region: 'North America (EPA/OSHA)',
    finePerViolation: 50000,
    maxFinePossible: 3000000,
    timeToEnforcement: 60,
    risk: 'HIGH',
    consequences: ['Government contract loss', 'Security incident liability', 'Operational restrictions'],
  },
  CE: {
    id: 'CE',
    name: 'CE (Product Safety)',
    description: 'CE Marking - European product safety and quality conformity',
    region: 'Europe (GDPR/RoHS)',
    finePerViolation: 30000,
    maxFinePossible: 500000,
    timeToEnforcement: 45,
    risk: 'HIGH',
    consequences: ['Market ban', 'Product recalls', 'Supply chain disruption'],
  },
}

// Asset Type Compliance Requirements by Region
export const ASSET_COMPLIANCE_BY_REGION: Record<Region, Record<string, ComplianceStandard[]>> = {
  'Europe (GDPR/RoHS)': {
    'Chair': ['GDPR', 'RoHS', 'CE'],
    'Table': ['GDPR', 'RoHS', 'CE'],
    'Monitor': ['GDPR', 'RoHS', 'CE', 'ISO 27001'],
    'Laptop': ['GDPR', 'RoHS', 'CE', 'ISO 27001'],
    'Cubicle': ['GDPR', 'RoHS', 'CE'],
    'Hardware': ['GDPR', 'RoHS', 'CE', 'ISO 27001'],
    'Software': ['GDPR', 'ISO 27001'],
    'Vehicle': ['GDPR', 'CE'],
    'Real Estate': ['GDPR'],
    'Other': ['GDPR'],
  },
  'North America (EPA/OSHA)': {
    'Chair': ['OSHA'],
    'Table': ['OSHA'],
    'Monitor': ['OSHA', 'EPA', 'ISO 27001', 'NIST'],
    'Laptop': ['OSHA', 'EPA', 'ISO 27001', 'NIST', 'PCI DSS'],
    'Cubicle': ['OSHA', 'EPA'],
    'Hardware': ['OSHA', 'EPA', 'ISO 27001', 'NIST', 'PCI DSS'],
    'Software': ['ISO 27001', 'NIST', 'PCI DSS', 'SOC 2', 'HIPAA'],
    'Vehicle': ['OSHA', 'EPA'],
    'Real Estate': ['EPA', 'OSHA'],
    'Other': ['OSHA'],
  },
  'Asia Pacific (Local Regs)': {
    'Chair': ['ISO 27001'],
    'Table': ['ISO 27001'],
    'Monitor': ['ISO 27001'],
    'Laptop': ['ISO 27001', 'PCI DSS'],
    'Cubicle': ['ISO 27001'],
    'Hardware': ['ISO 27001', 'PCI DSS'],
    'Software': ['ISO 27001', 'PCI DSS'],
    'Vehicle': ['ISO 27001'],
    'Real Estate': ['ISO 27001'],
    'Other': ['ISO 27001'],
  },
  'Other Regions': {
    'Chair': [],
    'Table': [],
    'Monitor': ['ISO 27001'],
    'Laptop': ['ISO 27001', 'PCI DSS'],
    'Cubicle': [],
    'Hardware': ['ISO 27001', 'PCI DSS'],
    'Software': ['ISO 27001', 'PCI DSS'],
    'Vehicle': [],
    'Real Estate': [],
    'Other': [],
  },
}

// Get applicable standards for an asset type in a region
export function getApplicableStandards(assetType: string, region: Region): ComplianceStandard[] {
  const regionStandards = ASSET_COMPLIANCE_BY_REGION[region]
  return regionStandards?.[assetType] || regionStandards?.['Other'] || []
}

// Get all standards for a region
export function getRegionStandards(region: Region): ComplianceStandardInfo[] {
  return Object.values(COMPLIANCE_STANDARDS).filter(std => std.region === region)
}
