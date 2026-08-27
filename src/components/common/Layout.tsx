'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/auth/')

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:ml-64">
        {children}
      </main>
    </div>
  )
}
