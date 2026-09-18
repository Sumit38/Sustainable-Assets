'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/common/Button'
import { Card, CardBody } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
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

      {/* Hero Section */}
      <section className="pt-40 pb-32 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-primary-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <p className="text-primary-200 text-sm font-semibold mb-6 uppercase tracking-wider">Enterprise Asset Intelligence</p>
          <h1 className="text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            Know Your Assets.<br/><span className="text-primary-300">Control Your Future.</span>
          </h1>
          <p className="text-xl text-primary-100 mb-12 leading-relaxed max-w-3xl mx-auto">
            Real-time health monitoring, predictive failure analysis, and automated compliance tracking.
            Make data-driven asset decisions that protect employee health, reduce costs, and ensure regulatory compliance.
          </p>

          <div className="flex gap-4 flex-wrap justify-center mb-12">
            <Link href="/auth/signup">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-primary-900 hover:bg-primary-50"
              >
                Start Free Trial
              </Button>
            </Link>
            <Link href="#features">
              <Button
                variant="secondary"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                See How It Works
              </Button>
            </Link>
          </div>

          <p className="text-primary-200 text-sm">✓ No credit card required • Deploy in minutes • Full compliance tracking</p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              The True Cost of Ignoring Asset Health
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Most organizations waste 25-40% of their asset budget on unexpected failures, emergency repairs, and compliance violations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-l-4 border-l-danger-600 hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <DollarSign className="w-12 h-12 text-danger-600" />
                  <Badge variant="danger">Financial</Badge>
                </div>
                <p className="text-sm text-neutral-600 mb-2">Unexpected Failures</p>
                <p className="text-3xl font-bold text-danger-600 mb-2">$2.5M+</p>
                <p className="text-xs text-neutral-500">Annual cost per 1,000 assets across emergency repairs, replacement, and lost productivity</p>
              </CardBody>
            </Card>

            <Card className="border-l-4 border-l-warning-600 hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <Users className="w-12 h-12 text-warning-600" />
                  <Badge variant="warning">Health</Badge>
                </div>
                <p className="text-sm text-neutral-600 mb-2">Employee Health Impact</p>
                <p className="text-3xl font-bold text-warning-600 mb-2">45%</p>
                <p className="text-xs text-neutral-500">Increase in musculoskeletal disorders and ergonomic injuries from aging equipment</p>
              </CardBody>
            </Card>

            <Card className="border-l-4 border-l-danger-600 hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <Clock className="w-12 h-12 text-danger-600" />
                  <Badge variant="danger">Productivity</Badge>
                </div>
                <p className="text-sm text-neutral-600 mb-2">Unplanned Downtime</p>
                <p className="text-3xl font-bold text-danger-600 mb-2">72 hrs/yr</p>
                <p className="text-xs text-neutral-500">Per employee lost to equipment failures, outages, and emergency replacements</p>
              </CardBody>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <Card>
              <CardBody>
                <h3 className="font-semibold text-neutral-900 mb-3">Compliance & Risk Exposure</h3>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <span className="text-danger-600 font-bold">•</span>
                    <span>GDPR, HIPAA, ISO 27001 violations ($5K-$50K per incident)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-danger-600 font-bold">•</span>
                    <span>Inadequate audit trails and asset documentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-danger-600 font-bold">•</span>
                    <span>Data breach risk from aging security infrastructure</span>
                  </li>
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h3 className="font-semibold text-neutral-900 mb-3">Environmental Impact</h3>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <span className="text-success-600 font-bold">•</span>
                    <span>120+ kg CO₂e per aged asset annually (Scope 2 & 3)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success-600 font-bold">•</span>
                    <span>Methane emissions from landfill disposal (28x CO₂ impact)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success-600 font-bold">•</span>
                    <span>No visibility into reuse/recycling opportunities</span>
                  </li>
                </ul>
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
