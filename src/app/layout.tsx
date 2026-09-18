import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { DashboardProvider } from '@/lib/context/dashboardContext'
import { Layout } from '@/components/common/Layout'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Asset Health System',
  description: 'Professional asset health monitoring and alert system',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DashboardProvider>
            <Layout>{children}</Layout>
          </DashboardProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
