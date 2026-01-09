import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { yupResolver } from '@hookform/resolvers/yup'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { FileUploader } from 'react-drag-drop-files'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'

import {
  useGetEvidenceDetailsQuery,
  useUpdateEvidenceIdMutation,
  useUploadExternalEvidenceFileMutation,
  useRequestSignatureMutation,
  useUpsertAssignmentMappingMutation,
} from 'app/store/api/evidence-api'
import { assessmentMethod, fileTypes } from 'src/utils/constants'

import { useGetLearnerPlanListQuery } from 'app/store/api/learner-plan-api'
import { showMessage } from 'app/store/fuse/messageSlice'
import { useDispatch } from 'react-redux'
import {
  useLearnerId,
  useLearnerUserId,
  useUserRole,
} from 'src/app/utils/userHelpers'
import { formatSessionTime } from 'src/utils/string'
import { selectGlobalUser } from 'app/store/globalUser'
import { getTrainerAPI } from 'app/store/session'
import { fetchCourseAPI } from 'app/store/courseManagement'
import { selectLearnerManagement } from 'app/store/learnerManagement'
import NewTimeLog from '../timeLog/newTimeLog'
import SignatureTable from './components/SignatureTable'
import UnitsTable from './components/UnitsTable'
import QualificationHierarchy from './components/QualificationHierarchy'
import { FormValues } from './lib/types'
import { getValidationSchema } from './schema'
import {
  COURSE_TYPES,
  UNIT_TYPES,
  USER_ROLES,
  COMBINED_UNIT_TYPES,
  ROLES_CAN_EDIT_DECLARATION,
  ROLES_CAN_EDIT_TRAINER_FIELDS,
  ROLES_REDIRECT_TO_QA,
} from './constants'
import { useEvidenceCount } from './hooks/useEvidenceCount'
import { useUnitHandlers } from './hooks/useUnitHandlers'
import { useQualificationHandlers } from './hooks/useQualificationHandlers'

