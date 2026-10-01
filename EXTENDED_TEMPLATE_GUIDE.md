# Extended Asset Template & Smart Q&A System

## Overview

The Asset Health System now supports **two levels of data input**:

1. **Extended Template** - Users can provide detailed impact factor data directly in the CSV
2. **Smart Q&A Fallback** - If fields are blank, the system asks guided questions to calculate factors

---

## 📋 Extended Template Structure

### Basic Asset Information (Required)
These fields are always required:
- **Asset ID** - Unique identifier
- **Asset Type** - Monitor, Laptop, Chair, etc.
- **Manufacturer** - Device manufacturer
- **Health Status** - healthy, at-risk, critical, end-of-life
- **Compliance Score** - 0-100
- **Last Date of Support** - When support ends
- **Region** - Europe, North America, Asia Pacific, Other
- **Department** - Organizational department
- **Location** - Physical location
- **Cost** - Asset cost in USD
- **Country** - Country location

### Optional Asset Details
Additional asset information (useful for context):
- **Barcode** - Inventory tracking ID
- **Date of Manufacture** - When made
- **End of Sale** - When product discontinued
- **Replacement Product** - Recommended successor
- **Product Parts** - Comma-separated list of components
- **Potential Health Impact** - Health hazards from this asset
- **Risk Level** - Manual risk assessment

### Optional Impact Factors
These fields allow users to provide actual data instead of using estimates:

#### Health Impact
- **Employees Affected** - How many employees use this asset daily
- **Health Issues Per Year** - Estimated health issues caused annually

#### Cost Impact
- **Annual Maintenance Cost** - Yearly repair & maintenance spend (USD)
- **Downtime Hours Per Failure** - Hours until asset is back in service
- **Downtime Cost Per Hour** - Productivity cost per hour when down (USD)
- **Replacement Cost** - Cost to purchase a new unit (USD)

#### Environmental Impact
- **Annual CO2e** - Annual carbon footprint (tonnes CO2e)
- **Power Watts** - Power consumption in watts (for CO2e calculation)

#### Notes
- **Notes** - Any additional context about the asset

---

## 🤖 Smart Q&A Fallback System

### How It Works

**Situation:** User imports a Monitor but leaves "Employees Affected" blank

**Process:**
1. System detects missing field
2. Instead of using industry standard, asks a question
3. User selects from options (e.g., "3-5 employees")
4. System calculates the factor from the answer
5. Dashboard shows "⚙️ From Your Answers" label for transparency

### Available Questions

#### Health Impact Questions

**Q1: How many employees use this asset daily?**
- 1-2 employees → 1.5 factor
- 3-5 employees → 3.5 factor
- 6-10 employees → 7 factor
- 11-20 employees → 15 factor
- 20+ employees → 30 factor

**Q2: Health issues annually due to poor condition?**
- None → 0 factor
- Minimal (1-2) → 1.5 factor
- Moderate (3-5) → 4 factor
- High (6-10) → 8 factor
- Critical (10+) → 15 factor

#### Cost Impact Questions

**Q3: Annual maintenance/repair cost?**
- Minimal (<$50) → $25
- Low ($50-150) → $100
- Moderate ($150-300) → $225
- High ($300-500) → $400
- Very High ($500+) → $750

**Q4: Hours until asset is back in service after failure?**
- Quick (<1 hour) → 0.5 hours
- Short (1-2 hours) → 1.5 hours
- Medium (2-4 hours) → 3 hours
- Long (4-8 hours) → 6 hours
- Extended (8+ hours) → 16 hours

**Q5: Productivity cost per hour when asset is down?**
- Low ($25-50/hr) → $37/hr
- Moderate ($50-150/hr) → $100/hr
- High ($150-300/hr) → $225/hr
- Critical ($300-500/hr) → $400/hr
- Severe ($500+/hr) → $750/hr

**Q6: Replacement cost for new unit?**
- Budget (<$200) → $150
- Standard ($200-500) → $350
- Good ($500-1000) → $750
- Premium ($1000-2000) → $1500
- Enterprise ($2000+) → $3000

#### Environmental Questions

**Q7: Annual CO2e footprint?**
- Very Low (<0.05 tonnes) → 0.025 tonnes
- Low (0.05-0.1 tonnes) → 0.075 tonnes
- Moderate (0.1-0.2 tonnes) → 0.15 tonnes
- High (0.2-0.5 tonnes) → 0.35 tonnes
- Very High (0.5+ tonnes) → 0.75 tonnes

**Q8: Power consumption data available?**
- Yes → User enters watts
- No → Use industry standard

---

## 📊 Data Source Transparency

Every calculated metric shows its data source:

### ✅ Actual Data
User provided complete data in the template
- Example: "Annual Maintenance Cost: $400" (from template)

### ⚙️ From Your Answers
User answered Q&A questions for this field
- Example: "Annual Maintenance Cost: $225" (from "Moderate $150-300/year" answer)

### 📊 Industry Standard
Field was blank and no Q&A was provided, system used default estimate
- Example: "Annual Maintenance Cost: $100" (industry standard for Monitor)

---

## 🎯 Confidence Levels

The system calculates overall data confidence:

### High Confidence
- 2+ factors from actual data OR answered questions

### Medium Confidence  
- 1+ factors from actual data OR answered questions
- Rest from industry standards

