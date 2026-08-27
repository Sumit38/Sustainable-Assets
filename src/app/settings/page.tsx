'use client'

import React, { useState } from 'react'
import { Header } from '@/components/common/Header'
import { Card, CardBody } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { Save, User, Bell, Lock, Database } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    appName: 'Asset Health System',
    organizationName: 'Your Organization',
    email: 'admin@assethealth.com',
    phone: '+1-800-000-0000',
    timezone: 'UTC-5',
    language: 'English',
    theme: 'light',
    alertEmail: true,
    alertSlack: false,
    criticalOnly: false,
    backupEnabled: true,
    backupFrequency: 'daily',
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  return (
    <div className="w-full">
      <Header title="Settings" description="Configure application and user preferences" />

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Success Message */}
        {saved && (
          <div className="bg-success-50 border border-success-200 rounded-lg px-4 py-3 text-success-700 text-sm">
            ✓ Settings saved successfully
          </div>
        )}

        {/* General Settings */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">General Settings</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Application Name</label>
                <input
                  type="text"
                  className="input"
                  value={settings.appName}
                  onChange={(e) => handleChange('appName', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Organization Name</label>
                <input
                  type="text"
                  className="input"
                  value={settings.organizationName}
                  onChange={(e) => handleChange('organizationName', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Timezone</label>
                <select
                  className="input"
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                >
                  <option>UTC-8 (PST)</option>
                  <option>UTC-6 (CST)</option>
                  <option>UTC-5 (EST)</option>
                  <option>UTC+0 (GMT)</option>
                  <option>UTC+5:30 (IST)</option>
                </select>
              </div>
              <div>
                <label className="label">Language</label>
                <select
                  className="input"
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* User Settings */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">User Settings</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  className="input"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label">Theme</label>
              <div className="flex gap-4">
                {['light', 'dark', 'auto'].map((theme) => (
                  <label key={theme} className="flex items-center gap-2">
                    <input
                      type="radio"
                      value={theme}
                      checked={settings.theme === theme}
                      onChange={(e) => handleChange('theme', e.target.value)}
                    />
                    <span className="text-sm capitalize">{theme}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Alert Settings */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">Alert Preferences</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
                <input
                  type="checkbox"
                  checked={settings.alertEmail}
                  onChange={(e) => handleChange('alertEmail', e.target.checked)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-neutral-900">Email Notifications</p>
                  <p className="text-sm text-neutral-600">Receive alerts via email</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
                <input
                  type="checkbox"
                  checked={settings.alertSlack}
                  onChange={(e) => handleChange('alertSlack', e.target.checked)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-neutral-900">Slack Notifications</p>
                  <p className="text-sm text-neutral-600">Send alerts to Slack channel</p>
                  <Badge variant="neutral" className="mt-2">Coming Soon</Badge>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
                <input
                  type="checkbox"
                  checked={settings.criticalOnly}
                  onChange={(e) => handleChange('criticalOnly', e.target.checked)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-neutral-900">Critical Alerts Only</p>
                  <p className="text-sm text-neutral-600">Only notify for critical severity alerts</p>
                </div>
              </label>
            </div>
          </CardBody>
        </Card>

        {/* Data & Backup */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">Data & Backup</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <label className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="checkbox"
                checked={settings.backupEnabled}
                onChange={(e) => handleChange('backupEnabled', e.target.checked)}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="font-medium text-neutral-900">Enable Automatic Backups</p>
                <p className="text-sm text-neutral-600">Automatically backup data</p>
              </div>
            </label>

            {settings.backupEnabled && (
              <div>
                <label className="label">Backup Frequency</label>
                <select
                  className="input"
                  value={settings.backupFrequency}
                  onChange={(e) => handleChange('backupFrequency', e.target.value)}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}

            <div className="bg-neutral-50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium text-neutral-900">Last Backup</p>
              <p className="text-sm text-neutral-600">2024-08-27 at 02:30 UTC</p>
              <Button variant="secondary" size="sm">
                Download Backup
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">Security</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="p-4 bg-neutral-50 rounded-lg space-y-3">
              <div>
                <p className="font-medium text-neutral-900 mb-2">Change Password</p>
                <Button variant="secondary" size="sm">
                  Update Password
                </Button>
              </div>
              <div>
                <p className="font-medium text-neutral-900 mb-2">Two-Factor Authentication</p>
                <Badge variant="neutral">Not Enabled</Badge>
                <Button variant="secondary" size="sm" className="mt-2">
                  Enable 2FA
                </Button>
              </div>
              <div>
                <p className="font-medium text-neutral-900 mb-2">Active Sessions</p>
                <p className="text-sm text-neutral-600 mb-2">1 active session (this device)</p>
                <Button variant="secondary" size="sm">
                  Sign Out All Other Sessions
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button variant="primary" onClick={handleSave} className="flex-1 md:flex-none">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
          <Button variant="secondary" className="flex-1 md:flex-none">
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  )
}
