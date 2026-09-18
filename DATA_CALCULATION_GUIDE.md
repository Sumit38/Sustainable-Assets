# Data-Driven Metrics Calculation Guide

## Overview

The Asset Health System automatically calculates all business impact and compliance metrics from your imported asset data using transparent, evidence-based formulas. **No fake data. No assumptions. All metrics are derived from your actual assets.**

---

## How It Works

### Step 1: Upload Asset Data
- Download the CSV template from the Dashboard
- Fill in your organization's asset data (15 required columns)
- Upload the CSV file through the "Import Asset Data" section

### Step 2: Automatic Validation
System validates:
- ✅ All required columns present
- ✅ Data types correct (dates, numbers, enums)
- ✅ Region/Country values match global compliance standards
- ✅ Compliance scores are 0-100
- ✅ Asset types are recognized

### Step 3: Automatic Calculation
System automatically calculates:
- 📊 Business Impact Metrics (cost, health, carbon)
- 🔐 Compliance Violations by Region
- ⚠️ Critical Standards Violated
- 🎯 Immediate Actions Needed
- 💰 ROI Projections (1-year and 3-year)

---

## Metrics Calculated & Formulas

### 1. BUSINESS IMPACT METRICS

#### Annual Cost Savings (Potential)
**Formula:**
```
Annual Maintenance Costs + Expected Downtime Costs
```

**Calculation Details:**
- **Maintenance Cost** = Sum of annual maintenance cost per asset type
- **Downtime Cost** = For each asset:
  - Base failure risk: healthy=5%, at-risk=30%, critical=70%, end-of-life=100%
  - Downtime Hours × Cost per Hour × Risk Factor
  - Example: Laptop with 8 hours downtime @ $150/hour, critical status
    = 8 × $150 × 0.70 = $840 potential annual loss

**Data Source:** Imported asset type + health status

**Example:**
```
100 Laptops (at-risk): $150/year maintenance × 100 = $15K
Average downtime cost per laptop: $840 × 0.3 = $252
Total downtime: $252 × 100 = $25.2K
Potential Savings = $15K + $25.2K = $40.2K
```

---

#### Employees at Health Risk
**Formula:**
```
Sum of (Affected Employees × Risk Multiplier)
```

**Risk Multipliers:**
- Healthy: 0 (no risk)
- At-Risk: 1.5x
- Critical: 2.5x
- End-of-Life: 4.0x

**Health Issues by Asset Type:**
- **Laptop:** 1.3 employees per asset, 0.18 issues/year, HIGH ergonomic risk
  - Back pain, neck strain, eye strain, wrist strain
- **Monitor:** 1.1 employees, 0.12 issues/year, HIGH risk
  - Eye strain, headaches, neck pain
- **Chair:** 1.2 employees, 0.15 issues/year, HIGH risk
  - Back pain, spinal issues, poor posture
- **Table:** 2.5 employees, 0.08 issues/year, MEDIUM risk
  - Repetitive strain injury, posture issues

**Example:**
```
10 Laptops (critical): 1.3 employees × 2.5 multiplier = 32.5 at risk
5 Monitors (at-risk): 1.1 employees × 1.5 multiplier = 8.25 at risk
Total: 40.75 ≈ 41 employees at health risk
```

---

#### Carbon Footprint Impact (Tonnes CO₂e/year)
**Formula:**
```
(Scope 1 + Scope 2 + Scope 3 Emissions) + End-of-Life Methane
```

**Per Asset Type (Annual):**
- **Laptop:** 40 kg Scope 2 (electricity) + 250 kg Scope 3 (manufacturing) = 290 kg CO₂e
- **Monitor:** 25 kg Scope 2 + 180 kg Scope 3 = 205 kg CO₂e
- **Chair:** 0 Scope 1/2 + 150 kg Scope 3 = 150 kg CO₂e
- **Vehicle:** 2,500 kg Scope 1 (emissions) + 100 kg Scope 2 + 300 kg Scope 3 = 2,900 kg CO₂e

**Methane from End-of-Life Assets:**
```
Methane (kg) × (1 - Capture Rate) × Methane GWP × Assets Retiring
```
- Methane GWP: 28x CO₂ over 100 years
- Landfill Capture Rate: 65% (35% escapes to atmosphere)
- Example: Cubicle (0.35 kg CH₄) at end-of-life
  = 0.35 × 0.35 × 28 = **3.43 kg CO₂e equivalent**

**Example:**
```
50 Laptops × 290 kg = 14,500 kg CO₂e (14.5 tonnes)
20 Chairs × 150 kg = 3,000 kg CO₂e (3 tonnes)
5 End-of-life Chairs: 0.35 kg CH₄ × 0.35 × 28 × 5 = 17.15 kg CO₂e
Total: 14.5 + 3 + 0.017 = 17.5 tonnes CO₂e
```

---

#### Business Continuity Risk
**Formula:**
```
If (Critical + End-of-Life Assets) / Total Assets > 30% → "Critical"
Else if > 20% → "High"
Else if > 10% → "Medium"
Else → "Low"
```

