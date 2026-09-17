# Methane (CH₄) Emissions Tracking System

## Overview
A comprehensive methane emissions tracking system for landfill discard scenarios in the Asset Health System. Monitors greenhouse gas emissions from organic material degradation in landfills and provides actionable insights for environmental impact reduction.

## Key Metrics

### Environmental Impact
- **Total Methane**: 45.80 kg (escaped methane from landfill)
- **CO₂e Equivalent**: 1,282 kg CO₂e (100-year timeframe, GWP = 28)
- **Avoidance Opportunity**: 1,282 kg CO₂e (savings if recycled instead of landfilled)
- **Capture Rate Model**: 65% captured/managed, 35% escapes to atmosphere

### Material Breakdown
| Material | Generation Factor | CO₂e Impact | Asset Count |
|----------|-------------------|-------------|-------------|
| Foam | 35% | 798 kg (62%) | 12 |
| Fabric | 28% | 286 kg (22%) | 8 |
| Wood | 25% | 126 kg (10%) | 5 |
| Paper | 32% | 73 kg (6%) | 3 |

## Database Schema

### Core Tables

#### `asset_methane_emissions`
Tracks methane emissions per asset destined for landfill.

**Columns:**
- `asset_id` (UUID): Reference to asset
- `eol_pathway` (VARCHAR): Should be 'landfill' for methane tracking
- `total_weight_kg` (DECIMAL): Total asset weight
- `gross_methane_produced_kg` (DECIMAL): Total CH₄ from degradation
- `captured_methane_kg` (DECIMAL): CH₄ captured by landfill systems (65%)
- `escaped_methane_kg` (DECIMAL): CH₄ released to atmosphere (35%)
- `methane_co2e_equivalent` (DECIMAL): kg CO₂e using GWP=28
- `methane_co2e_20year` (DECIMAL): kg CO₂e using GWP=84 (20-year timeframe)
- `compared_to_recycling` (DECIMAL): % worse than recycling
- `recommendation` (TEXT): Action recommendations
- `material_breakdown` (JSONB): Material composition {Foam: 3.5kg, Fabric: 2.1kg, ...}

#### `organization_landfill_impact`
Organization-wide methane summary.

**Columns:**
- `organization_id` (UUID): Organization reference
- `total_assets_to_landfill` (INTEGER): Count of assets to landfill
- `total_weight_to_landfill_kg` (DECIMAL): Total weight sent to landfill
- `total_methane_emissions_kg` (DECIMAL): Total CH₄ from org landfill
- `total_co2e_from_methane` (DECIMAL): Total kg CO₂e equivalent
- `avoidance_opportunity_kg` (DECIMAL): CO₂e savings if recycled
- `high_methane_assets` (INTEGER): Assets with >10kg escaped methane
- `medium_methane_assets` (INTEGER): Assets with 5-10kg escaped methane
- `methane_alert_count` (INTEGER): Total active methane alerts

#### `methane_source_analysis`
Material-type breakdown across organization.

**Columns:**
- `organization_id` (UUID): Organization reference
- `material_type` (VARCHAR): Foam, Fabric, Wood, Paper, Leather, etc.
- `total_weight_kg` (DECIMAL): Total weight of material type
- `methane_generation_rate` (DECIMAL): Factor: 0.0 - 0.35
- `total_methane_produced_kg` (DECIMAL): Total CH₄ from material
- `total_co2e_equivalent` (DECIMAL): CO₂e equivalent
- `asset_count` (INTEGER): Number of assets with this material
- `high_risk_assets` (INTEGER): Count of high-risk assets

#### `methane_alerts`
Warnings for high-methane assets.

**Columns:**
- `organization_id` (UUID): Organization reference
- `asset_id` (UUID): Asset reference (nullable)
- `alert_type` (VARCHAR): CRITICAL_METHANE, HIGH_METHANE_PRODUCER, LANDFILL_ALTERNATIVE
- `severity` (VARCHAR): critical, high, medium, low
- `methane_impact_kg` (DECIMAL): Escaped methane in kg
- `co2e_equivalent` (DECIMAL): CO₂e equivalent
- `message` (TEXT): Alert description
- `recommendation` (TEXT): Action recommendation
- `action_required` (BOOLEAN): Requires immediate action
- `resolved_at` (TIMESTAMP): When alert was resolved

