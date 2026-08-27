/* Multi-Category Asset Management Types */

export type AssetFieldType = 'text' | 'number' | 'date' | 'select' | 'multi-select' | 'boolean'

export interface Organization {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  logoUrl?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface OrganizationMember {
  id: string
  organizationId: string
  userId: string
  role: 'owner' | 'admin' | 'manager' | 'viewer'
  createdAt: string
}

export interface AssetCategory {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  userId?: string
  createdAt: string
  updatedAt: string
}

export interface AssetField {
  id: string
  categoryId: string
  fieldName: string
  fieldType: AssetFieldType
  isRequired: boolean
  fieldOrder: number
  selectOptions?: string[]
  createdAt: string
}

export interface GenericAsset {
  id: string
  categoryId: string
  organizationId: string
  userId: string
  assetName: string
  assetId: string
  status?: string
  healthStatus?: 'healthy' | 'at-risk' | 'critical' | 'end-of-life'
  complianceScore?: number
  lastDateOfSupport?: string
  customData?: Record<string, any> // Flexible field storage
  createdAt: string
  updatedAt: string
}

export interface GenericAssetWithCategory extends GenericAsset {
  categoryName: string
  categoryIcon?: string
  organizationName: string
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
}

export interface DataImportLog {
  id: string
  organizationId: string
  categoryId: string
  userId: string
  fileName: string
  totalRecords: number
  successfulRecords: number
  failedRecords: number
  importStatus: 'pending' | 'processing' | 'completed' | 'failed'
  errorDetails?: string
  createdAt: string
  completedAt?: string
}

export interface BulkImportRequest {
  categoryId: string
  organizationId: string
  csvFile: File
  mappingConfig: Record<string, string> // CSV column → field mapping
}

export interface ImportPreview {
  totalRecords: number
  sampleRecords: Record<string, any>[]
  fieldMapping: Record<string, string>
  validationErrors: { row: number; errors: string[] }[]
}

export interface CategoryTemplate {
  categoryName: string
  description: string
  defaultFields: Omit<AssetField, 'id' | 'categoryId' | 'createdAt'>[]
}

/* Pre-defined Category Templates */
export const CATEGORY_TEMPLATES: Record<string, CategoryTemplate> = {
  admin: {
    categoryName: 'Assets',
    description: 'Office furniture and equipment',
    defaultFields: [
      { fieldName: 'Asset Type', fieldType: 'select', isRequired: true, fieldOrder: 1, selectOptions: ['Chair', 'Table', 'Cubicle Equipment', 'Desk', 'Cabinet'] },
      { fieldName: 'Product Name', fieldType: 'text', isRequired: true, fieldOrder: 2 },
      { fieldName: 'Manufacturer', fieldType: 'text', isRequired: true, fieldOrder: 3 },
      { fieldName: 'Barcode', fieldType: 'text', isRequired: true, fieldOrder: 4 },
      { fieldName: 'Date of Manufacture', fieldType: 'date', isRequired: true, fieldOrder: 5 },
      { fieldName: 'Last Date of Support', fieldType: 'date', isRequired: true, fieldOrder: 6 },
      { fieldName: 'Health Impact', fieldType: 'text', isRequired: false, fieldOrder: 7 },
    ],
  },
  hardware: {
    categoryName: 'Hardware',
    description: 'IT Hardware - Computers, Servers, Networking',
    defaultFields: [
      { fieldName: 'Device Type', fieldType: 'select', isRequired: true, fieldOrder: 1, selectOptions: ['Laptop', 'Desktop', 'Server', 'Router', 'Switch', 'Printer'] },
      { fieldName: 'Model', fieldType: 'text', isRequired: true, fieldOrder: 2 },
      { fieldName: 'Serial Number', fieldType: 'text', isRequired: true, fieldOrder: 3 },
      { fieldName: 'Assigned User', fieldType: 'text', isRequired: false, fieldOrder: 4 },
      { fieldName: 'Purchase Date', fieldType: 'date', isRequired: true, fieldOrder: 5 },
      { fieldName: 'Warranty Expiry', fieldType: 'date', isRequired: false, fieldOrder: 6 },
      { fieldName: 'OS/Firmware Version', fieldType: 'text', isRequired: false, fieldOrder: 7 },
    ],
  },
  software: {
    categoryName: 'Software',
    description: 'Software licenses and subscriptions',
    defaultFields: [
      { fieldName: 'Software Name', fieldType: 'text', isRequired: true, fieldOrder: 1 },
      { fieldName: 'License Type', fieldType: 'select', isRequired: true, fieldOrder: 2, selectOptions: ['Perpetual', 'Annual', 'Monthly', 'Subscription'] },
      { fieldName: 'License Key', fieldType: 'text', isRequired: false, fieldOrder: 3 },
      { fieldName: 'Purchased Date', fieldType: 'date', isRequired: true, fieldOrder: 4 },
      { fieldName: 'Expiry Date', fieldType: 'date', isRequired: true, fieldOrder: 5 },
      { fieldName: 'License Count', fieldType: 'number', isRequired: false, fieldOrder: 6 },
      { fieldName: 'Cost (Annual)', fieldType: 'number', isRequired: false, fieldOrder: 7 },
    ],
  },
  realestate: {
    categoryName: 'Real Estate',
    description: 'Buildings, Property, Facilities',
    defaultFields: [
      { fieldName: 'Property Name', fieldType: 'text', isRequired: true, fieldOrder: 1 },
      { fieldName: 'Property Type', fieldType: 'select', isRequired: true, fieldOrder: 2, selectOptions: ['Office', 'Warehouse', 'Retail', 'Industrial'] },
      { fieldName: 'Address', fieldType: 'text', isRequired: true, fieldOrder: 3 },
      { fieldName: 'Square Footage', fieldType: 'number', isRequired: false, fieldOrder: 4 },
      { fieldName: 'Acquisition Date', fieldType: 'date', isRequired: true, fieldOrder: 5 },
      { fieldName: 'Annual Maintenance Cost', fieldType: 'number', isRequired: false, fieldOrder: 6 },
      { fieldName: 'Condition', fieldType: 'select', isRequired: false, fieldOrder: 7, selectOptions: ['Excellent', 'Good', 'Fair', 'Poor'] },
    ],
  },
  vehicles: {
    categoryName: 'Vehicles',
    description: 'Company vehicles and transportation',
    defaultFields: [
      { fieldName: 'Vehicle Type', fieldType: 'select', isRequired: true, fieldOrder: 1, selectOptions: ['Sedan', 'SUV', 'Truck', 'Van', 'Bus'] },
      { fieldName: 'Make & Model', fieldType: 'text', isRequired: true, fieldOrder: 2 },
      { fieldName: 'License Plate', fieldType: 'text', isRequired: true, fieldOrder: 3 },
      { fieldName: 'Purchase Date', fieldType: 'date', isRequired: true, fieldOrder: 4 },
      { fieldName: 'Mileage', fieldType: 'number', isRequired: false, fieldOrder: 5 },
      { fieldName: 'Next Service Due', fieldType: 'date', isRequired: false, fieldOrder: 6 },
      { fieldName: 'Insurance Expiry', fieldType: 'date', isRequired: false, fieldOrder: 7 },
    ],
  },
}
