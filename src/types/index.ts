/* Asset Types */
export type AssetType = 'Chair' | 'Table' | 'Cubicle Equipment';

export interface Asset {
  id: string;
  assetType: AssetType;
  productName: string;
  manufacturer: string;
  assetId: string;
  barcode: string;
  dateOfManufacture: string;
  endOfSale: string;
  lastDateOfSupport: string;
  replacementProduct: string;
  productParts: string[];
  potentialHealthImpact: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetWithHealthStatus extends Asset {
  healthStatus: HealthStatus;
  daysUntilEndOfSupport: number;
  complianceScore: number;
  riskLevel: RiskLevel;
}

/* Health Status */
export type HealthStatus = 'healthy' | 'at-risk' | 'critical' | 'end-of-life';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface HealthMetric {
  assetId: string;
  status: HealthStatus;
  riskLevel: RiskLevel;
  lastUpdated: string;
  notes: string;
}

/* Alert System */
export type AlertType = 'support-ending' | 'health-risk' | 'compliance-violation' | 'maintenance';
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface Alert {
  id: string;
  assetId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  daysUntilAction: number;
  createdAt: string;
  resolvedAt: string | null;
  actionTaken: boolean;
}

/* Dashboard Metrics */
export interface DashboardMetrics {
  totalAssets: number;
  healthyAssets: number;
  atRiskAssets: number;
  criticalAssets: number;
  endOfLifeAssets: number;
  avgComplianceScore: number;
  pendingAlerts: number;
  resolvedAlerts: number;
  assetsByType: AssetTypeCount[];
  assetsByManufacturer: ManufacturerCount[];
  assetsBySupportStatus: SupportStatusCount[];
}

export interface AssetTypeCount {
  type: AssetType;
  count: number;
  percentage: number;
}

export interface ManufacturerCount {
  manufacturer: string;
  count: number;
  percentage: number;
}

export interface SupportStatusCount {
  status: 'active' | 'ending-soon' | 'ended';
  count: number;
  percentage: number;
}

/* Compliance */
export interface ComplianceMetric {
  assetId: string;
  score: number;
  violations: string[];
  lastAuditDate: string;
}

/* Manufacturer */
export interface Manufacturer {
  id: string;
  name: string;
  country: string;
  website: string;
  createdAt: string;
}

/* Replacement Product */
export interface ReplacementProduct {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  ergonomicRating: number;
  price: number;
  createdAt: string;
}

/* User */
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'viewer';
  createdAt: string;
}

/* Pagination */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
