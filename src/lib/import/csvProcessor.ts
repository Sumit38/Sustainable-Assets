// CSV File Processing and Validation

import { ImportedAsset } from '@/lib/calculations/metricCalculator'
import { Region } from '@/lib/data/complianceMatrix'

export interface CSVValidationError {
  row: number
  field: string
  error: string
  value: string
}

// Extended asset interface with optional fields captured from CSV
export interface ExtendedImportedAsset extends ImportedAsset {
  barcode?: string
  endOfSale?: string
  replacementProduct?: string
  productParts?: string
  potentialHealthImpact?: string
  riskLevel?: string
  // Impact factor fields (optional - can be filled in template or answered via Q&A)
  employeesAffected?: number
  healthIssuesPerYear?: number
  annualMaintenanceCost?: number
  downtimeHoursPerFailure?: number
  downtimeCostPerHour?: number
  replacementCost?: number
  annualCO2e?: number
  powerWatts?: number
  notes?: string
}

export interface CSVProcessingResult {
  success: boolean
  assetsImported: number
  errors: CSVValidationError[]
  assets: ExtendedImportedAsset[]
  warnings: string[]
}

const VALID_REGIONS: Region[] = [
  'Europe (GDPR/RoHS)',
  'North America (EPA/OSHA)',
  'Asia Pacific (Local Regs)',
  'Other Regions',
]

const VALID_HEALTH_STATUSES = ['healthy', 'at-risk', 'critical', 'end-of-life']

const REQUIRED_FIELDS = [
  'Asset ID',
  'Asset Type',
  'Product Name',
  'Manufacturer',
  'Date of Manufacture',
  'Last Date of Support',
  'Health Status',
  'Compliance Score',
  'Days Until End of Support',
  'Country',
  'Region',
  'Department',
  'Location',
  'Cost',
  'Purchase Date',
]

const OPTIONAL_FIELDS = [
  'Barcode',
  'End of Sale',
  'Replacement Product',
  'Product Parts',
  'Potential Health Impact',
  'Risk Level',
  'Employees Affected',
  'Health Issues Per Year',
  'Annual Maintenance Cost',
  'Downtime Hours Per Failure',
  'Downtime Cost Per Hour',
  'Replacement Cost',
  'Annual CO2e',
  'Power Watts',
  'Notes',
]

export function parseCSV(csvContent: string): string[][] {
  const lines = csvContent.trim().split('\n')
  const rows: string[][] = []

  for (const line of lines) {
    // Simple CSV parsing - handles basic comma-separated values
    // For complex CSV with quotes, use a library
    const row = line.split(',').map(cell => cell.trim())
    rows.push(row)
  }

  return rows
}

