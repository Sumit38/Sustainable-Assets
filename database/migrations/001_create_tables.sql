-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create manufacturers table
CREATE TABLE manufacturers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  country VARCHAR(100),
  website VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create replacement products table
CREATE TABLE replacement_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  manufacturer_id UUID REFERENCES manufacturers(id),
  ergonomic_rating NUMERIC(3,1) CHECK (ergonomic_rating >= 1 AND ergonomic_rating <= 10),
  price NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create assets table (main data)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('Chair', 'Table', 'Cubicle Equipment')),
  product_name VARCHAR(255) NOT NULL,
  manufacturer_id UUID REFERENCES manufacturers(id),
  manufacturer VARCHAR(255) NOT NULL,
  asset_id VARCHAR(50) UNIQUE NOT NULL,
  barcode VARCHAR(50) UNIQUE NOT NULL,
  date_of_manufacture DATE NOT NULL,
  end_of_sale DATE,
  last_date_of_support DATE NOT NULL,
  replacement_product VARCHAR(255),
  product_parts TEXT[],
  potential_health_impact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create health metrics table
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('healthy', 'at-risk', 'critical', 'end-of-life')),
  risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  compliance_score NUMERIC(3,0) CHECK (compliance_score >= 0 AND compliance_score <= 100),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Create alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('support-ending', 'health-risk', 'compliance-violation', 'maintenance')),
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  days_until_action INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE,
  action_taken BOOLEAN DEFAULT FALSE
);

-- Create compliance metrics table
CREATE TABLE compliance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE UNIQUE,
  score NUMERIC(3,0) CHECK (score >= 0 AND score <= 100),
  violations TEXT[],
  last_audit_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table (for access control)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'viewer')) DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create audit log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_assets_asset_type ON assets(asset_type);
CREATE INDEX idx_assets_manufacturer ON assets(manufacturer);
CREATE INDEX idx_assets_last_date_of_support ON assets(last_date_of_support);
CREATE INDEX idx_health_metrics_asset_id ON health_metrics(asset_id);
CREATE INDEX idx_health_metrics_status ON health_metrics(status);
CREATE INDEX idx_alerts_asset_id ON alerts(asset_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_resolved_at ON alerts(resolved_at);
CREATE INDEX idx_compliance_metrics_asset_id ON compliance_metrics(asset_id);

-- Create views for common queries
CREATE VIEW assets_with_health AS
SELECT
  a.*,
  hm.status,
  hm.risk_level,
  hm.compliance_score,
  EXTRACT(DAY FROM (a.last_date_of_support - CURRENT_DATE)) as days_until_end_of_support
FROM assets a
LEFT JOIN health_metrics hm ON a.id = hm.asset_id;

CREATE VIEW pending_alerts_summary AS
SELECT
  severity,
  COUNT(*) as count,
  COUNT(CASE WHEN asset_id IN (SELECT id FROM assets) THEN 1 END) as asset_count
FROM alerts
WHERE resolved_at IS NULL
GROUP BY severity;

-- Insert sample manufacturers
INSERT INTO manufacturers (name, country) VALUES
('Godrej Interio', 'India'),
('Zuari', 'India'),
('IKEA', 'Sweden'),
('Durian', 'India'),
('Herman Miller', 'USA'),
('Featherlite', 'India'),
('Nilkamal', 'India')
ON CONFLICT (name) DO NOTHING;
