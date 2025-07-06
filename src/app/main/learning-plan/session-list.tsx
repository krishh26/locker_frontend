'use client'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  Stack,
  FormHelperText,
  DialogActions,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddFile from '@mui/icons-material/NoteAdd'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FileIcon from '@mui/icons-material/FilePresent'
import NotStartedIcon from '@mui/icons-material/StopCircle'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  useAddActionPlanerMutation,
  useDeleteActionPlanerMutation,
  useEditActionPlanerMutation,
  useGetLearnerPlanListQuery,
  useUpdateSessionMutation,
  useUploadActionFileMutation,
} from 'app/store/api/learner-plan-api'
import { showMessage } from 'app/store/fuse/messageSlice'
import {
  getLearnerDetails,
  selectLearnerManagement,
} from 'app/store/learnerManagement'
import { selectUser } from 'app/store/userSlice'
import { addDays, addMinutes, format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, redirect, useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { UserRole } from 'src/enum'
import { FileUploader } from 'react-drag-drop-files'

const schema = yup.object().shape({
  actionName: yup.string().required('Action name is required'),
  actionDescription: yup
    .string()
    .max(1000, 'Description cannot exceed 1000 characters'),
  targetDate: yup
    .date()
    .typeError('Target date is required')
    .nullable()
    .required('Target date is required'),
  onOffJob: yup.string(),
  who: yup
    .string()
    .oneOf(
      ['learner', 'assessor', 'employer', 'sessionLearner'],
      'Invalid action type'
    )
    .required('Please select an action type'),
  unit: yup.string().optional(),
})

const editSchema = yup.object().shape({
  actionDescription: yup.string().max(1000, 'Max 1000 characters'),
  trainer_feedback: yup.string().optional().nullable(),
  learner_feedback: yup.string().optional().nullable(),
  learner_status: yup.string(),
  onOffJob: yup.string(),
  targetDate: yup.date().typeError('Target date is required').nullable(),
  time_spent: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue == null
        ? undefined
        : Number(originalValue)
    )
    .optional()
    .typeError('Time spent must be a number'),
  status: yup.string(),
})

const FileTypes = [
  'JPG',
  'PNG',
  'GIF',
  'PDF',
  'DOCX',
  'XLSX',
  'PPTX',
  'TXT',
  'ZIP',
  'MP4',
]
const fileSchema = yup.object().shape({
  file: yup
    .mixed<File>()
    .required('A file is required')
    .test('fileSize', 'File is too large', (value): value is File => {
      return value instanceof File && value.size <= 10 * 1024 * 1024 // 10MB
    })
    .test('fileType', 'Unsupported file format', (value): value is File => {
      const extension = value?.name?.split('.').pop()?.toUpperCase()
      return (
        value instanceof File && !!extension && FileTypes.includes(extension)
      )
    }),
})

