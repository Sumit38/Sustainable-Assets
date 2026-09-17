# Asset Data Import Template Guide

## Overview
The Asset Health System provides a downloadable template to ensure data consistency across all organizations. This standardizes the data structure and prevents ambiguity in asset information imports.

---

## Download Template

**Location:** Dashboard → Import Asset Data Section → "Download Template" button

The template ensures:
- ✅ Consistent column structure
- ✅ Proper data types and formats
- ✅ Required vs optional fields clarity
- ✅ Easy integration with system

---

## Template Files Available

### 1. **CSV Template** (Recommended for bulk imports)
- **File:** `Admin_Asset_Template.csv`
- **Format:** Comma-separated values
- **Download from:** Dashboard

#### Required Columns:
```
Asset ID, Asset Type, Product Name, Manufacturer, 
Date of Manufacture, Last Date of Support, Health Status, 
Compliance Score, Days Until End of Support, Country, Region,
Department, Location, Cost, Purchase Date
```

#### Example Data:
```
ADM-0001,Chair,Office Chair Model X100,Godrej Interio,2019-06-14,2026-06-14,healthy,95,800,Germany,Europe (GDPR/RoHS),Operations,Berlin Office,15000,2019-06-14
ADM-0002,Table,Conference Table 200cm,IKEA,2018-03-20,2025-03-20,at-risk,65,200,United States,North America (EPA/OSHA),Sales & Marketing,New York Office,25000,2018-03-20
```

### 2. **Excel Template** (Your own format)
If you have an Excel template (Admin_Asset_Template.xlsx):
1. Place it in: `public/Admin_Asset_Template.xlsx`
2. Users can download and use it
3. Export/convert to CSV before importing

---

## Field Descriptions

| Field | Type | Required | Description | Example | Compliance Impact |
|-------|------|----------|-------------|---------|-------------------|
| Asset ID | Text | Yes | Unique identifier | ADM-0001 | — |
| Asset Type | Text | Yes | Category (Chair, Table, Monitor, etc.) | Chair | — |
| Product Name | Text | Yes | Model/product name | Office Chair X100 | — |
| Manufacturer | Text | Yes | Brand/manufacturer | Godrej Interio | — |
| Date of Manufacture | Date | Yes | YYYY-MM-DD format | 2019-06-14 | — |
| Last Date of Support | Date | Yes | End of support date | 2026-06-14 | — |
| Health Status | Text | Yes | healthy/at-risk/critical/end-of-life | healthy | — |
| Compliance Score | Number | Yes | 0-100 percentage | 95 | — |
| Days Until End of Support | Number | Yes | Days remaining | 800 | — |
| **Country** | **Text** | **Yes** | **Country where asset is located** | **Germany** | **🔴 CRITICAL: Determines applicable regulations (GDPR, EPA, HIPAA, etc.)** |
| **Region** | **Text** | **Yes** | **Global region for compliance policy** | **Europe (GDPR/RoHS)** | **🔴 CRITICAL: Applies regional compliance standards (GDPR, EPA/OSHA, RoHS, ISO, etc.)** |
| Department | Text | Yes | Organization unit | Operations | — |
| Location | Text | Yes | Physical location | Berlin Office | — |
| Cost | Number | Yes | Purchase cost | 15000 | — |
| Purchase Date | Date | Yes | YYYY-MM-DD format | 2019-06-14 | — |

---

## How to Use

### **Step 1: Download Template**
- Go to Dashboard
- Find "Import Asset Data" section
- Click "Download Template" button
- File saves as `Admin_Asset_Template.csv`

