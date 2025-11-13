import type { AssessmentMethod } from './types'

export const assessmentMethods: AssessmentMethod[] = [
  { code: 'DO', title: 'Direct Observation' },
  { code: 'WT', title: 'Witness Testimony' },
  { code: 'PE', title: 'Product Evidence' },
  { code: 'QA', title: 'Questioning and Answers' },
  { code: 'PS', title: 'Personal Statement' },
]

export const additionalAssessmentMethodCodes = [
  'PD',
  'OT',
  'RA',
  'ET',
  'DI',
  'SI',
  'APL_RPL',
]

export const assessmentMethodCodesForPayload = Array.from(
  new Set([
    ...assessmentMethods.map((method) => method.code),
    ...additionalAssessmentMethodCodes,
  ])
)

export const qaStatuses = ['All', 'QA Approved']

export const sampleTypes = [
  'Planned Sample',
  'Random Sample',
  'Targeted Sample',
  'Learner Risk Sample',
]

export const modalSampleTypes = [
  'Learner interview',
  'Observation',
  'Portfolio review',
  'Assessment review',
]

export const assessmentMethodCodes = [
  'WO',
  'WP',
  'PW',
  'VI',
  'LB',
  'PD',
  'PT',
  'TE',
  'RJ',
  'OT',
  'RPL',
]

export const iqaConclusionOptions = [
  'Valid',
  'Authentic',
  'Sufficient',
  'Relevant',
  'Current',
]

