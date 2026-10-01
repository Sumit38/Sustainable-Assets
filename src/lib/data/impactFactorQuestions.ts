/**
 * Impact Factor Questions & Fallback Calculator
 *
 * When users don't provide specific factor data in the template,
 * these questions help calculate reasonable values dynamically.
 *
 * This allows flexibility: users can provide full data, partial data,
 * or answer Q&A to let the system calculate factors intelligently.
 */

export interface FactorQuestion {
  id: string
  question: string
  description: string
  fieldName: string
  unit: string
  options: Array<{
    label: string
    value: number
    description?: string
  }>
}

export interface FactorQuestionnaireResponse {
  assetId: string
  answers: Record<string, number>
  confidenceLevel: 'actual' | 'calculated' | 'estimated'
}

/**
 * HEALTH IMPACT FACTOR QUESTIONS
 * Used when user doesn't provide "Employees Affected" or "Health Issues/Year"
 */
export const HEALTH_IMPACT_QUESTIONS: FactorQuestion[] = [
  {
    id: 'employees_affected',
    question: 'How many employees use this asset daily?',
    description: 'Estimate the number of people whose work depends on this asset',
    fieldName: 'employeesAffected',
    unit: 'people',
    options: [
      { label: '1-2 employees', value: 1.5, description: 'Personal/individual use' },
      { label: '3-5 employees', value: 3.5, description: 'Small team use' },
      { label: '6-10 employees', value: 7, description: 'Medium team use' },
      { label: '11-20 employees', value: 15, description: 'Department use' },
      { label: '20+ employees', value: 30, description: 'Shared/multi-team resource' },
    ],
  },
  {
    id: 'health_issues_year',
    question: 'How many health-related incidents occur annually due to poor asset condition?',
    description: 'E.g., ergonomic injuries from old chairs, eye strain from old monitors',
    fieldName: 'healthIssuesPerYear',
    unit: 'incidents/year',
    options: [
      { label: 'None (0)', value: 0, description: 'Asset is in good condition' },
      { label: 'Minimal (1-2)', value: 1.5, description: 'Occasional minor issues' },
      { label: 'Moderate (3-5)', value: 4, description: 'Regular issues reported' },
      { label: 'High (6-10)', value: 8, description: 'Frequent health complaints' },
      { label: 'Critical (10+)', value: 15, description: 'Major health impact' },
    ],
  },
]

/**
 * COST FACTOR QUESTIONS
 * Used when user doesn't provide cost-related data
 */
export const COST_FACTOR_QUESTIONS: FactorQuestion[] = [
  {
    id: 'annual_maintenance_cost',
    question: 'What is your typical annual maintenance/repair cost for this asset?',
    description: 'Include repairs, parts replacement, and preventive maintenance',
    fieldName: 'annualMaintenanceCost',
    unit: 'USD',
    options: [
      { label: 'Minimal (<$50/year)', value: 25, description: 'Rarely needs maintenance' },
      { label: 'Low ($50-150/year)', value: 100, description: 'Occasional maintenance' },
      { label: 'Moderate ($150-300/year)', value: 225, description: 'Regular maintenance needed' },
      { label: 'High ($300-500/year)', value: 400, description: 'Frequent repairs' },
      { label: 'Very High ($500+/year)', value: 750, description: 'Constant maintenance required' },
    ],
  },
  {
    id: 'downtime_hours',
    question: 'How many hours does it typically take to repair/replace this asset?',
    description: 'Time until asset is back in service',
    fieldName: 'downtimeHoursPerFailure',
    unit: 'hours',
    options: [
      { label: 'Quick (< 1 hour)', value: 0.5, description: 'Easy fix or quick replacement' },
      { label: 'Short (1-2 hours)', value: 1.5, description: 'Moderate complexity' },
      { label: 'Medium (2-4 hours)', value: 3, description: 'Moderate-high complexity' },
      { label: 'Long (4-8 hours)', value: 6, description: 'Complex repair/replacement' },
      { label: 'Extended (8+ hours)', value: 16, description: 'Very complex, may need specialist' },
    ],
  },
  {
    id: 'downtime_cost_per_hour',
    question: 'What is the productivity cost per hour when this asset is down?',
    description: 'Lost productivity, delayed work, or operational impact per hour',
    fieldName: 'downtimeCostPerHour',
    unit: 'USD/hour',
    options: [
      { label: 'Low ($25-50/hr)', value: 37, description: 'Minor productivity loss' },
      { label: 'Moderate ($50-150/hr)', value: 100, description: 'Noticeable impact' },
      { label: 'High ($150-300/hr)', value: 225, description: 'Significant disruption' },
      { label: 'Critical ($300-500/hr)', value: 400, description: 'Major business impact' },
      { label: 'Severe ($500+/hr)', value: 750, description: 'Operations halt' },
    ],
  },
  {
    id: 'replacement_cost',
    question: 'What is the typical replacement cost for this asset?',
    description: 'Cost to purchase a new unit of similar quality',
    fieldName: 'replacementCost',
    unit: 'USD',
    options: [
      { label: 'Budget (<$200)', value: 150, description: 'Budget option' },
      { label: 'Standard ($200-500)', value: 350, description: 'Standard quality' },
      { label: 'Good ($500-1000)', value: 750, description: 'Good quality' },
      { label: 'Premium ($1000-2000)', value: 1500, description: 'Premium option' },
      { label: 'Enterprise ($2000+)', value: 3000, description: 'High-end/specialized' },
    ],
  },
]

