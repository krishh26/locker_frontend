/**
 * Constants for Evidence Library
 * Centralized constants to avoid magic strings throughout the codebase
 */

export const COURSE_TYPES = {
  STANDARD: 'Standard',
  QUALIFICATION: 'Qualification',
  GATEWAY: 'Gateway',
} as const

export type CourseType = typeof COURSE_TYPES[keyof typeof COURSE_TYPES]

export const UNIT_TYPES = {
  KNOWLEDGE: 'Knowledge',
  BEHAVIOUR: 'Behaviour',
  SKILLS: 'Skills',
  DUTY: 'Duty',
} as const

export type UnitType = typeof UNIT_TYPES[keyof typeof UNIT_TYPES]

export const USER_ROLES = {
  LEARNER: 'Learner',
  TRAINER: 'Trainer',
  ADMIN: 'Admin',
  IQA: 'IQA',
  EMPLOYER: 'Employer',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// Combined unit types (for Standard courses)
export const COMBINED_UNIT_TYPES = [
  UNIT_TYPES.KNOWLEDGE,
  UNIT_TYPES.BEHAVIOUR,
  UNIT_TYPES.SKILLS,
] as const

// Roles that can edit declaration
export const ROLES_CAN_EDIT_DECLARATION = [
  USER_ROLES.TRAINER,
  USER_ROLES.ADMIN,
  USER_ROLES.IQA,
] as const

// Roles that can edit trainer fields
export const ROLES_CAN_EDIT_TRAINER_FIELDS = [
  USER_ROLES.TRAINER,
  USER_ROLES.IQA,
] as const

// Roles that redirect to QA sample plan after update
export const ROLES_REDIRECT_TO_QA = [
  USER_ROLES.ADMIN,
  USER_ROLES.IQA,
] as const

