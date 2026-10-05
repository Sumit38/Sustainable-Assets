/**
 * Regulatory reference for electronic and digital assets.
 *
 * Each category (data protection, e-waste, …) applies only to the asset types it governs.
 * Within a category, every country is mapped to its own law, legal reference and the penalty
 * as stated in that law. A "possible fine" is the fixed statutory maximum of a law, counted
 * once per law per country, never per asset. Turnover-based caps and penalties without a fixed
 * amount are shown as text and are not added to totals.
 *
 * Amounts are converted to USD at fixed reference rates (FX_TO_USD). Penalty values change
 * over time: verify with legal counsel before relying on them.
 */

export type Region = 'Europe (GDPR/RoHS)' | 'North America (EPA/OSHA)' | 'Asia Pacific (Local Regs)' | 'Africa' | 'Other Regions'
export type ComplianceStandard = 'GDPR' | 'RoHS' | 'EPA' | 'OSHA' | 'ISO 27001' | 'PCI DSS' | 'HIPAA' | 'SOC 2' | 'NIST' | 'CE'

export const REGIONS: Region[] = ['Europe (GDPR/RoHS)', 'North America (EPA/OSHA)', 'Asia Pacific (Local Regs)', 'Africa', 'Other Regions']

export type LawKind = 'statutory' | 'national' | 'contractual' | 'framework'

export interface LawEntry {
  law: string
  citation: string
  penalty: string
  kind: LawKind
  /** Fixed statutory maximum in local currency, if the law states one. */
  max?: { amount: number; currency: Currency }
  /** Only applies to some organisations; listed but never added to totals. */
  condition?: string
}

export interface ComplianceStandardInfo {
  id: ComplianceStandard
  name: string
  short: string
  requirement: string
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'SGD' | 'AUD' | 'BRL' | 'CAD' | 'ZAR' | 'NGN' | 'KES' | 'EGP'

/** Fixed reference conversion rates (approximate), used only to compare amounts. */
export const FX_TO_USD: Record<Currency, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  INR: 0.012,
  SGD: 0.74,
  AUD: 0.66,
  BRL: 0.18,
  CAD: 0.73,
  ZAR: 0.055,
  NGN: 0.00065,
  KES: 0.0077,
  EGP: 0.02,
}

export const COMPLIANCE_STANDARDS: Record<ComplianceStandard, ComplianceStandardInfo> = {
  GDPR: {
    id: 'GDPR',
    name: 'Data protection (GDPR & national equivalents)',
    short: 'Data protection',
    requirement: 'Devices holding personal data must be secured in use and certifiably wiped before reuse, resale or disposal.',
    risk: 'CRITICAL',
  },
  RoHS: {
    id: 'RoHS',
    name: 'Hazardous substances in electronics (RoHS)',
    short: 'RoHS',
    requirement: 'Electronic equipment must stay within limits for lead, mercury, cadmium and other restricted substances. Check when buying replacements.',
    risk: 'HIGH',
  },
  EPA: {
    id: 'EPA',
    name: 'E-waste & environment',
    short: 'E-waste',
    requirement: 'Electronic waste must go to authorised recyclers, never to landfill, with disposal records kept.',
    risk: 'CRITICAL',
  },
  OSHA: {
    id: 'OSHA',
    name: 'Workplace electrical safety',
    short: 'Workplace safety',
    requirement: 'Electrical equipment used by staff must be safe and maintained; faulty or damaged devices must be taken out of use.',
    risk: 'HIGH',
  },
  'ISO 27001': {
    id: 'ISO 27001',
    name: 'Information security (ISO/IEC 27001)',
    short: 'ISO 27001',
    requirement: 'Annex A 7.14 (secure disposal or reuse of equipment) and 8.1 (user endpoint devices).',
    risk: 'HIGH',
  },
  'PCI DSS': {
    id: 'PCI DSS',
    name: 'Payment card data (PCI DSS)',
    short: 'PCI DSS',
    requirement: 'Devices that store, process or transmit card data must be protected, and media destroyed when no longer needed (Req. 9.4).',
    risk: 'HIGH',
  },
  HIPAA: {
    id: 'HIPAA',
    name: 'US health data (HIPAA)',
    short: 'HIPAA',
    requirement: 'Device and media controls: track hardware holding health data and remove it securely before disposal or reuse.',
    risk: 'CRITICAL',
  },
  'SOC 2': {
    id: 'SOC 2',
    name: 'Service organisation controls (SOC 2)',
    short: 'SOC 2',
    requirement: 'CC6.5: data and software are disposed of securely when assets are retired.',
    risk: 'MEDIUM',
  },
  NIST: {
    id: 'NIST',
    name: 'Media sanitisation (NIST SP 800-88)',
    short: 'NIST 800-88',
    requirement: 'Storage media must be cleared, purged or destroyed according to the sensitivity of the data before leaving your control.',
    risk: 'MEDIUM',
  },
  CE: {
    id: 'CE',
    name: 'EU product conformity (CE marking)',
    short: 'CE marking',
    requirement: 'Electronic equipment on the EU market must carry CE marking. This is mainly a duty of manufacturers and importers, so verify it at procurement.',
    risk: 'MEDIUM',
  },
}

