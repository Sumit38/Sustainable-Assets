# Multi-Category Asset Management Guide

## Overview

Your **Admin Asset Health System** now supports **unlimited asset categories**! Beyond admin assets (chairs, tables, equipment), you can now track:

- ✅ **Hardware** - Computers, servers, networking equipment
- ✅ **Software** - Licenses, subscriptions, digital assets
- ✅ **Real Estate** - Buildings, facilities, property
- ✅ **Vehicles** - Company cars, trucks, transportation
- ✅ **Infrastructure** - Utilities, systems, infrastructure
- ✅ **Inventory** - Warehouse items, stock
- ✅ **Custom Categories** - Any asset type you define!

## 🏗 Architecture

### New Database Tables

```sql
asset_categories       -- Asset types/categories
asset_fields          -- Custom fields per category
organizations         -- Multi-tenant support
organization_members  -- Team members & permissions
data_import_logs      -- Import history & status
```

### Flexible Storage

Each asset now supports:
- **Standard fields**: ID, name, status, health score
- **Custom fields**: Store any data via `custom_data` JSON field
- **Custom attributes**: Define what fields matter for each category

## 🚀 Usage Examples

### Example 1: Track Hardware Assets

```typescript
// User creates "Hardware" category
const category = await createCategory(
  organizationId,
  'Hardware',
  'IT Hardware - Computers, Servers, Networking',
  'hardware' // Use template
)

// System creates default fields:
// - Device Type (select: Laptop, Desktop, Server, etc)
// - Model (text)
// - Serial Number (text)
// - Purchase Date (date)
// - Warranty Expiry (date)
// - OS/Firmware Version (text)
```

### Example 2: Track Software Licenses

```typescript
// User creates "Software" category
const category = await createCategory(
  organizationId,
  'Software',
  'Software licenses and subscriptions',
  'software'
)

// System creates fields:
// - Software Name (text)
// - License Type (select: Perpetual, Annual, Monthly)
// - License Key (text)
// - Purchased Date (date)
// - Expiry Date (date)
// - License Count (number)
// - Cost/Annual (number)
```

### Example 3: Custom Category - Real Estate

```typescript
const category = await createCategory(
  organizationId,
  'Real Estate',
  'Buildings, Property, Facilities',
  'realestate'
)
```

### Example 4: Completely Custom Category

```typescript
const category = await createCategory(
  organizationId,
  'Machinery',
  'Industrial machinery and equipment'
  // No template - create custom fields manually
)
```

## 📤 Data Import Workflow

### Step 1: User Uploads CSV File

```
Device Type,Model,Serial Number,Purchase Date,Warranty Expiry
Laptop,Dell XPS 13,SN123456,2023-01-15,2025-01-15
Server,HP ProLiant,SN789012,2022-06-20,2024-06-20
```

### Step 2: System Validates Data

```typescript
const validation = await validateImportData(records, fields)
// Returns: { isValid: true/false, errors: [...] }
```

### Step 3: Import with Mapping

```typescript
const result = await bulkImportAssets(
  organizationId,
  categoryId,
  userId,
  csvContent,
  {
    'Device Type': 'deviceType',
    'Model': 'model',
    'Serial Number': 'serialNumber',
    // ... mapping
  }
)
// Returns: { success: true, importLogId: '...', summary: {...} }
```

### Step 4: Track Import Progress

```typescript
const importLog = await getImportHistory(organizationId)
// Returns: [
//   { fileName: 'hardware.csv', totalRecords: 150, successfulRecords: 148, ... },
//   { fileName: 'software.csv', totalRecords: 200, successfulRecords: 200, ... },
// ]
```

## 🎯 Supported Asset Categories

### 1. Admin Assets (Default)
```
Fields: Asset Type, Product Name, Manufacturer, Barcode,
        Date of Manufacture, Last Date of Support, Health Impact
Ideal for: Office furniture, equipment, cubicles
```