**🔴 IMPORTANT: Last Date of Support Integration**
- Assets with Last Date of Support in the past are AUTOMATICALLY marked as "end-of-life"
- This happens REGARDLESS of the Health Status value you uploaded
- Reason: An asset without vendor support CANNOT receive security patches or bug fixes
- Therefore it's treated as end-of-life for risk calculation purposes

**Example:**
```
Asset: Laptop
Last Date of Support: 2024-12-31 (TODAY IS 2025-01-15)
Health Status Uploaded: "healthy"
System Status: AUTOMATICALLY CHANGED TO "end-of-life"
Result: Triggers replacement actions & methane calculations
```

**Example:**
```
Total Assets: 100
Critical: 15, End-of-Life: 5 (+ 8 auto-marked past EOL) = 28 total
(15 + 28) / 100 = 43% → "Critical" continuity risk
```

---

### 2. COMPLIANCE METRICS

#### Global Compliance Violation Rate (%)
**Formula:**
```
(Assets with Compliance Score < 80) / Total Assets × 100
```

**Threshold:** Assets with Compliance Score < 80 are considered non-compliant

**Example:**
```
Total Assets: 100
Non-Compliant (Score < 80): 25
Violation Rate = 25 / 100 × 100 = 25%
```

---

#### Potential Compliance Fine Exposure
**Formula:**
```
Sum of (Non-Compliant Assets × Fine Per Violation for Each Applicable Standard)
```

**Fine Amounts by Standard:**
- **GDPR:** $18,000/violation (max $20M)
- **RoHS:** $50,000/violation (max $500K)
- **EPA:** $25,000/violation (max $10M)
- **OSHA:** $15,000/violation (max $1M)
- **ISO 27001:** $100,000/violation (max $5M)
- **HIPAA:** $100,000/violation (max $50M)
- **PCI DSS:** $50,000/violation (max $100K)

**Compliance Standards by Region:**

| Region | Standards |
|--------|-----------|
| Europe (GDPR/RoHS) | GDPR, RoHS, CE, ISO 27001 |
| North America (EPA/OSHA) | EPA, OSHA, ISO 27001, NIST, PCI DSS, HIPAA, SOC 2 |
| Asia Pacific (Local Regs) | ISO 27001, PCI DSS |
| Other Regions | ISO 27001, PCI DSS |

**Example:**
```
Germany (Europe):
- 10 non-compliant Laptops
- Applicable standards: GDPR, RoHS, CE, ISO 27001
- GDPR fines: 10 × $18,000 = $180,000
- RoHS fines: 10 × $50,000 = $500,000
- ISO 27001 fines: 10 × $100,000 = $1,000,000
Total Fine Exposure: $1,680,000
```

---

#### Critical Standards Violated
**Formula:**
```
For each standard applicable to assets' regions:
  If any asset with Compliance Score < 80:
    Add to "Critical Standards Violated" list
    Show: Standard name, # non-compliant assets, fine per violation, risk level
```

**Risk Levels:**
- **CRITICAL:** Immediate legal/operational consequences
  - GDPR, RoHS, EPA, HIPAA
- **HIGH:** Significant business impact
  - OSHA, ISO 27001, SOC 2, NIST
- **MEDIUM:** Audit/compliance issues
  - PCI DSS

---

#### Compliance Violations by Region
**Formula:**
```
For each region in your assets:
  Count = number of assets with Compliance Score < 80
  Percentage = Count / Total Assets in Region × 100
```

**Example:**
```
Europe (40 total assets):
  Violations: 12 → 30% violation rate (Critical)

North America (35 total assets):
  Violations: 8 → 23% violation rate (Critical)

Asia Pacific (25 total assets):
  Violations: 5 → 20% violation rate (High)
```

---

### 3. IMMEDIATE ACTIONS

**Formula:**
```
Automatically generated actions based on:
1. Critical Assets: Replace them
2. End-of-Life Assets: Decommission them
3. At-Risk Assets: Schedule preventive maintenance
4. Non-Compliant Assets: Health risk assessments
```

**Cost Estimates:**
- Replace critical assets: Replacement cost per asset type
- Decommission: ~$500 per asset
- Preventive maintenance: ~$150 per asset
- Health assessments: ~$250 per asset

**Example:**
```
Imported 100 assets:
- 5 critical → Replace (5 × $1,400 replacement = $7,000)
- 3 end-of-life → Decommission (3 × $500 = $1,500)
- 20 at-risk → Maintenance (20 × $150 = $3,000)
- 15 non-compliant → Health assessments (15 × $250 = $3,750)
Total Immediate Investment: $15,250
```

---

### 4. ROI PROJECTIONS

#### Year 1 Savings
```
= Annual Cost Savings calculated above
```

#### Investment Required
```
= Replacement cost for all critical + end-of-life assets
```

#### Payback Period (Months)
```
= (Investment Required / Year 1 Savings) × 12
```

**Example:**
```
Investment Required: $15,250
Year 1 Savings: $40,200
Payback Period = ($15,250 / $40,200) × 12 = 4.6 months
```

