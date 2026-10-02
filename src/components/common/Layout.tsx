'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
}

const STORAGE_KEY = 'assetpulse-sidebar-collapsed'

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === '1')
    } catch {}
  }, [])

  const toggleCollapsed = () =>
    setCollapsed(c => {
      try {
        localStorage.setItem(STORAGE_KEY, c ? '0' : '1')
      } catch {}
      return !c
    })

  const isAuthPage = pathname?.startsWith('/auth/')
  const isLandingPage = pathname === '/landing' || pathname === '/'

  if (isAuthPage || isLandingPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
      <main
        data-sidebar={collapsed ? 'collapsed' : 'open'}
        className={`flex-1 overflow-auto transition-[margin] duration-300 ${collapsed ? 'md:ml-0' : 'md:ml-64'}`}
      >
        {children}
      </main>
    </div>
  )
}
