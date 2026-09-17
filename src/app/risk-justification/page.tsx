'use client'

import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { Plus, FileText, BarChart3, CheckCircle } from 'lucide-react'

interface RiskJustification {
  id: string
  complianceStandard: string
  violationDescription: string
  businessJustification: string
  remediationPlan: string
  targetDate: string
  owner: string
  currentMitigation: string
  riskImpact: string
  status: 'approved' | 'pending' | 'rejected'
  createdDate: string
  approvedBy?: string
  companyId: string
}

const COMPLIANCE_STANDARDS = [
  'GDPR (Data Protection - EU)',
  'HIPAA (Healthcare - US)',
  'ISO 27001 (Information Security - Global)',
  'PCI DSS (Payment Card Security)',
  'SOC 2 (Service Organization Control)',
  'NIST Cybersecurity Framework',
  'EPA Environmental Compliance',
  'OSHA Worker Safety',
  'RoHS (Restricted Hazardous Substances)',
]

const BUSINESS_JUSTIFICATION_OPTIONS = {
  'GDPR (Data Protection - EU)': [
    'Legacy system requires data migration - 6 months planned',
    'Third-party vendor dependency - negotiating compliance',
    'Resource constraint - hiring compliance team',
    'Technical debt remediation in progress',
    'Business continuity priority over immediate compliance',
  ],
  'HIPAA (Healthcare - US)': [
    'Infrastructure upgrade underway - phased approach',
    'Staff training program in progress',
    'Vendor compliance certification pending',
    'Architectural redesign for security controls',
    'Awaiting regulatory guidance on specific requirement',
  ],
  'ISO 27001 (Information Security - Global)': [
    'Formal audit scheduled - remediation plan prepared',
    'Policy framework being implemented',
    'Access control system migration in progress',
    'Incident response procedures under development',
    'Risk assessment ongoing - targeted remediation',
  ],
  'PCI DSS (Payment Card Security)': [
    'Payment processor transition - new system deploying',
    'Network segmentation in progress',
    'Encryption standards implementation underway',
    'Vendor compliance verification process',
    'Audit findings - remediation timeline established',
  ],
  'SOC 2 (Service Organization Control)': [
    'Control documentation being completed',
    'Security monitoring system implementation',
    'Access management policy deployment',
    'Data retention procedures under review',
    'Audit preparation - control testing in progress',
  ],
  'NIST Cybersecurity Framework': [
    'Framework adoption - phased implementation',
    'Risk assessment underway',
    'Control mapping against NIST categories',
    'Training program for staff',
    'Budget allocation pending - roadmap prepared',
  ],
  'EPA Environmental Compliance': [
    'Waste management system upgrade planned',
    'Emissions testing - remediation scheduled',
    'Documentation system implementation',
    'Compliance timeline - regulatory extension requested',
    'Alternative disposal method evaluation',
  ],
  'OSHA Worker Safety': [
    'Safety equipment being procured',
    'Training program in development',
    'Hazard assessment - controls being implemented',
    'Facility inspection - remediation underway',
    'Safety protocol rollout - phased approach',
  ],
  'RoHS (Restricted Hazardous Substances)': [
    'Component replacement - supply chain coordination',
    'Product redesign - compliance testing phase',
    'Vendor certification - compliance confirmation pending',
    'Inventory phase-out - timeline established',
    'Alternative materials evaluation completed',
  ],
}

const RISK_IMPACT_OPTIONS = [
  'Critical - Operations at risk, immediate action required',
  'High - Significant business impact within 90 days',
  'Medium - Business impact within 6-12 months',
  'Low - Minor impact, can be managed long-term',
  'Regulatory fine exposure - $100K-$1M range',
  'Regulatory fine exposure - $1M-$10M range',
  'Regulatory fine exposure - $10M+ range',
  'Legal liability - potential lawsuits',
  'Operational shutdown risk',
  'Market ban or export restrictions',
]

