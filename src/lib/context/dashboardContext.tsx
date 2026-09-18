'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ImportedAsset, CalculatedMetrics } from '@/lib/calculations/metricCalculator'
import { useAuth } from '@/lib/auth/authContext'
import { loadAssetsFromDatabase, saveAssetsToDatabase } from '@/lib/supabase/assetService'

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
  const { user } = useAuth()

  // Load data from Supabase on user auth or from localStorage as fallback
  useEffect(() => {
    const loadData = async () => {
      try {
        // If user is authenticated, load from Supabase
        if (user?.id) {
          const dbAssets = await loadAssetsFromDatabase(user.id)
          if (dbAssets.length > 0) {
            setImportedAssets(dbAssets)
            // Clear local storage if we have database data
            localStorage.removeItem('dashboardData')
            setIsLoaded(true)
            return
          }
        }

        // Fallback to localStorage if no user or no database data
        const stored = localStorage.getItem('dashboardData')
        if (stored) {
          const { assets, metrics } = JSON.parse(stored)
          setImportedAssets(assets)
          setCalculatedMetrics(metrics)
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        // Try localStorage as final fallback
        const stored = localStorage.getItem('dashboardData')
        if (stored) {
          try {
            const { assets, metrics } = JSON.parse(stored)
            setImportedAssets(assets)
            setCalculatedMetrics(metrics)
          } catch (e) {
            console.error('Failed to load from localStorage:', e)
          }
        }
      } finally {
        setIsLoaded(true)
      }
    }

    loadData()
  }, [user?.id])

  const setDashboardData = async (assets: ImportedAsset[], metrics: CalculatedMetrics) => {
    setImportedAssets(assets)
    setCalculatedMetrics(metrics)

    // Save to Supabase if user is authenticated
    if (user?.id) {
      try {
        await saveAssetsToDatabase(user.id, assets)
      } catch (error) {
        console.error('Failed to save assets to database:', error)
      }
    }

    // Also persist to localStorage as fallback
    try {
      localStorage.setItem(
        'dashboardData',
        JSON.stringify({ assets, metrics })
      )
    } catch (error) {
      console.error('Failed to save dashboard data to localStorage:', error)
    }
  }

  const clearDashboardData = async () => {
    setImportedAssets([])
    setCalculatedMetrics(null)
    localStorage.removeItem('dashboardData')

    // Delete from Supabase if user is authenticated
    if (user?.id) {
      try {
        const { deleteUserAssets } = await import('@/lib/supabase/assetService')
        await deleteUserAssets(user.id)
      } catch (error) {
        console.error('Failed to delete assets from database:', error)
      }
    }
  }

  const loadDashboardData = async () => {
    // Load from Supabase if user is authenticated
    if (user?.id) {
      try {
        const dbAssets = await loadAssetsFromDatabase(user.id)
        if (dbAssets.length > 0) {
          setImportedAssets(dbAssets)
          return
        }
      } catch (error) {
        console.error('Failed to load from database:', error)
      }
    }

    // Fallback to localStorage
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