const CreateViewEvidenceLibrary = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isEditMode, setIsEditMode] = useState<boolean>(
    location.state && location.state?.isEdit
  )
  // Session option structure: { id: number, label: string }
  const [sessions, setSessions] = useState<Array<{ id: number; label: string }>>([])
  const [isTimeLogDialogOpen, setIsTimeLogDialogOpen] = useState(false)
  // selectedCourses and courseSelectedTypes are now managed by React Hook Form
  const [timeLogData, setTimeLogData] = useState<{
    user_id: number | null
    course_id: number | null
    activity_date: string
    activity_type: string
    unit: string[]
    trainer_id: number | null
    type: string
    spend_time: string
    start_time: string
    end_time: string
    impact_on_learner: string
    evidence_link: string
  }>({
    user_id: null,
    course_id: null,
    activity_date: '',
    activity_type: '',
    unit: [],
    trainer_id: null,
    type: '',
    spend_time: '0:0',
    start_time: '0:0',
    end_time: '0:0',
    impact_on_learner: '',
    evidence_link: '',
  })

  const dispatch: any = useDispatch()
  const { id } = useParams()

  const learnerUserId = useLearnerUserId()
  const learnerId = useLearnerId()
  const userRole = useUserRole()
  const { currentUser, selectedUser, selected } = useSelector(selectGlobalUser)
  const { learner } = useSelector(selectLearnerManagement)
  
  // Ref to track if form has been initialized to prevent resetting values
  const isFormInitialized = useRef(false)

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    trigger,
    formState: { errors, isSubmitted },
  } = useForm<FormValues>({
    resolver: yupResolver(getValidationSchema(userRole)) as any,
    defaultValues: {
      title: '',
      description: '',
      trainer_feedback: '',
      points_for_improvement: '',
      audio: null,
      learner_comments: '',
      evidence_time_log: false,
      session: '',
      grade: '',
      declaration: ROLES_CAN_EDIT_DECLARATION.includes(userRole as any)
        ? true
        : false,
      assessment_method: [],
      selectedCourses: [],
      courseSelectedTypes: {},
      units: [],
      signatures: [
        {
          role: 'Trainer',
          name: '',
          signed: false,
          es: '',
          date: '',
          signature_required: false,
        },
        {
          role: 'Learner',
          name: '',
          signed: false,
          es: '',
          date: '',
          signature_required: false,
        },
        {
          role: 'Employer',
          name: '',
          signed: false,
          es: '',
          date: '',
          signature_required: false,
        },
        {
          role: 'IQA',
          name: '',
          signed: false,
          es: '',
          date: '',
          signature_required: false,
        },
      ],
    },
    mode: 'onSubmit',
  })
  console.log("🚀 ~ CreateViewEvidenceLibrary ~ errors:", errors)


  const {
    data: evidenceDetails,
    isLoading,
    isError,
  } = useGetEvidenceDetailsQuery(
    {
      id,
    },
    {
      skip: !id,
      refetchOnMountOrArgChange: true,
    }
  )

  // Extract mappings and signatures from evidenceDetails
  const mappingsData = evidenceDetails?.data?.mappings || []
  const signatureList = evidenceDetails?.data?.signatures || []

  const {
    data,
    error,
    isLoading: isLoadingLearnerPlan,
    refetch,
  } = useGetLearnerPlanListQuery(
    {
      learners: learnerId,
    },
    {
      skip: !learnerId,
    }
  )

  // Get learner courses from Redux store, filter out Gateway courses
  // Memoize to prevent recalculation on every render
  const learnerCoursesData = useMemo(() => {
    if (!learner?.course) return []
    return learner.course
        .map((courseItem: any) => {
          // Handle nested course structure
          const course = courseItem.course || courseItem
          // Ensure units are included from either course or courseItem
          return {
            ...course,
            units: course.units || courseItem.units || [],
            course_core_type: course.course_core_type || courseItem.course_core_type,
          }
        })
      .filter((course: any) => course?.course_core_type !== COURSE_TYPES.GATEWAY)
  }, [learner?.course])
  const isLoadingLearnerCourses = false

  // Populate signatures from API data
  useEffect(() => {
    if (signatureList && Array.isArray(signatureList) && signatureList.length > 0) {
      const signatureRoles = ['Trainer', 'Learner', 'Employer', 'IQA']
      const populatedSignatures = signatureRoles.map((role) => {
        const apiSignature = signatureList.find((sig: any) => sig.role === role)
        if (apiSignature) {
          return {
            role: apiSignature.role,
            name: apiSignature.name || '',
            signed: apiSignature.is_signed || false,
            es: '', // ES field not in API response, keeping empty
            date: apiSignature.signed_at
              ? new Date(apiSignature.signed_at).toISOString().split('T')[0]
              : '',
            signature_required: apiSignature.is_requested || false,
          }
        }
        return {
          role,
          name: '',
          signed: false,
          es: '',
          date: '',
          signature_required: false,
        }
      })
      setValue('signatures', populatedSignatures)
    }
  }, [signatureList, setValue])

  useEffect(() => {
    if (isError && error) {
      setSessions([])
      return
    }

    if (data && data?.data.length > 0) {
      const payload = data?.data.map((time) => {
        return {
          id: time.learner_plan_id,
          label: formatSessionTime(time.startDate, time.Duration),
        }
      })
      setSessions(payload)
    } else {
      setSessions([])
    }
  }, [data, isLoading, isError, error])

  // Fetch course and trainer data for time log
  useEffect(() => {
    if (isTimeLogDialogOpen) {
      dispatch(fetchCourseAPI())
      dispatch(getTrainerAPI('Trainer'))
    }
  }, [isTimeLogDialogOpen, dispatch])

  const [updateEvidenceId, { isLoading: isUpdateLoading }] =
    useUpdateEvidenceIdMutation()
  const [uploadExternalEvidenceFile] = useUploadExternalEvidenceFileMutation()
  const [requestSignature, { isLoading: isRequestingSignature }] =
    useRequestSignatureMutation()
  
  const [upsertMapping] = useUpsertAssignmentMappingMutation()

  useEffect(() => {
    if (!id) return navigate('/evidenceLibrary') // Redirect if no ID is provided
  }, [id])

  // Helper function to reconstruct form state from mappings
  const reconstructFormStateFromMappings = useCallback((mappings: any[], courses: any[]) => {
    if (!mappings || mappings.length === 0 || !courses || courses.length === 0) {
      return { selectedCourses: [], courseSelectedTypes: {}, units: [] }
    }

    // Group mappings by course_id (now directly available in mapping response)
    const mappingsByCourse = new Map<number, any[]>()
    mappings.forEach((mapping) => {
      // Use course_id directly from mapping response
      const courseId = mapping.course_id
      if (!courseId) return

      // unit_code now contains the unit ID (not code), but keep backward compatibility with unit_ref
      const unitIdOrRef = mapping.unit_code || mapping.unit_ref
      if (!unitIdOrRef) return

      if (!mappingsByCourse.has(courseId)) {
        mappingsByCourse.set(courseId, [])
      }
      mappingsByCourse.get(courseId)!.push(mapping)
    })

    // Build selected courses from mappings
    const selectedCoursesArray: any[] = []
    const courseSelectedTypesObj: Record<string | number, string[]> = {}
    const unitsArray: any[] = []

    mappingsByCourse.forEach((courseMappings, courseId) => {
      const course = courses.find((c: any) => c.course_id === courseId)
      if (!course) return

      selectedCoursesArray.push(course)

      // For Standard courses, collect all types that have mappings
      if (course.course_core_type === COURSE_TYPES.STANDARD) {
        const selectedTypesSet = new Set<string>()
        if (courseMappings.length > 0 && course.units) {
          courseMappings.forEach((mapping) => {
            const unitIdOrRef = mapping.unit_code || mapping.unit_ref
            if (unitIdOrRef) {
              // unit_code now contains unit ID, so match by id first, then fallback to code for backward compatibility
              const matchedUnit = course.units.find(
                (u: any) => String(u.id) === String(unitIdOrRef) || u.code === unitIdOrRef || u.unit_ref === unitIdOrRef
              )
              if (matchedUnit?.type) {
                selectedTypesSet.add(matchedUnit.type)
              }
            }
          })
        }
        if (selectedTypesSet.size > 0) {
          courseSelectedTypesObj[courseId] = Array.from(selectedTypesSet)
        }
      }

      // Reconstruct units from mappings + course structure
      const courseUnits = course.units || []
      const unitsMap = new Map<string, any>()

      // For Qualification courses: First, initialize all units with all subUnits and topics
      // Then apply mapping values to topics that have mappings
      if (course.course_core_type === COURSE_TYPES.QUALIFICATION) {
        // Create a map to track which topics have mappings
        const topicMappingsMap = new Map<string, any>()
        courseMappings.forEach((mapping) => {
          const unitIdOrRef = mapping.unit_code || mapping.unit_ref
          const key = `${courseId}-${unitIdOrRef}`
          topicMappingsMap.set(key, mapping)
        })

        // Initialize all units with all their subUnits and topics
        courseUnits.forEach((unit) => {
          const unitKey = `${courseId}-${unit.id || unit.code}`
          if (unitsMap.has(unitKey)) return // Already processed

          const unitData: any = {
            ...unit,
            course_id: courseId,
            type: unit.type,
            code: unit.code || unit.unit_ref,
            subUnit: [],
          }

          // Add all subUnits with all topics
          if (unit.subUnit && Array.isArray(unit.subUnit) && unit.subUnit.length > 0) {
            unitData.subUnit = unit.subUnit.map((subUnit: any) => {
              const subUnitData: any = {
                ...subUnit,
                topics: [],
              }

              // Add all topics from the course structure
              if (subUnit.topics && Array.isArray(subUnit.topics) && subUnit.topics.length > 0) {
                subUnitData.topics = subUnit.topics.map((topic: any) => {
                  // Check if this topic has a mapping
                  const topicKey = `${courseId}-${topic.id}`
                  const mapping = topicMappingsMap.get(topicKey)

                  if (mapping) {
                    // Apply mapping values
                    const learnerMap = mapping.learnerMap ?? mapping.learner_map ?? false
                    const trainerMap = mapping.trainerMap ?? mapping.trainer_map ?? false
                    const signedOff = mapping.signedOff ?? mapping.signed_off ?? false
                    const comment = mapping.comment ?? ''

                    return {
                      ...topic,
                      learnerMap,
                      trainerMap,
                      signedOff,
                      comment,
                      mapping_id: mapping.mapping_id,
                    }
                  } else {
                    // No mapping, use default values
                    return {
                      ...topic,
                      learnerMap: false,
                      trainerMap: false,
                      signedOff: false,
                      comment: '',
                    }
                  }
                })
              }

              return subUnitData
            })
          }

          unitsMap.set(unitKey, unitData)
        })

        // Push Qualification units to array and continue to next course
        unitsArray.push(...Array.from(unitsMap.values()))
        return // Skip the forEach loop below for Qualification courses
      }

      courseMappings.forEach((mapping) => {
        // unit_code now contains the unit ID (not code), but keep backward compatibility with unit_ref
        const unitIdOrRef = mapping.unit_code || mapping.unit_ref
        // Support both sub_unit_id (new API) and sub_unit_ref (old API)
        const subUnitRef = mapping.sub_unit_id || mapping.sub_unit_ref
        
        // For Standard courses or when sub_unit_id is provided: match by unit ID
        const unit = courseUnits.find(
          (u: any) => String(u.id) === String(unitIdOrRef) || u.code === unitIdOrRef || u.unit_ref === unitIdOrRef
        )
        if (!unit) return

        const unitKey = `${courseId}-${unit.id || unit.code}`
        if (!unitsMap.has(unitKey)) {
          unitsMap.set(unitKey, {
            ...unit,
            course_id: courseId,
            type: unit.type,
            code: unit.code || unit.unit_ref,
            subUnit: [],
            mapping_id: mapping.mapping_id, // Store mapping_id for updates
          })
        }

        const unitData = unitsMap.get(unitKey)!

        // If mapping has sub_unit_ref, it's a sub unit mapping
        if (subUnitRef !== null && subUnitRef !== undefined) {
          // Find the subunit in the unit's subUnit array - match by id first, then code
          const subunit = unit.subUnit?.find(
            (s: any) => String(s.id) === String(subUnitRef) || s.code === subUnitRef
          )
          if (subunit) {
            const existingSubUnit = unitData.subUnit.find(
              (s: any) => s.id === subunit.id || s.code === subunit.code
            )
            if (!existingSubUnit) {
              // Support both camelCase (learnerMap) and snake_case (learner_map) from API
              const learnerMap = mapping.learnerMap ?? mapping.learner_map ?? false
              const trainerMap = mapping.trainerMap ?? mapping.trainer_map ?? false
              const signedOff = mapping.signedOff ?? mapping.signed_off ?? false
              const comment = mapping.comment ?? ''
              
              unitData.subUnit.push({
                ...subunit,
                learnerMap,
                trainerMap,
                signedOff,
                comment,
                mapping_id: mapping.mapping_id,
              })
            }
          }
        } else {
          // Unit-only mapping (no subunits) - for Standard courses
          // Support both camelCase (learnerMap) and snake_case (learner_map) from API
          const learnerMap = mapping.learnerMap ?? mapping.learner_map ?? false
          const trainerMap = mapping.trainerMap ?? mapping.trainer_map ?? false
          const signedOff = mapping.signedOff ?? mapping.signed_off ?? false
          const comment = mapping.comment ?? ''
          
          unitData.learnerMap = learnerMap
          unitData.trainerMap = trainerMap
          unitData.signedOff = signedOff
          unitData.comment = comment
          unitData.mapping_id = mapping.mapping_id
        }
      })

      unitsArray.push(...Array.from(unitsMap.values()))
    })

    return {
      selectedCourses: selectedCoursesArray,
      courseSelectedTypes: courseSelectedTypesObj,
      units: unitsArray,
    }
  }, [])

  useEffect(() => {
    if (!isLoading && isError) {
      navigate('/evidenceLibrary') // Redirect if there's an error
      return
    }

    // Only initialize form once - prevent resetting values when user makes changes
    if (isFormInitialized.current) {
      return
    }

    // Load evidence-level data only (no course_id, no units)
    if (evidenceDetails && evidenceDetails.data) {
      const {
        description,
        grade,
        learner_comments,
        points_for_improvement,
        assessment_method,
        external_feedback,
        title,
        trainer_feedback,
        session,
      } = evidenceDetails.data

      // Set evidence-level fields only
      setValue('title', title ? title : '')
      setValue('trainer_feedback', trainer_feedback ? trainer_feedback : '')
      setValue('learner_comments', learner_comments ? learner_comments : '')
      setValue(
        'points_for_improvement',
        points_for_improvement ? points_for_improvement : ''
      )
      setValue('description', description ? description : '')
      setValue('grade', grade ? grade : '')
      setValue('assessment_method', assessment_method ? assessment_method : [])
      setValue('session', session ? session : '')
      setValue('audio', external_feedback ? external_feedback : '')
      setValue(
        'evidence_time_log',
        evidenceDetails.data.evidence_time_log || false
      )
      
      // Set declaration to true for Trainer/Admin/IQA, otherwise use existing value
      const canEditDeclaration = ['Trainer', 'Admin', 'IQA'].includes(userRole)
      setValue(
        'declaration',
        canEditDeclaration ? true : evidenceDetails.data.declaration || false
      )

      // Reconstruct form state from mappings
      if (mappingsData && Array.isArray(mappingsData) && mappingsData.length > 0 && learnerCoursesData && learnerCoursesData.length > 0) {
        const reconstructed = reconstructFormStateFromMappings(mappingsData, learnerCoursesData)
        
        const currentSelectedCourses = watch('selectedCourses') || []
        if (reconstructed.selectedCourses.length > 0 && currentSelectedCourses.length === 0) {
          setValue('selectedCourses', reconstructed.selectedCourses)
          setValue('courseSelectedTypes', reconstructed.courseSelectedTypes)
          setValue('units', reconstructed.units)
        }
      }

      // Mark form as initialized after setting all values
      isFormInitialized.current = true
    } else if (!id) {
      // For new evidence (no id), mark as initialized immediately to prevent future resets
      isFormInitialized.current = true
    }
  }, [evidenceDetails, mappingsData, setValue, isError, id, isLoading, learnerCoursesData, reconstructFormStateFromMappings, userRole, watch, navigate])

  // Watch form fields - must be declared before any conditional returns
  const unitsWatch = watch('units')
  const selectedCourses = watch('selectedCourses') || []
  const courseSelectedTypes = watch('courseSelectedTypes') || {}

  // Use custom hooks
  const { getEvidenceCount } = useEvidenceCount({ learner, selectedCourses })
  const {
    learnerMapHandler,
    trainerMapHandler,
    signedOffHandler,
    commentHandler,
    selectAllLearnerMapHandler,
    selectAllSignedOffHandler,
    selectAllSignedOffForCombinedHandler,
  } = useUnitHandlers({
    units: unitsWatch || [],
    setValue,
    trigger,
  })
  
  // Qualification-specific handlers (for topics)
  const {
    learnerMapHandler: qualificationLearnerMapHandler,
    trainerMapHandler: qualificationTrainerMapHandler,
    signedOffHandler: qualificationSignedOffHandler,
    commentHandler: qualificationCommentHandler,
  } = useQualificationHandlers({
    units: unitsWatch || [],
    setValue,
    trigger,
  })

  // Initialize time log data when evidence details are loaded
  useEffect(() => {
    if (evidenceDetails?.data && learnerUserId) {
      const evidence = evidenceDetails.data

      // Get units from form state (unitsWatch) - will be synced when units change
      const evidenceUnits =
        unitsWatch && unitsWatch.length > 0
          ? unitsWatch.map((unit: any) => unit?.title || '').filter(Boolean)
          : []

      // Get first selected course for time log (if any)
      const firstCourseId = selectedCourses.length > 0 ? selectedCourses[0].course_id : null

      setTimeLogData((prev) => ({
        ...prev,
        user_id: selected
          ? selectedUser?.user_id
          : currentUser?.user_id || learnerUserId,
        course_id: firstCourseId || prev.course_id,
        unit: evidenceUnits.length > 0 ? evidenceUnits : prev.unit,
        impact_on_learner: evidence.description || prev.impact_on_learner,
        evidence_link: evidence.file?.url || window.location.href,
      }))
    }
  }, [evidenceDetails, learnerUserId, selected, selectedUser, currentUser, unitsWatch, selectedCourses])

  // Auto-initialize units in form when type is selected for Standard courses
  // This is handled by the course selection and type selection UI, so this useEffect is no longer needed
  // Units are initialized when course type is selected in the UI

  // Sync selected units from evidence form to time log
  useEffect(() => {
    if (unitsWatch && unitsWatch.length > 0) {
      // Get all selected unit titles as an array for time log
      const selectedUnitTitles = unitsWatch
        .map((unit) => unit?.title || '')
        .filter(Boolean)
      if (selectedUnitTitles.length > 0) {
        setTimeLogData((prev) => ({
          ...prev,
          unit: selectedUnitTitles,
        }))
      }
    } else {
      // Reset to empty array if no units selected
      setTimeLogData((prev) => ({
        ...prev,
        unit: [],
      }))
    }
  }, [unitsWatch])

  // Helper functions for field access control
  const canEditLearnerFields = userRole === USER_ROLES.LEARNER
  const canEditTrainerFields = ROLES_CAN_EDIT_TRAINER_FIELDS.includes(userRole as any)

  // All hooks must be called before any conditional returns
  const openFilePreview = useCallback((url: string) => {
    if (url) {
      window.open(url, '_blank')
    } else {
      console.error('File URL is not available')
    }
  }, [])

  // Handle time log data update
  const handleTimeLogDataUpdate = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTimeLogData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }, [])

  // Handle evidence time log radio change
  const handleEvidenceTimeLogChange = useCallback((value: boolean) => {
    if (value === true) {
      // Pre-populate time log data with evidence information
      if (evidenceDetails?.data) {
        const evidence = evidenceDetails.data

        // Get units from currently selected units in evidence form, or from evidence data
        const selectedUnits =
          unitsWatch && unitsWatch.length > 0
            ? unitsWatch.map((unit) => unit?.title || '').filter(Boolean)
            : evidence.units && evidence.units.length > 0
            ? evidence.units.map((unit) => unit?.title || '').filter(Boolean)
            : []

        setTimeLogData((prev) => ({
          ...prev,
          user_id: selected
            ? selectedUser?.user_id
            : currentUser?.user_id || learnerUserId,
          course_id: evidence.course_id?.course_id || prev.course_id,
          unit: selectedUnits.length > 0 ? selectedUnits : prev.unit,
          impact_on_learner: evidence.description || prev.impact_on_learner,
          evidence_link: evidence.file?.url || window.location.href,
        }))
      }
      setIsTimeLogDialogOpen(true)
    }
  }, [evidenceDetails?.data, unitsWatch, selected, selectedUser, currentUser, learnerUserId])

  // Handle time log dialog close
  const handleTimeLogDialogClose = useCallback(() => {
    setIsTimeLogDialogOpen(false)
  }, [])

  // Handle time log submission success
  const handleTimeLogSubmitSuccess = useCallback(() => {
    setIsTimeLogDialogOpen(false)
    dispatch(
      showMessage({
        message: 'Time log created successfully',
        variant: 'success',
      })
    )
  }, [dispatch])

  // Conditional return must be after all hooks
  if (isLoading) {
    return (
      <Container sx={{ mt: 8, mb: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Loading Evidence Details...
        </Typography>
      </Container>
    )
  }

  const onSubmit = async (data: FormValues) => {
    // Validate course selections before submitting (schema validation should handle this, but keep as backup)
    if (!data.selectedCourses || data.selectedCourses.length === 0) {
      dispatch(
        showMessage({
          message: 'Please select at least one course',
          variant: 'error',
        })
      )
      return
    }

    // Validate Standard courses have type selected
    const standardCourses = data.selectedCourses.filter(
      (c) => c.course_core_type === COURSE_TYPES.STANDARD
    )
    for (const course of standardCourses) {
      const selectedTypes = data.courseSelectedTypes?.[course.course_id] || []
      if (!Array.isArray(selectedTypes) || selectedTypes.length === 0) {
        dispatch(
          showMessage({
            message: `Please select at least one type for ${course.course_name}`,
            variant: 'error',
          })
        )
        return
      }
    }

    // Validate Qualification courses have units selected
    const qualificationCourses = data.selectedCourses.filter(
      (c) => c.course_core_type === COURSE_TYPES.QUALIFICATION
    )
    for (const course of qualificationCourses) {
      const courseUnits = (unitsWatch || []).filter(
        (u) => u.course_id === course.course_id
      )
      if (courseUnits.length === 0) {
        dispatch(
          showMessage({
            message: `Please select at least one unit for ${course.course_name}`,
            variant: 'error',
          })
        )
        return
      }
    }

    // Step 1: Update evidence (evidence-level fields only, NO units/course_id)
    const evidencePayload = {
      title: data.title,
      description: data.description,
      trainer_feedback: data.trainer_feedback,
      learner_comments: data.learner_comments,
      points_for_improvement: data.points_for_improvement,
      assessment_method: data.assessment_method,
      session: data.session,
      grade: data.grade,
      evidence_time_log: data.evidence_time_log,
      declaration: data.declaration,
      id,
      user_id:
        userRole === 'Learner'
          ? learnerUserId
          : evidenceDetails?.data?.user?.user_id,
    }
    try {
      // Upload external feedback file if new file is selected
      if (data.audio && !data.audio?.url) {
        const formData = new FormData()
        formData.append('audio', data.audio)
        const externalPayload = {
          id,
          data: formData,
        }
        await uploadExternalEvidenceFile(externalPayload).unwrap()
      }

      // Update evidence
      await updateEvidenceId(evidencePayload).unwrap()

      // Step 2: Handle mappings for each course/unit/subunit/topic combination
      // Map key: course_id-topic_id (for Qualification, topics are mapped; for Standard, subUnits or units are mapped)
      // Build desired mappings from form state
      const desiredMappings: Map<string, any> = new Map()
      const formUnits = data.units || []

      formUnits.forEach((unit: any) => {
        const courseId = unit.course_id
        const course = selectedCourses.find((c: any) => c.course_id === courseId)
        const isQualification = course?.course_core_type === COURSE_TYPES.QUALIFICATION
        const hasSubUnit = unit.subUnit && unit.subUnit.length > 0

        if (isQualification && hasSubUnit) {
          // For Qualification courses: map topics (Assessment Criteria) only
          unit.subUnit.forEach((subUnit: any) => {
            if (subUnit.topics && Array.isArray(subUnit.topics) && subUnit.topics.length > 0) {
              subUnit.topics.forEach((topic: any) => {
                // Only add to desiredMappings if learnerMap is true
                if (topic.learnerMap === true) {
                  const key = `${courseId}-${topic.id}`
                  desiredMappings.set(key, {
                    assignment_id: Number(id),
                    course_id: Number(courseId),
                    unit_code: String(topic.id), // For qualification, unit_code = topic.id
                    learnerMap: true,
                    trainerMap: topic.trainerMap ?? false,
                    code: topic.code,
                    mapping_id: topic.mapping_id, // For updates (if exists)
                  })
                }
              })
            }
          })
        } else if (hasSubUnit) {
          // For Standard courses: Unit has subunits - create mapping for each subunit
          // Only include mappings where learnerMap is true
          unit.subUnit.forEach((sub: any) => {
            // Only add to desiredMappings if learnerMap is true
            if (sub.learnerMap === true) {
              const key = `${courseId}-${sub.id}`
              desiredMappings.set(key, {
                assignment_id: Number(id),
                course_id: Number(courseId),
                unit_code: String(sub.id),
                learnerMap: true,
                trainerMap: sub.trainerMap ?? false,
                code: sub.code,
                mapping_id: sub.mapping_id, // For updates (if exists)
              })
            }
          })
        } else {
          // Unit-only - create mapping for unit itself (unit_code = unit code)
          // Only include mappings where learnerMap is true
          if (unit.learnerMap === true) {
            const key = `${courseId}-${unit.id}`
            desiredMappings.set(key, {
              assignment_id: Number(id),
              course_id: Number(courseId),
              code: unit.code,
              unit_code: String(unit.id),
              learnerMap: true,
              trainerMap: unit.trainerMap ?? false,
              mapping_id: unit.mapping_id, // For updates (if exists)
            })
          }
        }
      })

      // Upsert mappings and collect mapping IDs
      const allMappingIds: number[] = []
      const desiredMappingsArray = Array.from(desiredMappings.entries())
      
      for (const [key, desiredMapping] of desiredMappingsArray) {
        try {
          // Use merged upsert API - it handles both create and update
          const { mapping_id, ...payload } = desiredMapping
          const result = await upsertMapping(payload).unwrap()
          
          // Extract mapping_id from response
          // Response structure: { status: true, message: "...", data: [{ mapping_id: 11, ... }] }
          let mappingId: number | null = null
          
          if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
            // Get mapping_id from the first item in the data array
            mappingId = result.data[0]?.mapping_id || null
          } else if ((result as any)?.mapping_id) {
            // Fallback: direct mapping_id property
            mappingId = (result as any).mapping_id
          } else if ((result as any)?.id) {
            // Fallback: direct id property
            mappingId = (result as any).id
          } else if ((result as any)?.data?.mapping_id) {
            // Fallback: data.mapping_id (if data is not an array)
            mappingId = (result as any).data.mapping_id
          } else if (mapping_id) {
            // Final fallback: use existing mapping_id from desiredMapping
            mappingId = mapping_id
          }
          
          if (mappingId) {
            allMappingIds.push(mappingId)
          }
        } catch (error) {
          console.warn('Failed to upsert mapping:', error)
        }
      }

      // Step 3: Handle signatures per mapping (if signature_required is set)
      // Get required roles that need signatures
      const requiredRoles = data.signatures
        ?.filter((sig) => sig.signature_required)
        .map((sig) => sig.role) || []

      // Request signatures for each mapping with all required roles as array
      if (requiredRoles.length > 0 && allMappingIds.length > 0) {
        for (const mappingId of allMappingIds) {
          try {   
            await requestSignature({
              id,
              data: {
                roles: requiredRoles,
              },
            }).unwrap()
          } catch (error) {
            // Log error but don't fail the entire submission
            console.warn(`Failed to request signature for mapping ${mappingId}:`, error)
          }
        }
      }

      dispatch(
        showMessage({
          message: 'Update successfully',
          variant: 'success',
        })
      )
      const isAdminOrIQA = ROLES_REDIRECT_TO_QA.includes(userRole as any)
      if (isAdminOrIQA) {
        navigate(`/qa-sample-plan`)
      } else {
        navigate(`/evidenceLibrary`)
      }
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Something went wrong. Please try again.',
          variant: 'error',
        })
      )
    }
  }

  return (
    <Container sx={{ mt: 8, mb: 4 }}>
      <div className='flex items-start justify-between'>
        <Typography variant='h4' component='h1' gutterBottom>
          Evidence Details
        </Typography>
        {isEditMode && (
          <Button
            variant='contained'
            className='rounded-md'
            color='primary'
            sx={{ mb: 2 }}
            startIcon={<i className='material-icons'>edit</i>}
            onClick={() => setIsEditMode(false)}
          >
            Edit
          </Button>
        )}
      </div>
      <Paper
        elevation={1}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 2,
          marginBottom: 3,
          padding: 2,
          minHeight: 64,
          border: '1px solid #e0e0e0',
        }}
      >
        <Box
          display='flex'
          alignItems='center'
          gap={2}
          onClick={() => {
            if (evidenceDetails?.data?.file?.url) {
              openFilePreview(evidenceDetails.data.file.url)
            }
          }}
          sx={{
            cursor: evidenceDetails?.data?.file?.url ? 'pointer' : 'default',
          }}
        >
          <InsertDriveFileOutlinedIcon color='action' />
          <Box>
            <Typography
              variant='body2'
              color='primary'
              sx={{ fontWeight: 500, cursor: 'pointer' }}
            >
              {evidenceDetails?.data?.file?.name}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {evidenceDetails?.data?.file?.size
                ? `${Math.round(evidenceDetails.data.file.size / 1024)} KB`
                : '0 KB'}
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              display='block'
            >
              {evidenceDetails?.data?.user?.first_name}{' '}
              {evidenceDetails?.data?.user?.last_name} on{' '}
              {evidenceDetails?.data?.created_at
                ? new Date(evidenceDetails.data.created_at).toLocaleDateString()
                : ''}
            </Typography>
          </Box>
        </Box>
      </Paper>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='body1' gutterBottom>
              Name
            </Typography>
            <Controller
              name='title'
              control={control}
              render={({ field }) => (
                <TextField
                  size='small'
                  placeholder={'Enter Name'}
                  fullWidth
                  error={!!errors.title}
                  disabled={isEditMode || !canEditLearnerFields}
                  helperText={errors.title?.message}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body1' gutterBottom>
              Description
            </Typography>
            <Controller
              name='description'
              control={control}
              render={({ field }) => (
                <TextField
                  size='small'
                  fullWidth
                  multiline
                  rows={4}
                  disabled={isEditMode || !canEditLearnerFields}
                  error={!!errors.description}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='body1' gutterBottom>
              Trainer feedback
            </Typography>
            <Controller
              name='trainer_feedback'
              control={control}
              render={({ field }) => {
                return (
                  <TextField
                    name='title'
                    size='small'
                    multiline
                    rows={4}
                    fullWidth
                    disabled={isEditMode || !canEditTrainerFields}
                    style={
                      !canEditTrainerFields || isEditMode
                        ? { backgroundColor: 'whitesmoke' }
                        : {}
                    }
                    error={!!errors.trainer_feedback}
                    {...field}
                  />
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='body1' gutterBottom>
              Points for Improvement
            </Typography>
            <Controller
              name='points_for_improvement'
              control={control}
              render={({ field }) => {
                return (
                  <TextField
                    name='title'
                    size='small'
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.points_for_improvement}
                    disabled={isEditMode || !canEditTrainerFields}
                    style={
                      !canEditTrainerFields || isEditMode
                        ? { backgroundColor: 'whitesmoke' }
                        : {}
                    }
                    {...field}
                  />
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body1' gutterBottom>
              Learner Comments
            </Typography>
            <Controller
              name='learner_comments'
              control={control}
              render={({ field }) => (
                <TextField
                  name='title'
                  size='small'
                  fullWidth
                  multiline
                  rows={4}
                  disabled={isEditMode || !canEditLearnerFields}
                  error={!!errors.learner_comments}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body1' gutterBottom>
              Upload External Feedback
            </Typography>
            <Controller
              name='audio'
              control={control}
              render={({ field }) => (
                <FileUploader
                  handleChange={(file: File) => {
                    field.onChange(file)
                  }}
                  name='file'
                  types={fileTypes}
                  multiple={false}
                  maxSize={10}
                  disabled={isEditMode || !canEditLearnerFields}
                >
                  <div
                    className={`relative border border-dashed border-gray-300 p-20 cursor-pointer rounded-md hover:shadow-md transition-all h-[100px] flex flex-col items-center justify-center ${
                      errors.audio ? 'border-red-500' : ''
                    }`}
                    style={isEditMode ? { backgroundColor: 'whitesmoke' } : {}}
                  >
                    <div className='flex justify-center mb-4'>
                      <img
                        src='assets/images/svgImage/uploadimage.svg'
                        alt='Upload'
                        className='w-36 h-36 object-contain mx-auto'
                      />
                    </div>
                    {field.value ? (
                      <>
                        <div className='text-center text-gray-700 font-medium '>
                          <p>{field.value.name}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className='text-center mb-2 text-gray-600'>
                          Drag and drop your files here or{' '}
                          <span className='text-blue-500 underline'>
                            Browse
                          </span>
                        </p>
                        <p className='text-center text-sm text-gray-500'>
                          Max 10MB files are allowed
                        </p>
                      </>
                    )}
                  </div>
                </FileUploader>
              )}
            />
            {errors.audio && (
              <FormHelperText error className='mt-2'>
                {errors.audio.message}
              </FormHelperText>
            )}
          </Grid>
          {evidenceDetails &&
            evidenceDetails.data &&
            evidenceDetails.data.external_feedback && (
              <Grid item xs={12}>
                <Paper
                  elevation={1}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: 2,
                    marginBottom: 3,
                    padding: 2,
                    minHeight: 64,
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Box
                    display='flex'
                    alignItems='center'
                    gap={2}
                    onClick={() =>
                      openFilePreview(
                        evidenceDetails.data.external_feedback?.url
                      )
                    }
                    sx={{ cursor: 'pointer' }}
                  >
                    <InsertDriveFileOutlinedIcon color='action' />
                    <Box>
                      <Typography
                        variant='body2'
                        color='primary'
                        sx={{ fontWeight: 500, cursor: 'pointer' }}
                      >
                        {evidenceDetails.data.external_feedback?.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {Math.round(
                          evidenceDetails.data.external_feedback.size / 1024
                        )}{' '}
                        KB
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        display='block'
                      >
                        {new Date(
                          evidenceDetails.data.external_feedback.uploaded_at
                        ).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            )}
          <Grid item xs={12}>
            <Typography variant='body1' gutterBottom>
              Evidence Method
            </Typography>

            <FormGroup row>
              {assessmentMethod.map((method) => (
                <Tooltip key={method.value} title={method.title}>
                  <FormControlLabel
                    control={
                      <Controller
                        name='assessment_method'
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value?.includes(method.value)}
                            disabled={isEditMode || !canEditLearnerFields}
                            onChange={(e) => {
                              const newValue = [...(field.value || [])]
                              if (e.target.checked) {
                                newValue.push(method.value)
                              } else {
                                const index = newValue.indexOf(method.value)
                                if (index > -1) newValue.splice(index, 1)
                              }
                              field.onChange(newValue)
                            }}
                          />
                        )}
                      />
                    }
                    label={method.value}
                  />
                </Tooltip>
              ))}
         
            </FormGroup>
              {errors.assessment_method && (
                <FormHelperText error>
                  {errors.assessment_method.message}
                </FormHelperText>
              )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body1' gutterBottom>
              Evidence to be used in time log?
            </Typography>
            <Controller
              name='evidence_time_log'
              control={control}
              render={({ field }) => (
                <FormControl
                  component='fieldset'
                  error={!!errors.evidence_time_log}
                >
                  <RadioGroup
                    row
                    value={
                      field.value === true
                        ? 'yes'
                        : field.value === false
                        ? 'no'
                        : ''
                    }
                    onChange={(e) => {
                      const newValue = e.target.value === 'yes'
                      field.onChange(newValue)
                      if (!isEditMode) {
                        handleEvidenceTimeLogChange(newValue)
                      }
                    }}
                  >
                    <FormControlLabel
                      value='yes'
                      control={
                        <Radio disabled={isEditMode || !canEditLearnerFields} />
                      }
                      label='Yes'
                    />
                    <FormControlLabel
                      value='no'
                      control={
                        <Radio disabled={isEditMode || !canEditLearnerFields} />
                      }
                      label='No'
                    />
                  </RadioGroup>
                  {errors.evidence_time_log && (
                    <FormHelperText>
                      {errors.evidence_time_log.message}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='body1' gutterBottom>
              Session
            </Typography>
            <Controller
              name='session'
              control={control}
              rules={{ required: 'Please select a session' }}
              render={({ field }) => (
                <FormControl fullWidth size='small' error={!!errors.session}>
                  <InputLabel id='session-label'>Select Session</InputLabel>
                  <Select
                    labelId='session-label'
                    label='Select Session'
                    disabled={isEditMode || !canEditLearnerFields}
                    {...field}
                  >
                    {isLoadingLearnerPlan ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading sessions...
                      </MenuItem>
                    ) : sessions?.length > 0 ? (
                      sessions.map((session) => (
                        <MenuItem key={session.id} value={session.id}>
                          {session.label}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No sessions available</MenuItem>
                    )}
                  </Select>
                  {errors.session && (
                    <FormHelperText>{errors.session.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='body1' gutterBottom>
              Grade
            </Typography>
            <Controller
              name='grade'
              control={control}
              render={({ field }) => (
                <TextField
                  name='title'
                  size='small'
                  fullWidth
                  disabled={isEditMode || !canEditLearnerFields}
                  error={!!errors.grade}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body1' gutterBottom>
              Select Courses
            </Typography>
            {isLoadingLearnerCourses ? (
              <CircularProgress size={24} />
            ) : (
              <Controller
                name="selectedCourses"
                control={control}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    multiple
                    options={learnerCoursesData || []}
                    getOptionLabel={(option: any) =>
                      `${option.course_name} (${option.course_core_type})`
                    }
                    value={field.value || []}
                    disabled={isEditMode || !canEditLearnerFields}
                    onChange={(event, newValue) => {
                      const selected = newValue || []
                      const currentValue = field.value || []

                      // Use getValues() once to get all current form values
                      const formValues = getValues()
                      const currentCourseSelectedTypes = formValues.courseSelectedTypes || {}
                      const currentUnits = formValues.units || []

                      // Calculate removed courses
                      const removed = currentValue.filter(
                        (c) => !selected.some((s: any) => s.course_id === c.course_id)
                      )

                      // Prepare updates for courseSelectedTypes
                      let updatedCourseSelectedTypes = { ...currentCourseSelectedTypes }
                      
                      // Initialize type selection for newly selected Standard courses
                      selected.forEach((course: any) => {
                        if (
                          course.course_core_type === COURSE_TYPES.STANDARD &&
                          !updatedCourseSelectedTypes[course.course_id]
                        ) {
                          updatedCourseSelectedTypes[course.course_id] = []
                        }
                      })

                      // Remove type selection for deselected courses
                      removed.forEach((course: any) => {
                        delete updatedCourseSelectedTypes[course.course_id]
                      })

                      // Prepare units update (remove units for deselected courses)
                      let updatedUnits = currentUnits
                      if (removed.length > 0) {
                        const removedCourseIds = removed.map((c: any) => c.course_id)
                        updatedUnits = currentUnits.filter(
                          (unit) => !removedCourseIds.includes(unit.course_id)
                        )
                      }

                      // Batch all updates together - update selectedCourses first, then other fields
                      field.onChange(selected)
                      
                      // Only update courseSelectedTypes if it changed
                      if (JSON.stringify(updatedCourseSelectedTypes) !== JSON.stringify(currentCourseSelectedTypes)) {
                        setValue('courseSelectedTypes', updatedCourseSelectedTypes, { 
                          shouldDirty: false, 
                          shouldTouch: false,
                          shouldValidate: false
                        })
                      }

                      // Only update units if they changed
                      if (removed.length > 0 && updatedUnits.length !== currentUnits.length) {
                        setValue('units', updatedUnits, {
                          shouldValidate: false,
                          shouldDirty: false,
                          shouldTouch: false,
                        })
                      }
                    }}
                    isOptionEqualToValue={(option: any, value: any) =>
                      option.course_id === value.course_id
                    }
                    renderTags={(value, getTagProps) =>
                      value.map((option: any, index: number) => (
                        <Chip
                          label={`${option.course_name} (${option.course_core_type})`}
                          {...getTagProps({ index })}
                          key={option.course_id}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size='small'
                        label='Select Courses'
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message || ''}
                      />
                    )}
                  />
                )}
              />
            )}
          </Grid>
          <Grid item xs={12}>
            {/* Type Filter for Standard Courses - Show for each selected Standard course */}
            {selectedCourses
              .filter((course) => course.course_core_type === COURSE_TYPES.STANDARD)
              .map((course) => (
                <Box key={course.course_id} sx={{ mb: 2 }}>
                <Typography variant='body1' sx={{ mb: 1, fontWeight: 500 }}>
                    {course.course_name} - Select Type:
                </Typography>
                <FormGroup row>
                    {[UNIT_TYPES.KNOWLEDGE, UNIT_TYPES.BEHAVIOUR, UNIT_TYPES.SKILLS].map(
                      (type) => {
                        const selectedTypes = courseSelectedTypes[course.course_id] || []
                        const isSelected = Array.isArray(selectedTypes) ? selectedTypes.includes(type) : false
                        return (
                          <FormControlLabel
                            key={type}
                            control={
                              <Checkbox
                                checked={isSelected}
                                onChange={(e) => {
                                  const checked = e.target.checked
                                  const currentCourseSelectedTypes = watch('courseSelectedTypes') || {}
                                  const currentSelectedTypes = currentCourseSelectedTypes[course.course_id] || []
                                  
                                  if (checked) {
                                    // Add type to array
                                    const updatedTypes = Array.isArray(currentSelectedTypes) 
                                      ? [...currentSelectedTypes, type]
                                      : [type]
                                    setValue('courseSelectedTypes', {
                                      ...currentCourseSelectedTypes,
                                      [course.course_id]: updatedTypes,
                                    })
                                    
                                    // Add units for this type
                                    const currentUnits = unitsWatch || []
                                    const unitsToKeep = currentUnits.filter(
                                      (u) => !(u.course_id === course.course_id && u.type === type)
                                    )
                                    
                                    const courseUnits = course.units || []
                                    const filteredUnits = courseUnits.filter(
                                      (unit: any) => unit.type === type
                                    )
                                    
                                    const initializedUnits = filteredUnits.map((method: any) => {
                                      const hasSubUnit =
                                        method.subUnit &&
                                        Array.isArray(method.subUnit) &&
                                        method.subUnit.length > 0

                                      return {
                                        ...method,
                                        course_id: course.course_id,
                                        type: method.type,
                                        code: method.code,
                                        subUnit: hasSubUnit
                                          ? method.subUnit.map((sub: any) => ({
                                              ...sub,
                                              learnerMap: false,
                                              trainerMap: false,
                                              signedOff: false,
                                              comment: '',
                                            }))
                                          : [],
                                        learnerMap: hasSubUnit ? undefined : false,
                                        trainerMap: hasSubUnit ? undefined : false,
                                        signedOff: hasSubUnit ? undefined : false,
                                        comment: hasSubUnit ? undefined : '',
                                      }
                                    })
                                    
                                    setValue('units', [...unitsToKeep, ...initializedUnits], {
                                      shouldValidate: true,
                                    })
                                  } else {
                                    // Remove type from array
                                    const updatedTypes = Array.isArray(currentSelectedTypes)
                                      ? currentSelectedTypes.filter((t: string) => t !== type)
                                      : []
                                    setValue('courseSelectedTypes', {
                                      ...currentCourseSelectedTypes,
                                      [course.course_id]: updatedTypes,
                                    })
                                    
                                    // Remove ALL units of this type
                                    const currentUnits = unitsWatch || []
                                    const updatedUnits = currentUnits.filter(
                                      (u) => !(u.course_id === course.course_id && u.type === type)
                                    )
                                    setValue('units', updatedUnits, {
                                      shouldValidate: true,
                                    })
                                  }
                                }}
                                disabled={isEditMode || !canEditLearnerFields}
                              />
                            }
                            label={type}
                          />
                        )
                      }
                    )}
                </FormGroup>
                  {/* Show validation error if type not selected (only after form submission attempt) */}
                  {isSubmitted && (!courseSelectedTypes[course.course_id] || (Array.isArray(courseSelectedTypes[course.course_id]) && courseSelectedTypes[course.course_id].length === 0)) && (
                    <FormHelperText error>
                      Please select at least one type for {course.course_name}
                    </FormHelperText>
                  )}
                  {isSubmitted && errors.courseSelectedTypes && (
                    <FormHelperText error>
                      {typeof errors.courseSelectedTypes.message === 'string' 
                        ? errors.courseSelectedTypes.message 
                        : 'Please select at least one type for all Standard courses'}
                    </FormHelperText>
                  )}
              </Box>
              ))}
          </Grid>
          <Grid item xs={12}>
            {/* Unit selection for Qualification courses - Show for each selected Qualification course */}
            {selectedCourses
              .filter((course) => course.course_core_type === COURSE_TYPES.QUALIFICATION)
              .map((course) => (
                <Box key={course.course_id} sx={{ mb: 2 }}>
                <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
                    {course.course_name} - Select Units:
                </Typography>
                <FormGroup row>
                    {course.units?.map((unit: any) => (
                    <FormControlLabel
                      key={unit.id}
                      control={
                        <Checkbox
                            checked={
                              (unitsWatch || []).some(
                                (u) =>
                                  String(u.id) === String(unit.id) &&
                                  u.course_id === course.course_id
                              )
                            }
                          disabled={isEditMode || !canEditLearnerFields}
                          onChange={(e) => {
                              const currentUnits = unitsWatch || []
                            if (e.target.checked) {
                              // Auto-add unit to form if not already present
                              if (
                                !currentUnits.some(
                                    (u) =>
                                      String(u.id) === String(unit.id) &&
                                      u.course_id === course.course_id
                                )
                              ) {
                                const hasSubUnit =
                                  unit.subUnit &&
                                  Array.isArray(unit.subUnit) &&
                                  unit.subUnit.length > 0
                                const unitToAdd = {
                                  ...unit,
                                    course_id: course.course_id,
                                    // Qualification units don't have unit-level mapping
                                    learnerMap: undefined,
                                    trainerMap: undefined,
                                    signedOff: undefined,
                                    comment: undefined,
                                  subUnit: hasSubUnit
                                      ? unit.subUnit.map((sub: any) => {
                                          // For Qualification: subUnits (Learning Outcomes) don't have mapping
                                          // Only topics (Assessment Criteria) have mapping
                                          const hasTopics = sub.topics && Array.isArray(sub.topics) && sub.topics.length > 0
                                          return {
                                        ...sub,
                                            learnerMap: undefined,
                                            trainerMap: undefined,
                                            signedOff: undefined,
                                            comment: undefined,
                                            topics: hasTopics
                                              ? sub.topics.map((topic: any) => ({
                                                  ...topic,
                                                  learnerMap: false,
                                          trainerMap: false,
                                          signedOff: false,
                                          comment: '',
                                      }))
                                              : [],
                                          }
                                        })
                                    : [],
                                }
                                setValue(
                                  'units',
                                  [...currentUnits, unitToAdd],
                                  { shouldValidate: false }
                                )
                              }
                            } else {
                                // Remove unit from form when unchecked
                                const updatedUnits = currentUnits.filter(
                                  (u) =>
                                    !(
                                      String(u.id) === String(unit.id) &&
                                      u.course_id === course.course_id
                                    )
                              )
                                setValue('units', updatedUnits, {
                                  shouldValidate: false,
                                })
                            }
                          }}
                        />
                      }
                      label={unit.title}
                    />
                  ))}
                </FormGroup>
                  {/* Show validation error if no units selected (only after form submission attempt) */}
                  {isSubmitted && !unitsWatch?.some(
                    (u) => u.course_id === course.course_id
                  ) && (
                    <FormHelperText error>
                      Please select at least one unit for {course.course_name}
                    </FormHelperText>
                  )}
                </Box>
              ))}

            {/* Show units table for each selected course */}
            {selectedCourses.length > 0 && (
              <Box sx={{ mt: 3 }}>
                {selectedCourses.map((course) => {
                  // For Standard courses, show units based on selected types
                  if (course.course_core_type === COURSE_TYPES.STANDARD) {
                    const selectedTypes = courseSelectedTypes[course.course_id] || []
                    if (!Array.isArray(selectedTypes) || selectedTypes.length === 0) return null

                    // Get units for this course and all selected types from unitsWatch
                    const typeUnits = (unitsWatch || []).filter(
                      (unit) =>
                        selectedTypes.includes(unit.type) &&
                        unit.course_id === course.course_id
                    )

                    if (typeUnits.length === 0) {
                      // Initialize units for this type from course data
                      // Always reset to unchecked state when switching types
                      const courseUnits = course.units || []
                      const filteredUnits = courseUnits.filter(
                        (unit: any) => selectedTypes.includes(unit.type)
                      )
                      if (filteredUnits.length > 0) {
                        const currentUnits = unitsWatch || []
                        // Remove existing units of selected types if any (to reset them)
                        const unitsWithoutSelectedTypes = currentUnits.filter(
                          (u) =>
                            !(
                              u.course_id === course.course_id &&
                              selectedTypes.includes(u.type)
                            )
                        )
                        
                        // Initialize units with all learnerMap values set to false
                        const initializedUnits = filteredUnits.map((method) => {
                          const hasSubUnit =
                            method.subUnit &&
                            Array.isArray(method.subUnit) &&
                            method.subUnit.length > 0

                          return {
                            ...method,
                            course_id: course.course_id,
                            type: method.type,
                            code: method.code,
                            subUnit: hasSubUnit
                              ? method.subUnit.map((sub) => ({
                                  ...sub,
                                  learnerMap: false, // Always start as false
                                  trainerMap: false,
                                  signedOff: false,
                                  comment: '',
                                }))
                              : [],
                            learnerMap: hasSubUnit ? undefined : false, // Always start as false
                            trainerMap: hasSubUnit ? undefined : false,
                            signedOff: hasSubUnit ? undefined : false,
                            comment: hasSubUnit ? undefined : '',
                          }
                        })
                        // Replace units of selected types with fresh ones (unchecked)
                        const newUnits = [...unitsWithoutSelectedTypes, ...initializedUnits]
                        setValue('units', newUnits, { shouldValidate: false })
                        return null // Will re-render with units
                      }
                      // If no units found, show message or return null
                      return null
                    }

                    // Group units by type and show one table per type
                    // Group typeUnits by their type
                    const unitsByType = new Map<string, typeof typeUnits>()
                    typeUnits.forEach((unit) => {
                      const unitType = unit.type || ''
                      if (!unitsByType.has(unitType)) {
                        unitsByType.set(unitType, [])
                      }
                      unitsByType.get(unitType)!.push(unit)
                    })

                    return (
                      <Box key={course.course_id} sx={{ mb: 3 }}>
                        {Array.from(unitsByType.entries()).map(([unitType, unitsOfType]) => {
                          // Combine all subUnits from all units of this type
                          const combinedSubUnits: any[] = []
                          unitsOfType.forEach((unit) => {
                            const hasSubUnit = unit.subUnit && unit.subUnit.length > 0
                            if (hasSubUnit) {
                              unit.subUnit.forEach((sub) => {
                                combinedSubUnits.push({
                                  ...sub,
                                  unitId: unit.id,
                                  unitTitle: unit.title,
                                  courseId: course.course_id,
                                })
                              })
                            } else {
                              // If unit doesn't have subUnit, add the unit itself
                              combinedSubUnits.push({
                                id: unit.id,
                                title: unit.title,
                                learnerMap: unit.learnerMap ?? false,
                                trainerMap: unit.trainerMap ?? false,
                                signedOff: unit.signedOff ?? false,
                                comment: unit.comment ?? '',
                                unitId: unit.id,
                                unitTitle: unit.title,
                                courseId: course.course_id,
                              })
                            }
                          })

                          if (combinedSubUnits.length === 0) return null

                          // Calculate validation message
                          const validationMessage = isSubmitted ? (() => {
                            const hasLearnerMapSelected = combinedSubUnits.some((sub) => {
                              const unit = unitsOfType.find((u) => u.id === sub.unitId)
                              const hasSubUnit = unit?.subUnit && unit.subUnit.length > 0
                              
                              if (!hasSubUnit) {
                                const currentUnit = (unitsWatch || []).find(
                                  (u) => String(u.id) === String(sub.id || sub.unitId) && u.course_id === course.course_id
                                )
                                return currentUnit?.learnerMap === true
                              } else {
                                const currentUnit = (unitsWatch || []).find(
                                  (u) => String(u.id) === String(sub.unitId) && u.course_id === course.course_id
                                )
                                const currentSubUnit = currentUnit?.subUnit?.find(
                                  (s) => String(s.id) === String(sub.id)
                                )
                                return currentSubUnit?.learnerMap === true
                              }
                            })
                            
                            return !hasLearnerMapSelected && (errors?.units as any)?.message
                              ? `At least one unit must have Learner Map selected for ${course.course_name} - ${unitType}`
                              : undefined
                          })() : undefined

                          return (
                            <Box key={unitType} sx={{ mb: 3 }}>
                              <UnitsTable
                                variant='combined'
                                title={`${course.course_name} - ${unitType} Units`}
                                rows={combinedSubUnits}
                                unitsWatch={unitsWatch || []}
                                courseId={course.course_id}
                                isEditMode={isEditMode}
                                canEditLearnerFields={canEditLearnerFields}
                                canEditTrainerFields={canEditTrainerFields}
                                isSubmitted={isSubmitted}
                                errors={errors}
                                learnerMapHandler={learnerMapHandler}
                                trainerMapHandler={trainerMapHandler}
                                signedOffHandler={signedOffHandler}
                                commentHandler={commentHandler}
                                selectAllSignedOffForCombinedHandler={selectAllSignedOffForCombinedHandler}
                                getEvidenceCount={getEvidenceCount}
                                setValue={setValue}
                                trigger={trigger}
                                validationMessage={validationMessage}
                                combinedSubUnits={combinedSubUnits}
                              />
                            </Box>
                          )
                        })}
                      </Box>
                    )
                  } else if (course.course_core_type === COURSE_TYPES.QUALIFICATION) {
                    // For Qualification courses: Show hierarchical structure
                    // Unit → Learning Outcomes (subUnit) → Assessment Criteria (topics)
                    // Get units for this course from unitsWatch (only show manually selected units)
                    const displayUnits = (unitsWatch || []).filter(
                      (units) =>
                        units.course_id === course.course_id
                    )

                    // Don't auto-initialize units - only show units that user has manually selected
                    if (displayUnits.length === 0) {
                      return null
                    }

                    return (
                      <Box key={course.course_id} sx={{ mb: 3 }}>
                        <Typography
                          variant='h6'
                          sx={{ mb: 2, color: 'primary.main' }}
                        >
                          {course.course_name} - Units
                        </Typography>
                        {displayUnits.map((unit) => {
                      const unitIndex = unitsWatch.findIndex(
                            (u) => u.id === unit.id
                      )

                      return (
                            <QualificationHierarchy
                              key={unit.id}
                              unit={unit}
                              unitsWatch={unitsWatch || []}
                              courseId={course.course_id}
                              courseName={course.course_name}
                              isEditMode={isEditMode}
                              canEditLearnerFields={canEditLearnerFields}
                              canEditTrainerFields={canEditTrainerFields}
                              isSubmitted={isSubmitted}
                              errors={errors}
                              learnerMapHandler={qualificationLearnerMapHandler}
                              trainerMapHandler={qualificationTrainerMapHandler}
                              signedOffHandler={qualificationSignedOffHandler}
                              commentHandler={qualificationCommentHandler}
                              getEvidenceCount={getEvidenceCount}
                              setValue={setValue}
                              trigger={trigger}
                              unitIndex={unitIndex}
                            />
                      )
                        })}
                      </Box>
                    )
                  }
                  return null
                })}
              </Box>
            )}
          </Grid>
          <Grid item xs={12}>
            <SignatureTable
              control={control}
              errors={errors}
              watch={watch}
              disabled={isEditMode || !canEditLearnerFields}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name='declaration'
              control={control}
              render={({ field }) => {
                return (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        color='primary'
                        disabled={isEditMode || !canEditLearnerFields}
                      />
                    }
                    label={
                      <Typography variant='body1'>
                        Please tick to confirm.
                        <br />I declare that all material in this submission is
                        my own work except where there is clear acknowledgement
                        and appropriate reference to the work of others.
                      </Typography>
                    }
                  />
                )
              }}
            />
            {errors.declaration && (
              <FormHelperText error>
                {errors.declaration.message}
              </FormHelperText>
            )}
          </Grid>
          <Grid item xs={12} className='w-full flex justify-end gap-10'>
            <Button
              variant='contained'
              color='secondary'
              className='rounded-md'
              disabled={isUpdateLoading}
              onClick={() => {
                const isAdminOrIQA = ['Trainer', 'Admin', 'IQA'].includes(
                  userRole
                )
                if (isAdminOrIQA) {
                  navigate(`/qa-sample-plan`)
                } else {
                  navigate(`/evidenceLibrary`)
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              color='primary'
              className='rounded-md'
              type='submit'
              disabled={isUpdateLoading || isRequestingSignature || isEditMode}
            >
              {isUpdateLoading || isRequestingSignature ? (
                <span className='flex items-center gap-5'>
                  <CircularProgress size={24} />
                  Updating...
                </span>
              ) : (
                <>Update</>
              )}
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Time Log Dialog */}
      <Dialog
        open={isTimeLogDialogOpen}
        onClose={handleTimeLogDialogClose}
        maxWidth='md'
        fullWidth
        sx={{
          '.MuiDialog-paper': {
            borderRadius: 3,
            padding: 0,
            maxHeight: '90vh',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <NewTimeLog
            edit='Save'
            handleCloseDialog={handleTimeLogDialogClose}
            handleDataUpdate={handleTimeLogDataUpdate}
            timeLogData={timeLogData}
            setTimeLogData={setTimeLogData}
            filterData={{}}
          />
        </DialogContent>
      </Dialog>
    </Container>
  )
}

export default CreateViewEvidenceLibrary
