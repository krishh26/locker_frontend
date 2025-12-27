import { useEffect, useState, useCallback, useRef } from 'react'
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
  useDeleteAssignmentMappingMutation,
  useUpdateMappingPCMutation,
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
import { FormValues } from './lib/types'
import { getValidationSchema } from './schema'

const CreateViewEvidenceLibrary = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isEditMode, setIsEditMode] = useState<boolean>(
    location.state && location.state?.isEdit
  )
  const [sessions, setSessions] = useState([])
  const [isTimeLogDialogOpen, setIsTimeLogDialogOpen] = useState(false)
  const [selectedUnitType, setSelectedUnitType] = useState<string | null>(null)
  // selectedCourses and courseSelectedTypes are now managed by React Hook Form
  const [timeLogData, setTimeLogData] = useState({
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
  console.log("🚀 ~ CreateViewEvidenceLibrary ~ learner:", learner)
  
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
    resolver: yupResolver(getValidationSchema(userRole)),
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
      declaration: ['Trainer', 'Admin', 'IQA'].includes(userRole)
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
  const learnerCoursesData = learner?.course
    ? learner.course
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
        .filter((course: any) => course?.course_core_type !== 'Gateway')
    : []
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
  const [deleteMapping] = useDeleteAssignmentMappingMutation()
  const [updateMappingPC] = useUpdateMappingPCMutation()

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
    const courseSelectedTypesObj: Record<string | number, string> = {}
    const unitsArray: any[] = []

    mappingsByCourse.forEach((courseMappings, courseId) => {
      const course = courses.find((c: any) => c.course_id === courseId)
      if (!course) return

      selectedCoursesArray.push(course)

      // For Standard courses, determine selected type from mappings
      if (course.course_core_type === 'Standard') {
        // Find the first mapping's unit type
        const firstMapping = courseMappings[0]
        const unitIdOrRef = firstMapping?.unit_code || firstMapping?.unit_ref
        if (unitIdOrRef && course.units) {
          // unit_code now contains unit ID, so match by id first, then fallback to code for backward compatibility
          const matchedUnit = course.units.find(
            (u: any) => String(u.id) === String(unitIdOrRef) || u.code === unitIdOrRef || u.unit_ref === unitIdOrRef
          )
          if (matchedUnit?.type) {
            courseSelectedTypesObj[courseId] = matchedUnit.type
          }
        }
      }

      // Reconstruct units from mappings + course structure
      const courseUnits = course.units || []
      const unitsMap = new Map<string, any>()

      courseMappings.forEach((mapping) => {
        // unit_code now contains the unit ID (not code), but keep backward compatibility with unit_ref
        const unitIdOrRef = mapping.unit_code || mapping.unit_ref
        // Support both sub_unit_id (new API) and sub_unit_ref (old API)
        const subUnitRef = mapping.sub_unit_id || mapping.sub_unit_ref
        
        // For Qualification courses: when sub_unit_id is null, unit_code might be a sub-unit ID
        if (course.course_core_type === 'Qualification' && (subUnitRef === null || subUnitRef === undefined)) {
          // Try to find it as a subUnit ID first
          let foundSubUnit: any = null
          let foundUnit: any = null
          
          for (const unit of courseUnits) {
            if (unit.subUnit && Array.isArray(unit.subUnit) && unit.subUnit.length > 0) {
              const subunit = unit.subUnit.find(
                (s: any) => String(s.id) === String(unitIdOrRef) || s.code === unitIdOrRef
              )
              if (subunit) {
                foundSubUnit = subunit
                foundUnit = unit
                break
              }
            }
          }
          
          if (foundSubUnit && foundUnit) {
            // It's a sub-unit mapping for Qualification course
            const unitKey = `${courseId}-${foundUnit.id || foundUnit.code}`
            if (!unitsMap.has(unitKey)) {
              unitsMap.set(unitKey, {
                ...foundUnit,
                course_id: courseId,
                type: foundUnit.type,
                code: foundUnit.code || foundUnit.unit_ref,
                subUnit: [],
                mapping_id: mapping.mapping_id, // Store mapping_id for updates
              })
            }
            
            const unitData = unitsMap.get(unitKey)!
            const existingSubUnit = unitData.subUnit.find(
              (s: any) => s.id === foundSubUnit.id || s.code === foundSubUnit.code
            )
            
            if (!existingSubUnit) {
              // Support both camelCase (learnerMap) and snake_case (learner_map) from API
              const learnerMap = mapping.learnerMap ?? mapping.learner_map ?? false
              const trainerMap = mapping.trainerMap ?? mapping.trainer_map ?? false
              const signedOff = mapping.signedOff ?? mapping.signed_off ?? false
              const comment = mapping.comment ?? ''
              
              unitData.subUnit.push({
                ...foundSubUnit,
                learnerMap,
                trainerMap,
                signedOff,
                comment,
                mapping_id: mapping.mapping_id,
              })
            }
            return // Skip the rest of the logic for this mapping
          }
        }
        
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
  const canEditLearnerFields = userRole === 'Learner'
  const canEditTrainerFields = ['Trainer', 'IQA'].includes(userRole)

  if (isLoading) {
    return (
      <Container sx={{ mt: 8, mb: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Loading Evidence Details...
        </Typography>
      </Container>
    )
  }

  const openFilePreview = (url) => {
    if (url) {
      window.open(url, '_blank')
    } else {
      console.error('File URL is not available')
    }
  }

  const learnerMapHandler = (row) => {
    const updated = [...unitsWatch]
    updated.forEach((unit) => {
      // Handle units with subUnit
      if (unit.subUnit && unit.subUnit.length > 0) {
        unit.subUnit.forEach((sub) => {
          if (sub.id === row.id) {
            sub.learnerMap = !(sub.learnerMap ?? false)
          }
        })
      } else {
        // Handle units without subUnit (unit-level)
        if (unit.id === row.id) {
          unit.learnerMap = !(unit.learnerMap ?? false)
        }
      }
    })
    setValue('units', updated)
    trigger('units')
  }

  const selectAllLearnerMapHandler = (unitIndex, checked) => {
    const updated = [...unitsWatch]
    const unit = updated[unitIndex]
    if (unit) {
      // Handle units with subUnit
      if (unit.subUnit && unit.subUnit.length > 0) {
        unit.subUnit.forEach((sub) => {
          sub.learnerMap = checked
        })
      } else {
        // Handle units without subUnit (unit-level)
        unit.learnerMap = checked
      }
    }
    setValue('units', updated)
    trigger('units')
  }

  const trainerMapHandler = (row) => {
    const updated = [...unitsWatch]
    updated.forEach((unit) => {
      // Handle units with subUnit
      if (unit.subUnit && unit.subUnit.length > 0) {
        unit.subUnit.forEach((sub) => {
          if (sub.id === row.id) {
            sub.trainerMap = !(sub.trainerMap ?? false)
            // Reset signedOff if trainerMap is unchecked
            if (!sub.trainerMap) {
              sub.signedOff = false
            }
          }
        })
      } else {
        // Handle units without subUnit (unit-level)
        if (unit.id === row.id) {
          unit.trainerMap = !(unit.trainerMap ?? false)
          // Reset signedOff if trainerMap is unchecked
          if (!unit.trainerMap) {
            unit.signedOff = false
          }
        }
      }
    })
    setValue('units', updated)
  }

  const signedOffHandler = (row) => {
    const updated = [...unitsWatch]
    updated.forEach((unit) => {
      // Handle units with subUnit
      if (unit.subUnit && unit.subUnit.length > 0) {
        unit.subUnit.forEach((sub) => {
          if (sub.id === row.id) {
            sub.signedOff = !(sub.signedOff ?? false)
          }
        })
      } else {
        // Handle units without subUnit (unit-level)
        if (unit.id === row.id) {
          unit.signedOff = !(unit.signedOff ?? false)
        }
      }
    })
    setValue('units', updated)
  }

  const selectAllSignedOffHandler = (unitIndex, checked) => {
    const updated = [...unitsWatch]
    const unit = updated[unitIndex]
    if (unit) {
      // First, determine current state from unitsWatch to handle toggle correctly
      let allCurrentlySignedOff = false
      
      if (unit.subUnit && unit.subUnit.length > 0) {
        const eligibleItems = unit.subUnit.filter(
          (sub) => (sub.learnerMap ?? false) && (sub.trainerMap ?? false)
        )
        allCurrentlySignedOff = eligibleItems.length > 0 && 
          eligibleItems.every((sub) => sub.signedOff ?? false)
      } else {
        if ((unit.learnerMap ?? false) && (unit.trainerMap ?? false)) {
          allCurrentlySignedOff = unit.signedOff ?? false
        }
      }
      
      // Determine target state: if all are signed off, uncheck; otherwise, check
      // Ignore the 'checked' parameter and determine from actual state
      const targetState = allCurrentlySignedOff ? false : true
      
      // Handle units with subUnit
      if (unit.subUnit && unit.subUnit.length > 0) {
        unit.subUnit.forEach((sub) => {
          // Only process items that have both learnerMap and trainerMap checked
          if ((sub.learnerMap ?? false) && (sub.trainerMap ?? false)) {
            sub.signedOff = targetState
          }
        })
      } else {
        // Handle units without subUnit (unit-level)
        // Only process if both learnerMap and trainerMap are checked
        if ((unit.learnerMap ?? false) && (unit.trainerMap ?? false)) {
          unit.signedOff = targetState
        }
      }
      setValue('units', updated)
      trigger('units')
    }
  }

  const selectAllSignedOffForCombinedHandler = (combinedSubUnits, checked) => {
    const updated = [...unitsWatch]
    
    // Get all eligible items from the current state (not from combinedSubUnits which might be stale)
    const eligibleItems: Array<{ unit: any; usub?: any; isSubUnit: boolean }> = []
    
    combinedSubUnits.forEach((sub) => {
      const unit = updated.find((u) => u.id === sub.unitId)
      if (!unit) return
      
      if (unit.subUnit && unit.subUnit.length > 0) {
        const usub = unit.subUnit.find((u) => u.id === sub.id)
        if (usub && (usub.learnerMap ?? false) && (usub.trainerMap ?? false)) {
          eligibleItems.push({ unit, usub, isSubUnit: true })
        }
      } else {
        if ((unit.learnerMap ?? false) && (unit.trainerMap ?? false)) {
          eligibleItems.push({ unit, isSubUnit: false })
        }
      }
    })
    
    // Check current state: are all eligible items signed off?
    const allCurrentlySignedOff = eligibleItems.length > 0 && 
      eligibleItems.every((item) => {
        if (item.isSubUnit) {
          return item.usub.signedOff ?? false
        } else {
          return item.unit.signedOff ?? false
        }
      })
    
    // Determine the target state: if all are signed off, uncheck; otherwise, check
    // Ignore the 'checked' parameter and determine from actual state
    const targetState = allCurrentlySignedOff ? false : true
    
    // Apply the target state to all eligible items
    eligibleItems.forEach((item) => {
      if (item.isSubUnit) {
        item.usub.signedOff = targetState
      } else {
        item.unit.signedOff = targetState
      }
    })

    setValue('units', updated)
    trigger('units')
  }

  const commentHandler = (e, id) => {
    const updated = [...unitsWatch]
    updated.forEach((unit) => {
      // Handle units with subUnit
      if (unit.subUnit && unit.subUnit.length > 0) {
        unit.subUnit.forEach((sub) => {
          if (sub.id === id) {
            sub.comment = e.target.value
          }
        })
      } else {
        // Handle units without subUnit (unit-level)
        if (unit.id === id) {
          unit.comment = e.target.value
        }
      }
    })
    setValue('units', updated)
  }

  // Handle time log data update
  const handleTimeLogDataUpdate = (e) => {
    const { name, value } = e.target
    setTimeLogData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // Handle evidence time log radio change
  const handleEvidenceTimeLogChange = (value: boolean) => {
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
  }

  // Handle time log dialog close
  const handleTimeLogDialogClose = () => {
    setIsTimeLogDialogOpen(false)
  }

  // Handle time log submission success
  const handleTimeLogSubmitSuccess = () => {
    setIsTimeLogDialogOpen(false)
    dispatch(
      showMessage({
        message: 'Time log created successfully',
        variant: 'success',
      })
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
      (c) => c.course_core_type === 'Standard'
    )
    for (const course of standardCourses) {
      if (!data.courseSelectedTypes || !data.courseSelectedTypes[course.course_id]) {
        dispatch(
          showMessage({
            message: `Please select a type for ${course.course_name}`,
            variant: 'error',
          })
        )
        return
      }
    }

    // Validate Qualification courses have units selected
    const qualificationCourses = data.selectedCourses.filter(
      (c) => c.course_core_type === 'Qualification'
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

      // Step 2: Handle mappings for each course/unit/subunit combination
      // Map key: course_id-unit_code (using unit_code instead of unit_ref/sub_unit_ref)
      // Build desired mappings from form state
      const desiredMappings: Map<string, any> = new Map()
      const formUnits = data.units || []

      formUnits.forEach((unit: any) => {
        const courseId = unit.course_id
        const hasSubUnit = unit.subUnit && unit.subUnit.length > 0

        if (hasSubUnit) {
          // Unit has subunits - create mapping for each subunit (unit_code = subunit code)
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
      const isAdminOrIQA = ['Admin', 'IQA'].includes(userRole)
      if (isAdminOrIQA) {
        navigate(`/qa-sample-plan`)
      } else {
        navigate(`/evidenceLibrary`)
      }
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Something error',
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
                          course.course_core_type === 'Standard' &&
                          !updatedCourseSelectedTypes[course.course_id]
                        ) {
                          updatedCourseSelectedTypes[course.course_id] = ''
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
              .filter((course) => course.course_core_type === 'Standard')
              .map((course) => (
                <Box key={course.course_id} sx={{ mb: 2 }}>
                <Typography variant='body1' sx={{ mb: 1, fontWeight: 500 }}>
                    {course.course_name} - Select Type:
                </Typography>
                <FormGroup row>
                    {['Knowledge', 'Behaviour', 'Skills', 'Duty'].map(
                      (type) => (
                    <FormControlLabel
                      key={type}
                      control={
                        <Radio
                              checked={
                                courseSelectedTypes[course.course_id] === type
                              }
                          onChange={() => {
                                // Reset units for this course and type to unchecked when switching types
                                const currentUnits = unitsWatch || []
                                const unitsToKeep = currentUnits.filter(
                                  (u) =>
                                    !(
                                      u.course_id === course.course_id &&
                                      u.type === type
                                    )
                                )
                                
                                // Get units from course data for the selected type
                                const courseUnits = course.units || []
                                const filteredUnits = courseUnits.filter(
                                  (unit: any) => unit.type === type
                                )
                                
                                // Re-initialize units with all values set to false/unchecked
                                const resetUnits = filteredUnits.map((method: any) => {
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
                                
                                // Update selected type first
                                const currentCourseSelectedTypes = watch('courseSelectedTypes') || {}
                                setValue('courseSelectedTypes', {
                                  ...currentCourseSelectedTypes,
                                  [course.course_id]: type,
                                })
                                
                                // Update form with reset units and trigger validation
                                setValue('units', [...unitsToKeep, ...resetUnits], {
                                  shouldValidate: true,
                                })
                          }}
                          disabled={isEditMode || !canEditLearnerFields}
                        />
                      }
                      label={type}
                    />
                      )
                    )}
                </FormGroup>
                  {/* Show validation error if type not selected (only after form submission attempt) */}
                  {isSubmitted && !courseSelectedTypes[course.course_id] && (
                    <FormHelperText error>
                      Please select a type for {course.course_name}
                    </FormHelperText>
                  )}
                  {isSubmitted && errors.courseSelectedTypes && (
                    <FormHelperText error>
                      {typeof errors.courseSelectedTypes.message === 'string' 
                        ? errors.courseSelectedTypes.message 
                        : 'Please select a type for all Standard courses'}
                    </FormHelperText>
                  )}
              </Box>
              ))}
          </Grid>
          <Grid item xs={12}>
            {/* Unit selection for Qualification courses - Show for each selected Qualification course */}
            {selectedCourses
              .filter((course) => course.course_core_type === 'Qualification')
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
                                    // Explicitly set learnerMap to false when adding unit
                                    learnerMap: false,
                                    trainerMap: false,
                                    signedOff: false,
                                    comment: '',
                                  subUnit: hasSubUnit
                                      ? unit.subUnit.map((sub: any) => ({
                                        ...sub,
                                          learnerMap: false, // Always start as false
                                          trainerMap: false,
                                          signedOff: false,
                                          comment: '',
                                      }))
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
                  // For Standard courses, show units based on selected type
                  if (course.course_core_type === 'Standard') {
                    const selectedType = courseSelectedTypes[course.course_id]
                    if (!selectedType) return null

                    // Get units for this course and type from unitsWatch
                    const typeUnits = (unitsWatch || []).filter(
                      (unit) =>
                        unit.type === selectedType &&
                        unit.course_id === course.course_id
                    )

                    if (typeUnits.length === 0) {
                      // Initialize units for this type from course data
                      // Always reset to unchecked state when switching types
                      const courseUnits = course.units || []
                      const filteredUnits = courseUnits.filter(
                        (unit) => unit.type === selectedType
                      )
                      if (filteredUnits.length > 0) {
                        const currentUnits = unitsWatch || []
                        // Remove existing units of this type if any (to reset them)
                        const unitsWithoutThisType = currentUnits.filter(
                          (u) =>
                            !(
                              u.course_id === course.course_id &&
                              u.type === selectedType
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
                        // Replace units of this type with fresh ones (unchecked)
                        const newUnits = [...unitsWithoutThisType, ...initializedUnits]
                        setValue('units', newUnits, { shouldValidate: false })
                        return null // Will re-render with units
                      }
                      // If no units found, show message or return null
                      return null
                    }

                    // For Knowledge, Behaviour, Skills: Combine all subUnits into one table
                    // For Duty: Show separate tables for each unit
                    const shouldCombineSubUnits = [
                      'Knowledge',
                      'Behaviour',
                      'Skills',
                    ].includes(selectedType)

                    if (shouldCombineSubUnits) {
                      // Combine all subUnits from all units of this type
                      const combinedSubUnits: any[] = []
                      typeUnits.forEach((unit) => {
                        const hasSubUnit =
                          unit.subUnit && unit.subUnit.length > 0
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

                      return (
                        <Box key={course.course_id} sx={{ mb: 3 }}>
                          <Typography
                            variant='h6'
                            sx={{ mb: 1, color: 'primary.main' }}
                          >
                            {course.course_name} - {selectedType} Units
                          </Typography>
                          <TableContainer>
                            <Table size='small'>
                              <TableHead>
                                <TableRow>
                                  <TableCell>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={combinedSubUnits.every(
                                            (s) => s.learnerMap ?? false
                                          )}
                                          onChange={(e) => {
                                            // Update all combined subUnits
                                            const updated = [...unitsWatch]
                                            combinedSubUnits.forEach((sub) => {
                                              const unit = updated.find(
                                                (u) => u.id === sub.unitId
                                              )
                                              if (unit) {
                                                if (
                                                  unit.subUnit &&
                                                  unit.subUnit.length > 0
                                                ) {
                                                  unit.subUnit.forEach(
                                                    (usub) => {
                                                      if (usub.id === sub.id) {
                                                        usub.learnerMap =
                                                          e.target.checked
                                                      }
                                                    }
                                                  )
                                                } else {
                                                  unit.learnerMap =
                                                    e.target.checked
                                                }
                                              }
                                            })
                                            setValue('units', updated)
                                            trigger('units')
                                          }}
                                          disabled={
                                            isEditMode || !canEditLearnerFields
                                          }
                                        />
                                      }
                                      label='Learner Map'
                                      sx={{ margin: 0 }}
                                    />
                                  </TableCell>
                                  <TableCell>Sub unit name</TableCell>
                                  <TableCell>Trainer Comment</TableCell>
                                  <TableCell align='center'>Gap</TableCell>
                                  <TableCell align='center'>
                                    {canEditTrainerFields ? (
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={
                                              combinedSubUnits.length > 0 &&
                                              combinedSubUnits.every(
                                                (s) =>
                                                  (s.learnerMap ?? false) &&
                                                  (s.trainerMap ?? false) &&
                                                  (s.signedOff ?? false)
                                              )
                                            }
                                            indeterminate={
                                              combinedSubUnits.some(
                                                (s) =>
                                                  (s.learnerMap ?? false) &&
                                                  (s.trainerMap ?? false) &&
                                                  (s.signedOff ?? false)
                                              ) &&
                                              !combinedSubUnits.every(
                                                (s) =>
                                                  (s.learnerMap ?? false) &&
                                                  (s.trainerMap ?? false) &&
                                                  (s.signedOff ?? false)
                                              )
                                            }
                                            onChange={(e) =>
                                              selectAllSignedOffForCombinedHandler(
                                                combinedSubUnits,
                                                e.target.checked
                                              )
                                            }
                                            disabled={isEditMode}
                                          />
                                        }
                                        label='Signed Off'
                                        sx={{ margin: 0 }}
                                      />
                                    ) : (
                                      'Signed Off'
                                    )}
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {combinedSubUnits.map((row) => {
                                  const unit = typeUnits.find(
                                    (u) => u.id === row.unitId
                                  )
                                  const hasSubUnit =
                                    unit?.subUnit && unit.subUnit.length > 0

                                  // Get current values from form state (unitsWatch) for real-time updates
                                  let currentLearnerMap =
                                    row?.learnerMap ?? false
                                  let currentTrainerMap =
                                    row?.trainerMap ?? false
                                  let currentSignedOff = row?.signedOff ?? false
                                  let currentComment = row?.comment ?? ''

                                  if (!hasSubUnit) {
                                    // For units without subUnits, get values from unitsWatch
                                    const currentUnit = (unitsWatch || []).find(
                                      (u) =>
                                        String(u.id) ===
                                        String(row.id || row.unitId)
                                    )
                                    if (currentUnit) {
                                      currentLearnerMap =
                                        currentUnit.learnerMap ?? false
                                      currentTrainerMap =
                                        currentUnit.trainerMap ?? false
                                      currentSignedOff =
                                        currentUnit.signedOff ?? false
                                      currentComment = currentUnit.comment ?? ''
                                    }
                                  } else {
                                    // For units with subUnits, get values from subUnit in unitsWatch
                                    const currentUnit = (unitsWatch || []).find(
                                      (u) => String(u.id) === String(row.unitId)
                                    )
                                    if (currentUnit?.subUnit) {
                                      const currentSubUnit =
                                        currentUnit.subUnit.find(
                                          (s) => String(s.id) === String(row.id)
                                        )
                                      if (currentSubUnit) {
                                        currentLearnerMap =
                                          currentSubUnit.learnerMap ?? false
                                        currentTrainerMap =
                                          currentSubUnit.trainerMap ?? false
                                        currentSignedOff =
                                          currentSubUnit.signedOff ?? false
                                        currentComment =
                                          currentSubUnit.comment ?? ''
                                      }
                                    }
                                  }

                                  return (
                                    <TableRow key={`${row.unitId}-${row.id}`}>
                                      <TableCell>
                                        <Checkbox
                                          checked={currentLearnerMap}
                                          onChange={() => {
                                            if (hasSubUnit) {
                                              learnerMapHandler(row)
                                            } else {
                                              const updated = [...unitsWatch]
                                              const unitToUpdate = updated.find(
                                                (u) =>
                                                  String(u.id) ===
                                                  String(row.id || row.unitId)
                                              )
                                              if (unitToUpdate) {
                                                unitToUpdate.learnerMap = !(
                                                  unitToUpdate.learnerMap ??
                                                  false
                                                )
                                                setValue('units', updated)
                                                trigger('units')
                                              }
                                            }
                                          }}
                                          disabled={
                                            isEditMode || !canEditLearnerFields
                                          }
                                        />
                                      </TableCell>
                                      <TableCell>
                                        {hasSubUnit
                                          ? row.title
                                          : `${row.title}`}
                                      </TableCell>
                                      <TableCell>
                                        {!canEditTrainerFields ? (
                                          <span>
                                            {currentComment || 'No comment'}
                                          </span>
                                        ) : (
                                          <TextField
                                            size='small'
                                            value={currentComment}
                                            disabled={isEditMode}
                                            onChange={(e) => {
                                              if (hasSubUnit) {
                                                commentHandler(e, row.id)
                                              } else {
                                                const updated = [...unitsWatch]
                                                const unitToUpdate =
                                                  updated.find(
                                                    (u) =>
                                                      String(u.id) ===
                                                      String(
                                                        row.id || row.unitId
                                                      )
                                                  )
                                                if (unitToUpdate) {
                                                  unitToUpdate.comment =
                                                    e.target.value
                                                  setValue('units', updated)
                                                }
                                              }
                                            }}
                                          />
                                        )}
                                      </TableCell>
                                      <TableCell
                                        align='center'
                                        className='flex items-center justify-center'
                                      >
                                        <div
                                          className='border-2 border-gray-500 w-[16px] mt-[12px] h-[16px] p-[1px] flex items-center justify-center cursor-pointer'
                                          onClick={() => {
                                            if (
                                              canEditTrainerFields &&
                                              !isEditMode &&
                                              currentLearnerMap
                                            ) {
                                              if (hasSubUnit) {
                                                trainerMapHandler(row)
                                              } else {
                                                const updated = [...unitsWatch]
                                                const unitToUpdate =
                                                  updated.find(
                                                    (u) =>
                                                      String(u.id) ===
                                                      String(
                                                        row.id || row.unitId
                                                      )
                                                  )
                                                if (unitToUpdate) {
                                                  unitToUpdate.trainerMap = !(
                                                    unitToUpdate.trainerMap ??
                                                    false
                                                  )
                                                  if (
                                                    !unitToUpdate.trainerMap
                                                  ) {
                                                    unitToUpdate.signedOff =
                                                      false
                                                  }
                                                  setValue('units', updated)
                                                }
                                              }
                                            }
                                          }}
                                          style={{
                                            cursor:
                                              canEditTrainerFields &&
                                              !isEditMode &&
                                              currentLearnerMap
                                                ? 'pointer'
                                                : 'default',
                                            opacity:
                                              canEditTrainerFields &&
                                              !isEditMode &&
                                              currentLearnerMap
                                                ? 1
                                                : 0.8,
                                          }}
                                        >
                                          <div
                                            style={{
                                              backgroundColor:
                                                currentLearnerMap &&
                                                currentTrainerMap &&
                                                currentSignedOff
                                                  ? 'green'
                                                  : currentLearnerMap &&
                                                    currentTrainerMap
                                                  ? 'orange'
                                                  : '',
                                              width: '100%',
                                              height: '100%',
                                            }}
                                          />
                                        </div>
                                      </TableCell>
                                      <TableCell align='center'>
                                        <Checkbox
                                          checked={currentSignedOff}
                                          disabled={
                                            !canEditTrainerFields ||
                                            isEditMode ||
                                            !currentLearnerMap ||
                                            !currentTrainerMap
                                          }
                                          onChange={() => {
                                            if (hasSubUnit) {
                                              signedOffHandler(row)
                                            } else {
                                              const updated = [...unitsWatch]
                                              // For units without subUnits, use row.id (which is the unit id)
                                              const unitToUpdate = updated.find(
                                                (u) =>
                                                  String(u.id) ===
                                                  String(row.id || row.unitId)
                                              )
                                              if (unitToUpdate) {
                                                unitToUpdate.signedOff = !(
                                                  unitToUpdate.signedOff ??
                                                  false
                                                )
                                                setValue('units', updated)
                                                trigger('units')
                                              }
                                            }
                                          }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          {/* Show validation error for this specific course/type combination (only after form submission attempt) */}
                          {isSubmitted && (() => {
                            // Check if at least one learnerMap is selected for this course/type combination
                            const hasLearnerMapSelected = combinedSubUnits.some((sub) => {
                              const unit = typeUnits.find((u) => u.id === sub.unitId)
                              const hasSubUnit = unit?.subUnit && unit.subUnit.length > 0
                              
                              if (!hasSubUnit) {
                                // For units without subUnits, check unit-level learnerMap
                                const currentUnit = (unitsWatch || []).find(
                                  (u) => String(u.id) === String(sub.id || sub.unitId) && u.course_id === course.course_id
                                )
                                return currentUnit?.learnerMap === true
                              } else {
                                // For units with subUnits, check subUnit learnerMap
                                const currentUnit = (unitsWatch || []).find(
                                  (u) => String(u.id) === String(sub.unitId) && u.course_id === course.course_id
                                )
                                const currentSubUnit = currentUnit?.subUnit?.find(
                                  (s) => String(s.id) === String(sub.id)
                                )
                                return currentSubUnit?.learnerMap === true
                              }
                            })
                            
                            // Only show error if no learnerMap is selected for this course/type
                            return !hasLearnerMapSelected && (errors?.units as any)?.message && (
                            <FormHelperText error>
                                At least one unit must have Learner Map selected for {course.course_name} - {selectedType}
                            </FormHelperText>
                            )
                          })()}
                        </Box>
                      )
                    } else {
                      // For Duty: Show separate tables for each unit
                      return (
                        <Box key={course.course_id} sx={{ mb: 3 }}>
                          <Typography
                            variant='h6'
                            sx={{ mb: 1, color: 'primary.main' }}
                          >
                            {course.course_name} - {selectedType} Units
                          </Typography>
                          {typeUnits.map((units) => {
                            const unitIndex = unitsWatch.findIndex(
                              (u) => u.id === units.id
                            )
                            const hasSubUnit =
                              units.subUnit && units.subUnit.length > 0
                            const rowsToDisplay = hasSubUnit
                              ? units.subUnit
                              : [
                                  {
                                    id: units.id,
                                    title: units.title,
                                    learnerMap: units.learnerMap ?? false,
                                    trainerMap: units.trainerMap ?? false,
                                    comment: units.comment ?? '',
                                  },
                                ]

                            return (
                              <Box
                                key={units.id}
                                className='flex flex-col gap-2'
                                sx={{ mt: 2, mb: 2 }}
                              >
                                {hasSubUnit && (
                                  <Typography variant='h6'>
                                    {units.title}
                                  </Typography>
                                )}
                                <TableContainer>
                                  <Table size='small'>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell align='center'>
                                          <Checkbox
                                            checked={
                                              hasSubUnit
                                                ? units.subUnit.every(
                                                    (s) => s.learnerMap ?? false
                                                  )
                                                : units.learnerMap ?? false
                                            }
                                            onChange={(e) =>
                                              selectAllLearnerMapHandler(
                                                unitIndex,
                                                e.target.checked
                                              )
                                            }
                                            disabled={
                                              isEditMode ||
                                              !canEditLearnerFields
                                            }
                                          />
                                        </TableCell>
                                        <TableCell>
                                          {hasSubUnit
                                            ? 'Sub unit name'
                                            : 'Unit name'}
                                        </TableCell>
                                        <TableCell>Trainer Comment</TableCell>
                                        <TableCell align='center'>
                                          Gap
                                        </TableCell>
                                        <TableCell align='center'>
                                          {canEditTrainerFields ? (
                                            <FormControlLabel
                                              control={
                                                <Checkbox
                                                  checked={
                                                    hasSubUnit
                                                      ? units.subUnit.length > 0 &&
                                                        units.subUnit.every(
                                                          (s) =>
                                                            (s.learnerMap ?? false) &&
                                                            (s.trainerMap ?? false) &&
                                                            (s.signedOff ?? false)
                                                        )
                                                      : (units.learnerMap ?? false) &&
                                                        (units.trainerMap ?? false) &&
                                                        (units.signedOff ?? false)
                                                  }
                                                  indeterminate={
                                                    hasSubUnit
                                                      ? units.subUnit.some(
                                                          (s) =>
                                                            (s.learnerMap ?? false) &&
                                                            (s.trainerMap ?? false) &&
                                                            (s.signedOff ?? false)
                                                        ) &&
                                                        !units.subUnit.every(
                                                          (s) =>
                                                            (s.learnerMap ?? false) &&
                                                            (s.trainerMap ?? false) &&
                                                            (s.signedOff ?? false)
                                                        )
                                                      : false
                                                  }
                                                  onChange={(e) =>
                                                    selectAllSignedOffHandler(
                                                      unitIndex,
                                                      e.target.checked
                                                    )
                                                  }
                                                  disabled={isEditMode}
                                                />
                                              }
                                              label='Signed Off'
                                              sx={{ margin: 0 }}
                                            />
                                          ) : (
                                            'Signed Off'
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {rowsToDisplay.map((row) => (
                                        <TableRow key={row.id}>
                                          <TableCell align='center'>
                                            <Checkbox
                                              checked={row?.learnerMap || false}
                                              onChange={() => {
                                                if (hasSubUnit) {
                                                  learnerMapHandler(row)
                                                } else {
                                                  const updated = [
                                                    ...unitsWatch,
                                                  ]
                                                  const unitToUpdate =
                                                    updated.find(
                                                      (u) => u.id === units.id
                                                    )
                                                  if (unitToUpdate) {
                                                    unitToUpdate.learnerMap = !(
                                                      unitToUpdate.learnerMap ??
                                                      false
                                                    )
                                                    setValue('units', updated)
                                                    trigger('units')
                                                  }
                                                }
                                              }}
                                              disabled={
                                                isEditMode ||
                                                !canEditLearnerFields
                                              }
                                            />
                                          </TableCell>
                                          <TableCell>{row?.title}</TableCell>
                                          <TableCell>
                                            {!canEditTrainerFields ? (
                                              <span>
                                                {row?.comment || 'No comment'}
                                              </span>
                                            ) : (
                                              <TextField
                                                size='small'
                                                value={row?.comment || ''}
                                                onChange={(e) => {
                                                  if (hasSubUnit) {
                                                    commentHandler(e, row.id)
                                                  } else {
                                                    const updated = [
                                                      ...unitsWatch,
                                                    ]
                                                    const unitToUpdate =
                                                      updated.find(
                                                        (u) => u.id === units.id
                                                      )
                                                    if (unitToUpdate) {
                                                      unitToUpdate.comment =
                                                        e.target.value
                                                      setValue('units', updated)
                                                    }
                                                  }
                                                }}
                                              />
                                            )}
                                          </TableCell>
                                          <TableCell
                                            align='center'
                                            className='flex items-center justify-center'
                                          >
                                            <div
                                              className='border-2 border-gray-500 w-[16px] h-[16px] mt-[12px] p-[1px] flex items-center justify-center cursor-pointer'
                                              onClick={() => {
                                                if (
                                                  canEditTrainerFields &&
                                                  !isEditMode &&
                                                  (row.learnerMap ?? false)
                                                ) {
                                                  if (hasSubUnit) {
                                                    trainerMapHandler(row)
                                                  } else {
                                                    const updated = [
                                                      ...unitsWatch,
                                                    ]
                                                    const unitToUpdate =
                                                      updated.find(
                                                        (u) => u.id === units.id
                                                      )
                                                    if (unitToUpdate) {
                                                      unitToUpdate.trainerMap =
                                                        !(
                                                          unitToUpdate.trainerMap ??
                                                          false
                                                        )
                                                      if (
                                                        !unitToUpdate.trainerMap
                                                      ) {
                                                        unitToUpdate.signedOff =
                                                          false
                                                      }
                                                      setValue('units', updated)
                                                    }
                                                  }
                                                }
                                              }}
                                              style={{
                                                cursor:
                                                  canEditTrainerFields &&
                                                  !isEditMode &&
                                                  (row.learnerMap ?? false)
                                                    ? 'pointer'
                                                    : 'default',
                                                opacity:
                                                  canEditTrainerFields &&
                                                  !isEditMode &&
                                                  (row.learnerMap ?? false)
                                                    ? 1
                                                    : 0.8,
                                              }}
                                            >
                                              <div
                                                style={{
                                                  backgroundColor:
                                                    (row.learnerMap ?? false) &&
                                                    (row.trainerMap ?? false) &&
                                                    (row.signedOff ?? false)
                                                      ? 'green'
                                                      : (row.learnerMap ??
                                                          false) &&
                                                        (row.trainerMap ??
                                                          false)
                                                      ? 'orange'
                                                      : '',
                                                  width: '100%',
                                                  height: '100%',
                                                }}
                                              />
                                            </div>
                                          </TableCell>
                                          <TableCell align='center'>
                                            <Checkbox
                                              checked={row?.signedOff || false}
                                              disabled={
                                                !canEditTrainerFields ||
                                                isEditMode ||
                                                !(row.learnerMap ?? false) ||
                                                !(row.trainerMap ?? false)
                                              }
                                              onChange={() => {
                                                if (hasSubUnit) {
                                                  signedOffHandler(row)
                                                } else {
                                                  const updated = [
                                                    ...unitsWatch,
                                                  ]
                                                  const unitToUpdate =
                                                    updated.find(
                                                      (u) => u.id === units.id
                                                    )
                                                  if (unitToUpdate) {
                                                    unitToUpdate.signedOff = !(
                                                      unitToUpdate.signedOff ??
                                                      false
                                                    )
                                                    setValue('units', updated)
                                                  }
                                                }
                                              }}
                                            />
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                                {isSubmitted && hasSubUnit && (() => {
                                  // Check if at least one learnerMap is selected for this unit's subUnits
                                  const currentUnit = (unitsWatch || []).find(
                                    (u) => String(u.id) === String(units.id) && u.course_id === course.course_id
                                  )
                                  const hasLearnerMapSelected = currentUnit?.subUnit?.some(
                                    (sub) => sub.learnerMap === true
                                  ) || false
                                  
                                  // Only show error if no learnerMap is selected for this unit
                                  return !hasLearnerMapSelected && errors?.units?.[unitIndex]?.subUnit?.message && (
                                    <FormHelperText error>
                                      {errors.units[unitIndex].subUnit.message}
                                    </FormHelperText>
                                  )
                                })()}
                              </Box>
                            )
                          })}
                        </Box>
                      )
                    }
                  } else if (course.course_core_type === 'Qualification') {
                    // For Qualification courses: Show unit first, then its subUnits
                    // Get units for this course from unitsWatch (only show manually selected units)
                    const displayUnits = (unitsWatch || []).filter(
                      (units) =>
                        units.course_id === course.course_id &&
                        units.subUnit &&
                        units.subUnit.length > 0
                    )

                    // Don't auto-initialize units - only show units that user has manually selected
                    if (displayUnits.length === 0) {
                      return null
                    }

                    return (
                      <Box key={course.course_id} sx={{ mb: 3 }}>
                        <Typography
                          variant='h6'
                          sx={{ mb: 1, color: 'primary.main' }}
                        >
                          {course.course_name} - Units
                        </Typography>
                        {displayUnits.map((units) => {
                      const unitIndex = unitsWatch.findIndex(
                        (u) => u.id === units.id
                      )

                      return (
                        <Box
                          key={units.id}
                          className='flex flex-col gap-2'
                          sx={{ mt: 2, mb: 3 }}
                        >
                          {/* Show Unit Title First */}
                          <Typography
                            variant='h5'
                            sx={{ mb: 1, fontWeight: 600 }}
                          >
                            {units.title}
                          </Typography>

                          {/* Then show subUnits table */}
                          <TableContainer>
                            <Table size='small'>
                              <TableHead>
                                <TableRow>
                                  <TableCell>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={units.subUnit.every(
                                            (s) => s.learnerMap ?? false
                                          )}
                                          onChange={(e) =>
                                            selectAllLearnerMapHandler(
                                              unitIndex,
                                              e.target.checked
                                            )
                                          }
                                          disabled={
                                            isEditMode || !canEditLearnerFields
                                          }
                                        />
                                      }
                                      label='Learner Map'
                                      sx={{ margin: 0 }}
                                    />
                                  </TableCell>
                                  <TableCell>Sub unit name</TableCell>
                                  <TableCell>Trainer Comment</TableCell>
                                  <TableCell align='center'>Gap</TableCell>
                                  <TableCell align='center'>
                                    {canEditTrainerFields ? (
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={
                                              units.subUnit.length > 0 &&
                                              units.subUnit.every(
                                                (s) =>
                                                  (s.learnerMap ?? false) &&
                                                  (s.trainerMap ?? false) &&
                                                  (s.signedOff ?? false)
                                              )
                                            }
                                            indeterminate={
                                              units.subUnit.some(
                                                (s) =>
                                                  (s.learnerMap ?? false) &&
                                                  (s.trainerMap ?? false) &&
                                                  (s.signedOff ?? false)
                                              ) &&
                                              !units.subUnit.every(
                                                (s) =>
                                                  (s.learnerMap ?? false) &&
                                                  (s.trainerMap ?? false) &&
                                                  (s.signedOff ?? false)
                                              )
                                            }
                                            onChange={(e) =>
                                              selectAllSignedOffHandler(
                                                unitIndex,
                                                e.target.checked
                                              )
                                            }
                                            disabled={isEditMode}
                                          />
                                        }
                                        label='Signed Off'
                                        sx={{ margin: 0 }}
                                      />
                                    ) : (
                                      'Signed Off'
                                    )}
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {units?.subUnit?.map((row) => (
                                  <TableRow key={row.id}>
                                    <TableCell>
                                      <Checkbox
                                        checked={row?.learnerMap || false}
                                        onChange={() => learnerMapHandler(row)}
                                        disabled={
                                          isEditMode || !canEditLearnerFields
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>{row?.title}</TableCell>
                                    <TableCell>
                                      {!canEditTrainerFields ? (
                                        <span>
                                          {row?.comment || 'No comment'}
                                        </span>
                                      ) : (
                                        <TextField
                                          size='small'
                                          value={row?.comment || ''}
                                          onChange={(e) =>
                                            commentHandler(e, row.id)
                                          }
                                        />
                                      )}
                                    </TableCell>
                                    <TableCell
                                      align='center'
                                      className='flex items-center justify-center'
                                    >
                                      <div
                                        className='border-2 border-gray-500 w-[16px] h-[16px] mt-[12px] p-[1px] flex items-center justify-center cursor-pointer'
                                        onClick={() => {
                                          if (
                                            canEditTrainerFields &&
                                            !isEditMode &&
                                            (row.learnerMap ?? false)
                                          ) {
                                            trainerMapHandler(row)
                                          }
                                        }}
                                        style={{
                                          cursor:
                                            canEditTrainerFields &&
                                            !isEditMode &&
                                            (row.learnerMap ?? false)
                                              ? 'pointer'
                                              : 'default',
                                          opacity:
                                            canEditTrainerFields &&
                                            !isEditMode &&
                                            (row.learnerMap ?? false)
                                              ? 1
                                              : 0.8,
                                        }}
                                      >
                                        <div
                                          style={{
                                            backgroundColor:
                                              (row.learnerMap ?? false) &&
                                              (row.trainerMap ?? false) &&
                                              (row.signedOff ?? false)
                                                ? 'green'
                                                : (row.learnerMap ?? false) &&
                                                  (row.trainerMap ?? false)
                                                ? 'orange'
                                                : '',
                                            width: '100%',
                                            height: '100%',
                                          }}
                                        />
                                      </div>
                                    </TableCell>
                                    <TableCell align='center'>
                                      <Checkbox
                                        checked={row?.signedOff || false}
                                        disabled={
                                          !canEditTrainerFields ||
                                          isEditMode ||
                                          !(row.learnerMap ?? false) ||
                                          !(row.trainerMap ?? false)
                                        }
                                        onChange={() => signedOffHandler(row)}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          {/* Show validation error for this specific unit (only after form submission attempt) */}
                          {isSubmitted && (() => {
                            // Get the current unit from unitsWatch to check real-time state for THIS SPECIFIC UNIT ONLY
                            const currentUnit = (unitsWatch || []).find(
                              (u) => String(u.id) === String(units.id) && u.course_id === course.course_id
                            )
                            
                            // Check if at least one learnerMap is selected for THIS SPECIFIC UNIT's subUnits only
                            // This check is completely independent for each unit - only checks THIS unit's subUnits
                            const hasLearnerMapSelected = currentUnit?.subUnit?.some(
                              (sub) => sub.learnerMap === true
                            ) || false
                            
                            // Show error ONLY for THIS SPECIFIC UNIT if no learnerMap is selected
                            // Don't check global errors - each unit's error is independent
                            // The error should only disappear when THIS unit has a learnerMap selected
                            if (!hasLearnerMapSelected) {
                              return (
                            <FormHelperText error>
                                  At least one sub unit must have Learner Map selected for {units.title}
                            </FormHelperText>
                              )
                            }
                            return null
                })()}
                        </Box>
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
