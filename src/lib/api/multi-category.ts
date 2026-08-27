import { supabase } from '@/lib/db/supabase'
import { GenericAsset, AssetCategory, DataImportLog, CategoryTemplate, CATEGORY_TEMPLATES } from '@/types/multi-category'

/* Asset Category Management */
export async function fetchCategories(organizationId: string) {
  const { data, error } = await supabase
    .from('asset_categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export async function createCategory(
  organizationId: string,
  name: string,
  description?: string,
  template?: keyof typeof CATEGORY_TEMPLATES
): Promise<AssetCategory> {
  const templateData = template ? CATEGORY_TEMPLATES[template] : null

  const { data: category, error: categoryError } = await supabase
    .from('asset_categories')
    .insert([
      {
        name,
        description: description || templateData?.description,
        icon: templateData?.categoryName.split(' ')[0] + ' 📦',
        color: '#3B82F6',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (categoryError) throw categoryError

  // Create default fields if using template
  if (templateData && category) {
    for (const field of templateData.defaultFields) {
      await supabase.from('asset_fields').insert([
        {
          category_id: category.id,
          field_name: field.fieldName,
          field_type: field.fieldType,
          is_required: field.isRequired,
          field_order: field.fieldOrder,
          select_options: field.selectOptions || null,
          created_at: new Date().toISOString(),
        },
      ])
    }
  }

  return category
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const { error } = await supabase.from('asset_categories').delete().eq('id', categoryId)

  if (error) throw error
}

/* Asset Management - Generic */
export async function createAssets(
  organizationId: string,
  categoryId: string,
  assets: Omit<GenericAsset, 'id' | 'createdAt' | 'updatedAt' | 'organizationId' | 'categoryId'>[]
): Promise<GenericAsset[]> {
  const now = new Date().toISOString()
  const assetsWithMeta = assets.map((asset) => ({
    ...asset,
    organization_id: organizationId,
    category_id: categoryId,
    created_at: now,
    updated_at: now,
  }))

  const { data, error } = await supabase.from('assets').insert(assetsWithMeta).select()

  if (error) throw error
  return data || []
}

export async function fetchAssetsByCategory(
  organizationId: string,
  categoryId: string,
  limit = 100,
  offset = 0
) {
  const { data, error, count } = await supabase
    .from('assets_with_details')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { data: data || [], count: count || 0 }
}

export async function updateAsset(
  assetId: string,
  updates: Partial<GenericAsset>
): Promise<GenericAsset> {
  const { data, error } = await supabase
    .from('assets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', assetId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAsset(assetId: string): Promise<void> {
  const { error } = await supabase.from('assets').delete().eq('id', assetId)

  if (error) throw error
}

/* Bulk Data Import */
export async function parseCSV(csvContent: string, delimiter = ','): Promise<Record<string, any>[]> {
  const lines = csvContent.split('\n').filter((line) => line.trim())
  if (lines.length === 0) return []

  const headers = lines[0].split(delimiter).map((h) => h.trim())
  const records: Record<string, any>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map((v) => v.trim())
    const record: Record<string, any> = {}

    headers.forEach((header, index) => {
      record[header] = values[index] || ''
    })

    records.push(record)
  }

  return records
}

export async function validateImportData(
  records: Record<string, any>[],
  fields: any[]
): Promise<{ isValid: boolean; errors: { row: number; errors: string[] }[] }> {
  const errors: { row: number; errors: string[] }[] = []

  records.forEach((record, rowIndex) => {
    const rowErrors: string[] = []

    fields.forEach((field) => {
      if (field.is_required && !record[field.field_name]) {
        rowErrors.push(`Required field missing: ${field.field_name}`)
      }

      if (field.field_type === 'date' && record[field.field_name]) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(record[field.field_name])) {
          rowErrors.push(`Invalid date format for ${field.field_name}: expected YYYY-MM-DD`)
        }
      }

      if (field.field_type === 'number' && record[field.field_name]) {
        if (isNaN(Number(record[field.field_name]))) {
          rowErrors.push(`Invalid number format for ${field.field_name}`)
        }
      }
    })

    if (rowErrors.length > 0) {
      errors.push({ row: rowIndex + 2, errors: rowErrors }) // +2 because row 1 is header
    }
  })

  return { isValid: errors.length === 0, errors }
}

export async function createImportLog(
  organizationId: string,
  categoryId: string,
  userId: string,
  fileName: string,
  totalRecords: number
): Promise<DataImportLog> {
  const { data, error } = await supabase
    .from('data_import_logs')
    .insert([
      {
        organization_id: organizationId,
        category_id: categoryId,
        user_id: userId,
        file_name: fileName,
        total_records: totalRecords,
        successful_records: 0,
        failed_records: 0,
        import_status: 'processing',
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateImportLog(
  logId: string,
  updates: Partial<DataImportLog>
): Promise<DataImportLog> {
  const { data, error } = await supabase
    .from('data_import_logs')
    .update({
      ...updates,
      completed_at: updates.import_status === 'completed' ? new Date().toISOString() : null,
    })
    .eq('id', logId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function bulkImportAssets(
  organizationId: string,
  categoryId: string,
  userId: string,
  csvContent: string,
  fieldMapping: Record<string, string> // CSV column → asset field mapping
): Promise<{ success: boolean; importLogId: string; summary: { total: number; imported: number; failed: number } }> {
  try {
    // Parse CSV
    const records = await parseCSV(csvContent)

    // Get category fields
    const { data: fields, error: fieldsError } = await supabase
      .from('asset_fields')
      .select('*')
      .eq('category_id', categoryId)

    if (fieldsError) throw fieldsError

    // Validate data
    const { isValid, errors: validationErrors } = await validateImportData(records, fields)

    // Create import log
    const importLog = await createImportLog(organizationId, categoryId, userId, 'bulk_import.csv', records.length)

    if (!isValid) {
      await updateImportLog(importLog.id, {
        import_status: 'failed',
        failed_records: records.length,
        error_details: JSON.stringify(validationErrors),
      } as any)

      return {
        success: false,
        importLogId: importLog.id,
        summary: { total: records.length, imported: 0, failed: records.length },
      }
    }

    // Map and prepare assets for insertion
    const assetsToInsert = records.map((record) => ({
      organization_id: organizationId,
      category_id: categoryId,
      user_id: userId,
      asset_name: record[fieldMapping['name'] || 'Name'] || 'Unnamed Asset',
      asset_id: record[fieldMapping['id'] || 'ID'] || `ASSET-${Date.now()}`,
      custom_data: record,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    // Insert assets
    const { error: insertError } = await supabase.from('assets').insert(assetsToInsert)

    if (insertError) throw insertError

    // Update import log
    await updateImportLog(importLog.id, {
      import_status: 'completed',
      successful_records: records.length,
      failed_records: 0,
    } as any)

    return {
      success: true,
      importLogId: importLog.id,
      summary: { total: records.length, imported: records.length, failed: 0 },
    }
  } catch (error) {
    throw error
  }
}

export async function getImportHistory(organizationId: string, limit = 20) {
  const { data, error } = await supabase
    .from('data_import_logs')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/* Organization Management */
export async function createOrganization(
  name: string,
  userId: string,
  email?: string,
  phone?: string
): Promise<any> {
  const { data, error } = await supabase
    .from('organizations')
    .insert([
      {
        name,
        email,
        phone,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) throw error

  // Add creator as owner
  if (data) {
    await supabase.from('organization_members').insert([
      {
        organization_id: data.id,
        user_id: userId,
        role: 'owner',
        created_at: new Date().toISOString(),
      },
    ])
  }

  return data
}

export async function getUserOrganizations(userId: string) {
  const { data, error } = await supabase
    .from('organization_members')
    .select('organizations(*)')
    .eq('user_id', userId)

  if (error) throw error
  return data?.map((m) => m.organizations) || []
}

export async function addOrganizationMember(
  organizationId: string,
  userId: string,
  role: 'admin' | 'manager' | 'viewer'
): Promise<void> {
  const { error } = await supabase.from('organization_members').insert([
    {
      organization_id: organizationId,
      user_id: userId,
      role,
      created_at: new Date().toISOString(),
    },
  ])

  if (error) throw error
}

/* Dashboard Metrics - Multi-Category */
export async function getOrganizationDashboardMetrics(organizationId: string) {
  const { data: assets, error: assetsError } = await supabase
    .from('assets_with_details')
    .select('*')
    .eq('organization_id', organizationId)

  if (assetsError) throw assetsError

  const { data: categories } = await supabase
    .from('asset_categories')
    .select('*')

  const assetsByCategory = categories?.map((cat) => ({
    category: cat.name,
    count: (assets || []).filter((a) => a.category_id === cat.id).length,
  })) || []

  return {
    totalAssets: (assets || []).length,
    totalCategories: (categories || []).length,
    assetsByCategory,
    recentImports: [],
  }
}
