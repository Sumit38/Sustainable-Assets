/**
 * Reference values used when the uploaded file does not provide its own numbers.
 * Every figure here is a typical value, shown in the app as "reference data".
 *
 * Power ratings: typical on-mode draw of a model 4+ years old ("legacy") versus a current
 * ENERGY STAR-class model ("current"). Embodied: typical manufacturer product-carbon-footprint
 * (cradle-to-gate) per unit. Grid factors: approximate 2023 average carbon intensity of
 * electricity generation per country (Ember / IEA).
 */

export interface AssetEmissionProfile {
  legacyPowerW: number
  currentPowerW: number
  hoursPerYear: number
  embodiedKg: number
  lifetimeYears: number
  scope1KgPerYear: number
  replacement: {
    label: string
    powerW: number
    embodiedKg: number
    lifetimeYears: number
    scope1KgPerYear: number
  }
}

const OFFICE_HOURS = 2000 // 8 h × 250 working days
const ALWAYS_ON = 8760

const same = (p: Omit<AssetEmissionProfile, 'replacement'>, label: string): AssetEmissionProfile => ({
  ...p,
  replacement: {
    label,
    powerW: p.currentPowerW,
    embodiedKg: p.embodiedKg,
    lifetimeYears: p.lifetimeYears,
    scope1KgPerYear: p.scope1KgPerYear,
  },
})

export const EMISSION_PROFILES: Record<string, AssetEmissionProfile> = {
  Laptop: same({ legacyPowerW: 30, currentPowerW: 15, hoursPerYear: OFFICE_HOURS, embodiedKg: 300, lifetimeYears: 4, scope1KgPerYear: 0 }, 'Current-generation ENERGY STAR laptop'),
  Monitor: same({ legacyPowerW: 32, currentPowerW: 16, hoursPerYear: OFFICE_HOURS, embodiedKg: 400, lifetimeYears: 6, scope1KgPerYear: 0 }, 'ENERGY STAR 27" LED monitor'),
  'Desktop Computer': same({ legacyPowerW: 90, currentPowerW: 40, hoursPerYear: OFFICE_HOURS, embodiedKg: 350, lifetimeYears: 5, scope1KgPerYear: 0 }, 'ENERGY STAR small-form-factor desktop'),
  Printer: same({ legacyPowerW: 75, currentPowerW: 25, hoursPerYear: OFFICE_HOURS, embodiedKg: 250, lifetimeYears: 6, scope1KgPerYear: 0 }, 'ENERGY STAR office laser printer'),
  'Docking Station': same({ legacyPowerW: 10, currentPowerW: 4, hoursPerYear: OFFICE_HOURS, embodiedKg: 30, lifetimeYears: 5, scope1KgPerYear: 0 }, 'USB-C docking station (low-standby)'),
  Keyboard: same({ legacyPowerW: 0.5, currentPowerW: 0.3, hoursPerYear: OFFICE_HOURS, embodiedKg: 15, lifetimeYears: 6, scope1KgPerYear: 0 }, 'Low-power wired keyboard'),
  Smartphone: same({ legacyPowerW: 2, currentPowerW: 1.5, hoursPerYear: OFFICE_HOURS, embodiedKg: 60, lifetimeYears: 3, scope1KgPerYear: 0 }, 'Current-generation smartphone'),
  Tablet: same({ legacyPowerW: 3, currentPowerW: 2, hoursPerYear: OFFICE_HOURS, embodiedKg: 100, lifetimeYears: 4, scope1KgPerYear: 0 }, 'Current-generation tablet'),
  Server: same({ legacyPowerW: 300, currentPowerW: 200, hoursPerYear: ALWAYS_ON, embodiedKg: 1300, lifetimeYears: 5, scope1KgPerYear: 0 }, 'ENERGY STAR 1U rack server'),
  'Network Router': same({ legacyPowerW: 20, currentPowerW: 12, hoursPerYear: ALWAYS_ON, embodiedKg: 50, lifetimeYears: 6, scope1KgPerYear: 0 }, 'Current-generation business router'),
  'UPS System': same({ legacyPowerW: 40, currentPowerW: 20, hoursPerYear: ALWAYS_ON, embodiedKg: 200, lifetimeYears: 8, scope1KgPerYear: 0 }, 'ENERGY STAR UPS (high-efficiency mode)'),
  'Storage Device': same({ legacyPowerW: 30, currentPowerW: 18, hoursPerYear: ALWAYS_ON, embodiedKg: 150, lifetimeYears: 5, scope1KgPerYear: 0 }, 'ENERGY STAR network storage (NAS)'),
}

/** kg CO2e per kWh, approximate 2023 average for electricity generation. */
export const GRID_FACTORS: Record<string, number> = {
  Australia: 0.49,
  Brazil: 0.1,
  Canada: 0.17,
  China: 0.58,
  France: 0.06,
  Germany: 0.38,
  India: 0.71,
  Indonesia: 0.68,
  Ireland: 0.29,
  Italy: 0.33,
  Japan: 0.48,
  Mexico: 0.43,
  Netherlands: 0.27,
  Norway: 0.03,
  Poland: 0.66,
  Singapore: 0.47,
  'South Africa': 0.71,
  'South Korea': 0.43,
  Spain: 0.17,
  Sweden: 0.04,
  'United Arab Emirates': 0.4,
  'United Kingdom': 0.24,
  'United States': 0.37,
  Egypt: 0.46,
  Kenya: 0.08,
  Morocco: 0.63,
  Nigeria: 0.4,
}

export const WORLD_AVERAGE_GRID_FACTOR = 0.48

/** Assets made this many years ago or more use the legacy power rating. */
export const LEGACY_AGE_YEARS = 4
