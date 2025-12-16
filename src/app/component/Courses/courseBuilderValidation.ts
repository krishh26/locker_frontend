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
  active: yup.boolean().default(true),
  included_in_off_the_job: yup.boolean().default(true),
  awarding_body: yup.string().default('No Awarding Body'),
  permitted_delivery_types: yup.string().optional(),
  professional_certification: yup.string().optional(),
  two_page_standard_link: yup.string().optional(),
  assessment_plan_link: yup.string().optional(),
  assigned_gateway_id: yup.number().nullable().optional(),
  assigned_gateway_name: yup.string().optional(),
  questions: yup.array().optional(),
  assigned_standards: yup.array().optional(),
  // Units validation is defined in Qualification and Standard schemas only
})

// Base qualification schema without units (for step 0)
const qualificationSchemaBase = baseCourseSchema.shape({
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
})

// Units validation schema for Qualification (only used in step 1)
const qualificationUnitsSchema = yup.object().shape({
  id: yup.mixed().optional(),
  unit_ref: yup.string().required('Unit Ref is required'),
  title: yup.string().required('Unit Title is required'),
  description: yup.string().optional(),
  mandatory: yup.boolean().optional(),
  level: yup.mixed().nullable().optional(),
  glh: yup.number().nullable().optional(),
  credit_value: yup.number().nullable().optional(),
  learning_outcomes: yup.array().optional(),
  // SubUnit (Assessment Criteria) validation for Qualification units
  subUnit: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.mixed().optional(),
        title: yup.string().required('Assessment Criteria Title is required'),
        type: yup
          .string()
          .oneOf(['to-do', 'to-know', 'req'])
          .default('to-do'),
        code: yup.string().optional(),
        showOrder: yup.number().optional(),
        timesMet: yup.number().optional(),
        // Topics validation for Qualification SubUnits
        topics: yup
          .array()
          .of(
            yup.object().shape({
              id: yup.string().optional(),
              title: yup.string().required('Topic Title is required'),
              type: yup.string().optional(),
              showOrder: yup.number().optional(),
              code: yup.string().optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
})

// Qualification-specific validation
const qualificationSchema = qualificationSchemaBase.shape({
  // Units validation for Qualification - validate each unit (only in step 1)
  units: yup
    .array()
    .of(qualificationUnitsSchema)
    .optional(),
})

// Base standard schema without units (for step 0)
const standardSchemaBase = baseCourseSchema.shape({
  course_core_type: yup.string().oneOf(['Standard']).required(),
  duration_period: yup.string().required('Duration period is required'),
  // Optional fields for Standard
  duration_value: yup.number().nullable().optional(),
  two_page_standard_link: yup.string().url('Must be a valid URL').optional(),
  assessment_plan_link: yup.string().url('Must be a valid URL').optional(),
  assigned_gateway_id: yup.number().nullable().optional(),
})

// Units validation schema for Standard (only used in step 1)
const standardUnitsSchema = yup.object().shape({
  id: yup.mixed().optional(),
  type: yup
    .string()
    .oneOf(['Knowledge', 'Behaviour', 'Skills', 'Duty'])
    .default('Knowledge')
    .required('Type is required'),
  code: yup.string().default('K1').required('Code is required'),
  title: yup.string().required('Title is required'),
  description: yup.string().optional(),
  // SubUnit (Assessment Criteria) validation for Standard units - required for Duty type
  subUnit: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.mixed().optional(),
        title: yup.string().required('Topic Title is required'),
        type: yup
          .string()
          .oneOf(['Behaviour', 'Knowledge', 'Skills'])
          .default('Knowledge')
          .required('Type is required'),
        code: yup.string().default('K1').required('Code is required'),
        description: yup.string().optional(),
      })
    )
    .test(
      'duty-requires-subunit',
      'At least one Assessment Criteria is required when Type is Duty',
      function (value) {
        const parent = this.parent
        if (parent?.type === 'Duty') {
          return Array.isArray(value) && value.length > 0
        }
        return true // Optional for other types
      }
    )
    .optional(),
})

// Standard-specific validation
const standardSchema = standardSchemaBase.shape({
  // Units validation for Standard - validate each unit (only in step 1)
  units: yup
    .array()
    .of(standardUnitsSchema)
    .optional(),
})

// Gateway-specific validation (no course_type field)
const gatewaySchema = baseCourseSchema.shape({
  course_core_type: yup.string().oneOf(['Gateway']).required(),
  // Gateway doesn't have course_type field
  course_type: yup.string().optional(),
  // Gateway requires course_name and course_code (inherited from baseCourseSchema)
  // Gateway doesn't require level field
  level: yup.string().optional(),
  // Gateway requires active field (inherited from baseCourseSchema as boolean)
  // Questions validation for Gateway
  questions: yup
    .array()
    .min(1, 'At least one question is required')
    .of(
      yup.object().shape({
        id: yup.mixed().optional(),
        question: yup.string().required('Question is required'),
        evidenceRequired: yup.boolean().optional(),
        isDropdown: yup.boolean().default(true),
        dropdownOptions: yup
          .string()
          .test(
            'dropdown-options-required',
            'Dropdown options are required when dropdown is enabled',
            function (value) {
              const isDropdown = this.parent.isDropdown
              if (isDropdown === true) {
                return !!value && value.trim() !== ''
              }
              return true
            }
          ),
      })
    )
    .min(1, 'At least one question is required'),
  // Assigned standards validation for Gateway - at least one required
  assigned_standards: yup
    .array()
    .min(1, 'At least one standard course must be assigned')
    .required('At least one standard course must be assigned'),
})

// Dynamic schema based on course type and active step
export const getCourseValidationSchema = (courseType: CourseCoreType, activeStep: number = 0) => {
  // Only validate units when activeStep is 1
  const shouldValidateUnits = activeStep === 1

  switch (courseType) {
    case 'Qualification':
      if (shouldValidateUnits) {
        return qualificationSchema
      }
      return qualificationSchemaBase
    case 'Standard':
      if (shouldValidateUnits) {
        return standardSchema
      }
      return standardSchemaBase
    case 'Gateway':
      return gatewaySchema
    default:
      return baseCourseSchema
  }
}

// Export individual schemas for flexibility
export { 
  baseCourseSchema, 
  qualificationSchema, 
  qualificationSchemaBase,
  standardSchema, 
  standardSchemaBase,
  gatewaySchema 
}
