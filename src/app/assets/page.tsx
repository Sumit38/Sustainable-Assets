'use client'

import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardBody } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { StatusIndicator } from '@/components/common/StatusIndicator'
import { useDashboard } from '@/lib/context/dashboardContext'
import { Search, Download, Plus, Filter, AlertCircle } from 'lucide-react'

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const { importedAssets } = useDashboard()

  const filteredAssets = importedAssets.filter((asset) => {
    const matchesSearch =
      asset.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === '' || asset.healthStatus === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <div className="w-full">
      <PageHeader
        title="Asset Inventory"
        description="View and manage all assets"
        homeHref="/"
      />

      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex-1 w-full md:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, asset ID, or barcode..."
                className="input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              className="input flex-1 md:flex-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Health Status</option>
              <option value="healthy">Healthy</option>
              <option value="at-risk">At Risk</option>
              <option value="critical">Critical</option>
              <option value="end-of-life">End of Life</option>
            </select>

            <Button variant="secondary" size="md">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" />
              New Asset
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                const csv = [
                  ['Product Name', 'Asset Type', 'Manufacturer', 'Health Status', 'Compliance Score'].join(','),
                  ...filteredAssets.map(a =>
                    [a.productName, a.assetType, a.manufacturer, a.healthStatus, a.complianceScore].join(',')
                  )
                ].join('\n')
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'assets.csv'
                a.click()
              }}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Assets Table */}
        {importedAssets.length > 0 && (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      Asset Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      Manufacturer
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      Health Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      Compliance
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      Support Ends
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset, idx) => (
                    <tr
                      key={asset.assetId || idx}
                      className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-neutral-900">
                            {asset.productName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {asset.assetId}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="neutral">{asset.assetType}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {asset.manufacturer}
                      </td>
                      <td className="px-6 py-4">
                        <StatusIndicator status={asset.healthStatus} showLabel={true} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-neutral-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                asset.complianceScore >= 80
                                  ? 'bg-success-500'
                                  : asset.complianceScore >= 50
                                    ? 'bg-warning-500'
                                    : 'bg-danger-500'
                              }`}
                              style={{ width: `${asset.complianceScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {asset.complianceScore}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="text-neutral-900">{asset.lastDateOfSupport}</p>
                          <p className="text-xs text-neutral-500">
                            {asset.daysUntilEndOfSupport} days
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => alert(`Asset: ${asset.productName}\nID: ${asset.assetId}\nStatus: ${asset.healthStatus}\nCompliance: ${asset.complianceScore}%`)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
        )}

        {/* Pagination */}
        {importedAssets.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              Showing {filteredAssets.length} of {importedAssets.length} assets
            </p>
            <div className="flex gap-2">
              <Button variant="secondary">Previous</Button>
              <Button variant="secondary">Next</Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {importedAssets.length === 0 && (
          <Card>
            <CardBody className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-neutral-300 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Assets Imported</h3>
              <p className="text-sm text-neutral-600 mb-6">
                Upload asset data from the Dashboard to view your asset inventory
              </p>
              <Button variant="primary" onClick={() => window.location.href = '/'}>
                Go to Dashboard
              </Button>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}
