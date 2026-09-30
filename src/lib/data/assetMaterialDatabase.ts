export type AssetCategory = 'ELECTRONICS' | 'FURNITURE' | 'INFRASTRUCTURE' | 'VEHICLE' | 'REAL_ESTATE' | 'OTHER';
export type RecoveryPathway = 'DLE' | 'BATTERY_RECYCLING' | 'E_WASTE' | 'REFURBISHMENT' | 'SCRAP_METAL' | 'DONATION' | 'LANDFILL';

export interface MaterialProfile {
  assetType: string;
  category: AssetCategory;
  isDLESuitable: boolean;

  lithiumContent: { min: number; max: number };
  cobaltContent: { min: number; max: number };
  nickelContent: { min: number; max: number };
  rareEarthContent: { min: number; max: number };
  copperContent: { min: number; max: number };

  recoveryValue: { min: number; max: number };
  recoveryPathway: RecoveryPathway;
  estimatedRecoveryYield: number;

  co2eSavingsVsPrimaryMining: number;
  co2eSavingsVsLandfill: number;

  hasLithiumBattery: boolean;
  hasRareEarths: boolean;
  refurbishmentPotential: boolean;
  notes: string;
}

export const ASSET_MATERIAL_DATABASE: Record<string, MaterialProfile> = {
  // ===== ELECTRONICS - DLE SUITABLE =====
  'Laptop': {
    assetType: 'Laptop',
    category: 'ELECTRONICS',
    isDLESuitable: true,
    lithiumContent: { min: 0.05, max: 0.15 },
    cobaltContent: { min: 0.001, max: 0.005 },
    nickelContent: { min: 0.002, max: 0.01 },
    rareEarthContent: { min: 0.005, max: 0.02 },
    copperContent: { min: 0.5, max: 1.5 },
    recoveryValue: { min: 800, max: 1200 },
    recoveryPathway: 'DLE',
    estimatedRecoveryYield: 85,
    co2eSavingsVsPrimaryMining: 8,
    co2eSavingsVsLandfill: 25,
    hasLithiumBattery: true,
    hasRareEarths: true,
    refurbishmentPotential: true,
    notes: 'Primary candidate for DLE. Age affects battery quality.',
  },

  'Tablet': {
    assetType: 'Tablet',
    category: 'ELECTRONICS',
    isDLESuitable: true,
    lithiumContent: { min: 0.03, max: 0.08 },
    cobaltContent: { min: 0.0005, max: 0.003 },
    nickelContent: { min: 0.001, max: 0.005 },
    rareEarthContent: { min: 0.002, max: 0.01 },
    copperContent: { min: 0.2, max: 0.5 },
    recoveryValue: { min: 200, max: 500 },
    recoveryPathway: 'DLE',
    estimatedRecoveryYield: 80,
    co2eSavingsVsPrimaryMining: 4,
    co2eSavingsVsLandfill: 15,
    hasLithiumBattery: true,
    hasRareEarths: true,
    refurbishmentPotential: true,
    notes: 'Good DLE candidate. Smaller battery than laptop.',
  },

  'Smartphone': {
    assetType: 'Smartphone',
    category: 'ELECTRONICS',
    isDLESuitable: true,
    lithiumContent: { min: 0.02, max: 0.05 },
    cobaltContent: { min: 0.0003, max: 0.002 },
    nickelContent: { min: 0.0005, max: 0.003 },
    rareEarthContent: { min: 0.001, max: 0.005 },
    copperContent: { min: 0.1, max: 0.3 },
    recoveryValue: { min: 50, max: 300 },
    recoveryPathway: 'DLE',
    estimatedRecoveryYield: 75,
    co2eSavingsVsPrimaryMining: 2.5,
    co2eSavingsVsLandfill: 8,
    hasLithiumBattery: true,
    hasRareEarths: true,
    refurbishmentPotential: true,
    notes: 'Small but valuable. High rare earth content.',
  },

  'Desktop Computer': {
    assetType: 'Desktop Computer',
    category: 'ELECTRONICS',
    isDLESuitable: false,
    lithiumContent: { min: 0, max: 0 },
    cobaltContent: { min: 0, max: 0 },
    nickelContent: { min: 0, max: 0 },
    rareEarthContent: { min: 0.01, max: 0.05 },
    copperContent: { min: 1, max: 3 },
    recoveryValue: { min: 300, max: 600 },
    recoveryPathway: 'E_WASTE',
    estimatedRecoveryYield: 70,
    co2eSavingsVsPrimaryMining: 0,
    co2eSavingsVsLandfill: 20,
    hasLithiumBattery: false,
    hasRareEarths: true,
    refurbishmentPotential: true,
    notes: 'NOT DLE-suitable (no battery). Valuable e-waste recycling.',
  },

  'Monitor': {
    assetType: 'Monitor',
    category: 'ELECTRONICS',
    isDLESuitable: false,
    lithiumContent: { min: 0, max: 0 },
    cobaltContent: { min: 0, max: 0 },
    nickelContent: { min: 0, max: 0 },
    rareEarthContent: { min: 0.005, max: 0.02 },
    copperContent: { min: 0.5, max: 1 },
    recoveryValue: { min: 500, max: 800 },
    recoveryPathway: 'E_WASTE',
    estimatedRecoveryYield: 65,
    co2eSavingsVsPrimaryMining: 0,
    co2eSavingsVsLandfill: 12,
    hasLithiumBattery: false,
    hasRareEarths: true,
    refurbishmentPotential: false,
    notes: 'NOT DLE-suitable. Contains hazardous materials. E-waste only.',
  },

  'Server': {
    assetType: 'Server',
    category: 'ELECTRONICS',
    isDLESuitable: false,
    lithiumContent: { min: 0, max: 0 },
    cobaltContent: { min: 0, max: 0 },
    nickelContent: { min: 0, max: 0 },
    rareEarthContent: { min: 0.02, max: 0.1 },
    copperContent: { min: 2, max: 5 },
    recoveryValue: { min: 1000, max: 3000 },
    recoveryPathway: 'E_WASTE',
    estimatedRecoveryYield: 80,
    co2eSavingsVsPrimaryMining: 0,
    co2eSavingsVsLandfill: 30,
    hasLithiumBattery: false,
    hasRareEarths: true,
    refurbishmentPotential: true,
    notes: 'NOT DLE-suitable. High copper/rare earth content.',
  },

  'UPS System': {
    assetType: 'UPS System',
    category: 'ELECTRONICS',
    isDLESuitable: true,
    lithiumContent: { min: 0.5, max: 2.0 },
    cobaltContent: { min: 0.01, max: 0.05 },
    nickelContent: { min: 0.02, max: 0.1 },
    rareEarthContent: { min: 0.01, max: 0.05 },
    copperContent: { min: 3, max: 8 },
    recoveryValue: { min: 500, max: 2000 },
    recoveryPathway: 'DLE',
    estimatedRecoveryYield: 90,
    co2eSavingsVsPrimaryMining: 15,
    co2eSavingsVsLandfill: 40,
    hasLithiumBattery: true,
    hasRareEarths: false,
    refurbishmentPotential: false,
    notes: 'Excellent DLE candidate! Large battery = high lithium content.',
  },

  'Network Router': {
    assetType: 'Network Router',
    category: 'INFRASTRUCTURE',
    isDLESuitable: false,
    lithiumContent: { min: 0, max: 0.01 },
    cobaltContent: { min: 0, max: 0 },
    nickelContent: { min: 0, max: 0 },
    rareEarthContent: { min: 0.001, max: 0.005 },
    copperContent: { min: 0.1, max: 0.3 },
    recoveryValue: { min: 50, max: 200 },
    recoveryPathway: 'E_WASTE',
    estimatedRecoveryYield: 40,
    co2eSavingsVsPrimaryMining: 0,
    co2eSavingsVsLandfill: 3,
    hasLithiumBattery: false,
    hasRareEarths: false,
    refurbishmentPotential: true,
    notes: 'NOT DLE-suitable. Minimal recovery value.',
  },

  // ===== FURNITURE - NOT DLE SUITABLE =====
  'Chair': {
    assetType: 'Chair',
    category: 'FURNITURE',
    isDLESuitable: false,
    lithiumContent: { min: 0, max: 0 },
    cobaltContent: { min: 0, max: 0 },
    nickelContent: { min: 0, max: 0 },
    rareEarthContent: { min: 0, max: 0 },
    copperContent: { min: 0.01, max: 0.05 },
    recoveryValue: { min: 5, max: 50 },
    recoveryPathway: 'REFURBISHMENT',
    estimatedRecoveryYield: 30,
    co2eSavingsVsPrimaryMining: 0,
    co2eSavingsVsLandfill: 5,
    hasLithiumBattery: false,
    hasRareEarths: false,
    refurbishmentPotential: true,
    notes: 'NOT DLE-applicable. Recommend donation or refurbishment.',
  },

  'Table': {
    assetType: 'Table',
    category: 'FURNITURE',
    isDLESuitable: false,
    lithiumContent: { min: 0, max: 0 },
    cobaltContent: { min: 0, max: 0 },
    nickelContent: { min: 0, max: 0 },
    rareEarthContent: { min: 0, max: 0 },
    copperContent: { min: 0.01, max: 0.1 },
    recoveryValue: { min: 20, max: 100 },
    recoveryPathway: 'REFURBISHMENT',
    estimatedRecoveryYield: 40,
    co2eSavingsVsPrimaryMining: 0,
    co2eSavingsVsLandfill: 8,
    hasLithiumBattery: false,
    hasRareEarths: false,
    refurbishmentPotential: true,
    notes: 'NOT DLE-applicable. Recommend refurbishment or donation.',
  },

  'Desk': {
    assetType: 'Desk',
    category: 'FURNITURE',
    isDLESuitable: false,
    lithiumContent: { min: 0, max: 0 },
    cobaltContent: { min: 0, max: 0 },
    nickelContent: { min: 0, max: 0 },
    rareEarthContent: { min: 0, max: 0 },
    copperContent: { min: 0.01, max: 0.1 },
    recoveryValue: { min: 30, max: 150 },
    recoveryPathway: 'REFURBISHMENT',
    estimatedRecoveryYield: 45,
    co2eSavingsVsPrimaryMining: 0,
    co2eSavingsVsLandfill: 10,
    hasLithiumBattery: false,
    hasRareEarths: false,
    refurbishmentPotential: true,
    notes: 'NOT DLE-applicable. Consider donation to NGOs.',
  },

  'Filing Cabinet': {
    assetType: 'Filing Cabinet',
    category: 'FURNITURE',
    isDLESuitable: false,
    lithiumContent: { min: 0, max: 0 },
    cobaltContent: { min: 0, max: 0 },
    nickelContent: { min: 0, max: 0 },
    rareEarthContent: { min: 0, max: 0 },
    copperContent: { min: 0.05, max: 0.2 },
    recoveryValue: { min: 30, max: 100 },
    recoveryPathway: 'SCRAP_METAL',
    estimatedRecoveryYield: 50,
    co2eSavingsVsPrimaryMining: 0,
    co2eSavingsVsLandfill: 8,
    hasLithiumBattery: false,
    hasRareEarths: false,
    refurbishmentPotential: false,
    notes: 'NOT DLE-applicable. Steel = scrap metal recovery.',
  },

  'Cubicle System': {
    assetType: 'Cubicle System',
    category: 'FURNITURE',
    isDLESuitable: false,
    lithiumContent: { min: 0, max: 0 },
    cobaltContent: { min: 0, max: 0 },
    nickelContent: { min: 0, max: 0 },
    rareEarthContent: { min: 0, max: 0 },
    copperContent: { min: 0.1, max: 0.5 },
    recoveryValue: { min: 50, max: 200 },
    recoveryPathway: 'SCRAP_METAL',
    estimatedRecoveryYield: 60,
    co2eSavingsVsPrimaryMining: 0,
    co2eSavingsVsLandfill: 15,
    hasLithiumBattery: false,
    hasRareEarths: false,
    refurbishmentPotential: false,
    notes: 'NOT DLE-applicable. Metal frame = scrap recovery.',
  },

  // ===== VEHICLES =====
  'Electric Vehicle': {
    assetType: 'Electric Vehicle',
    category: 'VEHICLE',
    isDLESuitable: true,
    lithiumContent: { min: 50, max: 100 },
    cobaltContent: { min: 5, max: 15 },
    nickelContent: { min: 10, max: 30 },
    rareEarthContent: { min: 0.5, max: 2 },
    copperContent: { min: 5, max: 15 },
    recoveryValue: { min: 5000, max: 15000 },
    recoveryPathway: 'DLE',
    estimatedRecoveryYield: 95,
    co2eSavingsVsPrimaryMining: 500,
    co2eSavingsVsLandfill: 1000,
    hasLithiumBattery: true,
    hasRareEarths: true,
    refurbishmentPotential: false,
    notes: 'PRIME DLE CANDIDATE! EV batteries have enormous value.',
  },

  'Gasoline Vehicle': {
    assetType: 'Gasoline Vehicle',
    category: 'VEHICLE',
    isDLESuitable: false,
    lithiumContent: { min: 0, max: 0 },
    cobaltContent: { min: 0, max: 0 },
    nickelContent: { min: 0, max: 0 },
    rareEarthContent: { min: 0, max: 0 },
    copperContent: { min: 2, max: 5 },
    recoveryValue: { min: 100, max: 500 },
    recoveryPathway: 'SCRAP_METAL',
    estimatedRecoveryYield: 40,
    co2eSavingsVsPrimaryMining: 0,
    co2eSavingsVsLandfill: 20,
    hasLithiumBattery: false,
    hasRareEarths: false,
    refurbishmentPotential: false,
    notes: 'NOT DLE-applicable. Lead-acid battery only. Scrap metal recovery.',
  },
};

export function getAssetProfile(assetType: string): MaterialProfile | null {
  return ASSET_MATERIAL_DATABASE[assetType] || null;
}

export function isDLESuitable(assetType: string): boolean {
  const profile = getAssetProfile(assetType);
  return profile?.isDLESuitable ?? false;
}

export function getRecoveryPathway(assetType: string): RecoveryPathway {
  const profile = getAssetProfile(assetType);
  return profile?.recoveryPathway ?? 'LANDFILL';
}