// ---- Asset scope: which asset types each category governs -----------------------------

const DATA_BEARING = new Set(['Laptop', 'Desktop Computer', 'Smartphone', 'Tablet', 'Server', 'Printer', 'Network Router', 'Storage Device', 'Software'])
const CARD_DATA = new Set(['Server', 'Desktop Computer', 'Laptop', 'Network Router', 'POS Terminal', 'Software'])
const SERVICE_CONTROLS = new Set(['Server', 'Software', 'Network Router', 'Laptop', 'Desktop Computer', 'Storage Device'])
const isHardware = (t: string) => t !== 'Software'

const SCOPE: Record<ComplianceStandard, (assetType: string) => boolean> = {
  GDPR: t => DATA_BEARING.has(t),
  HIPAA: t => DATA_BEARING.has(t),
  NIST: t => DATA_BEARING.has(t),
  'ISO 27001': t => DATA_BEARING.has(t),
  'PCI DSS': t => CARD_DATA.has(t),
  'SOC 2': t => SERVICE_CONTROLS.has(t),
  RoHS: isHardware,
  EPA: isHardware,
  OSHA: isHardware,
  CE: isHardware,
}

// ---- Country laws -----------------------------------------------------------------------

export const EU_COUNTRIES = new Set([
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France',
  'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Poland',
  'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
])

const national = (law: string, citation = 'National law', penalty = 'Penalty set by national law; no fixed amount used here'): LawEntry => ({
  law,
  citation,
  penalty,
  kind: 'national',
})

const DATA_PROTECTION: Record<string, LawEntry> = {
  EU: {
    law: 'EU General Data Protection Regulation (GDPR)',
    citation: 'Art. 32 (security); Art. 83(4)–(5)',
    penalty: 'Up to €20M or 4% of worldwide annual turnover, whichever is higher',
    kind: 'statutory',
    max: { amount: 20_000_000, currency: 'EUR' },
  },
  'United Kingdom': {
    law: 'UK GDPR & Data Protection Act 2018',
    citation: 'UK GDPR Art. 32; DPA 2018 s.157',
    penalty: 'Up to £17.5M or 4% of worldwide annual turnover, whichever is higher',
    kind: 'statutory',
    max: { amount: 17_500_000, currency: 'GBP' },
  },
  India: {
    law: 'Digital Personal Data Protection Act 2023',
    citation: 's.8(5) security safeguards; Schedule, item 1',
    penalty: 'Up to ₹250 crore for failing to take reasonable security safeguards',
    kind: 'statutory',
    max: { amount: 2_500_000_000, currency: 'INR' },
  },
  Singapore: {
    law: 'Personal Data Protection Act 2012',
    citation: 's.24 (protection); s.48J (financial penalties)',
    penalty: 'Up to S$1M, or 10% of annual Singapore turnover if turnover exceeds S$10M, whichever is higher',
    kind: 'statutory',
    max: { amount: 1_000_000, currency: 'SGD' },
  },
  Australia: {
    law: 'Privacy Act 1988',
    citation: 'APP 11 (security); s.13G',
    penalty: 'Up to the greater of A$50M, 3× the benefit obtained, or 30% of adjusted turnover',
    kind: 'statutory',
    max: { amount: 50_000_000, currency: 'AUD' },
  },
  Brazil: {
    law: 'General Data Protection Law (LGPD, Law 13,709/2018)',
    citation: 'Art. 46 (security); Art. 52',
    penalty: 'Up to 2% of revenue in Brazil, capped at R$50M per infraction',
    kind: 'statutory',
    max: { amount: 50_000_000, currency: 'BRL' },
  },
  Canada: {
    law: 'PIPEDA',
    citation: 'Schedule 1, Principle 4.7; s.28',
    penalty: 'Up to C$100,000 per offence',
    kind: 'statutory',
    max: { amount: 100_000, currency: 'CAD' },
  },
  'South Africa': {
    law: 'Protection of Personal Information Act 2013 (POPIA)',
    citation: 's.19 (security); s.107',
    penalty: 'Up to R10M and/or up to 10 years’ imprisonment',
    kind: 'statutory',
    max: { amount: 10_000_000, currency: 'ZAR' },
  },
  Nigeria: {
    law: 'Nigeria Data Protection Act 2023',
    citation: 's.39 (security); s.48',
    penalty: 'Up to ₦10M or 2% of annual gross revenue, whichever is greater (data controllers of major importance)',
    kind: 'statutory',
    max: { amount: 10_000_000, currency: 'NGN' },
  },
  Kenya: {
    law: 'Data Protection Act 2019',
    citation: 's.41 (security); s.63',
    penalty: 'Up to KES 5M or 1% of annual turnover, whichever is lower',
    kind: 'statutory',
    max: { amount: 5_000_000, currency: 'KES' },
  },
  Egypt: {
    law: 'Personal Data Protection Law No. 151 of 2020',
    citation: 'Penalty provisions, Arts. 35–48',
    penalty: 'Up to EGP 5M, depending on the offence',
    kind: 'statutory',
    max: { amount: 5_000_000, currency: 'EGP' },
  },
}

