'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { OrgScopePanel } from '@/components/compliance/OrgScopePanel'
import { CountryFactorsPanel } from '@/components/compliance/CountryFactorsPanel'
import { useAuth } from '@/lib/auth/authContext'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonStyles } from '@/components/common/ui'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/signin')
  }

  return (
    <div className="w-full">
      <PageHeader title="Settings" description="Your organisation's compliance scope, prediction settings and account" homeHref="/welcome" />

      <div className="p-6 space-y-6 max-w-4xl">
        <OrgScopePanel />

        <CountryFactorsPanel />

        <section className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-neutral-900 flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-primary-600" />
            Account
          </h2>
          <dl className="text-sm divide-y divide-neutral-100">
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-neutral-500">Signed in as</dt>
              <dd className="text-neutral-900">{user?.email ?? 'Not signed in'}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-neutral-500">Where data is stored</dt>
              <dd className="text-neutral-900 text-right">
                Asset data: AssetPulse database (your account only)
                <br />
                Settings above, alert acknowledgements, justifications: this browser
              </dd>
            </div>
          </dl>
          {user && (
            <button type="button" onClick={handleSignOut} className={`${buttonStyles.secondary} mt-4`}>
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          )}
        </section>
      </div>
    </div>
  )
}