### **Step 2: Prepare Your Data**
1. Open template in Excel or Google Sheets
2. Keep the header row (first row)
3. Add your organization's asset data
4. Ensure all required fields are filled
5. Use exact column names (don't rename)

### **Step 3: Save in Correct Format**
- **For CSV:** Save as `.csv` file
- **For Excel:** Export/Save As CSV before import

### **Step 4: Import into Dashboard**
1. Go to Dashboard
2. Find "Import Asset Data" section
3. Either:
   - Drag & drop your CSV file, OR
   - Click "Browse Files" and select file
4. System validates and imports data

---

## 🔴 CRITICAL: Country & Region Fields (Global Compliance Policy)

### Why Country & Region Are Essential

The **Country** and **Region** fields are **CRITICAL** for the system to apply correct global compliance policies. Without these fields, the system **CANNOT** determine which compliance standards apply to each asset.

### Global Compliance Mapping

**Region** determines which global compliance standards apply:

| Region | Standards | Applicable To |
|--------|-----------|----------------|
| **Europe (GDPR/RoHS)** | GDPR, RoHS, CE, ISO 27001 | Germany, UK, France, Netherlands, etc. |
| **North America (EPA/OSHA)** | EPA, OSHA, NIST, PCI DSS | USA, Canada |
| **Asia Pacific (Local Regs)** | Local regulations, ISO 27001 | India, China, Japan, Australia, etc. |
| **Other Regions** | Regional compliance standards | Middle East, Africa, Latin America |

### Example: Asset Compliance by Region

```
Asset in Germany (Europe region)
├─ Must comply with GDPR (Data Protection)
├─ Must comply with RoHS (Electronics)
├─ Must comply with CE (Product Safety)
└─ Dashboard shows as "Europe (GDPR, RoHS) - CRITICAL"

Asset in USA (North America region)
├─ Must comply with EPA (Environmental)
├─ Must comply with OSHA (Worker Safety)
├─ Must comply with PCI DSS (Payment Cards)
└─ Dashboard shows as "North America (EPA, OSHA) - CRITICAL"

Asset in India (Asia Pacific region)
├─ Must comply with Local Regulations
├─ Must comply with ISO 27001 (Information Security)
└─ Dashboard shows as "Asia Pacific (Local Regs) - HIGH"
```

### How Dashboard Uses This Data

1. **Compliance Violations by Region** card aggregates violations by region
2. **Global Compliance Risk Score** calculated based on country regulations
3. **Risk Justification System** suggests appropriate compliance standards based on country
4. **Audit Reports** filtered by region for regulatory inspections
5. **Company Benchmarking** compares compliance across regions

### Impact on Dashboard Metrics

Without Country/Region:
- ❌ Cannot determine applicable standards
- ❌ Cannot calculate compliance violations
- ❌ Cannot generate region-specific reports
- ❌ Cannot perform audits

With Country/Region:
- ✅ Automatic compliance standard assignment
- ✅ Accurate compliance violation detection
- ✅ Region-specific compliance reporting
- ✅ Audit-ready documentation

---

## Data Validation Rules

✅ **Asset ID**
- Must be unique (no duplicates)
- Format: Text (can include letters and numbers)

✅ **Asset Type**
- Accepted: Chair, Table, Monitor, Laptop, Cubicle, Hardware, Software, Vehicle, Real Estate, Other

✅ **Health Status**
- Only: healthy, at-risk, critical, end-of-life
- Case-sensitive

✅ **Compliance Score**
- Range: 0-100
- Decimal values allowed (e.g., 95.5)

✅ **Dates**
- Format: YYYY-MM-DD
- Must be valid dates
- Support end date should be after manufacture date

✅ **Days Until End of Support**
- Numeric value
- Can be negative (for already expired items)

✅ **Country** (🔴 CRITICAL FOR COMPLIANCE)
- Must be valid country name or code
- Examples: Germany, United States, India, United Kingdom, France, Canada, Australia, Japan, China
- Case-insensitive
- Do NOT use abbreviations (use "Germany" not "DE")

✅ **Region** (🔴 CRITICAL FOR COMPLIANCE)
- Must match one of these exact values:
  - `Europe (GDPR/RoHS)` - for GDPR/RoHS compliance
  - `North America (EPA/OSHA)` - for EPA/OSHA compliance
  - `Asia Pacific (Local Regs)` - for Asian regulations
  - `Other Regions` - for all other locations
- Case-sensitive - must match exactly
- Determines which global compliance standards apply

---

## Common Issues & Solutions

### Issue: "Invalid file format"
**Solution:** Ensure file is saved as `.csv` (not Excel or other format)

### Issue: "Missing required fields"
**Solution:** Verify all columns match template exactly, no missing columns

### Issue: "Invalid data in column X"
**Solution:** Check data types and formats (dates as YYYY-MM-DD, numbers without currency symbols)

### Issue: "Duplicate Asset IDs"
**Solution:** Ensure each asset has a unique ID, no repeats

---

## Template Setup for Your Organization

### **If using your own Excel template:**

1. **Prepare your template:**
   - Match column structure to guide above
   - Use same column names
   - Include sample data rows
   - Save as `Admin_Asset_Template.xlsx`

2. **Place in project:**
   ```
   admin-asset-health-app/
   └── public/
       └── Admin_Asset_Template.xlsx
   ```

3. **Users can then download:**
   - Dashboard → Import Data → Download Template
   - File will be `Admin_Asset_Template.xlsx`

4. **For import to work:**
   - Save as CSV from Excel before importing
   - Or update import code to accept Excel (if needed)

---

## Best Practices

1. **Validate Before Import**
   - Check for duplicates
   - Verify all dates are valid
   - Ensure all required fields are filled

2. **Standardize Data**
   - Use consistent naming conventions
   - Capitalize department names consistently
   - Use standard asset type categories

3. **Regular Updates**
   - Download fresh template each quarter
   - Update health status regularly
   - Add new assets as they arrive

4. **Backup**
   - Keep original Excel/CSV files
   - Export from system regularly
   - Maintain version history

---

## FAQ

**Q: Can I add extra columns?**  
A: No. System expects exact columns. Extra columns will be ignored, missing columns will cause errors.

**Q: Can I change column order?**  
A: No. Column order must match template exactly.

**Q: What if I have assets from multiple locations?**  
A: Include location in "Location" column for each asset. System can filter by location.

**Q: How often can I import?**  
A: As frequently as needed. Each import updates system with latest data.

**Q: Is there a maximum file size?**  
A: CSV files can contain thousands of rows. Larger files may take longer to process.

**Q: What happens to existing data when I import?**  
A: New imports ADD to existing data. Existing assets are updated if Asset ID matches.

---

## Support

For issues with template:
1. Download fresh template from Dashboard
2. Check that your data matches field descriptions
3. Verify file is saved as CSV format
4. Contact system administrator if problems persist

---

**Version:** 1.0  
**Last Updated:** 2026-09-17  
**Status:** Active