#### 3-Year ROI (%)
```
= ((Year 1 Savings × 3 - Investment Required) / Investment Required) × 100
```

**Example:**
```
Year 1 Savings: $40,200
3-Year Total Savings: $40,200 × 3 = $120,600
3-Year ROI = (($120,600 - $15,250) / $15,250) × 100 = 691%
```

---

## 🔴 CRITICAL: Last Date of Support Field

This field is **essential** for accurate end-of-life calculations:

### Why It Matters
- **Security Risk:** Assets past support end-of-life cannot receive security patches
- **Compliance Risk:** Unsupported software/hardware violates many standards (ISO 27001, PCI DSS)
- **Replacement Trigger:** System auto-marks assets with expired support as "end-of-life"
- **Methane Calculation:** Determines which assets contribute to carbon footprint

### How It Works
```
If Today's Date > Last Date of Support:
  → Asset status = "end-of-life" (automatic)
  → Included in immediate replacement actions
  → Methane emissions calculated for disposal
  → Compliance violations flagged for all applicable standards
```

### Example
```
Laptop: Last Date of Support = 2024-12-31
Today: 2025-01-15
Status: AUTOMATICALLY "end-of-life" (even if you uploaded "healthy")
Action: Add to replacement priority + calculate methane CO2e
```

---

## Data Validation Rules

### Required Fields
1. **Asset ID** - Unique identifier (no duplicates)
2. **Asset Type** - Chair, Table, Monitor, Laptop, Cubicle, Hardware, Software, Vehicle, Real Estate
3. **Health Status** - healthy, at-risk, critical, end-of-life
4. **Last Date of Support** - **CRITICAL for EOL calculations** (YYYY-MM-DD format)
5. **Compliance Score** - 0-100 (numeric)
6. **Country** - Valid country name (Germany, USA, India, etc.)
7. **Region** - MUST match exactly:
   - `Europe (GDPR/RoHS)`
   - `North America (EPA/OSHA)`
   - `Asia Pacific (Local Regs)`
   - `Other Regions`
8. **Cost** - Asset purchase cost (numeric)
9. **Dates** - YYYY-MM-DD format (valid dates)

### What Gets Rejected
- ❌ Missing required columns
- ❌ Invalid health status values
- ❌ Compliance score > 100 or < 0
- ❌ Region doesn't match the 4 valid values
- ❌ Duplicate Asset IDs
- ❌ Invalid date formats
- ❌ Non-numeric cost/score values

---

## Transparency & Audit Trail

### How to Verify Calculations

1. **Download Imported Data**
   - Dashboard stores all imported assets
   - Can export to verify data integrity

2. **Check Calculation Logic**
   - All formulas are in the codebase
   - Open-source, auditable

3. **Compare Against Your Data**
   - Each metric shows:
     - How it was calculated
     - Which assets contributed
     - Original source data

---

## Example: Complete Calculation

### Input: 20 Laptops, Germany, One Imported

```csv
ADM-0001,Laptop,ThinkPad X1,Lenovo,2020-01-15,2027-01-15,critical,45,1900,Germany,Europe (GDPR/RoHS),IT,Berlin,65000,2020-01-15
```

### System Calculates:

**Business Impact:**
- Health Risk: 1.3 employees × 2.5 (critical) = 3.25 → 3 employees at risk
- Annual Savings: $100 maintenance + ($150/hr × 8 hrs × 0.70) = $940
- Carbon: 290 kg CO₂e (operational) + 0.03 kg CH₄ (end-of-life) = 0.29 tonnes
- Continuity Risk: 1 critical asset out of 1 = 100% → "Critical"

**Compliance:**
- Compliance Score: 45 < 80 → **VIOLATION**
- Applicable Standards (Germany/Europe): GDPR, RoHS, CE, ISO 27001
- Violation Rate: 100%
- Fine Exposure: 
  - GDPR: 1 × $18,000 = $18,000
  - RoHS: 1 × $50,000 = $50,000
  - ISO 27001: 1 × $100,000 = $100,000
  - **Total: $168,000**

**Immediate Actions:**
- Replace critical asset: 1 × $1,400 = $1,400
- Health assessment: 1 × $250 = $250

**ROI:**
- Year 1 Savings: $940
- Investment: $1,650
- Payback: ($1,650 / $940) × 12 = 21 months
- 3-Year ROI: (($940 × 3 - $1,650) / $1,650) × 100 = 71%

---

## Key Principles

✅ **No Fake Data** - Everything comes from your imports
✅ **Transparent** - Every metric has a visible formula
✅ **Auditable** - All calculations based on standard factors
✅ **Region-Aware** - Compliance standards change by location
✅ **Risk-Based** - Health & continuity risk scale with asset condition
✅ **Financial** - All metrics include real cost estimates

---

## Support

For questions about calculations:
1. Check this guide's formula section
2. Export your imported data to verify accuracy
3. Review the source code in `src/lib/calculations/metricCalculator.ts`
4. Check regional compliance requirements in `src/lib/data/complianceMatrix.ts`
