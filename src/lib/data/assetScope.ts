/**
 * AssetPulse covers electronic and digital assets only. Furniture, vehicles and real estate
 * are excluded on import and when loading previously saved data.
 */
const PHYSICAL = /\b(chairs?|tables?|desks?|cabinets?|cubicles?|furniture|sofas?|couch(es)?|shel(f|ves|ving)|lockers?|bench(es)?|stools?|wardrobes?|vehicles?|cars?|trucks?|vans?|forklifts?|motorcycles?|real estate|buildings?|land|property|properties|office space|warehouses?)\b/i

export function isPhysicalAssetType(assetType: string | undefined): boolean {
  return !!assetType && PHYSICAL.test(assetType)
}

export const SUPPORTED_ASSET_EXAMPLES = [
  'Laptop',
  'Desktop Computer',
  'Monitor',
  'Printer',
  'Docking Station',
  'Keyboard',
  'Smartphone',
  'Tablet',
  'Server',
  'Network Router',
  'Storage Device',
  'UPS System',
  'Software',
]
