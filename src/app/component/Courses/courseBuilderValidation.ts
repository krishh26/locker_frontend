/**
 * courseBuilderValidation.ts
 *
 * Yup validation schemas for CourseBuilder forms
 * Matches fields in CourseDetailsForm.tsx
 */

import * as yup from 'yup'
import { CourseCoreType } from '../../store/courseBuilderSlice'

// Base validation schema for all course types (common fields)
const baseCourseSchema = yup.object().shape({
  // Required fields for all course types
  course_name: yup.string().required('Course name is required'),

  course_code: yup.string().required('Course code is required'),

  level: yup.string().required('Course level is required'),

  guided_learning_hours: yup
    .string()
    .optional()
    .test(
      'is-valid-number-or-empty',
      'Guided learning hours must be a valid number',
      (value) => {
        if (!value || value.trim() === '') return true // Optional field
        const num = Number(value)
        return !isNaN(num) && num > 0
      }
    ),

  // Optional fields for all course types
  operational_start_date: yup.string().optional(),

  sector: yup.string().optional(),

  recommended_minimum_age: yup
    .string()
    .optional()
    .test(
      'is-number-or-empty',
      'Recommended minimum age must be a valid number',
      (value) => {
        if (!value || value === '') return true // Optional field
        const num = Number(value)
        return !isNaN(num) && num > 0
      }
    ),

  overall_grading_type: yup.string().optional(),

  // Default values (not in form but needed for API)
  active: yup.string().default('Yes'),
  included_in_off_the_job: yup.string().default('Yes'),
  awarding_body: yup.string().default('No Awarding Body'),
  permitted_delivery_types: yup.string().optional(),
  professional_certification: yup.string().optional(),
  two_page_standard_link: yup.string().optional(),
  assessment_plan_link: yup.string().optional(),
  assigned_gateway_id: yup.number().nullable().optional(),
  assigned_gateway_name: yup.string().optional(),
  questions: yup.array().optional(),
  assigned_standards: yup.array().optional(),
})

// Qualification-specific validation
const qualificationSchema = baseCourseSchema.shape({
  course_core_type: yup.string().oneOf(['Qualification']).required(),
  course_type: yup.string().required('Course type is required'),
  brand_guidelines: yup.string().required('Course guidance is required'),
  // Optional fields for Qualification
  total_credits: yup
    .string()
    .optional()
    .test(
      'is-number-or-empty',
      'Total credits must be a valid number',
      (value) => {
        if (!value || value === '') return true // Optional field
        const num = Number(value)
        return !isNaN(num) && num >= 0
      }
    ),
  awarding_body: yup.string().optional(),
  // Fields not in form but may be needed
  qualification_type: yup.string().optional(),
  qualification_status: yup.string().optional(),
  duration_period: yup.string().optional(),
  duration_value: yup.string().optional(),
})

// Standard-specific validation
const standardSchema = baseCourseSchema.shape({
  course_core_type: yup.string().oneOf(['Standard']).required(),
  // Required fields for Standard
  duration_period: yup.string().required('Duration period is required'),
  duration_value: yup.string().optional(),
  // Optional fields for Standard
  two_page_standard_link: yup.string().url('Must be a valid URL').optional(),
  assessment_plan_link: yup.string().url('Must be a valid URL').optional(),
  assigned_gateway_id: yup.number().nullable().optional(),
})

// Gateway-specific validation (no course_type field)
const gatewaySchema = baseCourseSchema.shape({
  course_core_type: yup.string().oneOf(['Gateway']).required(),
  // Gateway doesn't have course_type field
  course_type: yup.string().optional(),
})

// Dynamic schema based on course type
export const getCourseValidationSchema = (courseType: CourseCoreType) => {
  switch (courseType) {
    case 'Qualification':
      return qualificationSchema
    case 'Standard':
      return standardSchema
    case 'Gateway':
      return gatewaySchema
    default:
      return baseCourseSchema
  }
}

// Export individual schemas for flexibility
export { baseCourseSchema, qualificationSchema, standardSchema, gatewaySchema }