const E_WASTE: Record<string, LawEntry> = {
  Germany: {
    law: 'Electrical and Electronic Equipment Act (ElektroG, WEEE)',
    citation: '§45',
    penalty: 'Up to €100,000 per administrative offence',
    kind: 'statutory',
    max: { amount: 100_000, currency: 'EUR' },
  },
  France: national('French WEEE rules (Code de l’environnement)', 'Art. R543-172 ff.'),
  EU: national('National WEEE law (Directive 2012/19/EU)', 'Directive 2012/19/EU, Art. 22'),
  'United Kingdom': national('WEEE Regulations 2013', 'Offences provisions', 'Unlimited fine on conviction; no fixed amount'),
  'United States': national('RCRA hazardous-waste rules & state e-waste laws', '42 U.S.C. §6928', 'Civil penalty per day per violation, adjusted yearly by EPA; no fixed amount used here'),
  India: {
    law: 'E-Waste (Management) Rules 2022, under the Environment (Protection) Act 1986',
    citation: 'EP Act s.15 (as amended 2023)',
    penalty: 'Penalty from ₹10,000 up to ₹15 lakh, plus environmental compensation',
    kind: 'statutory',
    max: { amount: 1_500_000, currency: 'INR' },
  },
  Brazil: {
    law: 'National Solid Waste Policy (Law 12,305/2010) & Decree 6,514/2008',
    citation: 'Decree 6,514/2008, Art. 62',
    penalty: 'Fines from R$5,000 up to R$50M',
    kind: 'statutory',
    max: { amount: 50_000_000, currency: 'BRL' },
  },
  'South Africa': {
    law: 'National Environmental Management: Waste Act 2008',
    citation: 's.67–68',
    penalty: 'Up to R10M and/or up to 10 years’ imprisonment',
    kind: 'statutory',
    max: { amount: 10_000_000, currency: 'ZAR' },
  },
  Canada: national('Provincial e-waste stewardship regulations', 'Provincial law'),
  Australia: national('State e-waste landfill bans and the Recycling and Waste Reduction Act 2020', 'State and federal law'),
  Singapore: national('Resource Sustainability Act 2019 (e-waste)', 'Part 3'),
  Nigeria: national('National Environmental (Electrical/Electronic Sector) Regulations', 'NESREA regulations'),
  Kenya: national('Sustainable Waste Management Act 2022', 'Offences provisions'),
  Egypt: national('Waste Management Law No. 202 of 2020', 'Penalty provisions'),
}

const WORKPLACE_SAFETY: Record<string, LawEntry> = {
  'United States': {
    law: 'Occupational Safety and Health Act (OSHA)',
    citation: '29 U.S.C. §666; 2025 inflation adjustment',
    penalty: 'Up to $16,550 per serious violation; up to $165,514 per wilful or repeated violation',
    kind: 'statutory',
    max: { amount: 165_514, currency: 'USD' },
  },
  'United Kingdom': national('Health and Safety at Work etc. Act 1974; Electricity at Work Regulations 1989', 's.33', 'Unlimited fine on conviction; no fixed amount'),
}

const ROHS: Record<string, LawEntry> = {
  EU: national('RoHS Directive 2011/65/EU (national transposition)', 'Directive 2011/65/EU, Art. 23'),
  'United Kingdom': national('RoHS Regulations 2012', 'Enforcement provisions', 'Unlimited fine on conviction; no fixed amount'),
  India: national('E-Waste (Management) Rules 2022, RoHS provisions', 'Rule 16', 'Same penalty provision as the E-Waste Rules (counted once, under E-waste)'),
}

const CE_MARKING: Record<string, LawEntry> = {
  EU: { ...national('EU product legislation (CE marking)', 'Regulation (EU) 2019/1020'), condition: 'Mainly applies to manufacturers and importers' },
}