const SessionList = () => {
  const [feedback, setFeedback] = useState({})
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sessionListData, setSessionListData] = useState([])
  const [isOpenAction, setIsOpenAction] = useState('')
  const [openDeleteSession, setOpenDeleteSession] = useState('')
  const [openEditSession, setOpenEditSession] = useState('')
  const [openAddFile, setOpenAddFile] = useState('')
  const [unitList, setUnitList] = useState([])

  const { id: learner_id } = useParams()
  const navigate = useNavigate()
  const dispatch: any = useDispatch()

  const { learner, trainer } = useSelector(selectLearnerManagement)
  const user =
    JSON.parse(sessionStorage.getItem('learnerToken'))?.user ||
    useSelector(selectUser)?.data

  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      actionName: '',
      actionDescription: '',
      targetDate: null,
      onOffJob: 'Not-applicable',
      who: 'learner',
      unit: '',
    },
  })

  const {
    handleSubmit: editSubmit,
    control: editControl,
    watch: editWatch,
    formState: { errors: editErrors },
    reset: editReset,
  } = useForm({
    resolver: yupResolver(editSchema),
    defaultValues: {
      actionDescription: '',
      trainer_feedback: '',
      learner_feedback: '',
      learner_status: '',
      onOffJob: '',
      targetDate: null,
      time_spent: 0,
      status: 'not_started',
    },
  })
  console.log('🚀 ~ SessionList ~ editErrors:', editErrors)

  const {
    handleSubmit: fileSubmit,
    control: fileControl,
    formState: { errors: fileErrors },
  } = useForm({
    resolver: yupResolver(fileSchema),
    defaultValues: {
      file: null,
    },
  })

  useEffect(() => {
    if (!learner_id) {
      redirect('/home')
    }
  }, [learner_id])

  const { data, isLoading, isError, error, refetch } =
    useGetLearnerPlanListQuery(
      {
        learners: learner_id,
        type: typeFilter,
        Attended: statusFilter,
      },
      {
        skip: !user && !learner_id,
      }
    )

  const [updateSession] = useUpdateSessionMutation()
  const [addActionPlaner] = useAddActionPlanerMutation()
  const [editActionPlaner] = useEditActionPlanerMutation()
  const [deleteActionPlaner] = useDeleteActionPlanerMutation()
  const [uploadActionFile] = useUploadActionFileMutation()

  useEffect(() => {
    dispatch(getLearnerDetails(learner_id))
  }, [learner_id])

  useEffect(() => {
    if (!learner) {
      redirect('/home')
    }
  }, [learner])

  useEffect(() => {
    if (isError && error) {
      setSessionListData([])
      return
    }

    if (data && data?.data.length > 0) {
      const payload = data?.data.map((item) => {
        const minutes = Number(item.Duration)

        // Step 1: Get allowed course IDs for the target learner
        const learnerMapping = item.participant_course_mapping?.find(
          (mapping) => mapping.learner_id.toString() === learner_id.toString()
        )

        const allowedCourseIds = learnerMapping?.courses || []

        // Step 2: Filter courses for the learner
        const learnerCourses =
          item.courses?.filter((course) =>
            allowedCourseIds.includes(course.course_id)
          ) || []

        return {
          sessionNo: item.learner_plan_id,
          title: item.title,
          description: item.description,
          startDate: format(new Date(item.startDate), 'dd/MM/yyyy'),
          timeStart: format(new Date(item.startDate), 'HH:mm'),
          end: format(addMinutes(new Date(item.startDate), minutes), 'HH:mm'),
          type: item?.type,
          assessor: item.assessor_id?.user_name,
          Attended: item.Attended ? item.Attended : '',
          learner: Array.isArray(item.learners)
            ? item.learners.find((l) => l.learner_id === learner_id)
            : '',
          courses: learnerCourses
            .map((course) => course.course_name)
            .join(', '),
          feedback: item.feedback ? item.feedback : 'Neutral',
          units: learnerCourses.flatMap((course) =>
            (course.units || []).map((unit) => ({
              unit_id: unit.unit_id || null,
              unit_name: unit.unit_name || null,
            }))
          ),
          actionList: item.sessionLearnerActionDetails,
        }
      })
      setSessionListData(payload)
    } else {
      setSessionListData([])
    }
  }, [data, isLoading, isError, error])

  const renderFilter = ({ label, options, value, onChange }) => (
    <FormControl size='small' fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )

  const handleFeedbackChange = (sessionNo, value) => {
    setFeedback((prev) => ({ ...prev, [sessionNo]: value }))
  }

  const handleFilterChange = (value, setValue) => {
    if (value === 'All') {
      setValue('') // Clear filter
    } else {
      setValue(value)
    }
  }

  const handleUpdateSubmit = async (payload) => {
    try {
      await updateSession(payload).unwrap()
      dispatch(
        showMessage({
          message: 'Session updated successfully',
          variant: 'success',
        })
      )
    } catch (error) {
      console.log(error)
      dispatch(
        showMessage({ message: 'Failed to update session', variant: 'error' })
      )
    }
  }

  const onSubmit = async (data: any) => {
    const payload = {
      learner_plan_id: isOpenAction,
      action_name: data.actionName,
      action_description: data.actionDescription,
      target_date: format(data.targetDate, 'dd-MM-yyyy'),
      job_type: data.onOffJob,
      unit: data.unit,
      who: data.who,
    }

    try {
      await addActionPlaner({
        ...payload,
      }).unwrap()
      dispatch(
        showMessage({
          message: 'Action Planer added successfully',
          variant: 'success',
        })
      )
      refetch()
      setIsOpenAction('')
    } catch (error) {
      console.log(error)
      dispatch(
        showMessage({
          message: 'Failed to add action planer',
          variant: 'error',
        })
      )
    }
  }

  const handleDeleteSession = async () => {
    try {
      await deleteActionPlaner(openDeleteSession).unwrap()
      dispatch(
        showMessage({
          message: 'Session deleted successfully',
          variant: 'success',
        })
      )
      setOpenDeleteSession('')
      refetch()
    } catch (error) {
      console.log(error)
      dispatch(
        showMessage({ message: 'Failed to delete session', variant: 'error' })
      )
    }
  }

  const handleOpenDeleteSession = (sessionNo) => {
    setOpenDeleteSession(sessionNo)
  }

  const handleCloseDeleteSession = () => {
    setOpenDeleteSession('')
  }

  const handleOpenEditSession = (session) => {
    editReset({
      actionDescription: session.action_description,
      onOffJob: session.job_type,
      targetDate: session.target_date ? new Date(session.target_date) : '',
      time_spent: session.time_spent,
      trainer_feedback: session.trainer_feedback,
      learner_feedback: session.learner_feedback,
    })
    setOpenEditSession(session.action_id)
  }

  const handleCloseEditSession = () => {
    setOpenEditSession(null)
  }

  const handleEditSession = async (data) => {
    const payload = {
      id: openEditSession,
      learner_plan_id: openEditSession,
      trainer_feedback: data.trainer_feedback,
      learner_feedback: data.learner_feedback,
      action_description: data.actionDescription,
      target_date: data.targetDate
        ? format(new Date(data.targetDate), 'dd-MM-yyyy')
        : '',
      job_type: data.onOffJob,
      time_spent: data.time_spent,
      status: data.status,
    }

    try {
      await editActionPlaner(payload).unwrap()
      dispatch(
        showMessage({
          message: 'Session updated successfully',
          variant: 'success',
        })
      )
      setOpenEditSession(null)
      refetch()
    } catch (error) {
      console.log(error)
      dispatch(
        showMessage({ message: 'Failed to update session', variant: 'error' })
      )
    }
  }

  const desc = editWatch('actionDescription') || ''

  const handleAddFile = async (data) => {
    try {
      const formData = new FormData()
      formData.append('file', data.file)
      const payload = {
        id: openAddFile,
        data: formData,
      }
      await uploadActionFile(payload).unwrap()

      dispatch(
        showMessage({
          message: 'File uploaded successfully',
          variant: 'success',
        })
      )
      refetch()
      setOpenAddFile('')
    } catch (error) {
      console.log(error)
      dispatch(
        showMessage({ message: 'Failed to upload file', variant: 'error' })
      )
    }
  }

  return (
    <Box p={3}>
      <div className='flex justify-between items-center'>
        <Typography variant='h4' mb={2} className='capitalize'>
          {learner.first_name} {learner.last_name} - All Courses
        </Typography>
        <div>
          {user.roles.includes('Trainer') && (
            <Button
              variant='contained'
              color='primary'
              onClick={() => navigate(`/add-session`)}
            >
              Add Session
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Grid container spacing={2} mb={2}>
        {/* <Grid item xs={12} sm={2}>{renderFilter('Assessor', ['Anushka Kerai'], 'Anushka Kerai', () => {})}</Grid> */}
        {/* <Grid item xs={12} sm={2}>{renderFilter('Actions', ['View', 'Edit'], '', () => {})}</Grid> */}
        <Grid item xs={12} sm={2}>
          {renderFilter({
            label: 'Attended',
            value: statusFilter,
            onChange: (val) => handleFilterChange(val, setStatusFilter),
            options: [
              'All',
              'Cancelled',
              'Cancelled by Trainer',
              'Cancelled by Employee',
              'Learner not Attended',
            ],
          })}
        </Grid>
        <Grid item xs={12} sm={2}>
          {renderFilter({
            label: 'Type',
            value: typeFilter,
            onChange: (val) => handleFilterChange(val, setTypeFilter),
            options: [
              'All',
              'General',
              'Induction',
              'Formal Review',
              'Telephone',
              'Exit Session',
              'Out Of the Workplace',
              'Tests/Exams',
              'Learner Support',
              'Initial Session',
              'Gateway Ready',
              'EPA',
              'Furloughed',
            ],
          })}
        </Grid>
        {/* <Grid item xs={12} sm={2}>
          {renderFilter('Unit', ['All Units'], '', () => {})}
        </Grid> */}
      </Grid>

      {/* Learner Info */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4}>
          <Typography>
            <strong>Learner Name:</strong>{' '}
            <span className='capitalize'>
              {learner.first_name} {learner.last_name}
            </span>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={2}>
          {/* {renderFilter('Course Name', ['All', 'Course 1'], 'All', () => {})} */}
        </Grid>
        {/* <Grid item xs={12} sm={4}>
          <Typography>
            <strong>Progress:</strong>
          </Typography>
          <LinearProgress variant='determinate' value={6} />
        </Grid> */}
      </Grid>

      {isLoading && (
        <div className='flex items-center justify-center'>
          <LinearProgress />
        </div>
      )}

      {sessionListData.length === 0 && !isLoading ? (
        <>
          <div className='flex items-center justify-center'>
            <Typography variant='h4'>No Data Available.</Typography>
          </div>
        </>
      ) : (
        <>
          {sessionListData.map((session, index) => (
            <Card key={index} variant='outlined' sx={{ mb: 2 }}>
              <CardContent>
                <Table size='small'>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                      <TableCell>Session No</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Start</TableCell>
                      <TableCell>End</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Assessor</TableCell>
                      <TableCell>Attended</TableCell>
                      <TableCell>Learner Feedback</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{session.sessionNo}</TableCell>
                      <TableCell>{session.startDate}</TableCell>
                      <TableCell>{session.timeStart}</TableCell>
                      <TableCell>{session.end}</TableCell>
                      <TableCell>{session.type}</TableCell>
                      <TableCell>{session.assessor}</TableCell>
                      <TableCell style={{ width: 150 }}>
                        <Select
                          size='small'
                          value={
                            session.Attended === null ? '' : session.Attended
                          }
                          displayEmpty
                          fullWidth
                          disabled={
                            !user.roles.includes('Trainer') ||
                            !user.roles.includes('Admin')
                          }
                          onChange={(e) =>
                            handleUpdateSubmit({
                              Attended:
                                e.target.value === '' ? null : e.target.value,
                              id: session.sessionNo,
                            })
                          }
                        >
                          <MenuItem value=''>Select</MenuItem>
                          <MenuItem value='Cancelled'>Cancelled</MenuItem>
                          <MenuItem value='Cancelled by Trainer'>
                            Cancelled by Trainer
                          </MenuItem>
                          <MenuItem value='Cancelled by Learner'>
                            Cancelled by Learner
                          </MenuItem>
                          <MenuItem value='Cancelled by Employee'>
                            Cancelled by Employee
                          </MenuItem>
                          <MenuItem value='Learner not Attended'>
                            Learner not Attended
                          </MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell style={{ width: 150 }}>
                        <Tooltip title='Good'>
                          <IconButton
                            size='small'
                            color={
                              session.feedback === 'Good'
                                ? 'success'
                                : 'default'
                            }
                            onClick={() => {
                              if (
                                user.learner_id !== session.learner?.learner_id
                              )
                                return
                              handleUpdateSubmit({
                                feedback: 'Good',
                                id: session.sessionNo,
                              })
                            }}
                          >
                            🙂
                          </IconButton>
                        </Tooltip>

                        <Tooltip title='Neutral'>
                          <IconButton
                            size='small'
                            color={
                              session.feedback === 'Neutral'
                                ? 'warning'
                                : 'default'
                            }
                            onClick={() => {
                              if (
                                user.learner_id !== session.learner?.learner_id
                              )
                                return
                              handleUpdateSubmit({
                                feedback: 'Neutral',
                                id: session.sessionNo,
                              })
                            }}
                          >
                            😐
                          </IconButton>
                        </Tooltip>

                        <Tooltip title='Bad'>
                          <IconButton
                            size='small'
                            color={
                              session.feedback === 'Bad' ? 'error' : 'default'
                            }
                            onClick={() => {
                              if (
                                user.learner_id !== session.learner?.learner_id
                              )
                                return
                              handleUpdateSubmit({
                                feedback: 'Bad',
                                id: session.sessionNo,
                              })
                            }}
                          >
                            😞
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography className='font-bold'>
                      {session.courses}
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails className='px-6'>
                    <div className='flex items-end justify-end mb-8'>
                      <Button
                        variant='contained'
                        className='rounded-md'
                        color='primary'
                        size='small'
                        onClick={() => {
                          setUnitList(session.units)
                          setIsOpenAction(session.sessionNo)
                          reset()
                        }}
                      >
                        Add Action
                      </Button>
                    </div>

                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Who</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>File</TableCell>
                          <TableCell>Units</TableCell>
                          <TableCell>Target Date</TableCell>
                          <TableCell>Feedback</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {session.actionList.map((action) => (
                          <TableRow key={action.action_id}>
                            <TableCell>
                              {action.who === 'learner' ||
                              action.who === 'assessor' ||
                              action.sessionLearner === 'sessionLearner'
                                ? 'Learner'
                                : action.employer
                                ? 'Employer'
                                : ''}
                            </TableCell>
                            <TableCell>{action.action_name}</TableCell>
                            <TableCell>{action.action_description}</TableCell>
                            <TableCell>
                              {action.file_attachment ? (
                                <>
                                  <IconButton
                                    LinkComponent={'a'}
                                    href={action.file_attachment.file_url}
                                    target='_blank'
                                  >
                                    <FileIcon />
                                  </IconButton>
                                </>
                              ) : (
                                ''
                              )}
                            </TableCell>
                            <TableCell>
                              {action.unit ? `Unit ${action.unit}` : ''}
                            </TableCell>
                            <TableCell>
                              {action?.target_date
                                ? format(
                                    new Date(action.target_date),
                                    'dd/MM/yyyy'
                                  )
                                : ''}
                            </TableCell>
                            <TableCell
                              sx={{
                                width: '200px',
                              }}
                            >
                              {action.trainer_feedback ? (
                                <Typography>
                                  Feedback from Trainer :{' '}
                                  {action.trainer_feedback}
                                </Typography>
                              ) : (
                                ''
                              )}
                              {action.learner_feedback ? (
                                <Typography>
                                  Feedback from Leaner :{' '}
                                  {action.learner_feedback}
                                </Typography>
                              ) : (
                                ''
                              )}
                            </TableCell>
                            <TableCell>
                              {action.time_spent
                                ? `${action.time_spent} mins`
                                : ''}
                            </TableCell>
                            <TableCell>
                              {action.status === false ? (
                                <>
                                  <Tooltip title='Not Started'>
                                    <IconButton>
                                      <NotStartedIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              ) : (
                                <></>
                              )}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => handleOpenEditSession(action)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => setOpenAddFile(action.action_id)}
                              >
                                <AddFile />
                              </IconButton>
                              {(user.roles.includes(UserRole.Admin) ||
                                user.roles.includes(UserRole.Trainer)) && (
                                <IconButton
                                  onClick={() =>
                                    handleOpenDeleteSession(action.action_id)
                                  }
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </>
      )}
      <Dialog
        open={Boolean(isOpenAction)}
        onClose={() => setIsOpenAction('')}
        sx={{
          '.MuiDialog-paper': {
            borderRadius: '4px',
            padding: '1rem',
          },
        }}
      >
        <DialogTitle>Add Action</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack
                spacing={3}
                sx={{ maxWidth: 500, mx: 'auto' }}
                className='mt-8'
              >
                <Controller
                  name='actionName'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Action name'
                      fullWidth
                      error={!!errors.actionName}
                      helperText={errors.actionName?.message}
                    />
                  )}
                />

                <Controller
                  name='actionDescription'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Action Description'
                      fullWidth
                      multiline
                      minRows={3}
                      helperText={
                        errors.actionDescription?.message ||
                        `Remaining characters: ${
                          1000 - (field.value?.length || 0)
                        }`
                      }
                      error={!!errors.actionDescription}
                    />
                  )}
                />

                <Controller
                  name='targetDate'
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label='Target Date'
                      format='dd/MM/yyyy'
                      value={field.value ?? null}
                      onChange={(date) => field.onChange(date)}
                      minDate={addDays(new Date(), 1)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.targetDate,
                          helperText: errors.targetDate
                            ?.message as React.ReactNode,
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name='onOffJob'
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.onOffJob}>
                      <InputLabel>On/Off the Job</InputLabel>
                      <Select {...field} label='On/Off the Job'>
                        <MenuItem value='Not-applicable'>
                          Not Applicable
                        </MenuItem>
                        <MenuItem value='On-the-job'>On the Job</MenuItem>
                        <MenuItem value='Off-the-job'>Off the Job</MenuItem>
                      </Select>
                      <FormHelperText>
                        {errors.onOffJob?.message}
                      </FormHelperText>
                    </FormControl>
                  )}
                />

                <Controller
                  name='who'
                  control={control}
                  render={({ field }) => (
                    <FormControl error={!!errors.who}>
                      <FormLabel>Action</FormLabel>
                      <RadioGroup {...field}>
                        <FormControlLabel
                          value='assessor'
                          control={<Radio />}
                          label='Action myself'
                        />
                        <FormControlLabel
                          value='learner'
                          control={<Radio />}
                          label='Action Learner'
                        />
                        <FormControlLabel
                          value='employer'
                          control={<Radio />}
                          label='Action employer'
                        />
                        <FormControlLabel
                          value='sessionLearner'
                          control={<Radio />}
                          label='Session Learner Action'
                        />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
                <Controller
                  name='unit'
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel id='unit-select-label'>
                        Unit (Optional)
                      </InputLabel>
                      <Select
                        {...field}
                        labelId='unit-select-label'
                        label='Unit (Optional)'
                      >
                        <MenuItem value=''>
                          <em>None</em>
                        </MenuItem>
                        {unitList.map((unit) => (
                          <MenuItem key={unit.unit_id} value={unit.unit_id}>
                            {unit.unit_name}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {fieldState.error?.message}
                      </FormHelperText>
                    </FormControl>
                  )}
                />

                <Button variant='contained' type='submit'>
                  Submit
                </Button>

                <div style={{ fontSize: 13, color: '#555' }}>
                  Be SMART with your actions. Is your action Specific,
                  Measurable, Achievable, Realistic and does it have a Target
                  date?
                </div>
              </Stack>
            </form>
          </LocalizationProvider>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(openDeleteSession)}
        onClose={handleCloseDeleteSession}
      >
        <DialogTitle>Delete Session</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this session?
        </DialogContent>
        <DialogActions>
          <Button
            variant='outlined'
            color='secondary'
            onClick={handleCloseDeleteSession}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleDeleteSession}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(openEditSession)}
        onClose={handleCloseEditSession}
        sx={{
          '.MuiDialog-paper': {
            borderRadius: '4px',
            padding: '1rem',
          },
        }}
      >
        <DialogTitle>Edit Action</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <form onSubmit={editSubmit(handleEditSession)}>
              <Stack
                spacing={3}
                sx={{ width: 500, mx: 'auto' }}
                className='mt-8'
              >
                <Controller
                  name='actionDescription'
                  control={editControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Action Description'
                      fullWidth
                      multiline
                      minRows={3}
                      error={!!editErrors.actionDescription}
                      helperText={
                        editErrors.actionDescription?.message ||
                        `Remaining left characters:- ${1000 - desc.length}`
                      }
                    />
                  )}
                />

                <Controller
                  name='trainer_feedback'
                  control={editControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Trainer Feedback'
                      fullWidth
                      multiline
                      disabled={
                        !user.roles.includes(UserRole.Trainer) ||
                        !user.roles.includes(UserRole.Admin)
                      }
                      minRows={2}
                    />
                  )}
                />

                <Controller
                  name='learner_feedback'
                  control={editControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Learner Feedback'
                      fullWidth
                      multiline
                      minRows={2}
                      disabled={!user.roles.includes(UserRole.Learner)}
                    />
                  )}
                />

                <Controller
                  name='learner_status'
                  control={editControl}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      disabled={!user.roles.includes(UserRole.Learner)}
                    >
                      <InputLabel>Learner Status</InputLabel>
                      <Select {...field} label='Learner Status'>
                        <MenuItem value='not_started'>not started</MenuItem>
                        <MenuItem value='in_progress'>in progress</MenuItem>
                        <MenuItem value='completed'>completed</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name='targetDate'
                  control={editControl}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label='Target Date'
                      format='dd/MM/yyyy'
                      value={field.value ?? null}
                      onChange={(date) => field.onChange(date)}
                      minDate={addDays(new Date(), 1)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!editErrors.targetDate,
                          helperText: editErrors.targetDate
                            ?.message as React.ReactNode,
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name='onOffJob'
                  control={editControl}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!editErrors.onOffJob}>
                      <InputLabel>On/Off the Job</InputLabel>
                      <Select {...field} label='On/Off the Job'>
                        <MenuItem value='Not-applicable'>
                          Not Applicable
                        </MenuItem>
                        <MenuItem value='On-the-job'>On the Job</MenuItem>
                        <MenuItem value='Off-the-job'>Off the Job</MenuItem>
                      </Select>
                      <FormHelperText>
                        {editErrors.onOffJob?.message}
                      </FormHelperText>
                    </FormControl>
                  )}
                />

                <Controller
                  name='time_spent'
                  control={editControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Time Spent'
                      fullWidth
                      type='number'
                      error={!!editErrors.time_spent}
                      helperText={editErrors.time_spent?.message}
                    />
                  )}
                />

                <Controller
                  name='status'
                  control={editControl}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!editErrors.status}
                      disabled={
                        !user.roles.includes(UserRole.Trainer) ||
                        !user.roles.includes(UserRole.Admin)
                      }
                    >
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label='Status'>
                        <MenuItem value='not_started'>Not Started</MenuItem>
                        <MenuItem value='in-progress'>In Progress</MenuItem>
                        <MenuItem value='completed'>Completed</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                <Button variant='contained' type='submit'>
                  Submit
                </Button>
              </Stack>
            </form>
          </LocalizationProvider>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(openAddFile)}
        onClose={() => setOpenAddFile('')}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <form onSubmit={fileSubmit(handleAddFile)}>
          <DialogTitle id='alert-dialog-title'>
            Manage Actions Files
          </DialogTitle>
          <DialogContent sx={{ width: 500, mx: 'auto' }}>
            <Grid className='w-full mt-4'>
              {/* File upload */}
              <Controller
                name='file'
                control={fileControl}
                render={({ field }) => (
                  <FileUploader
                    handleChange={(file: File) => {
                      field.onChange(file)
                    }}
                    name='file'
                    types={FileTypes}
                    multiple={false}
                    maxSize={10}
                  >
                    <div
                      className={`relative border border-dashed border-gray-300 p-20 cursor-pointer rounded-md hover:shadow-md transition-all h-[200px] flex flex-col items-center justify-center ${
                        fileErrors.file ? 'border-red-500' : ''
                      }`}
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
              <FormHelperText className='text-red-500'>
                {fileErrors.file?.message?.toString() || ''}
              </FormHelperText>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddFile('')} color='secondary'>
              Cancel
            </Button>
            <Button type='submit' color='primary' autoFocus>
              Upload
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default SessionList
