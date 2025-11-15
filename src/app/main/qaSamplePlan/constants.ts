import type { AssessmentMethod, SampleType } from './types'

export const assessmentMethods: AssessmentMethod[] = [
  { code: 'WO', title: 'Workplace Observation', assessmentMethodId: 'WO' },
  { code: 'WP', title: 'Workplace Projects/Projects away from Work', assessmentMethodId: 'WP' },
  { code: 'PW', title: 'Portfolio of Work', assessmentMethodId: 'PW' },
  { code: 'VI', title: 'Viva', assessmentMethodId: 'VI' },
  { code: 'LB', title: 'Log Book/Assignments', assessmentMethodId: 'LB' },
  { code: 'PD', title: 'Professional Discussions', assessmentMethodId: 'PD' },
  { code: 'PT', title: 'Practical Test', assessmentMethodId: 'PT' },
  { code: 'TE', title: 'Tests/Examinations', assessmentMethodId: 'TE' },
  { code: 'RJ', title: 'Reflective Journal', assessmentMethodId: 'RJ' },
  { code: 'OT', title: 'Other', assessmentMethodId: 'OT' },
  { code: 'RPL', title: 'Recognised Prior Learning', assessmentMethodId: 'RPL' },
]

// Get all assessment method codes for display and selection
export const assessmentMethodCodes = assessmentMethods.map((method) => method.code)

// Get all assessment method IDs for payload
export const assessmentMethodCodesForPayload = assessmentMethods
  .map((method) => method.assessmentMethodId || method.code)
  .filter((id) => id) as string[]

// Get assessment method by code
export const getAssessmentMethodByCode = (code: string): AssessmentMethod | undefined => {
  return assessmentMethods.find((method) => method.code === code)
}

// Get assessment method by assessment method ID
export const getAssessmentMethodById = (id: string): AssessmentMethod | undefined => {
  return assessmentMethods.find(
    (method) => method.assessmentMethodId === id || method.code === id
  )
}

export const qaStatuses = ['All', 'QA Approved']

export const sampleTypes: SampleType[] = [
  { value: 'Portfolio', label: 'Sample Portfolio'},
  { value: 'ObserveAssessor', label: 'Observe Assessor'},
  { value: 'LearnerInterview', label: 'Learner Interview' },
  { value: 'EmployerInterview', label: 'Employer Interview' },
  { value: 'Final', label: 'Final Check' },
]

export const modalSampleTypes = [
  'Learner interview',
  'Observation',
  'Portfolio review',
  'Assessment review',
]


export const iqaConclusionOptions = [
  'Valid',
  'Authentic',
  'Sufficient',
  'Relevant',
  'Current',
]

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return dateString
  }
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Convert ISO date string to YYYY-MM-DD format for date input
export const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) {
      return ''
    }
    // Format as YYYY-MM-DD
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}

// Tab colors - alternating between primary and pink
export const getTabColor = (index: number) => {
  return index % 2 === 0 ? 'primary.main' : '#e91e63'
}