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
import {
  fetchCourseById,
  selectCourseManagement,
} from 'app/store/courseManagement'
import { showMessage } from 'app/store/fuse/messageSlice'
import { useDispatch } from 'react-redux'
import {
  useLearnerId,
  useLearnerUserId,
  useUserRole,
} from 'src/app/utils/userHelpers'
import { formatSessionTime } from 'src/utils/string'
import { selectGlobalUser } from 'app/store/globalUser'
import { getTrainerAPI, selectSession } from 'app/store/session'
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

  const singleCourse = useSelector(selectCourseManagement)
  const learnerUserId = useLearnerUserId()
  const learnerId = useLearnerId()
  const userRole = useUserRole()
  const { currentUser, selectedUser, selected } = useSelector(selectGlobalUser)
  const session = useSelector(selectSession)

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(getValidationSchema()),
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
      declaration: false,
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

  const [evidenceData, setEvidenceData] = useState<{
    course_id: string
    file: {
      key: string
      name: string
      url: string
      size: number
    }
    created_at: string
    user: {
      name: string
      roles: string[]
    }
    units: [
      {
        id: string
        title: string
        subUnit: [
          {
            id: number
            learnerMap: boolean
            subTitle: string
            comment: string
            trainerMap: boolean
          }
        ]
      }
    ]
  }>({
    course_id: '',
    file: {
      key: '',
      name: '',
      url: '',
      size: 0,
    },
    created_at: '',
    user: {
      name: '',
      roles: [],
    },
    units: [
      {
        id: '',
        subUnit: [
          {
            id: 0,
            comment: '',
            learnerMap: false,
            subTitle: '',
            trainerMap: false,
          },
        ],
        title: '',
      },
    ],
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
        course_id,
        created_at,
        file,
        user,
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
      dispatch(fetchCourseById(course_id.course_id))
      setEvidenceData({
        created_at,
        file: {
          key: file.key,
          name: file.name,
          url: file.url,
          size: file.size,
        },
        course_id: '',
        user: {
          name: `${user.first_name} ${user.last_name}`,
          roles: user.roles,
        },
        units: course_id.units,
      })
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
      setValue('units', units ? units : [])
      setValue('session', session ? session : '')
      setValue('audio', external_feedback ? external_feedback : '')
      setValue('evidence_time_log', evidenceDetails.data.evidence_time_log || false)
    }
  }, [evidenceDetails, setValue, isError, id, isLoading])

  // Initialize time log data when evidence details are loaded
  useEffect(() => {
    if (evidenceDetails?.data && learnerUserId) {
      const evidence = evidenceDetails.data
      
      // Get units from evidence data as array (will be synced when unitsWatch changes)
      const evidenceUnits = evidence.units && evidence.units.length > 0 
        ? evidence.units.map((unit) => unit?.title || '').filter(Boolean)
        : []
      
      setTimeLogData((prev) => ({
        ...prev,
        user_id: selected ? selectedUser?.user_id : currentUser?.user_id || learnerUserId,
        course_id: evidence.course_id?.course_id || prev.course_id,
        unit: evidenceUnits.length > 0 ? evidenceUnits : prev.unit,
        impact_on_learner: evidence.description || prev.impact_on_learner,
        evidence_link: evidence.file?.url || window.location.href,
      }))
    }
  }, [evidenceDetails, learnerUserId, selected, selectedUser, currentUser])

  // Watch units from form - must be declared before any conditional returns
  const unitsWatch = watch('units')
  console.log("🚀 ~ CreateViewEvidenceLibrary ~ unitsWatch:", unitsWatch)
  
  // Sync selected units from evidence form to time log
  useEffect(() => {
    if (unitsWatch && unitsWatch.length > 0) {
      // Get all selected unit titles as an array for time log
      const selectedUnitTitles = unitsWatch.map((unit) => unit?.title || '').filter(Boolean)
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
    const exists = currentUnits.find((unit) => unit.id === method.id)
    let updatedUnits = []

    if (exists) {
      updatedUnits = currentUnits.filter((unit) => unit.id !== method.id)
    } else {
      updatedUnits = [...currentUnits, method]
    }

    setValue('units', updatedUnits, { shouldValidate: true })
  }

  const learnerMapHandler = (row) => {
    const updated = [...unitsWatch]
    updated.forEach((unit) => {
      unit.subUnit.forEach((sub) => {
        if (sub.id === row.id) {
          sub.learnerMap = !sub.learnerMap
        }
      })
    })
    setValue('units', updated)
    trigger('units')
  }

  const selectAllLearnerMapHandler = (unitIndex, checked) => {
    const updated = [...unitsWatch]
    updated[unitIndex].subUnit.forEach((sub) => {
      sub.learnerMap = checked
    })
    setValue('units', updated)
    trigger('units')
  }

  const trainerMapHandler = (row) => {
    const updated = [...unitsWatch]
    updated.forEach((unit) => {
      unit.subUnit.forEach((sub) => {
        if (sub.id === row.id) {
          sub.trainerMap = !sub.trainerMap
        }
      })
    })
    setValue('units', updated)
  }

  const commentHandler = (e, id) => {
    const updated = [...unitsWatch]
    updated.forEach((unit) => {
      unit.subUnit.forEach((sub) => {
        if (sub.id === id) {
          sub.comment = e.target.value
        }
      })
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
        const selectedUnits = unitsWatch && unitsWatch.length > 0
          ? unitsWatch.map((unit) => unit?.title || '').filter(Boolean)
          : evidence.units && evidence.units.length > 0
          ? evidence.units.map((unit) => unit?.title || '').filter(Boolean)
          : []
        
        setTimeLogData((prev) => ({
          ...prev,
          user_id: selected ? selectedUser?.user_id : currentUser?.user_id || learnerUserId,
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
      user_id: learnerUserId,
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
      navigate(`/evidenceLibrary`)
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
          onClick={() => openFilePreview(evidenceData.file.url)}
          sx={{ cursor: 'pointer' }}
        >
          <InsertDriveFileOutlinedIcon color='action' />
          <Box>
            <Typography
              variant='body2'
              color='primary'
              sx={{ fontWeight: 500, cursor: 'pointer' }}
            >
              {evidenceData.file?.name}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {Math.round(evidenceData.file.size / 1024)} KB
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              display='block'
            >
              {evidenceData.user.name} on{' '}
              {new Date(evidenceData.created_at).toLocaleDateString()}
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
                  disabled={isEditMode}
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
                  disabled={isEditMode}
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
              render={({ field }) => (
                <TextField
                  name='title'
                  size='small'
                  multiline
                  rows={4}
                  fullWidth
                  disabled={isEditMode || userRole !== 'Trainer'}
                  style={
                    userRole !== 'Trainer' || isEditMode
                      ? { backgroundColor: 'whitesmoke' }
                      : {}
                  }
                  error={!!errors.trainer_feedback}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='body1' gutterBottom>
              Points for Improvement
            </Typography>
            <Controller
              name='points_for_improvement'
              control={control}
              render={({ field }) => (
                <TextField
                  name='title'
                  size='small'
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.points_for_improvement}
                  disabled={isEditMode || userRole !== 'Trainer'}
                  style={
                    userRole !== 'Trainer' || isEditMode
                      ? { backgroundColor: 'whitesmoke' }
                      : {}
                  }
                  {...field}
                />
              )}
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
                  disabled={isEditMode || userRole !== 'Learner'}
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
                  disabled={isEditMode}
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
                            disabled={isEditMode}
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
                      control={<Radio disabled={isEditMode} />}
                      label='Yes'
                    />
                    <FormControlLabel
                      value='no'
                      control={<Radio disabled={isEditMode} />}
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
                    disabled={isEditMode}
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
                  disabled={isEditMode}
                  error={!!errors.grade}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body1' gutterBottom>
              Select Unit
            </Typography>
            <FormGroup className='flex flex-row'>
              {singleCourse?.unitData?.map((method) => (
                <FormControlLabel
                  key={method.id}
                  control={
                    <Checkbox
                      checked={!!(watch('units') && watch('units').some((unit) => unit.id == method.id))}
                      onChange={(e) => handleCheckboxUnits(e, method)}
                      name='units'
                      disabled={isEditMode}
                      style={
                        userRole !== 'Learner'
                          ? { backgroundColor: 'whitesmoke' }
                          : {}
                      }
                    />
                  }
                  label={method.title}
                />
              ))}
            </FormGroup>
            {errors.units && (
              <FormHelperText error>{errors.units.message}</FormHelperText>
            )}
            {unitsWatch?.map((units, unitIndex) => (
              <Box key={units.id} className='flex flex-col gap-2'>
                <Typography variant='h5'>{units.title}</Typography>
                <TableContainer>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell align='center'>
                          <Checkbox
                            checked={units.subUnit.every((s) => s.learnerMap)}
                            onChange={(e) =>
                              selectAllLearnerMapHandler(
                                unitIndex,
                                e.target.checked
                              )
                            }
                            disabled={isEditMode}
                          />
                        </TableCell>
                        <TableCell>Subunit name</TableCell>
                        <TableCell>Trainer Comment</TableCell>
                        <TableCell align='center'>Gap</TableCell>
                        <TableCell align='center'>Trainer's Map</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {units?.subUnit?.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell align='center'>
                            <Checkbox
                              checked={row?.learnerMap || false}
                              onChange={() => learnerMapHandler(row)}
                              disabled={isEditMode}
                            />
                          </TableCell>
                          <TableCell>{row?.subTitle}</TableCell>
                          <TableCell>
                            {userRole === 'Learner' ? (
                              row?.comment
                            ) : (
                              <TextField
                                size='small'
                                value={row?.comment || ''}
                                onChange={(e) => commentHandler(e, row.id)}
                              />
                            )}
                          </TableCell>
                          <TableCell align='center'>
                            <div className='border-2 border-gray-500 w-[16px] h-[16px] p-[1px]'>
                              <div
                                style={{
                                  backgroundColor:
                                    row.learnerMap && row.trainerMap
                                      ? 'green'
                                      : row.learnerMap || row.trainerMap
                                      ? 'orange'
                                      : 'maroon',
                                  width: '100%',
                                  height: '100%',
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell align='center'>
                            <Checkbox
                              checked={row?.trainerMap || false}
                              disabled={userRole === 'Learner' || isEditMode}
                              onChange={() => trainerMapHandler(row)}
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
              </Box>
            ))}
          </Grid>
          <Grid item xs={12}>
            <SignatureTable
              control={control}
              errors={errors}
              watch={watch}
              disabled={isEditMode}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name='declaration'
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      color='primary'
                      disabled={isEditMode}
                    />
                  }
                  label={
                    <Typography variant='body1'>
                      Please tick to confirm.
                      <br />I declare that all material in this submission is my
                      own work except where there is clear acknowledgement and
                      appropriate reference to the work of others.
                    </Typography>
                  }
                />
              )}
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
              onClick={() => navigate('/evidenceLibrary')}
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
        maxWidth="md"
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
            edit="Save"
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
