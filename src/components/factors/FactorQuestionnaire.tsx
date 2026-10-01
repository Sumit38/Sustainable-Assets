'use client'

import React, { useState } from 'react'
import { Card, CardBody, CardHeader } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { CheckCircle, HelpCircle } from 'lucide-react'
import {
  getMissingDataDescription,
  calculateFactorFromResponse,
} from '@/lib/data/impactFactorQuestions'

interface FactorQuestionnaireProps {
  missingFields: string[]
  onComplete: (answers: Record<string, number>) => void
  onSkip: () => void
}

export function FactorQuestionnaire({
  missingFields,
  onComplete,
  onSkip,
}: FactorQuestionnaireProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const { questions } = getMissingDataDescription(missingFields)

  if (questions.length === 0) {
    return null
  }

  const currentQuestion = questions[currentQuestionIndex]
  // Progress based on answered questions, not viewed questions
  const answeredCount = Object.keys(answers).length
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0

  const handleAnswer = (value: number) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.fieldName]: value,
    }
    setAnswers(newAnswers)

    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      onComplete(newAnswers)
    }
  }

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      onSkip()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <CardHeader className="bg-primary-50 border-b border-primary-200 flex-shrink-0 overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Help Us Calculate Impact Factors
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                Answer a few questions to get more accurate metrics
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">{progress}%</div>
              <div className="text-xs text-neutral-500">
                {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardHeader>

        <CardBody className="space-y-6 py-8 overflow-y-auto flex-1">
          {/* Question */}
          <div>
            <div className="flex items-start gap-3 mb-2">
              <HelpCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-neutral-900">{currentQuestion.question}</h4>
                <p className="text-sm text-neutral-600 mt-1">
                  {currentQuestion.description}
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option.value)}
                className="w-full p-4 text-left border-2 border-neutral-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-neutral-900 group-hover:text-primary-600">
                      {option.label}
                    </p>
                    {option.description && (
                      <p className="text-xs text-neutral-600 mt-1">{option.description}</p>
                    )}
                  </div>
                  <div className="w-5 h-5 border-2 border-neutral-300 rounded-full flex-shrink-0 group-hover:border-primary-400 group-hover:bg-primary-100" />
                </div>
              </button>
            ))}
          </div>

          {/* Info box */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-xs text-primary-900">
              <strong>💡 Tip:</strong> Your answers will help us calculate more accurate impact
              factors for your assets. You can always update this data later.
            </p>
          </div>
        </CardBody>

        {/* Sticky Buttons Footer */}
        <div className="border-t border-neutral-200 bg-white p-4 flex gap-3 flex-shrink-0 pointer-events-auto">
          {currentQuestionIndex < questions.length - 1 ? (
            <>
              <Button variant="secondary" onClick={handleSkip} className="flex-1">
                Skip This Question
              </Button>
              <Button variant="secondary" onClick={onSkip} className="flex-1">
                Skip All
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  // For last question, clicking this just skips without answering
                  onSkip()
                }}
                className="flex-1"
              >
                Skip All
              </Button>
              <Button
                variant="primary"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onComplete(answers)
                }}
                className="flex-1 cursor-pointer"
                type="button"
              >
                Complete Survey
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

/**
 * Summary Card - Show data sources for calculated factors
 */
interface FactorSourceSummaryProps {
  factors: Array<{
    label: string
    value: number
    source: 'actual' | 'calculated' | 'estimated'
    unit: string
  }>
}

export function FactorSourceSummary({ factors }: FactorSourceSummaryProps) {
  const sourceLabels = {
    actual: { label: '✅ Actual Data', color: 'bg-success-50 border-success-200 text-success-700' },
    calculated: { label: '⚙️ From Your Answers', color: 'bg-primary-50 border-primary-200 text-primary-700' },
    estimated: { label: '📊 Industry Standard', color: 'bg-warning-50 border-warning-200 text-warning-700' },
  }

  return (
    <Card>
      <CardHeader>
        <h4 className="font-semibold text-neutral-900">Impact Factor Sources</h4>
      </CardHeader>
      <CardBody>
        <div className="space-y-2">
          {factors.map((factor, idx) => {
            const sourceInfo = sourceLabels[factor.source]
            return (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{factor.label}</p>
                  <p className={`text-xs mt-1 px-2 py-1 rounded border w-fit ${sourceInfo.color}`}>
                    {sourceInfo.label}
                  </p>
                </div>
                <p className="text-lg font-bold text-neutral-900">
                  {factor.value.toFixed(2)} {factor.unit}
                </p>
              </div>
            )
          })}
        </div>
      </CardBody>
    </Card>
  )
}
