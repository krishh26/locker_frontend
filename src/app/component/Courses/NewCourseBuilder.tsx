/**
 * NewCourseBuilder.tsx
 *
 * New, clean CourseBuilder component using React Hook Form + Yup
 * Minimal, professional implementation
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Chip,
  useTheme,
  Tooltip,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SchoolIcon from '@mui/icons-material/School'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import AssessmentIcon from '@mui/icons-material/Assessment'
import { showMessage } from 'app/store/fuse/messageSlice'
import {
  selectCourseBuilder,
  selectIsSaving,
  setSaving,
  setError,
  CourseFormData,
  CourseCoreType,
  EditMode,
} from 'app/store/courseBuilderSlice'
import { getCourseValidationSchema } from './courseBuilderValidation'
import { useCourseBuilderAPI } from './useCourseBuilderAPI'
import { SecondaryButton } from '../Buttons'
import CourseDetailsForm from './CourseDetailsForm'
import { useNotification } from './useNotification'
import { fetchActiveGatewayCourses } from 'app/store/courseManagement'
import { GatewayCourse } from './courseConstants'
import CourseUnitsModulesStep from './CourseUnitsModulesStep'

interface NewCourseBuilderProps {
  edit?: EditMode
  handleClose?: () => void
}

const STEPS = ['Course Details', 'Units/Modules']

const NewCourseBuilder: React.FC<NewCourseBuilderProps> = ({
  edit = 'create',
  handleClose,
}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const { courseId } = useParams<{ courseId?: string }>()
  const { saveCourse, loadCourse } = useCourseBuilderAPI()
  const { showSuccess, showError, NotificationComponent } = useNotification()

  const { isSaving, course_id } = useSelector(selectCourseBuilder)
  const [gatewayCourses, setGatewayCourses] = useState<GatewayCourse[]>([])
  const [activeStep, setActiveStep] = useState<number>(0)

  const isEdit = course_id || courseId

  // Get course type from location state (passed from navigation)
  const initialCourseType = useMemo(() => {
    const state = location.state as { courseCoreType?: CourseCoreType } | null
    return (state?.courseCoreType || 'Qualification') as CourseCoreType
  }, [location.state])

  // Default form values with initial course type (matching CourseDetailsForm fields)
  const defaultFormValues: CourseFormData = useMemo(
    () => ({
      // Required fields in form
      course_name: '',
      course_code: '',
      level: '',
      brand_guidelines: '',
      guided_learning_hours: '',
      course_core_type: initialCourseType,

      // Optional fields in form
      course_type: initialCourseType !== 'Gateway' ? '' : '', // Only for Qualification/Standard
      operational_start_date: '',
      sector: '',
      recommended_minimum_age: '',
      overall_grading_type: '',

      // Qualification-specific fields
      total_credits: '',
      awarding_body: 'No Awarding Body',

      // Standard-specific fields (not in form yet but may be needed)
      two_page_standard_link: '',
      assessment_plan_link: '',
      assigned_gateway_id: null,
      assigned_gateway_name: '',

      // Gateway-specific fields
      questions: [],

      // Standard-specific fields
      assigned_standards: [],

      // Default values (not in form but needed for API)
      active: 'Yes',
      included_in_off_the_job: 'Yes',
      permitted_delivery_types: '',
      professional_certification: '',
      qualification_type: '',
      qualification_status: '',
      duration_period: '',
      duration_value: '',
    }),
    [initialCourseType]
  )

  // Initialize React Hook Form with dynamic resolver
  // The resolver will check the current course_core_type value from the form data
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
    getValues,
    trigger,
  } = useForm<CourseFormData>({
    resolver: async (values, context, options) => {
      // Dynamically determine which schema to use based on current course_core_type value
      const currentCourseType = (values.course_core_type || initialCourseType) as CourseCoreType
      const schema = getCourseValidationSchema(currentCourseType)
      return yupResolver(schema)(values, context, options)
    },
    defaultValues: defaultFormValues,
    shouldUnregister: false, // Keep all fields registered even when empty
  })
  console.log("🚀 ~ NewCourseBuilder ~ errors:", errors)

  // Watch course_core_type for UI display
  const courseCoreType = watch('course_core_type') || initialCourseType

  // Course type configuration for UI display
  const courseTypeConfig = useMemo(() => {
    const configs = {
      Qualification: {
        label: 'Qualification',
        color: 'primary' as const,
        icon: <SchoolIcon sx={{ fontSize: 18 }} />,
        description: 'Create a qualification course with units and criteria',
      },
      Standard: {
        label: 'Standard',
        color: 'success' as const,
        icon: <MenuBookIcon sx={{ fontSize: 18 }} />,
        description: 'Create a standard course with modules and topics',
      },
      Gateway: {
        label: 'Gateway',
        color: 'warning' as const,
        icon: <AssessmentIcon sx={{ fontSize: 18 }} />,
        description: 'Create a gateway course for assessments',
      },
    }
    return configs[courseCoreType] || configs.Qualification
  }, [courseCoreType])

  // Load course data if editing
  useEffect(() => {
    if (courseId) {
      loadCourse(courseId).then((result) => {
        if (result.success && result.data) {
          // Map API response to CourseFormData format
          const formData: CourseFormData = {
            course_name: result.data.course_name || '',
            course_code: result.data.course_code || '',
            course_type: result.data.course_type || '',
            course_core_type: (result.data.course_core_type ||
              initialCourseType) as CourseCoreType,
            level: result.data.level || '',
            sector: result.data.sector || '',
            qualification_type: result.data.qualification_type || '',
            qualification_status: result.data.qualification_status || '',
            guided_learning_hours: result.data.guided_learning_hours || '',
            total_credits: result.data.total_credits || '',
            duration_period: result.data.duration_period || '',
            duration_value: result.data.duration_value || '',
            operational_start_date: result.data.operational_start_date || '',
            recommended_minimum_age: result.data.recommended_minimum_age || '',
            overall_grading_type: result.data.overall_grading_type || '',
            // Include units array from API response
            units: (result.data as any).units || [],
            permitted_delivery_types:
              result.data.permitted_delivery_types || '',
            professional_certification:
              result.data.professional_certification || '',
            two_page_standard_link: result.data.two_page_standard_link || '',
            assessment_plan_link: result.data.assessment_plan_link || '',
            brand_guidelines: result.data.brand_guidelines || '',
            active: result.data.active || 'Yes',
            included_in_off_the_job:
              result.data.included_in_off_the_job || 'Yes',
            awarding_body: result.data.awarding_body || 'No Awarding Body',
            assigned_gateway_id: result.data.assigned_gateway_id || null,
            assigned_gateway_name: result.data.assigned_gateway_name || '',
            questions: result.data.questions || [],
            assigned_standards: result.data.assigned_standards || [],
          }

          // Initialize form with loaded data
          reset(formData)
        }
      })
    }
  }, [courseId])

  // Fetch gateway courses for Standard type
  useEffect(() => {
    const fetchGateways = async () => {
      try {
        const gateways = await fetchActiveGatewayCourses()
        setGatewayCourses(gateways)
      } catch (error) {
        console.error('Failed to fetch gateway courses:', error)
      }
    }
    fetchGateways()
  }, [])

  // Handle form submission
  const onSubmit = async (data: CourseFormData) => {
    // Ensure all fields are included, even if empty
    const formData: CourseFormData = {
      ...defaultFormValues,
      ...data,
      // Ensure guided_learning_hours is included even if empty
      guided_learning_hours: data.guided_learning_hours ?? '',
    }
    console.log("🚀 ~ onSubmit ~ formData:", formData)

    // Units/modules are already part of the form data
    const courseIdToSave = course_id || courseId

    const result = await saveCourse(formData, courseIdToSave)

    if (result.success) {
      showSuccess(
        isEdit ? 'Course updated successfully!' : 'Course created successfully!'
      )

      if (activeStep < STEPS.length - 1) {
        setActiveStep((prev) => prev + 1)
      }
    } else {
      showError(result.error || 'Failed to save course. Please try again.')
    }
  }

  // Handle step navigation
  const handleNext = () => {
    if (activeStep === 0) {
      // Validate step 1 before proceeding
      handleSubmit(onSubmit)()
    } else if (activeStep < STEPS.length - 1) {
      // Move to next step if not on last step
      setActiveStep((prev) => prev + 1)
    } else {
      // On last step, submit the form
      handleSubmit(onSubmit)()
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => Math.max(0, prev - 1))
  }

  const handleStepClick = (step: number) => {
    if (step <= activeStep) {
      setActiveStep(step)
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant='h6' gutterBottom>
              Course Details
            </Typography>
            <Typography variant='body2' color='textSecondary' sx={{ mb: 3 }}>
              Enter the basic information for your{' '}
              {courseCoreType.toLowerCase()} course
            </Typography>
            <CourseDetailsForm
              control={control}
              errors={errors}
              courseCoreType={courseCoreType}
              edit={edit}
              gatewayCourses={gatewayCourses}
              setValue={setValue}
            />
          </Box>
        )
      case 1:
        return (
          <CourseUnitsModulesStep
            courseId={courseId || course_id}
            courseCoreType={courseCoreType}
            edit={edit}
            control={control}
            setValue={setValue}
          />
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <SecondaryButton
          name='Back to Listing'
          onClick={() => {
            handleClose?.()
            navigate('/courseBuilder')
          }}
          startIcon={<ArrowBackIcon />}
        />

        {/* Course Type Badge */}
        <Tooltip title={courseTypeConfig.description} arrow placement='left'>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.02)',
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
                transform: 'translateY(-1px)',
                boxShadow: theme.shadows[2],
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 500,
                  color: theme.palette.text.secondary,
                  fontSize: '1.5rem',
                }}
              >
                Course Type:
              </Typography>
            </Box>
            <Chip
              icon={courseTypeConfig.icon}
              label={courseTypeConfig.label}
              color={courseTypeConfig.color}
              variant='filled'
              sx={{
                fontWeight: 600,
                fontSize: '1.2rem',
                height: 32,
                '& .MuiChip-icon': {
                  color: 'inherit',
                },
              }}
            />
          </Box>
        </Tooltip>
      </Box>

      {/* Stepper */}
      <Paper
        elevation={0}
        sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}
      >
        <Stepper activeStep={activeStep}>
          {STEPS.map((label, index) => (
            <Step key={label} completed={index < activeStep}>
              <StepLabel
                onClick={() => handleStepClick(index)}
                sx={{ cursor: index <= activeStep ? 'pointer' : 'default' }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Paper
        elevation={0}
        sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent()}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>

            <Button
              type='submit'
              variant='contained'
              disabled={isSaving}
              onClick={
                activeStep === STEPS.length - 1
                  ? handleSubmit(onSubmit)
                  : handleNext
              }
            >
              {isSaving
                ? 'Saving...'
                : isEdit
                ? 'Update Course'
                : 'Create Course'}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Custom Notification Component */}
      <NotificationComponent />
    </Box>
  )
}

export default NewCourseBuilder