### Low Confidence
- All factors from industry standards
- No actual data or Q&A answers provided

Dashboard displays this confidence level to help users understand reliability.

---

## 📥 Using the Extended Template

### Option 1: Full Data (High Confidence)
```csv
Asset ID,Type,Health Status,...,Employees Affected,Annual Maintenance Cost,...
A001,Monitor,healthy,...,5,400,...
```
Result: ✅ All actual data, highest confidence

### Option 2: Partial Data (Medium Confidence)
```csv
Asset ID,Type,Health Status,...,Employees Affected,Annual Maintenance Cost,...
A001,Monitor,healthy,...,5,
```
Result: ✅ Employees data actual, cost data will be asked via Q&A

### Option 3: No Data (Low Confidence, Q&A Offered)
```csv
Asset ID,Type,Health Status,...,Employees Affected,Annual Maintenance Cost,...
A001,Monitor,healthy,...,
```
Result: System asks questions when calculating

### Option 4: Old Template (Backward Compatible)
Users with the old Asset_Template.csv can still use it - system just asks more Q&A questions

---

## 🔄 Data Flow

```
User imports CSV with optional factor fields
↓
System identifies blank fields
↓
During metric calculation:
  For each blank field:
    ├─ Check if actual data provided → Use it
    ├─ If blank, ask Q&A question → Calculate from answer
    └─ If skipped, use industry standard → Mark as estimated
↓
Dashboard displays metrics with confidence labels
↓
User sees where each number came from
```

---

## 💾 Storing Answers

Users can optionally save Q&A answers:
- Answers are stored with the asset record
- Future imports of same asset reuse the answers
- Users can update answers anytime

---

## 📈 Benefits of This Approach

✅ **User Control** - Full transparency on where data comes from
✅ **Flexibility** - Provide full data, partial data, or just answer questions
✅ **No Hidden Assumptions** - No surprise calculations from unknown factors
✅ **Guides Improvement** - Users can upgrade from estimated → Q&A → actual over time
✅ **Backward Compatible** - Old templates still work (just trigger more Q&A)
✅ **Smart Guidance** - Q&A options help users without expertise
✅ **Confidence Scoring** - Shows reliability of final metrics

---

## 🎓 Example Walkthrough

### Scenario: Import Monitor without factor data

**User's Template Row:**
```csv
ADM-0001,Monitor,Dell UltraSharp,Dell,...,at-risk,70,...,[all factor fields blank]
```

**System Response:**
1. Detects blank factor fields
2. Shows questionnaire modal
3. Asks questions one-by-one:
   - "How many employees use this Monitor?" → User selects "6-10"
   - "Health issues annually?" → User selects "Moderate (3-5)"
   - "Annual maintenance cost?" → User selects "High ($300-500/year)"
   - etc.

**Result in Dashboard:**
- Employee Health Risk: 3 employees at risk (⚙️ From Your Answers)
- Annual Maintenance Cost: $400 (⚙️ From Your Answers)
- Overall Confidence: **Medium** (some factors answered, some estimated)

---

## 🛠️ For Developers

### Files Added
- `src/lib/data/impactFactorQuestions.ts` - Question database
- `src/lib/calculations/factorCalculator.ts` - Smart calculator logic
- `src/components/factors/FactorQuestionnaire.tsx` - UI component
- `public/Asset_Template_Extended.csv` - Extended template

### Integration Points
- CSV Processor: Extracts factor fields
- Metric Calculator: Uses smart fallback logic
- Dashboard: Shows data source labels

### Using the Factor Calculator
```typescript
import { calculateFactorsWithConfidence } from '@/lib/calculations/factorCalculator'

const result = calculateFactorsWithConfidence(
  'Monitor',
  {
    employeesAffected: 5, // from template
    // annualMaintenanceCost: undefined, // blank in template
  },
  {
    annualMaintenanceCost: 400, // from Q&A answer
  }
)

// result.healthFactor.source = 'actual'
// result.costFactor.source = 'calculated'
// result.overallConfidence = 'high'
```

---

## 📝 Next Steps

1. **Download Extended Template** from Dashboard
2. **Fill in available data** - No pressure to fill everything
3. **Import CSV** - System shows progress and asks Q&A
4. **View Results** - Each metric shows its data source
5. **Improve Over Time** - Add actual data as it becomes available

---

## ❓ FAQ

**Q: Do I have to answer all questions?**
A: No, you can skip questions. Skipped fields use industry standards (marked as estimated).

**Q: Can I mix template data and Q&A answers?**
A: Yes! Template data is always used first. Q&A fills gaps. Unansw answered fields use industry standards.

**Q: Will the system ask questions every time I import?**
A: No, once answered, answers are stored with the asset and reused on future imports.

**Q: How accurate are the industry standards?**
A: They're good starting points but may not match your specific environment. Providing actual data improves accuracy.

**Q: Can I update answers later?**
A: Yes, you can edit asset data anytime and update factor values.

---

## 📊 Summary

The Extended Template + Smart Q&A system eliminates "hidden assumptions" by:
1. Letting users provide actual data
2. Asking guided questions for data they don't have
3. Using industry standards as a last resort
4. Showing where every number comes from

This gives you **complete transparency and control** over asset impact calculations.
