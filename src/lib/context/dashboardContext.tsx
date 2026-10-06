'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ImportedAsset, CalculatedMetrics, calculateMetrics } from '@/lib/calculations/metricCalculator'
import { useAuth } from '@/lib/auth/authContext'
import { loadAssetsFromDatabase, saveAssetsToDatabase } from '@/lib/supabase/assetService'
import { isPhysicalAssetType } from '@/lib/data/assetScope'
import { DEFAULT_ORG_PROFILE, OrgProfile, setOrgProfile as applyOrgProfile } from '@/lib/data/complianceMatrix'

const electronicOnly = (assets: ImportedAsset[]) => assets.filter(a => !isPhysicalAssetType(a.assetType))

const profileKey = (userId?: string) => `assetpulse-org-profile-${userId ?? 'guest'}`
const factorsKey = (userId?: string) => `assetpulse-country-factors-${userId ?? 'guest'}`

function readFactors(userId?: string): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(factorsKey(userId)) || '{}')
  } catch {
    return {}
  }
}

function readProfile(userId?: string): OrgProfile {
  try {
    const raw = localStorage.getItem(profileKey(userId))
    return raw ? { ...DEFAULT_ORG_PROFILE, ...JSON.parse(raw) } : DEFAULT_ORG_PROFILE
  } catch {
    return DEFAULT_ORG_PROFILE
  }
}

interface DashboardContextType {
  importedAssets: ImportedAsset[]
  calculatedMetrics: CalculatedMetrics | null
  setDashboardData: (assets: ImportedAsset[], metrics: CalculatedMetrics) => Promise<{ success: boolean; error?: string }>
  clearDashboardData: () => void
  loadDashboardData: () => void
  orgProfile: OrgProfile
  updateOrgProfile: (profile: OrgProfile) => void
  countryFactors: Record<string, number>
  updateCountryFactors: (factors: Record<string, number>) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [importedAssets, setImportedAssets] = useState<ImportedAsset[]>([])
  const [calculatedMetrics, setCalculatedMetrics] = useState<CalculatedMetrics | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [orgProfile, setOrgProfileState] = useState<OrgProfile>(DEFAULT_ORG_PROFILE)
  const [countryFactors, setCountryFactors] = useState<Record<string, number>>({})
  const { user } = useAuth()

  const updateCountryFactors = (factors: Record<string, number>) => {
    setCountryFactors(factors)
    try {
      localStorage.setItem(factorsKey(user?.id), JSON.stringify(factors))
    } catch {}
  }

  const updateOrgProfile = (profile: OrgProfile) => {
    applyOrgProfile(profile)
    setOrgProfileState(profile)
    try {
      localStorage.setItem(profileKey(user?.id), JSON.stringify(profile))
    } catch {}
    // Pages memoise on the asset array, so hand them a new one to recalculate compliance
    const next = [...importedAssets]
    setImportedAssets(next)
    setCalculatedMetrics(calculateMetrics(next))
  }

  // Load data from Supabase on user auth or from localStorage only for unauthenticated users
  useEffect(() => {
    const loadData = async () => {
      const profile = readProfile(user?.id)
      applyOrgProfile(profile)
      setOrgProfileState(profile)
      setCountryFactors(readFactors(user?.id))
      try {
        // If user is authenticated, ONLY load from Supabase (not localStorage to prevent data leakage)
        if (user?.id) {
          const dbAssets = electronicOnly(await loadAssetsFromDatabase(user.id))
          setImportedAssets(dbAssets)
          // Calculate metrics from loaded assets
          const metrics = calculateMetrics(dbAssets)
          setCalculatedMetrics(metrics)
          // Always clear localStorage when user is authenticated to prevent data mixing
          localStorage.removeItem('dashboardData')
          setIsLoaded(true)
          return
        }

        // Only load localStorage if user is NOT authenticated (for demo/trial mode)
        const stored = localStorage.getItem('dashboardData')
        if (stored) {
          const { assets } = JSON.parse(stored)
          const kept = electronicOnly(assets)
          setImportedAssets(kept)
          setCalculatedMetrics(calculateMetrics(kept))
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        // If user is authenticated, don't fallback to localStorage - that would leak data
        if (!user?.id) {
          // Only fallback to localStorage if NO authenticated user
          const stored = localStorage.getItem('dashboardData')
          if (stored) {
            try {
              const kept = electronicOnly(JSON.parse(stored).assets)
              setImportedAssets(kept)
              setCalculatedMetrics(calculateMetrics(kept))
            } catch (e) {
              console.error('Failed to load from localStorage:', e)
            }
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

    // Authenticated users persist only to Supabase; localStorage is cleared on their next load anyway
    if (user?.id) {
      return saveAssetsToDatabase(user.id, assets)
    }

    try {
      localStorage.setItem(
        'dashboardData',
        JSON.stringify({ assets, metrics })
      )
    } catch (error) {
      console.error('Failed to save dashboard data to localStorage:', error)
    }
    return { success: true }
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
        const dbAssets = electronicOnly(await loadAssetsFromDatabase(user.id))
        setImportedAssets(dbAssets)
        // Calculate metrics from loaded assets
        const metrics = calculateMetrics(dbAssets)
        setCalculatedMetrics(metrics)
        return
      } catch (error) {
        console.error('Failed to load from database:', error)
        // Don't fallback to localStorage for authenticated users - prevents data leakage
        return
      }
    }

    // Only load localStorage if user is NOT authenticated
    const stored = localStorage.getItem('dashboardData')
    if (stored) {
      try {
        const kept = electronicOnly(JSON.parse(stored).assets)
        setImportedAssets(kept)
        setCalculatedMetrics(calculateMetrics(kept))
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      }
    }
  }

  return (
    <DashboardContext.Provider value={{ importedAssets, calculatedMetrics, setDashboardData, clearDashboardData, loadDashboardData, orgProfile, updateOrgProfile, countryFactors, updateCountryFactors }}>
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