#### `landfill_alternatives`
Environmental comparison for disposal methods.

**Columns:**
- `asset_id` (UUID): Asset reference
- `current_plan` (VARCHAR): 'landfill'
- `methane_cost_kg_co2e` (DECIMAL): Environmental cost if landfilled
- `reuse_benefit_kg_co2e` (DECIMAL): Savings if reused (95%)
- `recycling_benefit_kg_co2e` (DECIMAL): Savings if recycled (90%)
- `refurbishing_benefit_kg_co2e` (DECIMAL): Savings if refurbished (92%)
- `best_alternative` (VARCHAR): Recommended disposal method
- `impact_reduction_percentage` (DECIMAL): % reduction with best option
- `recommended_action` (TEXT): Action description

### Database Views

#### `high_risk_methane_assets`
Ranked list of high-methane producers.

```sql
SELECT
  asset_id,
  asset_type,
  total_weight_kg,
  escaped_methane_kg,
  methane_co2e_equivalent,
  risk_level (CRITICAL/HIGH/MEDIUM/LOW),
  recommendation,
  calculated_at
FROM asset_methane_emissions
WHERE eol_pathway = 'landfill'
ORDER BY escaped_methane_kg DESC
```

#### `organization_methane_summary`
Organization-level methane breakdown with percentages.

## Calculation Engine

### Key Functions

#### `calculateMaterialMethaneEmissions(materialType, weightKg, timeframe)`
Calculates methane emissions for a single material.

**Parameters:**
- `materialType`: Foam, Fabric, Wood, Plastic, Steel, Paper, Leather
- `weightKg`: Material weight in kilograms
- `timeframe`: '100-year' or '20-year' (for GWP selection)

**Returns:**
```typescript
{
  materialType: string
  weightKg: number
  methaneGenerationFactor: number
  grossMethaneProducedKg: number
  capturedMethaneKg: number (65% of gross)
  escapedMethaneKg: number (35% of gross)
  totalCO2eEquivalent: number
  timeframe: '100-year' | '20-year'
}
```

#### `calculateTotalAssetMethaneEmissions(materials[], timeframe)`
Sums methane across all materials in an asset.

**Returns:**
```typescript
{
  totalGrossMethane: number
  totalCapturedMethane: number
  totalEscapedMethane: number
  totalCO2eEquivalent: number
  byMaterial: MethaneEmissionData[]
}
```

#### `compareLandfillVsRecycling(assetType, totalWeightKg, materials, directCO2e)`
Compares environmental impact of landfill vs recycling.

**Returns:**
```typescript
{
  landfillMethaneEmissions: number
  landfillCO2eEquivalent: number
  totalLandfillImpact: number
  comparisonToRecycling: number (% comparison)
  recommendation: string
}
```

#### `getMethaneImpactLevel(escapedMethaneKg, co2eEquivalent)`
Classifies methane severity.

**Severity Levels:**
- **CRITICAL**: >10 kg CH₄ or >250 kg CO₂e
- **HIGH**: >5 kg CH₄ or >100 kg CO₂e
- **MEDIUM**: >2 kg CH₄ or >40 kg CO₂e
- **LOW**: ≤2 kg CH₄ or ≤40 kg CO₂e

#### `calculateOrganizationLandfillImpact(landfillAssets[])`
Calculates org-wide landfill methane impact.

**Returns:**
```typescript
{
  totalAssetsToLandfill: number
  totalWeightToLandfill: number
  totalMethaneEmissions: number
  totalCO2eFromMethane: number
  avoidanceOpportunity: number
}
```

## API Functions

### Asset-Level Operations

#### `calculateAndStoreMethaneEmissions(assetId, totalWeightKg, materials, eolPathway, directCO2e)`
Calculates and persists methane emissions for an asset.

#### `getMethaneEmissions(assetId)`
Retrieves stored methane data for an asset.

### Organization-Level Operations

#### `calculateAndStoreOrganizationLandfillImpact(organizationId)`
Aggregates landfill impact across all organization assets.