export function validateAndProcessCSV(csvContent: string): CSVProcessingResult {
  const rows = parseCSV(csvContent)
  const errors: CSVValidationError[] = []
  const assets: ImportedAsset[] = []
  const warnings: string[] = []

  if (rows.length < 2) {
    return {
      success: false,
      assetsImported: 0,
      errors: [{ row: 1, field: 'FILE', error: 'CSV file is empty or has only headers', value: '' }],
      assets: [],
      warnings,
    }
  }

  // Validate headers
  const headers = rows[0]
  const missingFields = REQUIRED_FIELDS.filter(
    field => !headers.includes(field)
  )

  if (missingFields.length > 0) {
    return {
      success: false,
      assetsImported: 0,
      errors: [
        {
          row: 1,
          field: 'HEADERS',
          error: `Missing required columns: ${missingFields.join(', ')}`,
          value: '',
        },
      ],
      assets: [],
      warnings,
    }
  }

  // Map header indices
  const headerMap: Record<string, number> = {}
  headers.forEach((header, index) => {
    headerMap[header] = index
  })

  // Process data rows
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex]

    // Skip empty rows
    if (row.every(cell => !cell)) {
      continue
    }

    const rowNumber = rowIndex + 1

    try {
      // Extract and validate required fields
      const assetId = row[headerMap['Asset ID']]?.trim()
      const assetType = row[headerMap['Asset Type']]?.trim()
      const productName = row[headerMap['Product Name']]?.trim()
      const manufacturer = row[headerMap['Manufacturer']]?.trim()
      const dateOfManufacture = row[headerMap['Date of Manufacture']]?.trim()
      const lastDateOfSupport = row[headerMap['Last Date of Support']]?.trim()
      const healthStatus = row[headerMap['Health Status']]?.trim().toLowerCase()
      const complianceScoreStr = row[headerMap['Compliance Score']]?.trim()
      const daysUntilEOLStr = row[headerMap['Days Until End of Support']]?.trim()
      const country = row[headerMap['Country']]?.trim()
      const region = row[headerMap['Region']]?.trim() as Region
      const department = row[headerMap['Department']]?.trim()
      const location = row[headerMap['Location']]?.trim()
      const costStr = row[headerMap['Cost']]?.trim()
      const purchaseDate = row[headerMap['Purchase Date']]?.trim()

      // Extract optional fields
      const barcode = row[headerMap['Barcode']]?.trim()
      const endOfSale = row[headerMap['End of Sale']]?.trim()
      const replacementProduct = row[headerMap['Replacement Product']]?.trim()
      const productParts = row[headerMap['Product Parts']]?.trim()
      const potentialHealthImpact = row[headerMap['Potential Health Impact']]?.trim()
      const riskLevel = row[headerMap['Risk Level']]?.trim()

      // Extract impact factor fields (optional)
      const employeesAffectedStr = row[headerMap['Employees Affected']]?.trim()
      const healthIssuesPerYearStr = row[headerMap['Health Issues Per Year']]?.trim()
      const annualMaintenanceCostStr = row[headerMap['Annual Maintenance Cost']]?.trim()
      const downtimeHoursStr = row[headerMap['Downtime Hours Per Failure']]?.trim()
      const downtimeCostPerHourStr = row[headerMap['Downtime Cost Per Hour']]?.trim()
      const replacementCostStr = row[headerMap['Replacement Cost']]?.trim()
      const annualCO2eStr = row[headerMap['Annual CO2e']]?.trim()
      const powerWattsStr = row[headerMap['Power Watts']]?.trim()
      const notes = row[headerMap['Notes']]?.trim()

      // Validate required fields
      if (!assetId) {
        errors.push({
          row: rowNumber,
          field: 'Asset ID',
          error: 'Asset ID is required',
          value: assetId || '',
        })
        continue
      }

      if (!assetType) {
        errors.push({
          row: rowNumber,
          field: 'Asset Type',
          error: 'Asset Type is required',
          value: assetType || '',
        })
        continue
      }

      // Validate health status
      if (!VALID_HEALTH_STATUSES.includes(healthStatus || '')) {
        errors.push({
          row: rowNumber,
          field: 'Health Status',
          error: `Must be one of: ${VALID_HEALTH_STATUSES.join(', ')}`,
          value: healthStatus || '',
        })
        continue
      }

      // Validate compliance score
      const complianceScore = parseFloat(complianceScoreStr || '')
      if (isNaN(complianceScore) || complianceScore < 0 || complianceScore > 100) {
        errors.push({
          row: rowNumber,
          field: 'Compliance Score',
          error: 'Must be a number between 0 and 100',
          value: complianceScoreStr || '',
        })
        continue
      }

      // Validate days until EOL
      const daysUntilEOL = parseInt(daysUntilEOLStr || '0', 10)
      if (isNaN(daysUntilEOL)) {
        errors.push({
          row: rowNumber,
          field: 'Days Until End of Support',
          error: 'Must be a valid number',
          value: daysUntilEOLStr || '',
        })
        continue
      }

      // Validate region
      if (!VALID_REGIONS.includes(region)) {
        errors.push({
          row: rowNumber,
          field: 'Region',
          error: `Must be one of: ${VALID_REGIONS.join(', ')}`,
          value: region || '',
        })
        continue
      }

      // Validate cost
      const cost = parseFloat(costStr || '0')
      if (isNaN(cost)) {
        errors.push({
          row: rowNumber,
          field: 'Cost',
          error: 'Must be a valid number',
          value: costStr || '',
        })
        continue
      }

      // Validate dates
      if (dateOfManufacture && !isValidDate(dateOfManufacture)) {
        errors.push({
          row: rowNumber,
          field: 'Date of Manufacture',
          error: 'Must be in YYYY-MM-DD format',
          value: dateOfManufacture,
        })
        continue
      }

      if (lastDateOfSupport && !isValidDate(lastDateOfSupport)) {
        errors.push({
          row: rowNumber,
          field: 'Last Date of Support',
          error: 'Must be in YYYY-MM-DD format',
          value: lastDateOfSupport,
        })
        continue
      }

      if (purchaseDate && !isValidDate(purchaseDate)) {
        errors.push({
          row: rowNumber,
          field: 'Purchase Date',
          error: 'Must be in YYYY-MM-DD format',
          value: purchaseDate,
        })
        continue
      }

      // Parse impact factor fields (optional numeric values)
      const employeesAffected = employeesAffectedStr ? parseFloat(employeesAffectedStr) : undefined
      const healthIssuesPerYear = healthIssuesPerYearStr ? parseFloat(healthIssuesPerYearStr) : undefined
      const annualMaintenanceCost = annualMaintenanceCostStr ? parseFloat(annualMaintenanceCostStr) : undefined
      const downtimeHoursPerFailure = downtimeHoursStr ? parseFloat(downtimeHoursStr) : undefined
      const downtimeCostPerHour = downtimeCostPerHourStr ? parseFloat(downtimeCostPerHourStr) : undefined
      const replacementCost = replacementCostStr ? parseFloat(replacementCostStr) : undefined
      const annualCO2e = annualCO2eStr ? parseFloat(annualCO2eStr) : undefined
      const powerWatts = powerWattsStr ? parseFloat(powerWattsStr) : undefined

      // Build asset object with optional fields
      const asset: ExtendedImportedAsset = {
        assetId,
        assetType,
        productName,
        manufacturer,
        dateOfManufacture: dateOfManufacture || new Date().toISOString().split('T')[0],
        lastDateOfSupport: lastDateOfSupport || new Date().toISOString().split('T')[0],
        healthStatus: healthStatus as any,
        complianceScore,
        daysUntilEndOfSupport: daysUntilEOL,
        country,
        region,
        department,
        location,
        cost,
        purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
        // Optional fields - Asset information
        ...(barcode && { barcode }),
        ...(endOfSale && { endOfSale }),
        ...(replacementProduct && { replacementProduct }),
        ...(productParts && { productParts }),
        ...(potentialHealthImpact && { potentialHealthImpact }),
        ...(riskLevel && { riskLevel }),
        // Impact factor fields (optional)
        ...(employeesAffected && !isNaN(employeesAffected) && { employeesAffected }),
        ...(healthIssuesPerYear !== undefined && !isNaN(healthIssuesPerYear) && { healthIssuesPerYear }),
        ...(annualMaintenanceCost && !isNaN(annualMaintenanceCost) && { annualMaintenanceCost }),
        ...(downtimeHoursPerFailure && !isNaN(downtimeHoursPerFailure) && { downtimeHoursPerFailure }),
        ...(downtimeCostPerHour && !isNaN(downtimeCostPerHour) && { downtimeCostPerHour }),
        ...(replacementCost && !isNaN(replacementCost) && { replacementCost }),
        ...(annualCO2e && !isNaN(annualCO2e) && { annualCO2e }),
        ...(powerWatts && !isNaN(powerWatts) && { powerWatts }),
        ...(notes && { notes }),
      }

      assets.push(asset)
    } catch (error) {
      errors.push({
        row: rowNumber,
        field: 'PARSE',
        error: `Error parsing row: ${error instanceof Error ? error.message : 'Unknown error'}`,
        value: row.join(', '),
      })
    }
  }

  return {
    success: errors.length === 0,
    assetsImported: assets.length,
    errors,
    assets,
    warnings,
  }
}

function isValidDate(dateString: string): boolean {
  if (!dateString) return false
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateString)) return false
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}
