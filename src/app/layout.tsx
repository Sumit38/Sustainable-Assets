import type { Metadata } from 'next'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { Layout } from '@/components/common/Layout'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Asset Health System',
  description: 'Professional asset health monitoring and alert system',
  viewport: 'width=device-width, initial-scale=1',
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
          <Layout>{children}</Layout>
        </AuthProvider>
      </body>
    </html>
  )
}
