'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/common/Button'
import { Card, CardBody } from '@/components/common/Card'
import { Package, AlertTriangle, BarChart3, Shield, TrendingUp, CheckCircle } from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BarChart3 className="w-12 h-12 text-primary-600" />
            <h1 className="text-5xl font-bold text-neutral-900">Asset Health System</h1>
          </div>
          <p className="text-xl text-neutral-600">
            Professional monitoring for your organization's asset portfolio
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardBody>
              <Package className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Complete Visibility</h3>
              <p className="text-neutral-600 text-sm">
                Track all your assets including furniture, hardware, software, and real estate in one place
              </p>
            </CardBody>
          </Card>

          <Card className="text-center">
            <CardBody>
              <AlertTriangle className="w-12 h-12 text-warning-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Proactive Alerts</h3>
              <p className="text-neutral-600 text-sm">
                Get notified before assets fail, reach end-of-life, or violate compliance requirements
              </p>
            </CardBody>
          </Card>

          <Card className="text-center">
            <CardBody>
              <TrendingUp className="w-12 h-12 text-success-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Planning</h3>
              <p className="text-neutral-600 text-sm">
                Data-driven insights for replacement planning and budget forecasting
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-neutral-900">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardBody>
                <div className="flex gap-4">
                  <BarChart3 className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Real-time Dashboard</h4>
                    <p className="text-sm text-neutral-600">
                      Executive-level overview with KPI cards and interactive visualizations
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex gap-4">
                  <AlertTriangle className="w-6 h-6 text-warning-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Alert System</h4>
                    <p className="text-sm text-neutral-600">
                      Automated alerts with multiple severity levels and filtering options
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex gap-4">
                  <Shield className="w-6 h-6 text-success-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Compliance Tracking</h4>
                    <p className="text-sm text-neutral-600">
                      Monitor health compliance and ergonomic standards across all assets
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Multi-Category Support</h4>
                    <p className="text-sm text-neutral-600">
                      Track assets, hardware, software, real estate, vehicles, and more
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Asset Types Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-neutral-900">What You Can Track</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: '📦', name: 'Assets' },
              { icon: '💻', name: 'Hardware' },
              { icon: '📱', name: 'Software' },
              { icon: '🏢', name: 'Real Estate' },
              { icon: '🚗', name: 'Vehicles' },
              { icon: '⚙️', name: 'Infrastructure' },
              { icon: '📊', name: 'Inventory' },
              { icon: '✨', name: 'Custom Assets' },
            ].map((item) => (
              <Card key={item.name}>
                <CardBody>
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg shadow-lg p-12">
          <h2 className="text-3xl font-bold mb-4 text-neutral-900">Ready to Get Started?</h2>
          <p className="text-lg text-neutral-600 mb-8">
            Begin monitoring your asset health and make data-driven decisions today
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/">
              <Button variant="primary" size="lg">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/assets">
              <Button variant="secondary" size="lg">
                View Assets
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="secondary" size="lg">
                See Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-neutral-600 text-sm">
          <p>
            Asset Health System v1.0.0 • Professional Asset Monitoring & Alert Management
          </p>
        </div>
      </div>
    </div>
  )
}
