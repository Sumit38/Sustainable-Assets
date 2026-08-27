-- Add support for multiple asset categories (Admin, Hardware, Software, Real Estate, etc)

-- Create asset_categories table
CREATE TABLE asset_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(20),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create asset_fields table (for custom fields per category)
CREATE TABLE asset_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES asset_categories(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(50) NOT NULL, -- text, number, date, select, multi-select, boolean
  is_required BOOLEAN DEFAULT FALSE,
  field_order INTEGER,
  select_options TEXT[], -- for dropdown/multi-select types
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, field_name)
);

-- Modify assets table to support multiple categories
ALTER TABLE assets ADD COLUMN category_id UUID REFERENCES asset_categories(id);
ALTER TABLE assets ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE assets ADD COLUMN custom_data JSONB; -- Store custom field values
ALTER TABLE assets ADD COLUMN organization_id UUID;

-- Create organizations table for multi-tenant support
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  logo_url VARCHAR(500),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create organization_members table
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) CHECK (role IN ('owner', 'admin', 'manager', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, user_id)
);

-- Create data_import_logs table
CREATE TABLE data_import_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  category_id UUID NOT NULL REFERENCES asset_categories(id),
  user_id UUID NOT NULL REFERENCES users(id),
  file_name VARCHAR(255),
  total_records INTEGER,
  successful_records INTEGER,
  failed_records INTEGER,
  import_status VARCHAR(50), -- pending, processing, completed, failed
  error_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add index for organization-based queries
CREATE INDEX idx_assets_organization_id ON assets(organization_id);
CREATE INDEX idx_assets_category_id ON assets(category_id);
CREATE INDEX idx_asset_categories_user_id ON asset_categories(user_id);
CREATE INDEX idx_organization_members_organization_id ON organization_members(organization_id);
CREATE INDEX idx_data_import_logs_organization_id ON data_import_logs(organization_id);

-- Create default asset categories
INSERT INTO asset_categories (name, description, icon, color) VALUES
('Admin Assets', 'Office furniture and admin equipment', '📦', '#3B82F6'),
('Hardware', 'IT Hardware - Computers, Servers, Networking', '💻', '#10B981'),
('Software', 'Software licenses and subscriptions', '📱', '#8B5CF6'),
('Real Estate', 'Buildings, Property, Facilities', '🏢', '#F59E0B'),
('Vehicles', 'Company vehicles and transportation', '🚗', '#EF4444'),
('Infrastructure', 'Infrastructure assets and utilities', '⚙️', '#6366F1'),
('Inventory', 'Warehouse and inventory items', '📊', '#EC4899')
ON CONFLICT (name) DO NOTHING;

-- Update existing users with default organization
UPDATE users SET organization_id =
  (SELECT id FROM organizations LIMIT 1)
WHERE organization_id IS NULL;

-- Create updated view for flexible asset queries
CREATE OR REPLACE VIEW assets_with_details AS
SELECT
  a.*,
  ac.name as category_name,
  ac.icon as category_icon,
  hm.status,
  hm.risk_level,
  hm.compliance_score,
  EXTRACT(DAY FROM (a.last_date_of_support - CURRENT_DATE)) as days_until_end_of_support,
  o.name as organization_name
FROM assets a
LEFT JOIN asset_categories ac ON a.category_id = ac.id
LEFT JOIN health_metrics hm ON a.id = hm.asset_id
LEFT JOIN organizations o ON a.organization_id = o.id;
