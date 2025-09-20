import { useReducer, useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  createCourseAPI,
  selectCourseManagement,
  updateCourseAPI,
  fetchCourseById,
} from 'app/store/courseManagement'
import { showMessage } from 'app/store/fuse/messageSlice'
import {
  courseReducer,
  initialState,
  formatText,
  EMPTY_COURSE_DATA,
} from './courseReducer'

// Helper functions for localStorage
const saveStepToLocalStorage = (courseId: string | undefined, step: number) => {
  if (!courseId) return
  localStorage.setItem(`course_${courseId}_activeStep`, step.toString())
}

const getStepFromLocalStorage = (
  courseId: string | undefined
): number | null => {
  if (!courseId) return null
  const savedStep = localStorage.getItem(`course_${courseId}_activeStep`)
  return savedStep ? parseInt(savedStep, 10) : null
}

const clearStepFromLocalStorage = (courseId: string | undefined) => {
  if (!courseId) return
  localStorage.removeItem(`course_${courseId}_activeStep`)
}

interface Unit {
  id: string | number
  unit_ref?: string
  component_ref?: string
  title: string
  mandatory: string
  level?: string | null
  glh?: number | null
  credit_value?: number | null
  moduleType?: string
  subUnit: any[]
  learning_outcomes: any[]
  assessment_criteria?: any[]
  [key: string]: any
}