#### `getOrganizationLandfillImpact(organizationId)`
Retrieves latest organization landfill summary.

### Analysis & Insights

#### `analyzeMethaneByMaterial(organizationId)`
Provides material-level breakdown of methane generation.

**Returns:** Array of material analysis objects with generation rates and asset counts.

#### `analyzeAlternativesToLandfill(assetId, totalWeightKg, materials, landfillMethaneImpact)`
Compares disposal pathway alternatives.

**Returns:** Recommendation for best alternative (reuse, recycling, refurbishing) with impact reduction percentage.

### Alert Management

#### `createMethaneAlert(organizationId, assetId, alertType, methaneImpactKg, co2eEquivalent)`
Creates a new methane alert.

#### `getMethaneAlerts(organizationId, limit)`
Retrieves active methane alerts.

#### `resolveMethaneAlert(alertId)`
Marks an alert as resolved.

## React Components

### `MethaneEmissions` Component
Comprehensive methane data visualization dashboard.

**Props:**
- `methaneByMaterial`: Array of material breakdown data
- `highMethaneAssets`: Array of high-risk asset alerts
- `totalMethaneKg`: Total escaped methane
- `totalCO2eFromMethane`: CO₂e equivalent
- `avoidanceOpportunity`: Savings opportunity kg

**Features:**
- KPI cards: Total CH₄, CO₂e equivalent, avoidance opportunity
- Material breakdown pie chart
- High-risk methane assets alert cards (color-coded by severity)
- Methane context information and best practices

### React Hooks

#### `useMethaneData(assetId?, organizationId?)`
Fetches methane data for asset or organization.

**Returns:**
```typescript
{
  assetMethane: any | null
  organizationLandfill: any | null
  methaneAlerts: any[]
  isLoading: boolean
  error: Error | null
}
```

#### `useHighMethaneAssets(organizationId?)`
Fetches high-risk methane assets.

#### `useMaterialMethaneBreakdown(organizationId?)`
Fetches material-level methane analysis.

## Sustainability Dashboard Integration

### Methane Tab (`/sustainability`)
Displays methane emissions dashboard with:

1. **KPI Cards**
   - Total Methane: 45.80 kg (escaped CH₄ from landfill)
   - Methane CO₂e: 1,282 kg CO₂e (GWP=28, 100-year timeframe)
   - Avoidance Opportunity: 1,282 kg CO₂e (savings if recycled)

2. **Material Breakdown Pie Chart**
   - Visual distribution of methane by material type
   - Percentage and CO₂e values for each material
   - Color-coded segments for easy identification

3. **High-Risk Methane Assets**
   - CRITICAL severity: >10 kg escaped methane (red)
   - HIGH severity: 5-10 kg escaped methane (orange)
   - Asset-specific recommendations
   - Impact reduction opportunities

4. **About Methane Emissions**
   - Key facts about methane impact
   - GWP explanation (28x CO₂ over 100 years)
   - Landfill capture rate (65% captured, 35% escapes)
   - High-risk materials and generation factors
   - Alternative disposal pathways

## High-Risk Assets Example

### Office Chairs (Foam) - CRITICAL
- **Escaped CH₄**: 12.30 kg
- **CO₂e Impact**: 344 kg
- **Severity**: CRITICAL
- **Recommendation**: "Prioritize recycling over landfill to save 344kg CO₂e"

### Cubicle Padding (Foam) - HIGH
- **Escaped CH₄**: 8.50 kg
- **CO₂e Impact**: 238 kg
- **Severity**: HIGH
- **Recommendation**: "Consider reuse or refurbishment to avoid methane emissions"

### Sofa Units (Fabric) - HIGH
- **Escaped CH₄**: 6.20 kg
- **CO₂e Impact**: 174 kg
- **Severity**: HIGH
- **Recommendation**: "Reuse in office lounges or donate - environmental impact reduced by 95%"

## Material Methane Generation Factors

