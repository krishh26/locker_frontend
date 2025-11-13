import type { ChipProps } from '@mui/material/Chip'
import type { SamplePlanLearnerUnit } from 'app/store/api/sample-plan-api'

export const sanitizeText = (value?: string | null) => {
  if (value === null || value === undefined) {
    return '-'
  }
  const trimmed = String(value).trim()
  return trimmed.length ? trimmed : '-'
}

export const formatDisplayDate = (value?: string | null) => {
  if (!value) {
    return '-'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const getRiskChipColor = (riskLevel?: string): ChipProps['color'] => {
  if (!riskLevel) {
    return 'default'
  }
  const normalized = riskLevel.toLowerCase()
  if (normalized.includes('high')) {
    return 'error'
  }
  if (normalized.includes('medium')) {
    return 'warning'
  }
  if (normalized.includes('low')) {
    return 'success'
  }
  if (normalized.includes('not') || normalized.includes('unset')) {
    return 'default'
  }
  return 'info'
}

export const countSelectedUnits = (units?: SamplePlanLearnerUnit[]) => {
  if (!Array.isArray(units)) {
    return 0
  }
  return units.filter((unit) => unit?.is_selected).length
}

