-- Methane (CH₄) Emissions Tracking for Landfill Discard
-- CH₄ has 28-36x higher GWP than CO₂

-- Asset Methane Emissions (for landfill discard scenario)
CREATE TABLE IF NOT EXISTS asset_methane_emissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  eol_pathway VARCHAR(50), -- Should be 'landfill' for methane tracking
  total_weight_kg DECIMAL(10, 2),
  gross_methane_produced_kg DECIMAL(10, 4), -- Total CH₄ from degradation
  captured_methane_kg DECIMAL(10, 4), -- CH₄ captured by landfill systems
  escaped_methane_kg DECIMAL(10, 4), -- CH₄ released to atmosphere
  methane_co2e_equivalent DECIMAL(10, 2), -- kg CO₂e (using GWP=28)
  methane_co2e_20year DECIMAL(10, 2), -- kg CO₂e over 20-year timeframe (GWP=84)
  compared_to_recycling DECIMAL(5, 2), -- % worse than recycling (100 = equal)
  recommendation TEXT,
  material_breakdown JSONB, -- {Foam: 3.5kg, Fabric: 2.1kg, ...}
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(asset_id, eol_pathway)
);

-- Organization Landfill Impact Summary
CREATE TABLE IF NOT EXISTS organization_landfill_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  total_assets_to_landfill INTEGER,
  total_weight_to_landfill_kg DECIMAL(12, 2),
  total_methane_emissions_kg DECIMAL(12, 4), -- Total CH₄
  total_co2e_from_methane DECIMAL(12, 2), -- kg CO₂e
  avoidance_opportunity_kg DECIMAL(12, 2), -- kg CO₂e saved if recycled
  high_methane_assets INTEGER, -- Assets with >10kg CH₄
  medium_methane_assets INTEGER, -- Assets with 5-10kg CH₄
  methane_alert_count INTEGER,
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, calculated_at::DATE)
);

-- Methane Source Breakdown by Material Type
CREATE TABLE IF NOT EXISTS methane_source_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  material_type VARCHAR(50), -- Foam, Fabric, Wood, Paper, Leather, etc.
  total_weight_kg DECIMAL(12, 2),
  methane_generation_rate DECIMAL(5, 4), -- Factor: 0.0 - 0.35
  total_methane_produced_kg DECIMAL(12, 4),
  total_co2e_equivalent DECIMAL(12, 2),
  asset_count INTEGER,
  high_risk_assets INTEGER,
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, material_type, calculated_at::DATE)
);

-- Methane Alerts & Warnings
CREATE TABLE IF NOT EXISTS methane_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  alert_type VARCHAR(50), -- CRITICAL_METHANE, HIGH_METHANE_PRODUCER, LANDFILL_ALTERNATIVE
  severity VARCHAR(20), -- critical, high, medium, low
  methane_impact_kg DECIMAL(10, 4),
  co2e_equivalent DECIMAL(10, 2),
  message TEXT NOT NULL,
  recommendation TEXT,
  action_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Landfill Alternative Comparison
CREATE TABLE IF NOT EXISTS landfill_alternatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  current_plan VARCHAR(50), -- landfill
  methane_cost_kg_co2e DECIMAL(10, 2), -- Cost if landfill
  reuse_benefit_kg_co2e DECIMAL(10, 2), -- Savings if reused
  recycling_benefit_kg_co2e DECIMAL(10, 2), -- Savings if recycled
  refurbishing_benefit_kg_co2e DECIMAL(10, 2), -- Savings if refurbished
  best_alternative VARCHAR(50), -- Best environmental option
  impact_reduction_percentage DECIMAL(5, 2), -- % reduction with best option
  recommended_action TEXT,
  analysis_date TIMESTAMP DEFAULT NOW(),
  UNIQUE(asset_id, current_plan)
);

-- Create indexes for performance
CREATE INDEX idx_methane_emissions_asset ON asset_methane_emissions(asset_id);
CREATE INDEX idx_methane_emissions_pathway ON asset_methane_emissions(eol_pathway);
CREATE INDEX idx_org_landfill_impact ON organization_landfill_impact(organization_id);
CREATE INDEX idx_methane_source_org ON methane_source_analysis(organization_id);
CREATE INDEX idx_methane_alerts_org ON methane_alerts(organization_id, created_at);
CREATE INDEX idx_methane_alerts_asset ON methane_alerts(asset_id);
CREATE INDEX idx_landfill_alternatives ON landfill_alternatives(asset_id);

-- Add methane-related columns to existing tables
ALTER TABLE asset_environmental_metrics
ADD COLUMN IF NOT EXISTS methane_impact_kg_co2e DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS landfill_scenario_co2e DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS methane_high_risk BOOLEAN DEFAULT FALSE;

-- Create view for high-risk methane assets
CREATE OR REPLACE VIEW high_risk_methane_assets AS
SELECT
  ame.asset_id,
  a.asset_type,
  ame.total_weight_kg,
  ame.escaped_methane_kg,
  ame.methane_co2e_equivalent,
  CASE
    WHEN ame.escaped_methane_kg > 10 THEN 'CRITICAL'
    WHEN ame.escaped_methane_kg > 5 THEN 'HIGH'
    WHEN ame.escaped_methane_kg > 2 THEN 'MEDIUM'
    ELSE 'LOW'
  END AS risk_level,
  ame.recommendation,
  ame.calculated_at
FROM asset_methane_emissions ame
JOIN assets a ON ame.asset_id = a.id
WHERE ame.eol_pathway = 'landfill'
ORDER BY ame.escaped_methane_kg DESC;

-- Create view for organization methane summary
CREATE OR REPLACE VIEW organization_methane_summary AS
SELECT
  oli.organization_id,
  oli.total_assets_to_landfill,
  oli.total_weight_to_landfill_kg,
  oli.total_methane_emissions_kg,
  oli.total_co2e_from_methane,
  oli.avoidance_opportunity_kg,
  oli.high_methane_assets,
  oli.medium_methane_assets,
  ROUND(
    (oli.total_co2e_from_methane / NULLIF(
      (SELECT COALESCE(SUM(total_eol_co2e), 0) FROM asset_environmental_metrics
       WHERE asset_id IN (
         SELECT id FROM assets WHERE user_id IN (
           SELECT user_id FROM assets WHERE id IN (
             SELECT asset_id FROM asset_environmental_metrics
           )
         )
       )),
      0
    ) * 100)::numeric,
    2
  ) AS methane_percentage_of_total,
  oli.calculated_at
FROM organization_landfill_impact oli;
