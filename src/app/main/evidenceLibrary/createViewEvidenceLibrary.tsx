import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { yupResolver } from '@hookform/resolvers/yup'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import {
  Box,
  Button,
  Checkbox,
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
  useGetSignatureListQuery,
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
  const [selectedUnitIds, setSelectedUnitIds] = useState<(string | number)[]>(
    []
  )
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

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
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

  const {
    data: signatureList,
    isLoading: isLoadingSignatureList,
    isError: isErrorSignatureList,
    error: errorSignatureList,
  } = useGetSignatureListQuery(
    { id: id as string },
    {
      skip: !id,
      refetchOnMountOrArgChange: true,
    }
  )

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

  // Populate signatures from API data
  useEffect(() => {
    if (signatureList && signatureList.data && signatureList.data.length > 0) {
      const signatureRoles = ['Trainer', 'Learner', 'Employer', 'IQA']
      const populatedSignatures = signatureRoles.map((role) => {
        const apiSignature = signatureList.data.find((sig) => sig.role === role)
        if (apiSignature) {
          return {
            role: apiSignature.role,
            name: apiSignature.name || '',
            signed: apiSignature.isSigned || false,
            es: '', // ES field not in API response, keeping empty
            date: apiSignature.signedAt
              ? new Date(apiSignature.signedAt).toISOString().split('T')[0]
              : '',
            signature_required: apiSignature.isRequested || false,
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

  useEffect(() => {
    if (!id) return navigate('/evidenceLibrary') // Redirect if no ID is provided
  }, [id])

  useEffect(() => {
    if (!isLoading && isError) {
      navigate('/evidenceLibrary') // Redirect if there's an error
      return
    }

    if (evidenceDetails) {
      const {
        description,
        grade,
        learner_comments,
        points_for_improvement,
        assessment_method,
        external_feedback,
        title,
        units,
        trainer_feedback,
        session,
      } = evidenceDetails.data
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
      // Initialize units with learnerMap, trainerMap, signedOff, and comment from API
      const initializedUnits = units
        ? units.map((unit) => {
            const hasSubUnit = unit.subUnit && unit.subUnit.length > 0
            return {
              ...unit,
              // Preserve type and code from API
              type: unit.type,
              code: unit.code,
              subUnit:
                unit.subUnit?.map((sub) => ({
                  ...sub,
                  learnerMap: sub.learnerMap ?? false,
                  trainerMap: sub.trainerMap ?? false,
                  signedOff: sub.signedOff ?? false,
                  comment: sub.comment ?? '',
                })) || [],
              // Initialize unit-level properties for units without subUnit (Standard courses)
              learnerMap: hasSubUnit ? undefined : unit.learnerMap ?? false,
              trainerMap: hasSubUnit ? undefined : unit.trainerMap ?? false,
              signedOff: hasSubUnit ? undefined : unit.signedOff ?? false,
              comment: hasSubUnit ? undefined : unit.comment ?? '',
            }
          })
        : []
      setValue('units', initializedUnits)

      // For Standard courses, set default selected type based on units with learnerMap selected
      if (
        evidenceDetails.data.course_id?.course_core_type === 'Standard' &&
        initializedUnits.length > 0
      ) {
        // Find the first unit type that has learnerMap selected
        const unitWithLearnerMap = initializedUnits.find((unit) => {
          const hasSubUnit = unit.subUnit && unit.subUnit.length > 0
          if (hasSubUnit) {
            return unit.subUnit.some((sub) => sub.learnerMap === true)
          } else {
            return unit.learnerMap === true
          }
        })

        if (unitWithLearnerMap?.type) {
          setSelectedUnitType(unitWithLearnerMap.type)
        }
      }

      // For Qualification courses, set selectedUnitIds based on units with learnerMap
      if (
        evidenceDetails.data.course_id?.course_core_type === 'Qualification' &&
        initializedUnits.length > 0
      ) {
        const selectedIds = initializedUnits
          .filter((unit) => {
            const hasSubUnit = unit.subUnit && unit.subUnit.length > 0
            if (hasSubUnit) {
              return unit.subUnit.some((sub) => sub.learnerMap === true)
            }
            return false
          })
          .map((unit) => unit.id)
        setSelectedUnitIds(selectedIds)
      }
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
    }
  }, [evidenceDetails, setValue, isError, id, isLoading])

  // Initialize time log data when evidence details are loaded
  useEffect(() => {
    if (evidenceDetails?.data && learnerUserId) {
      const evidence = evidenceDetails.data

      // Get units from evidence data as array (will be synced when unitsWatch changes)
      const evidenceUnits =
        evidence.units && evidence.units.length > 0
          ? evidence.units.map((unit) => unit?.title || '').filter(Boolean)
          : []

      setTimeLogData((prev) => ({
        ...prev,
        user_id: selected
          ? selectedUser?.user_id
          : currentUser?.user_id || learnerUserId,
        course_id: evidence.course_id?.course_id || prev.course_id,
        unit: evidenceUnits.length > 0 ? evidenceUnits : prev.unit,
        impact_on_learner: evidence.description || prev.impact_on_learner,
        evidence_link: evidence.file?.url || window.location.href,
      }))
    }
  }, [evidenceDetails, learnerUserId, selected, selectedUser, currentUser])

  // Watch units from form - must be declared before any conditional returns
  const unitsWatch = watch('units')

  // Auto-initialize units in form when type is selected for Standard courses
  useEffect(() => {
    const courseType = evidenceDetails?.data?.course_id?.course_core_type
    if (
      courseType === 'Standard' &&
      selectedUnitType !== null &&
      evidenceDetails?.data?.course_id?.units
    ) {
      const allUnits = evidenceDetails.data.course_id.units || []
      const filteredUnits = allUnits.filter(
        (unit) => unit.type === selectedUnitType
      )

      if (filteredUnits.length > 0) {
        // Initialize all units of the selected type
        const initializedUnits = filteredUnits.map((method) => {
          const hasSubUnit =
            method.subUnit &&
            Array.isArray(method.subUnit) &&
            method.subUnit.length > 0

          // Check if this unit already exists in form to preserve user changes
          const currentUnits = unitsWatch || []
          const existingUnit = currentUnits.find(
            (u) => String(u.id) === String(method.id)
          )

          if (existingUnit && existingUnit.type === selectedUnitType) {
            // Preserve existing unit data if it matches the selected type
            return existingUnit
          }

          // Create new initialized unit
          return {
            ...method,
            type: method.type,
            code: method.code,
            subUnit: hasSubUnit
              ? method.subUnit.map((sub) => ({
                  ...sub,
                  learnerMap: sub.learnerMap ?? false,
                  trainerMap: sub.trainerMap ?? false,
                  signedOff: sub.signedOff ?? false,
                  comment: sub.comment ?? '',
                }))
              : [],
            learnerMap: hasSubUnit ? undefined : method.learnerMap ?? false,
            trainerMap: hasSubUnit ? undefined : method.trainerMap ?? false,
            signedOff: hasSubUnit ? undefined : method.signedOff ?? false,
            comment: hasSubUnit ? undefined : method.comment ?? '',
          }
        })

        // Replace all units with the new type's units
        setValue('units', initializedUnits, { shouldValidate: false })
      } else {
        // If no units found for selected type, clear the form
        setValue('units', [], { shouldValidate: false })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedUnitType,
    evidenceDetails?.data?.course_id?.course_core_type,
    evidenceDetails?.data?.course_id?.units,
  ])

  // Remove units from form when they're deselected for Qualification courses
  useEffect(() => {
    const courseType = evidenceDetails?.data?.course_id?.course_core_type
    if (courseType === 'Qualification') {
      const currentUnits = unitsWatch || []
      // Remove units that are not in selectedUnitIds
      const unitsToKeep = currentUnits.filter((unit) =>
        selectedUnitIds.includes(unit.id)
      )

      if (unitsToKeep.length !== currentUnits.length) {
        setValue('units', unitsToKeep, { shouldValidate: false })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnitIds])

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

  const handleCheckboxUnits = (event, method) => {
    const currentUnits = [...(unitsWatch || [])]
    const exists = currentUnits.find(
      (unit) => String(unit.id) === String(method.id)
    )
    let updatedUnits = []

    if (exists) {
      updatedUnits = currentUnits.filter(
        (unit) => String(unit.id) !== String(method.id)
      )
    } else {
      // When adding a unit, ensure subUnits have learnerMap, trainerMap, and comment initialized
      const hasSubUnit =
        method.subUnit &&
        Array.isArray(method.subUnit) &&
        method.subUnit.length > 0
      const unitToAdd = {
        ...method,
        // Explicitly preserve type property (important for Standard courses)
        type: method.type,
        code: method.code,
        subUnit: hasSubUnit
          ? method.subUnit.map((sub) => ({
              ...sub,
              learnerMap: sub.learnerMap ?? false,
              trainerMap: sub.trainerMap ?? false,
              comment: sub.comment ?? '',
            }))
          : [],
        // Initialize unit-level properties for units without subUnit (Knowledge/Behaviour/Skills)
        learnerMap: hasSubUnit ? undefined : method.learnerMap ?? false,
        trainerMap: hasSubUnit ? undefined : method.trainerMap ?? false,
        comment: hasSubUnit ? undefined : method.comment ?? '',
      }
      updatedUnits = [...currentUnits, unitToAdd]
    }

    console.log('🚀 ~ handleCheckboxUnits ~ updatedUnits:', updatedUnits)
    setValue('units', updatedUnits, { shouldValidate: true })
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
    const payload = {
      ...data,
      id,
      user_id:
        userRole === 'Learner'
          ? learnerUserId
          : evidenceDetails?.data?.user?.user_id,
    }
    try {
      if (data.audio && !data.audio?.url) {
        const formData = new FormData()
        formData.append('audio', data.audio)
        const externalPayload = {
          id,
          data: formData,
        }
        await uploadExternalEvidenceFile(externalPayload).unwrap()
      }

      // Request signature with required roles
      const requiredRoles = data.signatures
        .filter((sig) => sig.signature_required)
        .map((sig) => sig.role)

      if (requiredRoles.length > 0) {
        await requestSignature({
          id,
          data: {
            roles: requiredRoles,
            user_id: learnerUserId,
          },
        }).unwrap()
      }
      await updateEvidenceId(payload).unwrap()

      dispatch(
        showMessage({
          message: 'Update successfully',
          variant: 'success',
        })
      )
      const isAdminOrIQA = ['Trainer', 'Admin', 'IQA'].includes(userRole)
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
              {errors.assessment_method && (
                <FormHelperText error>
                  {errors.assessment_method.message}
                </FormHelperText>
              )}
            </FormGroup>
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
            {/* Type Filter for Standard Courses */}
            {evidenceDetails?.data?.course_id?.course_core_type ===
              'Standard' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='body1' sx={{ mb: 1, fontWeight: 500 }}>
                  Select Type:
                </Typography>
                <FormGroup row>
                  {['Knowledge', 'Behaviour', 'Skills', 'Duty'].map((type) => (
                    <FormControlLabel
                      key={type}
                      control={
                        <Radio
                          checked={selectedUnitType === type}
                          onChange={() => {
                            setSelectedUnitType(type)
                          }}
                          disabled={isEditMode || !canEditLearnerFields}
                        />
                      }
                      label={type}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}

            {/* Unit selection for Qualification courses */}
            {evidenceDetails?.data?.course_id?.course_core_type ===
              'Qualification' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
                  Select Units:
                </Typography>
                <FormGroup row>
                  {evidenceDetails?.data?.course_id?.units?.map((unit) => (
                    <FormControlLabel
                      key={unit.id}
                      control={
                        <Checkbox
                          checked={selectedUnitIds.includes(unit.id)}
                          disabled={isEditMode || !canEditLearnerFields}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUnitIds([...selectedUnitIds, unit.id])
                              // Auto-add unit to form if not already present
                              const currentUnits = unitsWatch || []
                              if (
                                !currentUnits.some(
                                  (u) => String(u.id) === String(unit.id)
                                )
                              ) {
                                const hasSubUnit =
                                  unit.subUnit &&
                                  Array.isArray(unit.subUnit) &&
                                  unit.subUnit.length > 0
                                const unitToAdd = {
                                  ...unit,
                                  subUnit: hasSubUnit
                                    ? unit.subUnit.map((sub) => ({
                                        ...sub,
                                        learnerMap: sub.learnerMap ?? false,
                                        trainerMap: sub.trainerMap ?? false,
                                        signedOff: sub.signedOff ?? false,
                                        comment: sub.comment ?? '',
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
                              setSelectedUnitIds(
                                selectedUnitIds.filter((id) => id !== unit.id)
                              )
                            }
                          }}
                        />
                      }
                      label={unit.title}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}

            {/* Show units table for Standard and Qualification courses */}
            {(() => {
              const courseType =
                evidenceDetails?.data?.course_id?.course_core_type

              // For Standard courses, show table only when a type is selected
              if (courseType === 'Standard') {
                if (selectedUnitType === null) {
                  return null // Don't show table if no type is selected
                }
              }

              // For Qualification courses, show table only when units are selected
              if (courseType === 'Qualification') {
                if (selectedUnitIds.length === 0) {
                  return null // Don't show table if no units are selected
                }
              }

              return true
            })() && (
              <Box sx={{ mt: 3 }}>
                {/* Show units directly based on selected type for Standard courses */}
                {(() => {
                  const courseType =
                    evidenceDetails?.data?.course_id?.course_core_type

                  if (courseType === 'Standard' && selectedUnitType !== null) {
                    // Get all units of selected type from unitsWatch
                    const typeUnits = (unitsWatch || []).filter(
                      (unit) => unit.type === selectedUnitType
                    )

                    if (typeUnits.length === 0) return null

                    // For Knowledge, Behaviour, Skills: Combine all subUnits into one table
                    // For Duty: Show separate tables for each unit
                    const shouldCombineSubUnits = [
                      'Knowledge',
                      'Behaviour',
                      'Skills',
                    ].includes(selectedUnitType)

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
                          })
                        }
                      })

                      if (combinedSubUnits.length === 0) return null

                      return (
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant='h6'
                            sx={{ mb: 1, color: 'primary.main' }}
                          >
                            {selectedUnitType} Units
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
                                  <TableCell>Unit/Subunit name</TableCell>
                                  <TableCell>Trainer Comment</TableCell>
                                  <TableCell align='center'>Gap</TableCell>
                                  <TableCell align='center'>
                                    Signed Off
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
                                          : `${row.unitTitle} - ${row.title}`}
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
                          {/* Show validation error for combined Knowledge/Behaviour/Skills units */}
                          {(errors?.units as any)?.message && (
                            <FormHelperText error>
                              {(errors.units as any).message}
                            </FormHelperText>
                          )}
                        </Box>
                      )
                    } else {
                      // For Duty: Show separate tables for each unit
                      return (
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant='h6'
                            sx={{ mb: 1, color: 'primary.main' }}
                          >
                            {selectedUnitType} Units
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
                                            ? 'Subunit name'
                                            : 'Unit name'}
                                        </TableCell>
                                        <TableCell>Trainer Comment</TableCell>
                                        <TableCell align='center'>
                                          Gap
                                        </TableCell>
                                        <TableCell align='center'>
                                          Signed Off
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
                                {hasSubUnit &&
                                  errors?.units?.[unitIndex]?.subUnit
                                    ?.message && (
                                    <FormHelperText error>
                                      {errors.units[unitIndex].subUnit.message}
                                    </FormHelperText>
                                  )}
                              </Box>
                            )
                          })}
                        </Box>
                      )
                    }
                  } else {
                    // For Qualification courses: Show unit first, then its subUnits (only for selected units)
                    // Get selected units from unitsWatch that have subUnits
                    const displayUnits = (unitsWatch || []).filter(
                      (units) =>
                        selectedUnitIds.includes(units.id) &&
                        units.subUnit &&
                        units.subUnit.length > 0
                    )

                    if (displayUnits.length === 0) return null

                    return displayUnits.map((units) => {
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
                                  <TableCell>Subunit name</TableCell>
                                  <TableCell>Trainer Comment</TableCell>
                                  <TableCell align='center'>Gap</TableCell>
                                  <TableCell align='center'>
                                    Signed Off
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
                          {errors?.units?.[unitIndex]?.subUnit?.message && (
                            <FormHelperText error>
                              {errors.units[unitIndex].subUnit.message}
                            </FormHelperText>
                          )}
                           {(errors?.units as any)?.message && (
                            <FormHelperText error>
                              {(errors.units as any).message}
                            </FormHelperText>
                          )}
                        </Box>
                      )
                    })
                  }
                })()}
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