const FRAMEWORK = (law: string, citation: string, condition?: string): LawEntry => ({
  law,
  citation,
  penalty: 'Not a law: no fine. Risk is losing certification or customer contracts',
  kind: 'framework',
  condition,
})

function pick(table: Record<string, LawEntry>, country: string): LawEntry | null {
  return table[country] ?? (EU_COUNTRIES.has(country) ? table.EU ?? null : null)
}

export function lawFor(standard: ComplianceStandard, country: string): LawEntry | null {
  switch (standard) {
    case 'GDPR':
      return pick(DATA_PROTECTION, country)
    case 'EPA':
      return pick(E_WASTE, country) ?? national('National e-waste / environmental law')
    case 'OSHA':
      return pick(WORKPLACE_SAFETY, country) ?? national('National occupational health & safety law')
    case 'RoHS':
      return pick(ROHS, country)
    case 'CE':
      return pick(CE_MARKING, country)
    case 'HIPAA':
      return country === 'United States'
        ? {
            law: 'HIPAA Security Rule',
            citation: '45 CFR 164.310(d); 2024 inflation adjustment',
            penalty: 'Up to $2,134,831 per calendar year for identical violations',
            kind: 'statutory',
            max: { amount: 2_134_831, currency: 'USD' },
            condition: 'Only if you handle US health information',
          }
        : null
    case 'PCI DSS':
      return {
        law: 'PCI DSS v4.0 (card-brand contract)',
        citation: 'Requirement 9.4',
        penalty: 'Contractual penalties set by card brands and acquirers; not a law',
        kind: 'contractual',
        condition: 'Only if you process card payments',
      }
    case 'ISO 27001':
      return FRAMEWORK('ISO/IEC 27001:2022', 'Annex A 7.14, 8.1', 'Only if certified or contractually required')
    case 'SOC 2':
      return FRAMEWORK('SOC 2 (AICPA Trust Services Criteria)', 'CC6.5', 'Only if you provide audited services')
    case 'NIST':
      return FRAMEWORK('NIST SP 800-88 Rev. 1', 'Sections 4–5', 'Best practice; mandatory for some US government contracts')
  }
}

export function maxFineUSD(law: LawEntry | null): number {
  return law?.max ? law.max.amount * FX_TO_USD[law.max.currency] : 0
}

/** Counts toward the possible-fine total: a fixed statutory amount with no applicability condition. */
export function countsTowardFine(law: LawEntry | null): boolean {
  return !!law && law.kind === 'statutory' && !!law.max && !law.condition
}

/** Regulation categories that apply to an asset, based on its type and country. */
export function getApplicableStandards(assetType: string, country: string): ComplianceStandard[] {
  return (Object.keys(COMPLIANCE_STANDARDS) as ComplianceStandard[]).filter(s => SCOPE[s](assetType) && lawFor(s, country) !== null)
}

export function standardLabel(id: string): string {
  return COMPLIANCE_STANDARDS[id as ComplianceStandard]?.short ?? id
}

/** Countries with a dedicated entry in at least one category (for the Logic Library). */
export const REFERENCE_COUNTRIES = [
  'Germany', 'France', 'United Kingdom', 'United States', 'Canada', 'India', 'Singapore', 'Australia', 'Brazil',
  'South Africa', 'Nigeria', 'Kenya', 'Egypt',
]

export interface FineLine {
  standard: ComplianceStandard
  country: string
  law: LawEntry
  assetsBelowTarget: number
  possibleFineUSD: number
}

/**
 * Possible fines: for every (regulation, country) where at least one asset below the compliance
 * target is in scope, the law's fixed statutory maximum, counted once.
 */
export function possibleFines(
  assets: Array<{ assetType: string; country: string; complianceScore: number }>,
  threshold: number,
  onlyStandard?: string
): { total: number; lines: FineLine[] } {
  const lines = new Map<string, FineLine>()
  for (const a of assets) {
    if (a.complianceScore >= threshold) continue
    for (const s of getApplicableStandards(a.assetType, a.country)) {
      if (onlyStandard && onlyStandard !== 'all' && s !== onlyStandard) continue
      const law = lawFor(s, a.country)!
      const key = `${s}|${a.country}`
      const line = lines.get(key) ?? { standard: s, country: a.country, law, assetsBelowTarget: 0, possibleFineUSD: countsTowardFine(law) ? maxFineUSD(law) : 0 }
      line.assetsBelowTarget++
      lines.set(key, line)
    }
  }
  const list = Array.from(lines.values()).sort((a, b) => b.possibleFineUSD - a.possibleFineUSD || b.assetsBelowTarget - a.assetsBelowTarget)
  return { total: list.reduce((s, l) => s + l.possibleFineUSD, 0), lines: list }
}
