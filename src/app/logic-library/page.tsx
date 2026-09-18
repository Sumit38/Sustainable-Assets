'use client'

import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/common/Card'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function LogicLibraryPage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    gpi: true,
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const formulas = [
    {
      id: 'gpi',
      title: 'Global Pollution Index (GPI)',
      description: 'Comprehensive environmental and compliance score (0-100)',
      formula: `GPI = Average of [(Actual Scope 2 / Replaceable Scope 2) +
                    (Actual Scope 3 / Replaceable Scope 3) +
                    (Actual Energy / Replaceable Energy)] ×
            (Number of Replaceable Assets / Total Assets)`,
      explanation: [
        'Scope 2: Indirect emissions from electricity, steam, heating, and cooling',
        'Scope 3: Other indirect emissions (supplier, customer activities)',
        'Energy: Total estimated energy consumption from assets',
        'Replaceable Assets: Assets marked as critical or end-of-life',
        'Higher GPI indicates worse environmental/compliance status',
      ],
    },
    {
      id: 'assetReplacementRatio',
      title: 'Asset Replacement Ratio',
      description: 'Percentage of assets that need replacement',
      formula: `ARR = (Critical Assets + End-of-Life Assets) / Total Assets × 100`,
      explanation: [
        'Identifies aging assets requiring replacement',
        'Higher ratio indicates operational risk',
        'Used in capital planning and budgeting',
      ],
    },
    {
      id: 'healthImpact',
      title: 'Employee Health Impact',
      description: 'Predicted health risk from aging assets',
      formula: `Health Risk = Σ(Asset Health Factor × Risk Multiplier)`,
      explanation: [
        'Healthy: Multiplier = 0 (no risk)',
        'At-Risk: Multiplier = 1.5',
        'Critical: Multiplier = 2.5',
        'End-of-Life: Multiplier = 4.0',
        'Factors include ergonomic hazards, health issues per year, affected employees',
      ],
    },
    {
      id: 'carbonFootprint',
      title: 'Carbon Footprint Impact',
      description: 'Total CO₂e emissions including scopes and methane',
      formula: `Total CO₂e = Scope 1 + Scope 2 + Scope 3 + Methane Emissions

Methane = (Landfill Capture Rate × Asset Methane Factor × GWP Factor)`,
      explanation: [
        'Scope 1: Direct emissions from asset operation',
        'Scope 2: Indirect emissions from energy',
        'Scope 3: Indirect emissions from supplier/waste',
        'Methane GWP: 28x CO₂ over 100-year horizon',
        'Landfill Capture Rate: 65% captured, 35% atmospheric escape',
        'Material factors: Foam (0.35), Fabric (0.28), Wood (0.25), Plastic (0.05), Steel (0.0)',
      ],
    },
    {
      id: 'compliance',
      title: 'Compliance Risk Score',
      description: 'Global compliance violation rate and fine exposure',
      formula: `Violation Rate = (Assets Non-Compliant / Total Assets) × 100

Fine Exposure = Σ(Violation Count × Fine Per Violation)`,
      explanation: [
        'Standards tracked: GDPR, HIPAA, ISO 27001, PCI DSS, SOC 2, NIST, EPA, OSHA, RoHS, CE',
        'Region-specific standards applied:',
        '  • Europe: GDPR, RoHS, CE',
        '  • North America: EPA, OSHA',
        '  • Asia Pacific: Local regulations',
        'Fine exposure calculated based on standard severity and violation count',
      ],
    },
    {
      id: 'costSavings',
      title: 'Annual Cost Savings',
      description: 'Potential savings from preventing failures',
      formula: `Savings = Maintenance Costs + (Downtime Costs × Failure Risk)

Downtime Cost = Hours Per Failure × Cost Per Hour × Failure Probability`,
      explanation: [
        'Maintenance costs vary by asset type',
        'Downtime calculated based on asset criticality',
        'Failure probability ranges from 0 (healthy) to 1.0 (end-of-life)',
        'Estimate includes emergency repair avoidance',
      ],
    },
    {
      id: 'roi',
      title: 'Return on Investment (ROI)',
      description: 'Financial benefit of asset replacement program',
      formula: `Payback Period (months) = (Investment Required / Year 1 Savings) × 12

3-Year ROI (%) = ((3-Year Savings - Investment) / Investment) × 100`,
      explanation: [
        'Investment: Cost to replace critical/end-of-life assets',
        'Year 1 Savings: Annual maintenance + downtime cost reduction',
        '3-Year ROI: Cumulative savings over 3 years minus investment cost',
      ],
    },
    {
      id: 'businessContinuity',
      title: 'Business Continuity Risk',
      description: 'Risk level based on asset health distribution',
      formula: `Risk Level based on Critical/EOL Percentage:
- Critical: > 30%
- High: > 20%
- Medium: > 10%
- Low: ≤ 10%`,
      explanation: [
        'Evaluates exposure to sudden asset failures',
        'Higher percentage of critical assets = greater operational risk',
        'Informs business continuity planning',
      ],
    },
  ]

  return (
    <div className="w-full">
      <PageHeader
        title="Logic Library"
        description="Transparent documentation of all calculation formulas and metrics"
        homeHref="/"
      />

      <div className="p-6 space-y-4 max-w-6xl">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">About This Library</h3>
          <p className="text-sm text-blue-800">
            This page documents all formulas and calculation logic used in the Asset Health Management System.
            Each metric is transparent and traceable, allowing you to understand exactly how scores
            are calculated from your asset data.
          </p>
        </div>

        <div className="space-y-4">
          {formulas.map(formula => (
            <Card key={formula.id}>
              <CardHeader
                className="cursor-pointer hover:bg-neutral-50"
                onClick={() => toggleSection(formula.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900">{formula.title}</h3>
                    <p className="text-sm text-neutral-600 mt-1">{formula.description}</p>
                  </div>
                  {expandedSections[formula.id] ? (
                    <ChevronUp className="w-5 h-5 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                  )}
                </div>
              </CardHeader>

              {expandedSections[formula.id] && (
                <CardBody className="border-t border-neutral-200 pt-4 space-y-4">
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-2">Formula</h4>
                    <pre className="bg-neutral-50 p-4 rounded-lg overflow-x-auto text-sm font-mono text-neutral-700">
                      {formula.formula}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-2">Explanation</h4>
                    <ul className="space-y-2">
                      {formula.explanation.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-primary-600 font-bold mt-0.5">•</span>
                          <span className="text-sm text-neutral-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardBody>
              )}
            </Card>
          ))}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
          <h3 className="font-semibold text-green-900 mb-2">💡 Key Principles</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li>✓ All calculations are based on real imported data, no assumptions or estimates</li>
            <li>✓ Metrics update automatically when asset data changes</li>
            <li>✓ Formulas follow industry standards: GHG Protocol, ISO 27001, GDPR, OSHA guidelines</li>
            <li>✓ Transparency first: every number is traceable to source data</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