export const useCourseBuilder = (edit = 'create') => {
  const navigate = useNavigate()
  const location = useLocation()
  const { courseId } = useParams()
  const dispatch: any = useDispatch()
  const { preFillData } = useSelector(selectCourseManagement)

  const [state, courseDispatch] = useReducer(courseReducer, initialState)
  const [courseSaved, setCourseSaved] = useState(
    edit === 'edit' || Boolean(courseId)
  )
  const [showModuleEditor, setShowModuleEditor] = useState(false)
  const [showTopicEditor, setShowTopicEditor] = useState(false)

  // Initialize activeStep from localStorage if available
  const savedStep = courseId ? getStepFromLocalStorage(courseId) : null
  const [activeStep, _setActiveStep] = useState(
    savedStep !== null ? savedStep : 0
  )

  // Wrapper for setActiveStep that also saves to localStorage
  const setActiveStep = (
    stepOrFunction: number | ((prevStep: number) => number)
  ) => {
    _setActiveStep((prevStep) => {
      const newStep =
        typeof stepOrFunction === 'function'
          ? stepOrFunction(prevStep)
          : stepOrFunction

      // Save to localStorage
      if (courseId) {
        saveStepToLocalStorage(courseId, newStep)
      }

      return newStep
    })
  }

  const [completedSteps, setCompletedSteps] = useState<{
    [k: number]: boolean
  }>({})
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({
    course_name: false,
    course_code: false,
    level: false,
    course_type: false,
    brand_guidelines: false,
  })

  const mapUnitsToFormat = useCallback((units: any[]) => {
    const unitObject: Record<string, any> = {}
    if (units && units.length > 0) {
      units.forEach((unit) => {
        // Ensure mandatory is a string 'true' or 'false'
        const mandatoryValue =
          typeof unit.mandatory === 'boolean'
            ? unit.mandatory
              ? 'true'
              : 'false'
            : unit.mandatory === 'true'
            ? 'true'
            : 'false'

        unitObject[unit.id] = {
          id: unit.id,
          unit_ref: unit.unit_ref || '',
          title: unit.title || '',
          mandatory: mandatoryValue,
          level: unit.level || '',
          glh: unit.glh || 0,
          credit_value: unit.credit_value || 0,
          subUnit: unit.subUnit || [],
          learning_outcomes: unit.learning_outcomes || [],
          assessment_criteria: unit.assessment_criteria || [],
          component_ref: unit.component_ref || '',
          // Add additional module-specific fields
          description: unit.description || '',
          delivery_method: unit.delivery_method || '',
          otj_hours: unit.otj_hours || '0',
          delivery_lead: unit.delivery_lead || '',
          sort_order: unit.sort_order || '0',
          active: unit.active || 'true',
          moduleType: unit.moduleType || 'core',
        }
      })
    }
    return unitObject
  }, [])

  useEffect(() => {
    const loadCourseData = async () => {
      if (courseId) {
        try {
          courseDispatch({ type: 'SET_LOADING', payload: true })
          const response = await dispatch(fetchCourseById(courseId))
          if (!response) {
            navigate('/courseBuilder')
          }
        } catch (error) {
          console.error('Error loading course data:', error)
          navigate('/courseBuilder')
        } finally {
          courseDispatch({ type: 'SET_LOADING', payload: false })
        }
      } else if (edit === 'create') {
        // Clear any existing data in Redux store
        dispatch({ type: 'courseManagement/updatePreFillData', payload: {} })

        const params = new URLSearchParams(location.search)
        const typeFromUrl = params.get('type')
        const defaultCourseType = typeFromUrl || 'Qualification'

        // Reset the course data with the selected course type
        courseDispatch({
          type: 'RESET_COURSE_DATA',
          courseType: defaultCourseType,
        })
      }
    }

    loadCourseData()
  }, [courseId, dispatch, navigate, edit, location.search])

  useEffect(() => {
    if (!preFillData || Object.keys(preFillData).length === 0) {
      return
    }
    const course_core_type = preFillData.course_core_type || 'Qualification'
    const courseData = {
      ...EMPTY_COURSE_DATA,
      ...preFillData,
      brand_guidelines: formatText(preFillData.brand_guidelines) || '',
      course_core_type: course_core_type,
      active: preFillData.active || 'Yes',
      included_in_off_the_job: preFillData.included_in_off_the_job || 'Yes',
      awarding_body: preFillData.awarding_body || 'No Awarding Body',
    }

    // Prepare units data
    let units = {}
    let savedUnits = {}

    if (preFillData.units && preFillData.units.length > 0) {
      // Check if units have the expected structure
      const hasValidUnits = preFillData.units.every(
        (unit: any) => unit && typeof unit === 'object' && unit.id && unit.title
      )

      if (!hasValidUnits) {
        console.warn(
          'useCourseBuilder - Some units are missing required fields:',
          preFillData.units
        )
      }

      units = mapUnitsToFormat(preFillData.units)

      preFillData.units.forEach((unit: any) => {
        if (unit && unit.id) {
          savedUnits[unit.id] = true
        }
      })
    }

    // Dispatch to update state with API data
    courseDispatch({
      type: 'INITIALIZE_FROM_API',
      courseData, // Direct property
      units, // Direct property
      savedUnits, // Direct property
    })

    if (edit === 'edit' || edit === 'view') {
      setCourseSaved(true)
    }
  }, [preFillData, edit, mapUnitsToFormat])

  // Initialize stepper based on edit mode and direct edit
  useEffect(() => {
    const directEditMode = sessionStorage.getItem('directEditMode') === 'true'
    const editCourseId = sessionStorage.getItem('editCourseId')

    // Get saved step from localStorage
    const savedStep = courseId ? getStepFromLocalStorage(courseId) : null
    // Set completed steps
    if (edit === 'edit' || edit === 'view') {
      setCompletedSteps({
        0: true,
      })

      if (Object.values(state.savedUnits).some((saved) => saved)) {
        setCompletedSteps((prev) => ({
          ...prev,
          1: true,
        }))
      }

      // Determine the appropriate step based on course state
      let appropriateStep = 0

      if (state.courseData.course_core_type === 'Gateway') {
        appropriateStep = 0
      } else if (
        directEditMode &&
        editCourseId === courseId &&
        Object.values(state.mandatoryUnit).length > 0
      ) {
        appropriateStep = 1
        sessionStorage.removeItem('directEditMode')
        sessionStorage.removeItem('editCourseId')
      } else if (Object.values(state.savedUnits).some((saved) => saved)) {
        appropriateStep = 2
      } else if (courseSaved) {
        appropriateStep = 1
      }

      // If we have a saved step from localStorage, validate it against the appropriate step
      if (savedStep !== null) {
        // For Gateway courses, always force step 0
        if (state.courseData.course_core_type === 'Gateway') {
          setActiveStep(0)
        }
        // For other course types, ensure the saved step is valid based on course state
        else {
          // Step 2 requires saved units
          if (
            savedStep === 2 &&
            !Object.values(state.savedUnits).some((saved) => saved)
          ) {
            setActiveStep(appropriateStep)
          }
          // Step 1 requires course to be saved
          else if (savedStep === 1 && !courseSaved) {
            setActiveStep(appropriateStep)
          }
          // Otherwise use the saved step
          else {
            setActiveStep(savedStep)
          }
        }
      } else {
        // No saved step, use the appropriate step
        setActiveStep(appropriateStep)
      }
    } else if (edit === 'create' && state.courseData.course_core_type) {
      // For Gateway courses in create mode, always stay at step 0
      if (state.courseData.course_core_type === 'Gateway') {
        setActiveStep(0)
      }
      // For other course types in create mode
      else if (savedStep !== null && savedStep > 0) {
        // Validate the saved step
        if (
          savedStep === 2 &&
          !Object.values(state.savedUnits).some((saved) => saved)
        ) {
          setActiveStep(0)
        } else if (savedStep === 1 && !courseSaved) {
          setActiveStep(0)
        } else {
          setActiveStep(savedStep)
        }
      } else {
        setActiveStep(0)
      }
    }
  }, [edit, state.courseData.course_core_type, courseSaved, courseId])

  useEffect(() => {
    if (Object.values(state.savedUnits).some((saved) => saved)) {
      setCompletedSteps((prev) => ({
        ...prev,
        1: true,
      }))
    }
  }, [state.savedUnits])

  // Course form handlers
  const courseHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const currentMode = courseId ? edit : edit
    if (currentMode === 'view') return

    const { name, value } = event.target
    courseDispatch({
      type: 'UPDATE_COURSE_FIELD',
      field: name,
      value,
    })
  }

  const validateForm = () => {
    const baseErrors = {
      course_name: !state.courseData.course_name,
      course_code: !state.courseData.course_code,
    }

    let errors: Record<string, boolean> = { ...baseErrors }

    switch (state.courseData.course_core_type) {
      case 'Gateway':
        break

      case 'Standard':
        errors = {
          ...errors,
          level: !state.courseData.level,
          duration_period: !state.courseData.duration_period,
        }
        break

      case 'Qualification':
        errors = {
          ...errors,
          level: !state.courseData.level,
          course_type: !state.courseData.course_type,
          brand_guidelines: !state.courseData.brand_guidelines,
        }
        break

      default:
        break
    }

    setValidationErrors(errors)
    return !Object.values(errors).some((error) => error)
  }

  const saveCourse = async () => {
    if (!validateForm()) return false

    let units = []
    if (state.courseData.course_core_type !== 'Gateway') {
      units = Object.values(state.mandatoryUnit).map((item: Unit) => {
        return {
          id: item.id,
          unit_ref: item.unit_ref,
          component_ref: item.component_ref,
          title: item.title,
          mandatory: item.mandatory,
          level: item.level,
          glh: item.glh,
          credit_value: item.credit_value,
          moduleType: item.moduleType,
          subUnit: item.subUnit,
          learning_outcomes: item.learning_outcomes || [],
          assessment_criteria: item.assessment_criteria || [],
        }
      })
    }

    const courseDataToSend = { ...state.courseData }

    if (!courseDataToSend.course_type) {
      courseDataToSend.course_type = 'CORE'
    }

    if (
      state.courseData.course_core_type === 'Gateway' &&
      !courseDataToSend.level
    ) {
      courseDataToSend.level = 'N/A'
    }

    courseDispatch({ type: 'SET_LOADING', payload: true })
    let response: any = false

    if (courseSaved && (courseId || preFillData?.course_id)) {
      const courseIdToUpdate = courseId || preFillData?.course_id
      response = await dispatch(
        updateCourseAPI(courseIdToUpdate, { ...courseDataToSend, units })
      )
      if (response) {
        setCourseSaved(true)
        if (edit === 'edit') {
          // Handle close if needed
        } else {
          dispatch(
            showMessage({
              message: 'Course updated successfully.',
              variant: 'success',
            })
          )
        }
      }
    } else {
      response = await dispatch(createCourseAPI({ ...courseDataToSend, units }))
      if (response && response.data && response.data.course_id) {
        setCourseSaved(true)

        window.history.replaceState(
          null,
          '',
          `/courseBuilder/course/${response.data.course_id}`
        )

        await dispatch(fetchCourseById(response.data.course_id))

        dispatch(
          showMessage({
            message: 'Course created successfully.',
            variant: 'success',
          })
        )

        // Only call handleNext for non-Gateway courses
        if (
          activeStep === 0 &&
          state.courseData.course_core_type !== 'Gateway'
        ) {
          handleNext()
        }
      }
    }
    courseDispatch({ type: 'SET_LOADING', payload: false })
    return !!response
  }

  const handleNext = () => {
    // For Gateway courses, always stay on step 0
    if (state.courseData.course_core_type === 'Gateway') {
      setCompletedSteps((prev) => ({
        ...prev,
        0: true,
      }))

      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
      return
    }

    const newActiveStep = activeStep + 1
    setActiveStep(newActiveStep)

    setCompletedSteps((prev) => ({
      ...prev,
      [activeStep]: true,
    }))

    setShowSuccessMessage(true)
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 3000)
  }

  const handleBack = () => {
    // For Gateway courses, always stay on step 0
    if (state.courseData.course_core_type === 'Gateway') {
      return
    }

    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleStepClick = (step: number) => {
    if (state.courseData.course_core_type === 'Gateway' && step > 0) {
      dispatch(
        showMessage({
          message: 'Gateway courses only have Course Details step.',
          variant: 'info',
        })
      )
      return
    }

    if (step === 0) {
      setActiveStep(0)
      return
    }

    if (step === 1) {
      if (!courseSaved) {
        dispatch(
          showMessage({
            message: 'Please save your course details first.',
            variant: 'warning',
          })
        )
        return
      }

      setActiveStep(1)
      return
    }

    if (step === 2 && state.courseData.course_core_type !== 'Gateway') {
      const hasUnits = Object.values(state.mandatoryUnit).length > 0
      const hasSavedUnits = Object.values(state.savedUnits).some(
        (saved) => saved
      )

      if (!hasUnits) {
        dispatch(
          showMessage({
            message: 'Please create outcomes before accessing criteria.',
            variant: 'warning',
          })
        )
        return
      }

      if (hasUnits && !hasSavedUnits) {
        dispatch(
          showMessage({
            message: 'Please save your outcomes before accessing criteria.',
            variant: 'warning',
          })
        )
        return
      }

      setActiveStep(2)
      return
    }
  }

  // Function to clear step data when navigating away
  const clearStepData = useCallback(() => {
    if (courseId) {
      clearStepFromLocalStorage(courseId)
    }
  }, [courseId])

  return {
    state,
    courseDispatch,
    courseSaved,
    setCourseSaved,
    showModuleEditor,
    setShowModuleEditor,
    showTopicEditor,
    setShowTopicEditor,
    activeStep,
    setActiveStep,
    completedSteps,
    setCompletedSteps,
    showSuccessMessage,
    validationErrors,
    courseHandler,
    validateForm,
    saveCourse,
    handleNext,
    handleBack,
    handleStepClick,
    mapUnitsToFormat,
    clearStepData,
  }
}
