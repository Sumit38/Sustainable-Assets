import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { DashboardProvider } from '@/lib/context/dashboardContext'
import { Layout } from '@/components/common/Layout'
import { FULL_TITLE } from '@/lib/brand'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: FULL_TITLE,
  description:
    'AssetPulse turns your asset register into one view of lifecycle risk, compliance, employee health, carbon emissions and lithium recovery.',
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