### 2. Hardware
```
Fields: Device Type, Model, Serial Number, Assigned User,
        Purchase Date, Warranty Expiry, OS/Firmware Version
Ideal for: Computers, servers, networking equipment
```

### 3. Software
```
Fields: Software Name, License Type, License Key,
        Purchased Date, Expiry Date, License Count, Annual Cost
Ideal for: Software licenses and subscriptions
```

### 4. Real Estate
```
Fields: Property Name, Property Type, Address, Square Footage,
        Acquisition Date, Maintenance Cost, Condition
Ideal for: Buildings, offices, warehouses, facilities
```

### 5. Vehicles
```
Fields: Vehicle Type, Make & Model, License Plate,
        Purchase Date, Mileage, Next Service Due, Insurance Expiry
Ideal for: Company vehicles and transportation fleet
```

### 6. Infrastructure
```
Fields: Infrastructure Type, Location, Installation Date,
        Last Maintenance, Next Maintenance, Status
Ideal for: Utilities, systems, infrastructure assets
```

### 7. Inventory
```
Fields: Item Name, SKU, Quantity, Reorder Level,
        Last Updated, Supplier, Unit Cost
Ideal for: Warehouse items and stock
```

## 🔧 Creating Custom Categories

### Step 1: Create Empty Category

```typescript
const category = await createCategory(
  organizationId,
  'My Custom Category',
  'Description of what we track here'
)
```

### Step 2: Add Custom Fields

```typescript
// Add field via UI or API
await supabase.from('asset_fields').insert({
  category_id: category.id,
  field_name: 'Custom Field Name',
  field_type: 'text', // text, number, date, select, multi-select, boolean
  is_required: true,
  field_order: 1,
  select_options: null // For select types: ['Option 1', 'Option 2']
})
```

### Field Types Supported

| Type | Example | Storage |
|------|---------|---------|
| text | "Dell XPS 13" | String |
| number | 25000 | Numeric |
| date | 2024-08-27 | ISO Date |
| select | "Active" | String (single) |
| multi-select | ["Tag1", "Tag2"] | Array |
| boolean | true | Boolean |

## 📊 Dashboard Enhancements

### Multi-Category Dashboard

```typescript
const metrics = await getOrganizationDashboardMetrics(organizationId)
// Returns:
{
  totalAssets: 1500,
  totalCategories: 7,
  assetsByCategory: [
    { category: 'Admin Assets', count: 500 },
    { category: 'Hardware', count: 250 },
    { category: 'Software', count: 300 },
    { category: 'Real Estate', count: 50 },
    ...
  ],
  recentImports: [...]
}
```

### Category-Specific View

```typescript
const hardware = await fetchAssetsByCategory(
  organizationId,
  hardwareCategoryId,
  limit: 100,
  offset: 0
)
// Returns: { data: [...], count: 250 }
```

## 👥 Multi-Tenant & Team Support

### Create Organization

```typescript
const org = await createOrganization(
  'My Company Name',
  userId,
  'admin@company.com',
  '+1-800-000-0000'
)
```

### Add Team Members

```typescript
await addOrganizationMember(
  organizationId,
  newUserId,
  'manager' // 'owner', 'admin', 'manager', 'viewer'
)
```

### Role Permissions

| Role | View | Edit | Import | Delete |
|------|------|------|--------|--------|
| Owner | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ |
| Manager | ✅ | ✅ | ✅ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ |

## 📈 Health Tracking Across Categories

Each asset type can track health differently:

### Admin Assets
- Health based on: Support lifecycle, ergonomic compliance
- Alert when: Support ends in 90/30/0 days

### Hardware
- Health based on: Age, warranty status, OS version
- Alert when: Warranty expires, OS end-of-life

### Software
- Health based on: License expiry, version status
- Alert when: License expires in 30/7/0 days

### Real Estate
- Health based on: Condition rating, maintenance schedule
- Alert when: Maintenance overdue, condition rating < Good

### Vehicles
- Health based on: Service schedule, mileage
- Alert when: Service overdue, high mileage

