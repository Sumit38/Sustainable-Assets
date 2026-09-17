'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/common/Button'
import { Card, CardBody } from '@/components/common/Card'
import { VideoPlayer } from '@/components/common/VideoPlayer'
import {
  Package,
  AlertTriangle,
  BarChart3,
  Shield,
  TrendingUp,
  CheckCircle,
  DollarSign,
  Users,
  Leaf,
  Clock,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white border-b border-neutral-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-neutral-900">Asset Health System</span>
            </div>
            <div className="flex gap-4">
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                Transform Asset Management Into <span className="text-primary-600">Strategic Value</span>
              </h1>
              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                Stop guessing about your assets. Use AI-powered health monitoring to predict failures,
                optimize replacement budgets, and make data-driven decisions that save millions.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link href="/auth/signup">
                  <Button variant="primary" size="lg">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="secondary" size="lg">
                    Learn More
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-neutral-500 mt-6">✓ No credit card required • Free for 30 days</p>
            </div>

            {/* Professional Video Player */}
            <VideoPlayer
              title="Asset Lifecycle Impact"
              description="Learn how aging assets affect employee health, environmental health, and your bottom line"
              videoUrl="https://www.youtube.com/embed/xtf1eHBlh14"
              posterImage="https://img.youtube.com/vi/xtf1eHBlh14/maxresdefault.jpg"
            />
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-neutral-900">
            The Hidden Cost of Asset Failure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-danger-100">
              <CardBody>
                <DollarSign className="w-12 h-12 text-danger-600 mb-4" />
                <p className="text-sm text-neutral-600 mb-2">Unexpected Failures Cost</p>
                <p className="text-3xl font-bold text-danger-600">$2.5M+</p>
                <p className="text-xs text-neutral-500 mt-2">Average annual impact per 1000 assets</p>
              </CardBody>
            </Card>

            <Card className="border-2 border-warning-100">
              <CardBody>
                <Users className="w-12 h-12 text-warning-600 mb-4" />
                <p className="text-sm text-neutral-600 mb-2">Employee Health Issues</p>
                <p className="text-3xl font-bold text-warning-600">45%</p>
                <p className="text-xs text-neutral-500 mt-2">Due to aging/poor asset conditions</p>
              </CardBody>
            </Card>

            <Card className="border-2 border-danger-100">
              <CardBody>
                <Clock className="w-12 h-12 text-danger-600 mb-4" />
                <p className="text-sm text-neutral-600 mb-2">Unplanned Downtime</p>
                <p className="text-3xl font-bold text-danger-600">72 hrs/yr</p>
                <p className="text-xs text-neutral-500 mt-2">Per employee from asset failures</p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-neutral-900">How We Solve This</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardBody>
                <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-neutral-900">Real-Time Monitoring</h3>
                <p className="text-neutral-600">
                  Track 500+ asset metrics in real-time. Get instant alerts before problems occur.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="bg-success-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-success-600" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-neutral-900">Predictive Analytics</h3>
                <p className="text-neutral-600">
                  AI predicts failures 6-12 months in advance. Plan replacements with confidence.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="bg-danger-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-danger-600" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-neutral-900">Cost Optimization</h3>
                <p className="text-neutral-600">
                  Optimize replacement budgets. Save 35% on maintenance and emergency repairs.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Metrics Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-neutral-900">What You'll Achieve</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '💰', metric: '35%', description: 'Cost Reduction' },
              { icon: '⏱️', metric: '40%', description: 'Less Downtime' },
              { icon: '❤️', metric: '50%', description: 'Better Employee Health' },
              { icon: '♻️', metric: '60%', description: 'Carbon Reduction' },
            ].map((item) => (
              <Card key={item.description}>
                <CardBody className="text-center">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <p className="text-3xl font-bold text-primary-600 mb-2">{item.metric}</p>
                  <p className="text-neutral-600">{item.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-neutral-900">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                icon: <AlertTriangle className="w-8 h-8" />,
                title: 'Smart Alerts',
                description:
                  'AI-powered alerts notify you before assets fail. Multi-severity levels with customizable thresholds.',
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Health Compliance',
                description:
                  'Auto-track ergonomic standards, safety compliance, and health regulations across all assets.',
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Predictive Planning',
                description:
                  'Forecast replacement needs 6-12 months ahead. Optimize capital expenditure with precision.',
              },
              {
                icon: <Leaf className="w-8 h-8" />,
                title: 'Sustainability Tracking',
                description:
                  'Monitor carbon footprint, scope 2 & 3 emissions, and methane impact from landfill disposal.',
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: 'Executive Dashboards',
                description:
                  'Real-time KPIs with business impact metrics. Make data-driven decisions instantly.',
              },
              {
                icon: <Package className="w-8 h-8" />,
                title: 'Multi-Category Support',
                description:
                  'Track furniture, hardware, software, real estate, vehicles, infrastructure, and more.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="text-primary-600 flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator Teaser */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">See Your Potential Savings</h2>
          <p className="text-xl mb-8 text-primary-100">
            Organizations save an average of $125K per year per 500 assets by optimizing maintenance
            and avoiding failure-driven replacements.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/signup">
              <Button variant="primary" size="lg" className="bg-white text-primary-600 hover:bg-primary-50">
                Calculate Your Savings
              </Button>
            </Link>
            <a href="#features">
              <Button
                variant="secondary"
                size="lg"
                className="border-2 border-white text-white hover:bg-primary-700"
              >
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-12 text-center border-2 border-primary-200">
            <h2 className="text-4xl font-bold mb-4 text-neutral-900">Ready to Transform Your Operations?</h2>
            <p className="text-lg text-neutral-600 mb-8">
              Join 200+ organizations using Asset Health System to save millions and improve employee wellness.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/auth/signup">
                <Button variant="primary" size="lg">
                  Start Your Free Trial
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="secondary" size="lg">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-6 h-6 text-primary-400" />
                <span className="font-bold text-white">Asset Health System</span>
              </div>
              <p className="text-sm text-neutral-400">
                Professional asset health monitoring and sustainability tracking.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-primary-400">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-primary-400">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-primary-400">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center text-sm text-neutral-400">
            <p>&copy; 2026 Asset Health System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
