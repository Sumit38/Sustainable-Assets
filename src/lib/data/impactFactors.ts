// Health Impact and Cost Factors for Asset Types

export interface HealthImpactFactor {
  assetType: string
  healthIssuesPerYear: number // average health issues per asset
  affectedEmployeesPerAsset: number // average employees using asset
  commonHealthIssues: string[]
  ergonomicRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

export interface CostFactor {
  assetType: string
  averagePurchaseCost: number
  averageReplacementCost: number
  annualMaintenanceCost: number
  downtimeHoursPerFailure: number
  downtimeCostPerHour: number
}

export interface CarbonEmissionFactor {
  assetType: string
  scopeOneEmissions: number // kg CO2e per year (direct)
  scopeTwoEmissions: number // kg CO2e per year (electricity)
  scopeThreeEmissions: number // kg CO2e per year (manufacturing, disposal)
  methaneGenerationFactor: number // kg CH4 per asset at end-of-life
}

// Health Impact Factors by Asset Type
export const HEALTH_IMPACT_FACTORS: Record<string, HealthImpactFactor> = {
  Chair: {
    assetType: 'Chair',
    healthIssuesPerYear: 0.15,
    affectedEmployeesPerAsset: 1.2,
    commonHealthIssues: ['Back pain', 'Neck strain', 'Poor posture', 'Spinal issues'],
    ergonomicRiskLevel: 'HIGH',
  },
  Table: {
    assetType: 'Table',
    healthIssuesPerYear: 0.08,
    affectedEmployeesPerAsset: 2.5,
    commonHealthIssues: ['Repetitive strain injury', 'Posture issues', 'Leg discomfort'],
    ergonomicRiskLevel: 'MEDIUM',
  },
  Monitor: {
    assetType: 'Monitor',
    healthIssuesPerYear: 0.12,
    affectedEmployeesPerAsset: 1.1,
    commonHealthIssues: ['Eye strain', 'Headaches', 'Neck pain', 'Screen fatigue'],
    ergonomicRiskLevel: 'HIGH',
  },
  Laptop: {
    assetType: 'Laptop',
    healthIssuesPerYear: 0.18,
    affectedEmployeesPerAsset: 1.3,
    commonHealthIssues: ['Eye strain', 'Neck pain', 'Wrist strain', 'Screen fatigue'],
    ergonomicRiskLevel: 'CRITICAL',
  },
  Cubicle: {
    assetType: 'Cubicle',
    healthIssuesPerYear: 0.10,
    affectedEmployeesPerAsset: 1.0,
    commonHealthIssues: ['Stress', 'Poor air circulation', 'Privacy issues'],
    ergonomicRiskLevel: 'MEDIUM',
  },
  Hardware: {
    assetType: 'Hardware',
    healthIssuesPerYear: 0.05,
    affectedEmployeesPerAsset: 1.0,
    commonHealthIssues: ['Electrical hazard', 'Heat exposure'],
    ergonomicRiskLevel: 'MEDIUM',
  },
  Software: {
    assetType: 'Software',
    healthIssuesPerYear: 0.02,
    affectedEmployeesPerAsset: 1.0,
    commonHealthIssues: ['Data security stress'],
    ergonomicRiskLevel: 'LOW',
  },
  Vehicle: {
    assetType: 'Vehicle',
    healthIssuesPerYear: 0.20,
    affectedEmployeesPerAsset: 1.0,
    commonHealthIssues: ['Accident risk', 'Emission exposure', 'Repetitive strain'],
    ergonomicRiskLevel: 'CRITICAL',
  },
  'Real Estate': {
    assetType: 'Real Estate',
    healthIssuesPerYear: 0.05,
    affectedEmployeesPerAsset: 50.0,
    commonHealthIssues: ['Air quality', 'Structural safety', 'Sanitation'],
    ergonomicRiskLevel: 'HIGH',
  },
}

// Cost Factors by Asset Type (in USD)
export const COST_FACTORS: Record<string, CostFactor> = {
  Chair: {
    assetType: 'Chair',
    averagePurchaseCost: 350,
    averageReplacementCost: 400,
    annualMaintenanceCost: 25,
    downtimeHoursPerFailure: 2,
    downtimeCostPerHour: 75, // average employee cost
  },
  Table: {
    assetType: 'Table',
    averagePurchaseCost: 500,
    averageReplacementCost: 550,
    annualMaintenanceCost: 30,
    downtimeHoursPerFailure: 3,
    downtimeCostPerHour: 75,
  },
  Monitor: {
    assetType: 'Monitor',
    averagePurchaseCost: 300,
    averageReplacementCost: 350,
    annualMaintenanceCost: 15,
    downtimeHoursPerFailure: 4,
    downtimeCostPerHour: 100,
  },
  Laptop: {
    assetType: 'Laptop',
    averagePurchaseCost: 1200,
    averageReplacementCost: 1400,
    annualMaintenanceCost: 100,
    downtimeHoursPerFailure: 8,
    downtimeCostPerHour: 150,
  },
  Cubicle: {
    assetType: 'Cubicle',
    averagePurchaseCost: 2000,
    averageReplacementCost: 2200,
    annualMaintenanceCost: 50,
    downtimeHoursPerFailure: 1,
    downtimeCostPerHour: 75,
  },
  Hardware: {
    assetType: 'Hardware',
    averagePurchaseCost: 800,
    averageReplacementCost: 900,
    annualMaintenanceCost: 60,
    downtimeHoursPerFailure: 6,
    downtimeCostPerHour: 120,
  },
  Software: {
    assetType: 'Software',
    averagePurchaseCost: 2000,
    averageReplacementCost: 2500,
    annualMaintenanceCost: 200,
    downtimeHoursPerFailure: 8,
    downtimeCostPerHour: 200,
  },
  Vehicle: {
    assetType: 'Vehicle',
    averagePurchaseCost: 25000,
    averageReplacementCost: 28000,
    annualMaintenanceCost: 2000,
    downtimeHoursPerFailure: 48,
    downtimeCostPerHour: 200,
  },
  'Real Estate': {
    assetType: 'Real Estate',
    averagePurchaseCost: 500000,
    averageReplacementCost: 550000,
    annualMaintenanceCost: 15000,
    downtimeHoursPerFailure: 24,
    downtimeCostPerHour: 1000,
  },
}

// Carbon Emission Factors (in kg CO2e per asset per year, or total at EOL)
export const CARBON_EMISSION_FACTORS: Record<string, CarbonEmissionFactor> = {
  Chair: {
    assetType: 'Chair',
    scopeOneEmissions: 0,
    scopeTwoEmissions: 0,
    scopeThreeEmissions: 150, // manufacturing, disposal
    methaneGenerationFactor: 0.08, // kg CH4 at end-of-life (fabric padding)
  },
  Table: {
    assetType: 'Table',
    scopeOneEmissions: 0,
    scopeTwoEmissions: 0,
    scopeThreeEmissions: 200,
    methaneGenerationFactor: 0.12, // kg CH4 (wood, fabric)
  },
  Monitor: {
    assetType: 'Monitor',
    scopeOneEmissions: 0,
    scopeTwoEmissions: 25,
    scopeThreeEmissions: 180,
    methaneGenerationFactor: 0.02, // kg CH4 (minimal plastic/glass)
  },
  Laptop: {
    assetType: 'Laptop',
    scopeOneEmissions: 0,
    scopeTwoEmissions: 40,
    scopeThreeEmissions: 250,
    methaneGenerationFactor: 0.03, // kg CH4 (plastic, metals)
  },
  Cubicle: {
    assetType: 'Cubicle',
    scopeOneEmissions: 0,
    scopeTwoEmissions: 0,
    scopeThreeEmissions: 500,
    methaneGenerationFactor: 0.35, // kg CH4 (foam, fabric, wood)
  },
  Hardware: {
    assetType: 'Hardware',
    scopeOneEmissions: 0,
    scopeTwoEmissions: 30,
    scopeThreeEmissions: 120,
    methaneGenerationFactor: 0.0, // kg CH4 (metals don't degrade)
  },
  Software: {
    assetType: 'Software',
    scopeOneEmissions: 0,
    scopeTwoEmissions: 80,
    scopeThreeEmissions: 50,
    methaneGenerationFactor: 0.0,
  },
  Vehicle: {
    assetType: 'Vehicle',
    scopeOneEmissions: 2500,
    scopeTwoEmissions: 100,
    scopeThreeEmissions: 300,
    methaneGenerationFactor: 0.0,
  },
  'Real Estate': {
    assetType: 'Real Estate',
    scopeOneEmissions: 5000,
    scopeTwoEmissions: 3000,
    scopeThreeEmissions: 1000,
    methaneGenerationFactor: 0.0,
  },
}

// Methane Impact Multiplier: Global Warming Potential of methane vs CO2
// Methane is 28x more potent than CO2 over 100 years
export const METHANE_GWP_MULTIPLIER = 28
export const LANDFILL_CAPTURE_RATE = 0.65 // 65% of methane is captured, 35% escapes to atmosphere

// Helper functions
export function getHealthImpactFactor(assetType: string): HealthImpactFactor {
  return HEALTH_IMPACT_FACTORS[assetType] || HEALTH_IMPACT_FACTORS['Hardware']
}

export function getCostFactor(assetType: string): CostFactor {
  return COST_FACTORS[assetType] || COST_FACTORS['Hardware']
}

export function getCarbonFactor(assetType: string): CarbonEmissionFactor {
  return CARBON_EMISSION_FACTORS[assetType] || CARBON_EMISSION_FACTORS['Hardware']
}

// Calculate methane CO2e from end-of-life asset
export function calculateMethaneCO2e(methaneKg: number, captureFraction: number = LANDFILL_CAPTURE_RATE): number {
  // Only atmospheric methane contributes to warming
  const atmosphericMethane = methaneKg * (1 - captureFraction)
  return atmosphericMethane * METHANE_GWP_MULTIPLIER
}
