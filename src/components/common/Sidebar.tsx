'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/authContext'
import { PRODUCT_NAME, TAGLINE } from '@/lib/brand'
import {
  BarChart3,
  AlertTriangle,
  Package,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Leaf,
  CheckCircle2,
  Battery,
  ShieldAlert,
} from 'lucide-react'

const navigation = [
  { name: 'Welcome', href: '/welcome', icon: BarChart3 },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Assets', href: '/assets', icon: Package },
  { name: 'Compliance', href: '/compliance', icon: ShieldAlert },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Sustainability', href: '/sustainability', icon: Leaf },
  { name: 'DLE Analytics', href: '/dle', icon: Battery },
  { name: 'Risk Justification', href: '/risk-justification', icon: CheckCircle2 },
  { name: 'Logic Library', href: '/logic-library', icon: FileText },
  { name: 'Score Library', href: '/score-library', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

function LogoutButton() {
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/auth/signin')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="border-t border-neutral-800 p-4">
      <div className="mb-4 px-4 py-2 text-sm text-neutral-400">
        {user?.email}
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 w-full px-4 py-3 text-neutral-300 hover:bg-neutral-800 rounded-lg transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-sm font-medium">Logout</span>
      </button>
    </div>
  )
}

export function Sidebar({ collapsed, onToggleCollapsed }: { collapsed: boolean; onToggleCollapsed: () => void }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (href: string) => pathname === href
  const desktopVisible = !collapsed

  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const toggle = () => (isDesktop ? onToggleCollapsed() : setIsOpen(o => !o))
  const expanded = isDesktop ? desktopVisible : isOpen

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label={expanded ? 'Hide menu' : 'Show menu'}
        title={expanded ? 'Hide menu' : 'Show menu'}
        className={`print:hidden fixed top-5 left-4 z-30 p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          isOpen ? 'text-white hover:bg-neutral-800' : 'bg-white text-neutral-700 shadow-md hover:bg-neutral-50'
        } ${desktopVisible ? 'md:bg-transparent md:shadow-none md:text-neutral-300 md:hover:bg-neutral-800 md:hover:text-white' : ''}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-neutral-900 text-white transition-transform duration-300 z-20 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${desktopVisible ? 'md:translate-x-0' : ''}`}
      >
        {/* Logo */}
        <div className="flex items-center h-20 pl-16 pr-4 border-b border-neutral-800 flex-shrink-0">
          <span className="leading-tight">
            <span className="block font-bold text-lg">{PRODUCT_NAME}</span>
            <span className="block text-[11px] text-neutral-400">{TAGLINE}</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  active
                    ? 'bg-primary-600 text-white'
                    : 'text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer - Always visible */}
        <div className="flex-shrink-0">
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
