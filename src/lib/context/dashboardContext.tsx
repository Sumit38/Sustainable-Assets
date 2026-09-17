'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ImportedAsset, CalculatedMetrics } from '@/lib/calculations/metricCalculator'

interface DashboardContextType {
  importedAssets: ImportedAsset[]
  calculatedMetrics: CalculatedMetrics | null
  setDashboardData: (assets: ImportedAsset[], metrics: CalculatedMetrics) => void
  clearDashboardData: () => void
  loadDashboardData: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [importedAssets, setImportedAssets] = useState<ImportedAsset[]>([])
  const [calculatedMetrics, setCalculatedMetrics] = useState<CalculatedMetrics | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('dashboardData')
    if (stored) {
      try {
        const { assets, metrics } = JSON.parse(stored)
        setImportedAssets(assets)
        setCalculatedMetrics(metrics)
      } catch (error) {
        console.error('Failed to load dashboard data from localStorage:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  const setDashboardData = (assets: ImportedAsset[], metrics: CalculatedMetrics) => {
    setImportedAssets(assets)
    setCalculatedMetrics(metrics)

    // Persist to localStorage
    try {
      localStorage.setItem(
        'dashboardData',
        JSON.stringify({ assets, metrics })
      )
    } catch (error) {
      console.error('Failed to save dashboard data to localStorage:', error)
    }
  }

  const clearDashboardData = () => {
    setImportedAssets([])
    setCalculatedMetrics(null)
    localStorage.removeItem('dashboardData')
  }

  const loadDashboardData = () => {
    const stored = localStorage.getItem('dashboardData')
    if (stored) {
      try {
        const { assets, metrics } = JSON.parse(stored)
        setImportedAssets(assets)
        setCalculatedMetrics(metrics)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      }
    }
  }

  return (
    <DashboardContext.Provider value={{ importedAssets, calculatedMetrics, setDashboardData, clearDashboardData, loadDashboardData }}>
      {isLoaded && children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return context
}
