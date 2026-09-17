-- Environmental and Health Impact Tracking Tables
-- Created for Scope 2/3 emissions and health risk assessment

-- Asset Material Composition (for EOL calculations)
CREATE TABLE IF NOT EXISTS asset_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  material_type VARCHAR(50) NOT NULL, -- Steel, Plastic, Foam, Fabric, Wood
  weight_kg DECIMAL(10, 2) NOT NULL,
  emission_factor DECIMAL(10, 4) NOT NULL, -- kg CO2e per kg
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(asset_id, material_type)
);

-- Asset Environmental Metrics
CREATE TABLE IF NOT EXISTS asset_environmental_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  eol_pathway VARCHAR(50), -- reuse, refurbish, recycle, incinerate, landfill
  total_weight_kg DECIMAL(10, 2),
  scope2_emission DECIMAL(10, 4), -- kg CO2e
  scope3_emission DECIMAL(10, 4), -- kg CO2e
  total_eol_co2e DECIMAL(10, 4),
  transport_distance_km INTEGER,
  transport_co2e DECIMAL(10, 4),
  avoided_emissions DECIMAL(10, 4), -- if reused/refurbished
  last_calculated TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(asset_id)
);

-- Asset Health Impact Assessment
CREATE TABLE IF NOT EXISTS asset_health_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  asset_age_years INTEGER,
  condition_status VARCHAR(20), -- New, Good, Fair, Poor, EOL
  ergonomic_risk_score INTEGER, -- 0-100
  chemical_exposure_risk INTEGER, -- 0-100
  safety_risk_score INTEGER, -- 0-100
  overall_health_risk_score INTEGER, -- 0-100
  musculoskeletal_disorder_probability DECIMAL(5, 2), -- percentage
  back_pain_probability DECIMAL(5, 2),
  neck_strain_probability DECIMAL(5, 2),
  eye_strain_probability DECIMAL(5, 2),
  respiratory_issue_probability DECIMAL(5, 2),
  predicted_health_incidents INTEGER,
  predicted_annual_health_cost DECIMAL(12, 2),
  affected_employees_count INTEGER,
  last_assessed TIMESTAMP DEFAULT NOW(),
  UNIQUE(asset_id)
);

-- Organization Sustainability Index
CREATE TABLE IF NOT EXISTS organization_sustainability_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  global_pollution_index DECIMAL(10, 4), -- 0-1, where >0.8 is critical
  scope2_actual DECIMAL(12, 2), -- kg CO2e
  scope2_replaceable DECIMAL(12, 2), -- baseline
  scope3_actual DECIMAL(12, 2),
  scope3_replaceable DECIMAL(12, 2),
  energy_actual DECIMAL(12, 2),
  energy_replaceable DECIMAL(12, 2),
  replaceable_assets_count INTEGER,
  total_assets_count INTEGER,
  organizational_health_risk_score DECIMAL(5, 2), -- 0-100
  predicted_health_incidents_annual INTEGER,
  predicted_health_costs_annual DECIMAL(12, 2),
  recycling_rate DECIMAL(5, 2), -- percentage
  reuse_opportunity_count INTEGER,
  avoided_emissions_total DECIMAL(12, 2), -- kg CO2e
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, calculated_at::DATE)
);

-- Sustainability Alerts (extension of existing alerts table)
CREATE TABLE IF NOT EXISTS sustainability_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  alert_type VARCHAR(50) NOT NULL, -- HIGH_EOL_EMISSIONS, ERGONOMIC_RISK_HIGH, etc
  severity VARCHAR(20) NOT NULL, -- critical, warning, info
  message TEXT NOT NULL,
  affected_assets_count INTEGER,
  environmental_impact DECIMAL(12, 2), -- kg CO2e
  health_impact_count INTEGER,
  action_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Department-Level Sustainability Metrics
CREATE TABLE IF NOT EXISTS department_sustainability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  department_name VARCHAR(100) NOT NULL,
  total_assets INTEGER,
  eol_assets_count INTEGER,
  at_risk_assets_count INTEGER,
  total_co2e_emissions DECIMAL(12, 2),
  health_risk_score DECIMAL(5, 2),
  employees_at_risk INTEGER,
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, department_name, calculated_at::DATE)
);

-- Create indexes for performance
CREATE INDEX idx_asset_materials_asset_id ON asset_materials(asset_id);
CREATE INDEX idx_environmental_metrics_asset_id ON asset_environmental_metrics(asset_id);
CREATE INDEX idx_health_impact_asset_id ON asset_health_impact(asset_id);
CREATE INDEX idx_sustainability_index_org ON organization_sustainability_index(organization_id);
CREATE INDEX idx_sustainability_alerts_org ON sustainability_alerts(organization_id, created_at);
CREATE INDEX idx_department_sustainability_org ON department_sustainability(organization_id);

-- Add health_status_updated_at to assets if not exists
ALTER TABLE assets
ADD COLUMN IF NOT EXISTS eol_pathway VARCHAR(50),
ADD COLUMN IF NOT EXISTS carbon_footprint DECIMAL(10, 4),
ADD COLUMN IF NOT EXISTS health_risk_level VARCHAR(20);