/**
 * CARBON FACTOR QUESTIONS
 * Used when user doesn't provide carbon/environmental data
 */
export const CARBON_FACTOR_QUESTIONS: FactorQuestion[] = [
  {
    id: 'annual_co2e',
    question: 'What is the estimated annual CO2e footprint for this asset?',
    description: 'Based on energy use, manufacturing, and end-of-life',
    fieldName: 'annualCO2e',
    unit: 'tonnes CO2e/year',
    options: [
      { label: 'Very Low (<0.05 tonnes)', value: 0.025, description: 'Minimal environmental impact' },
      { label: 'Low (0.05-0.1 tonnes)', value: 0.075, description: 'Low impact' },
      { label: 'Moderate (0.1-0.2 tonnes)', value: 0.15, description: 'Moderate impact' },
      { label: 'High (0.2-0.5 tonnes)', value: 0.35, description: 'Significant impact' },
      { label: 'Very High (0.5+ tonnes)', value: 0.75, description: 'Major environmental concern' },
    ],
  },
  {
    id: 'has_energy_data',
    question: 'Do you have specific power consumption data?',
    description: 'Allows more accurate carbon calculation',
    fieldName: 'powerWatts',
    unit: 'watts',
    options: [
      { label: 'Yes, I have it', value: 1, description: 'Proceed to enter wattage' },
      { label: 'No, use standard estimate', value: 0, description: 'Use industry average' },
    ],
  },
]

/**
 * Helper function to get all questions for a given category
 */
export function getQuestionsForCategory(
  category: 'health' | 'cost' | 'carbon'
): FactorQuestion[] {
  switch (category) {
    case 'health':
      return HEALTH_IMPACT_QUESTIONS
    case 'cost':
      return COST_FACTOR_QUESTIONS
    case 'carbon':
      return CARBON_FACTOR_QUESTIONS
    default:
      return []
  }
}

/**
 * Helper function to calculate factors from user responses
 */
export function calculateFactorFromResponse(
  questionId: string,
  selectedValue: number
): number {
  const allQuestions = [
    ...HEALTH_IMPACT_QUESTIONS,
    ...COST_FACTOR_QUESTIONS,
    ...CARBON_FACTOR_QUESTIONS,
  ]

  const question = allQuestions.find(q => q.id === questionId)
  if (!question) return 0

  const option = question.options.find(opt => opt.value === selectedValue)
  return option?.value || selectedValue
}

/**
 * Get a user-friendly description of what data is missing
 */
export function getMissingDataDescription(
  missingFields: string[]
): { category: string; questions: FactorQuestion[] } {
  const result = {
    category: 'Health & Cost Factors',
    questions: [] as FactorQuestion[],
  }

  // Check what's missing and group questions
  if (
    missingFields.includes('employeesAffected') ||
    missingFields.includes('healthIssuesPerYear')
  ) {
    result.questions.push(...HEALTH_IMPACT_QUESTIONS)
  }

  if (
    missingFields.includes('annualMaintenanceCost') ||
    missingFields.includes('downtimeHoursPerFailure') ||
    missingFields.includes('downtimeCostPerHour') ||
    missingFields.includes('replacementCost')
  ) {
    result.category = 'Health, Cost & Environmental Factors'
    result.questions.push(...COST_FACTOR_QUESTIONS)
  }

  if (missingFields.includes('annualCO2e')) {
    result.questions.push(...CARBON_FACTOR_QUESTIONS)
  }

  return result
}
