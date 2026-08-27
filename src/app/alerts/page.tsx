'use client'

import React, { useState } from 'react'
import { Header } from '@/components/common/Header'
import { Card, CardBody, CardHeader } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { Bell, Trash2, CheckCircle } from 'lucide-react'

const MOCK_ALERTS = [
  {
    id: '1',
    title: 'Support Ending Soon',
    message: 'Support for Chair-2535 ends in 180 days',
    type: 'support-ending',
    severity: 'critical',
    assetId: 'ADM-0002',
    assetName: 'Chair-2535',
    createdAt: '2024-08-27T10:30:00Z',
    resolved: false,
  },
  {
    id: '2',
    title: 'Health Risk Detected',
    message: 'Cubicle-500 may cause posture issues after support ends',
    type: 'health-risk',
    severity: 'warning',
    assetId: 'ADM-0003',
    assetName: 'Cubicle-500',
    createdAt: '2024-08-27T09:15:00Z',
    resolved: false,
  },
  {
    id: '3',
    title: 'Compliance Violation',
    message: 'Table-1024 does not meet current ergonomic standards',
    type: 'compliance-violation',
    severity: 'warning',
    assetId: 'ADM-0001',
    assetName: 'Table-1024',
    createdAt: '2024-08-26T14:20:00Z',
    resolved: true,
  },
]

const severityColors = {
  critical: { bg: 'bg-danger-50', border: 'border-danger-200', text: 'text-danger-700', badge: 'danger' },
  warning: { bg: 'bg-warning-50', border: 'border-warning-200', text: 'text-warning-700', badge: 'warning' },
  error: { bg: 'bg-danger-50', border: 'border-danger-200', text: 'text-danger-700', badge: 'danger' },
  info: { bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-700', badge: 'neutral' },
}

const typeLabels = {
  'support-ending': 'Support Ending',
  'health-risk': 'Health Risk',
  'compliance-violation': 'Compliance',
  maintenance: 'Maintenance',
}

export default function AlertsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending')
  const [alerts, setAlerts] = useState(MOCK_ALERTS)

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'pending') return !alert.resolved
    if (filter === 'resolved') return alert.resolved
    return true
  })

  const handleResolveAlert = (id: string) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, resolved: true } : alert)))
  }

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  const pendingCount = alerts.filter((a) => !a.resolved).length
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.resolved).length

  return (
    <div className="w-full">
      <Header title="Alert Management" description="Monitor and manage system alerts" alerts={pendingCount} />

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Alerts</p>
                  <p className="text-2xl font-bold text-neutral-900">{alerts.length}</p>
                </div>
                <Bell className="w-8 h-8 text-primary-600 opacity-20" />
              </div>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-l-danger-500">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Pending Critical</p>
                  <p className="text-2xl font-bold text-danger-600">{criticalCount}</p>
                </div>
                <span className="text-3xl">🔴</span>
              </div>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-l-warning-500">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Pending Warnings</p>
                  <p className="text-2xl font-bold text-warning-600">
                    {alerts.filter((a) => a.severity === 'warning' && !a.resolved).length}
                  </p>
                </div>
                <span className="text-3xl">🟡</span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-neutral-200">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              filter === 'pending'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Pending ({alerts.filter((a) => !a.resolved).length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              filter === 'resolved'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Resolved ({alerts.filter((a) => a.resolved).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              filter === 'all'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            All ({alerts.length})
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                <p className="text-neutral-600">No {filter !== 'all' ? filter : ''} alerts found</p>
              </CardBody>
            </Card>
          ) : (
            filteredAlerts.map((alert) => {
              const colors = severityColors[alert.severity as keyof typeof severityColors]
              return (
                <Card key={alert.id} className={`${colors.border} border-l-4`}>
                  <CardBody>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-neutral-900">{alert.title}</h3>
                          <Badge variant={colors.badge as any}>
                            {typeLabels[alert.type as keyof typeof typeLabels]}
                          </Badge>
                          {alert.resolved && (
                            <Badge variant="success">
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm ${colors.text}`}>{alert.message}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
                          <span>Asset: {alert.assetName}</span>
                          <span>
                            {new Date(alert.createdAt).toLocaleDateString()}
                            {' '}
                            {new Date(alert.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!alert.resolved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Resolve
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <Trash2 className="w-4 h-4 text-danger-600" />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
