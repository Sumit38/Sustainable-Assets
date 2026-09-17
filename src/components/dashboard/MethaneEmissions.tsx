'use client'

import React from 'react'
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardBody, CardHeader } from '@/components/common/Card'
import { AlertTriangle, TrendingDown } from 'lucide-react'
import { COLORS } from '@/lib/constants/colors'

interface MethaneByMaterial {
  material: string
  methane_kg: number
  co2e_equivalent: number
  asset_count: number
}

interface MethaneAlertData {
  id: string
  asset_type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  escaped_methane_kg: number
  co2e_equivalent: number
  recommendation: string
}

interface MethaneEmissionsProps {
  methaneByMaterial?: MethaneByMaterial[]
  highMethaneAssets?: MethaneAlertData[]
  totalMethaneKg?: number
  totalCO2eFromMethane?: number
  avoidanceOpportunity?: number
}

export function MethaneEmissions({
  methaneByMaterial = [],
  highMethaneAssets = [],
  totalMethaneKg = 0,
  totalCO2eFromMethane = 0,
  avoidanceOpportunity = 0,
}: MethaneEmissionsProps) {
  // Material methane breakdown for pie chart
  const materialData = methaneByMaterial.map((m) => ({
    name: m.material,
    value: Math.round(m.co2e_equivalent),
  }))

  // Alert severity mapping
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-l-4 border-l-red-600'
      case 'high':
        return 'bg-orange-50 border-l-4 border-l-orange-600'
      case 'medium':
        return 'bg-yellow-50 border-l-4 border-l-yellow-600'
      default:
        return 'bg-green-50 border-l-4 border-l-green-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-600">Total Methane</span>
              <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">CH₄</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {totalMethaneKg.toFixed(2)}
              <span className="text-sm text-neutral-500 ml-2">kg</span>
            </div>
            <p className="text-xs text-neutral-500">Escaped methane from landfill</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-600">Methane CO₂e</span>
              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">GWP=28</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {Math.round(totalCO2eFromMethane).toLocaleString()}
              <span className="text-sm text-neutral-500 ml-2">kg CO₂e</span>
            </div>
            <p className="text-xs text-neutral-500">100-year timeframe</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-600">Avoidance Opportunity</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Recycling</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {Math.round(avoidanceOpportunity).toLocaleString()}
              <span className="text-sm text-neutral-500 ml-2">kg CO₂e</span>
            </div>
            <p className="text-xs text-neutral-500">Savings if recycled instead</p>
          </CardBody>
        </Card>
      </div>

      {/* Material Breakdown - Pie Chart */}
      {materialData.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-red-600">◆</span>
              Methane Impact by Material
            </h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={materialData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${value}kg CO₂e (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {materialData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={Object.values(COLORS)[index % Object.keys(COLORS).length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}kg CO₂e`} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      {/* High Methane Assets Alert */}
      {highMethaneAssets.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              High-Risk Methane Assets
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              {highMethaneAssets.length} assets producing significant methane
            </p>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {highMethaneAssets.map((asset) => (
                <div key={asset.id} className={`p-4 rounded-lg ${getSeverityColor(asset.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900">{asset.asset_type}</p>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div>
                          <p className="text-xs text-neutral-600">Escaped CH₄</p>
                          <p className="font-bold text-neutral-900">{asset.escaped_methane_kg.toFixed(2)} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-600">CO₂e Impact</p>
                          <p className="font-bold text-neutral-900">{Math.round(asset.co2e_equivalent)} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-600">Severity</p>
                          <p className="font-bold text-neutral-900">
                            {asset.severity.charAt(0).toUpperCase() + asset.severity.slice(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                    <p className="text-xs font-medium text-neutral-700">
                      <TrendingDown className="w-4 h-4 inline mr-1" />
                      {asset.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Methane Context Information */}
      <Card className="bg-blue-50 border border-blue-200">
        <CardBody>
          <h4 className="font-semibold text-neutral-900 mb-2">About Methane Emissions</h4>
          <ul className="text-sm text-neutral-700 space-y-1">
            <li>• <strong>CH₄ (Methane)</strong> has 28x higher Global Warming Potential (GWP) than CO₂ over 100 years</li>
            <li>• <strong>Landfill capture rate:</strong> ~65% of methane is captured; 35% escapes to atmosphere</li>
            <li>• <strong>High-risk materials:</strong> Foam (35%), Paper (32%), Leather (30%), Fabric (28%)</li>
            <li>• <strong>Alternative disposal:</strong> Recycling eliminates 100% of methane emissions</li>
            <li>• <strong>Action needed:</strong> Assets with &gt;5kg escaped methane should be prioritized for recycling/reuse</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}
