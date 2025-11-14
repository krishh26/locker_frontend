import type { ChipProps } from '@mui/material/Chip'
import { SamplePlanLearner, SamplePlanLearnerUnit } from 'app/store/api/sample-plan-api'

export type AssessmentMethod = {
  code: string
  title: string
}

export type PlanSummary = {
  planId?: string
  courseName?: string
}

export type SelectedLearnerForUnits = {
  learner: SamplePlanLearner
  learnerIndex: number
}

export type SelectedUnit = {
  unit: SamplePlanLearnerUnit
  learner: SamplePlanLearner
}

export type SampleQuestion = {
  id: string
  question: string
  answer: 'Yes' | 'No' | ''
}

export type ModalFormData = {
  qaName: string
  plannedDate: string
  assessmentMethods: string[]
  assessmentProcesses: string
  feedback: string
  type: string
  completedDate: string
  sampleType: string
  iqaConclusion: string[]
  assessorDecisionCorrect: string
}

export type RiskChipColor = ChipProps['color']