| Material | Generation Factor | Risk Level | Comment |
|----------|-------------------|-----------|---------|
| Foam | 0.35 (35%) | CRITICAL | Highest methane producer |
| Paper | 0.32 (32%) | HIGH | High organic content |
| Leather | 0.30 (30%) | HIGH | Organic material |
| Fabric | 0.28 (28%) | MEDIUM | Natural fiber degradation |
| Wood | 0.25 (25%) | MEDIUM | Organic decomposition |
| Plastic | 0.05 (5%) | LOW | Minimal degradation |
| Steel | 0.0 (0%) | NONE | No methane generation |

## Global Warming Potential (GWP)

### CH₄ to CO₂e Conversion
- **100-year timeframe**: 1 kg CH₄ = 28 kg CO₂e
- **20-year timeframe**: 1 kg CH₄ = 84 kg CO₂e

### Example Calculations
- 10 kg escaped CH₄ = 280 kg CO₂e (100-year)
- 10 kg escaped CH₄ = 840 kg CO₂e (20-year)

## Disposal Pathway Environmental Impact

### Landfill Discard
- **Methane production**: Based on material composition
- **Capture rate**: 65% of methane captured/flared
- **Atmospheric release**: 35% of produced methane
- **Environmental cost**: Full methane + processing emissions

### Recycling Alternative
- **Methane elimination**: 100% of methane emissions avoided
- **Environmental benefit**: 90% reduction vs landfill
- **Processing emissions**: Minimal (electric/fuel-based)
- **Impact reduction**: Up to 1,282 kg CO₂e in example

### Reuse/Refurbishment
- **Methane elimination**: 100% of methane emissions avoided
- **Environmental benefit**: 95% reduction vs landfill
- **Useful life extension**: Highest impact reduction
- **Impact reduction**: Up to 1,282 kg CO₂e in example

## Alerts & Action Items

### When Alerts Are Generated
- Asset with >10 kg escaped methane: CRITICAL alert
- Asset with 5-10 kg escaped methane: HIGH alert
- Asset with 2-5 kg escaped methane: MEDIUM alert
- Asset with <2 kg escaped methane: LOW alert

### Recommended Actions
1. **CRITICAL Assets**: URGENT - Reconsider landfill. Prioritize recycling, reuse, or refurbishment.
2. **HIGH Assets**: Review alternatives to landfill discard. Evaluate reuse/refurbishment potential.
3. **MEDIUM Assets**: Consider environmental impact. Recycling recommended.
4. **LOW Assets**: Monitor. Minimal methane impact.

## Migration

Run database migration to create all tables and views:

```bash
psql -U postgres -d your_database < database/migrations/004_methane_emissions_tracking.sql
```

## Files Included

### Database
- `database/migrations/004_methane_emissions_tracking.sql` - Complete schema with 5 tables + 2 views

### Calculation Engines
- `src/lib/api/methane-calculations.ts` - Pure calculation functions (~330 lines)
- `src/lib/api/methane-tracking.ts` - Database API functions (~335 lines)

### React Components & Hooks
- `src/components/dashboard/MethaneEmissions.tsx` - Visualization component (~220 lines)
- `src/lib/hooks/useMethaneData.ts` - React hooks for data fetching

### Dashboard Integration
- `src/app/sustainability/page.tsx` - Updated with methane tab and mock data

### TypeScript Types
- `src/types/sustainability.ts` - Existing types (already included)

## Future Enhancements

1. **Real Database Integration**: Replace mock data with Supabase queries
2. **Material-Specific Recommendations**: AI-powered disposal pathway suggestions
3. **Trend Analysis**: Track methane improvements over time
4. **Export Functionality**: CSV/PDF reports of methane analysis
5. **Alerts Dashboard**: Real-time methane alert monitoring
6. **Circular Economy Scoring**: Incorporate methane into overall sustainability score
7. **Third-party Integration**: Connect to environmental reporting standards (GHG Protocol)
8. **Landfill Partner API**: Real-time capture rate data from landfill operators

## References

- **GHG Protocol**: Scope 2 & 3 emissions from asset disposal
- **Global Warming Potential**: IPCC AR5 methane GWP values
- **Landfill Methane Capture**: EPA Landfill Gas Energy Project standards
- **Circular Economy**: Ellen MacArthur Foundation definitions