const MITIGATION_OPTIONS = [
  'Compensating controls in place - monitoring active',
  'Temporary security measures implemented',
  'Risk accepted by executive management',
  'Third-party oversight - consultant monitoring',
  'Insurance coverage - risk transfer',
  'Enhanced monitoring and alerting',
  'Restricted access - access controls tightened',
  'Segmentation - isolated from critical systems',
  'Backup procedures - redundancy established',
  'No mitigation - risk acknowledged',
]

export default function RiskJustificationPage() {
  const [justifications, setJustifications] = useState<RiskJustification[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    complianceStandard: '',
    violationDescription: '',
    businessJustification: '',
    remediationPlan: '',
    targetDate: '',
    owner: '',
    currentMitigation: '',
    riskImpact: '',
  })

  const handleSubmit = () => {
    if (!formData.complianceStandard || !formData.businessJustification) {
      alert('Please fill in all required fields')
      return
    }

    const newJustification: RiskJustification = {
      id: Date.now().toString(),
      ...formData,
      status: 'pending',
      createdDate: new Date().toISOString(),
      companyId: 'current-company',
    }

    setJustifications([newJustification, ...justifications])
    setFormData({
      complianceStandard: '',
      violationDescription: '',
      businessJustification: '',
      remediationPlan: '',
      targetDate: '',
      owner: '',
      currentMitigation: '',
      riskImpact: '',
    })
    setShowForm(false)
  }

  const mitigation = formData.complianceStandard
    ? BUSINESS_JUSTIFICATION_OPTIONS[formData.complianceStandard as keyof typeof BUSINESS_JUSTIFICATION_OPTIONS] || []
    : []

  return (
    <div className="w-full">
      <PageHeader
        title="Risk Justification & Compliance Q&A"
        description="Document and justify compliance violations with structured answers based on global compliance policies"
        homeHref="/"
      />

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Justifications</p>
                  <p className="text-3xl font-bold text-neutral-900">{justifications.length}</p>
                </div>
                <FileText className="w-8 h-8 text-primary-600 opacity-20" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Pending Approval</p>
                  <p className="text-3xl font-bold text-warning-600">{justifications.filter(j => j.status === 'pending').length}</p>
                </div>
                <FileText className="w-8 h-8 text-warning-600 opacity-20" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Approved</p>
                  <p className="text-3xl font-bold text-success-600">{justifications.filter(j => j.status === 'approved').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success-600 opacity-20" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Available for Benchmark</p>
                  <p className="text-3xl font-bold text-primary-600">{justifications.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary-600 opacity-20" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Add New Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Compliance Justifications</h2>
          <Button
            variant="primary"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Justification
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="border-2 border-primary-300 bg-primary-50">
            <CardHeader>
              <h3 className="text-lg font-semibold">Add Risk Justification</h3>
              <p className="text-sm text-neutral-600 mt-1">
                Provide structured answers based on global compliance policies
              </p>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* Compliance Standard */}
              <div>
                <label className="label">Compliance Standard *</label>
                <select
                  className="input"
                  value={formData.complianceStandard}
                  onChange={(e) =>
                    setFormData({ ...formData, complianceStandard: e.target.value, businessJustification: '' })
                  }
                >
                  <option value="">Select compliance standard...</option>
                  {COMPLIANCE_STANDARDS.map((standard) => (
                    <option key={standard} value={standard}>
                      {standard}
                    </option>
                  ))}
                </select>
              </div>

              {/* Violation Description */}
              <div>
                <label className="label">Violation Description</label>
                <textarea
                  className="input min-h-24"
                  placeholder="Describe the specific compliance violation..."
                  value={formData.violationDescription}
                  onChange={(e) => setFormData({ ...formData, violationDescription: e.target.value })}
                />
              </div>

              {/* Business Justification - Predefined */}
              {formData.complianceStandard && (
                <div>
                  <label className="label">Business Justification * (Select from policy-based options)</label>
                  <select
                    className="input"
                    value={formData.businessJustification}
                    onChange={(e) => setFormData({ ...formData, businessJustification: e.target.value })}
                  >
                    <option value="">Select justification...</option>
                    {mitigation.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-neutral-600 mt-2">
                    ✓ These options are based on global compliance best practices
                  </p>
                </div>
              )}

              {/* Risk Impact */}
              <div>
                <label className="label">Risk Impact if Not Remediated</label>
                <select
                  className="input"
                  value={formData.riskImpact}
                  onChange={(e) => setFormData({ ...formData, riskImpact: e.target.value })}
                >
                  <option value="">Select risk impact...</option>
                  {RISK_IMPACT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Mitigation */}
              <div>
                <label className="label">Current Mitigation/Compensating Controls</label>
                <select
                  className="input"
                  value={formData.currentMitigation}
                  onChange={(e) => setFormData({ ...formData, currentMitigation: e.target.value })}
                >
                  <option value="">Select mitigation...</option>
                  {MITIGATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Remediation Plan */}
              <div>
                <label className="label">Remediation Plan</label>
                <textarea
                  className="input min-h-20"
                  placeholder="Describe the specific steps to remediate this violation..."
                  value={formData.remediationPlan}
                  onChange={(e) => setFormData({ ...formData, remediationPlan: e.target.value })}
                />
              </div>

              {/* Target Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Target Remediation Date</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  />
                </div>

                {/* Owner */}
                <div>
                  <label className="label">Responsible Owner/Department</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Security Team, Compliance Officer"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button variant="primary" onClick={handleSubmit} className="flex-1">
                  Save Justification
                </Button>
                <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Justifications List */}
        <div className="space-y-4">
          {justifications.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600">No justifications documented yet</p>
                <p className="text-sm text-neutral-500 mt-2">Create your first risk justification to get started</p>
              </CardBody>
            </Card>
          ) : (
            justifications.map((justification) => (
              <Card key={justification.id} className="border-l-4 border-l-primary-500">
                <CardHeader className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{justification.complianceStandard}</h3>
                      <Badge
                        variant={
                          justification.status === 'approved'
                            ? 'success'
                            : justification.status === 'pending'
                              ? 'warning'
                              : 'danger'
                        }
                      >
                        {justification.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-600">{justification.violationDescription}</p>
                  </div>
                  <span className="text-xs text-neutral-500">
                    {new Date(justification.createdDate).toLocaleDateString()}
                  </span>
                </CardHeader>
                <CardBody className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-neutral-600 uppercase">Business Justification</p>
                      <p className="text-sm text-neutral-900 mt-1">{justification.businessJustification}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-600 uppercase">Risk Impact</p>
                      <p className="text-sm text-danger-700 mt-1">{justification.riskImpact}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-neutral-600 uppercase">Current Mitigation</p>
                      <p className="text-sm text-neutral-900 mt-1">{justification.currentMitigation}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-600 uppercase">Remediation Target</p>
                      <p className="text-sm text-success-700 mt-1">{justification.targetDate || 'Not specified'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-neutral-600 uppercase">Remediation Plan</p>
                    <p className="text-sm text-neutral-900 mt-1">{justification.remediationPlan}</p>
                  </div>

                  <div className="pt-3 border-t border-neutral-200">
                    <p className="text-xs text-neutral-600">
                      <span className="font-semibold">Owner:</span> {justification.owner}
                    </p>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>

        {/* Comparison Section */}
        {justifications.length > 0 && (
          <Card className="bg-success-50 border-2 border-success-200">
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-success-600" />
                Available for Company Benchmarking
              </h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-neutral-700 mb-4">
                These {justifications.length} documented justifications can be used to:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-success-600 font-bold">✓</span>
                  <span>Compare compliance posture with peer companies in your industry</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success-600 font-bold">✓</span>
                  <span>Identify common compliance challenges and best practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success-600 font-bold">✓</span>
                  <span>Benchmark remediation timelines against industry standards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success-600 font-bold">✓</span>
                  <span>Create audit trail for regulatory inspections</span>
                </li>
              </ul>
              <Button variant="secondary" className="mt-4 w-full md:w-auto">
                Prepare for Benchmark Comparison
              </Button>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}
