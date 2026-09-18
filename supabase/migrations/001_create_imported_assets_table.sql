-- Create imported_assets table for persistent asset data storage
CREATE TABLE IF NOT EXISTS imported_assets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  product_name TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  date_of_manufacture DATE,
  last_date_of_support DATE,
  health_status TEXT NOT NULL,
  compliance_score NUMERIC NOT NULL,
  days_until_eol INTEGER,
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  department TEXT,
  location TEXT,
  cost NUMERIC,
  purchase_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Composite unique constraint: user can't have duplicate asset IDs
  UNIQUE(user_id, asset_id)
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_imported_assets_user_id
ON imported_assets(user_id);

-- Create index for faster queries by region (for compliance grouping)
CREATE INDEX IF NOT EXISTS idx_imported_assets_region
ON imported_assets(user_id, region);

-- Create index for faster queries by health_status
CREATE INDEX IF NOT EXISTS idx_imported_assets_health_status
ON imported_assets(user_id, health_status);

-- Enable RLS (Row Level Security)
ALTER TABLE imported_assets ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can only see their own assets
CREATE POLICY "Users can view their own assets"
  ON imported_assets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create RLS policy: Users can insert their own assets
CREATE POLICY "Users can insert their own assets"
  ON imported_assets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policy: Users can update their own assets
CREATE POLICY "Users can update their own assets"
  ON imported_assets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS policy: Users can delete their own assets
CREATE POLICY "Users can delete their own assets"
  ON imported_assets
  FOR DELETE
  USING (auth.uid() = user_id);