## 🔍 Advanced Filtering

```typescript
// Filter by category
const adminAssets = await fetchAssetsByCategory(
  organizationId,
  adminCategoryId
)

// Filter by status (custom field in custom_data)
const activeHardware = (await fetchAssetsByCategory(
  organizationId,
  hardwareCategoryId
)).data.filter(a => a.customData?.status === 'Active')

// Filter by health status (if supported)
const criticalAssets = assets.filter(
  a => a.healthStatus === 'critical'
)
```

## 📁 Bulk Import Best Practices

### CSV Format
```csv
Name,ID,Status,PurchaseDate,Notes
Asset 1,A001,Active,2024-01-15,In use
Asset 2,A002,Inactive,2024-02-20,Stored
```

### Validation Rules
✅ Required fields must be present  
✅ Dates must be YYYY-MM-DD format  
✅ Numbers must be numeric  
✅ Select options must match defined values  

### Error Handling
```typescript
const result = await bulkImportAssets(...)
if (!result.success) {
  console.log(result.summary.failed + ' records failed')
  // Check import log for detailed error messages
}
```

## 🔐 Security & Access Control

- Each organization has isolated data
- Users see only organizations they're members of
- Row-level security (RLS) enforces in database
- Audit logs track all imports and changes
- Role-based access control (RBAC)

## 📊 Reporting Across Categories

```typescript
// Get summary across all categories
const metrics = await getOrganizationDashboardMetrics(organizationId)

// Create category-specific reports
const hardwareReport = assets
  .filter(a => a.categoryId === hardwareCategoryId)
  .map(a => ({
    name: a.assetName,
    warranty: a.customData?.warrantyExpiry,
    status: a.customData?.status
  }))
```

## 🚀 Migration from Existing Data

If you have existing admin asset data:

1. **Export existing data** from Excel
2. **Create "Admin Assets" category** (or customize)
3. **Map CSV columns** to category fields
4. **Bulk import** using the import tool
5. **Verify data** in dashboard
6. **Add new categories** as needed

## 📞 Support & Examples

### Common Use Cases

**Use Case 1: Track IT Hardware**
- Create Hardware category
- Import 250 laptops/desktops from IT inventory
- Track warranty expiry and OS updates
- Generate hardware lifecycle report

**Use Case 2: Manage Software Licenses**
- Create Software category
- Import 300 licenses from procurement
- Track license expiry dates
- Alert before subscription renewal

**Use Case 3: Monitor Real Estate Portfolio**
- Create Real Estate category
- Import 10 office properties
- Track maintenance schedules
- Monitor facility conditions

**Use Case 4: Track Vehicle Fleet**
- Create Vehicles category
- Import 50 company vehicles
- Track service schedule
- Monitor fuel costs

## 🎯 Next Steps

1. ✅ Setup Supabase with migration `002_multi_category_support.sql`
2. ✅ Define your asset categories
3. ✅ Prepare CSV data for import
4. ✅ Import data via bulk upload
5. ✅ Configure alerts for each category
6. ✅ Setup team member access
7. ✅ Generate category-specific reports

## 🚨 Troubleshooting

**Q: How do I add new fields to existing category?**
A: Use the asset_fields table to add new fields, or use the UI (once built)

**Q: Can I import mixed asset types in one CSV?**
A: No - each import is for one category. Create separate CSVs per category.

**Q: How do I delete a category?**
A: Use `deleteCategory()` - this will cascade delete associated assets

**Q: Can I customize field validation?**
A: Yes - extend `validateImportData()` function for custom rules

## 📚 API Reference

See `src/lib/api/multi-category.ts` for complete API documentation.

Key functions:
- `createCategory()` - Create new asset category
- `bulkImportAssets()` - Import CSV data
- `fetchAssetsByCategory()` - Query assets
- `createOrganization()` - Multi-tenant support
- `getOrganizationDashboardMetrics()` - Cross-category analytics

---

**Your asset management system is now universal! Track any type of asset you need.** 🚀
