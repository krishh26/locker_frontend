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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  useGetLearnerPlanListQuery,
  useUpdateSessionMutation,
} from 'app/store/api/learner-plan-api'
import { showMessage } from 'app/store/fuse/messageSlice'
import {
  getLearnerDetails,
  selectLearnerManagement,
} from 'app/store/learnerManagement'
import { selectUser } from 'app/store/userSlice'
import { addMinutes, format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, redirect, useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'

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
  onOffJob: yup.string().required('Please select On/Off the Job'),
  actionType: yup
    .string()
    .oneOf(
      [
        'Action myself',
        'Action Learner',
        'Action employer',
        'Session Learner Action',
      ],
      'Invalid action type'
    )
    .required('Please select an action type'),
  unit: yup.string().optional(),
})

const editSchema = yup.object().shape({
  actionDescription: yup
    .string()
    .max(1000, 'Max 1000 characters')
    .required('Action Description is required'),
  assessorFeedback: yup.string().optional(),
  learnerFeedback: yup.string().optional(),
  learnerStatus: yup.string().required(),
  onOffJob: yup.string().required('Select On/Off the Job'),
  targetDate: yup.date().typeError('Target date is required').nullable().required('Target Date is required'),
})

const SessionList = () => {
  const [feedback, setFeedback] = useState({})
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sessionListData, setSessionListData] = useState([])
  const [isOpenAction, setIsOpenAction] = useState(false)
  const [openDeleteSession, setOpenDeleteSession] = useState(false)
  const [openEditSession, setOpenEditSession] = useState(false)
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
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      actionName: '',
      actionDescription: '',
      targetDate: null,
      onOffJob: '',
      actionType: 'Action Learner',
      unit: '',
    },
  })

  const {
    handleSubmit: editSubmit,
    control: editControl,
    watch: editWatch,
    formState: { errors: editErrors },
  } = useForm({
    resolver: yupResolver(editSchema),
    defaultValues: {
      actionDescription: '',
      assessorFeedback: '',
      learnerFeedback: '',
      learnerStatus: '',
      onOffJob: '',
      targetDate: null,
    },
  })

  useEffect(() => {
    if (!learner_id) {
      redirect('/home')
    }
  }, [learner_id])

  const { data, isLoading, isError, error } = useGetLearnerPlanListQuery(
    {
      learners: learner_id,
      type: typeFilter,
    },
    {
      skip: !user && !learner_id,
    }
  )

  const [updateSession] = useUpdateSessionMutation()

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
          learner: Array.isArray(item.learners) ? item.learners[0] : '',
          courses: item.courses?.map((course) => course.course_name).join(', '),
          feedback: item.feedback ? item.feedback : 'Neutral',
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

  const onSubmit = (data: any) => {
    console.log('Form Data:', data)
  }

  const handleDeleteSession = async (sessionNo) => {
    try {
      // await deleteSession(sessionNo).unwrap()
      dispatch(
        showMessage({
          message: 'Session deleted successfully',
          variant: 'success',
        })
      )
      setOpenDeleteSession(false)
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
    setOpenDeleteSession(false)
  }

  const handleOpenEditSession = (session) => {
    setOpenEditSession(session)
  }

  const handleCloseEditSession = () => {
    setOpenEditSession(null)
  }

  const handleEditSession = () => {
    try {
    } catch (error) {}
  }

  const desc = editWatch('actionDescription') || ''
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
                        onClick={() => setIsOpenAction(session.sessionNo)}
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
                          <TableCell>Files</TableCell>
                          <TableCell>Units</TableCell>
                          <TableCell>Target Date</TableCell>
                          <TableCell>Feedback</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableCell>Learner</TableCell>
                        <TableCell>Dev</TableCell>
                        <TableCell>Test</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell>03/09/2025</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleOpenEditSession(session)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() =>
                              handleOpenDeleteSession(session.sessionNo)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
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
        onClose={() => setIsOpenAction(false)}
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
                        <MenuItem value='Not Applicable'>
                          Not Applicable
                        </MenuItem>
                        <MenuItem value='On the Job'>On the Job</MenuItem>
                        <MenuItem value='Off the Job'>Off the Job</MenuItem>
                      </Select>
                      <FormHelperText>
                        {errors.onOffJob?.message}
                      </FormHelperText>
                    </FormControl>
                  )}
                />

                <Controller
                  name='actionType'
                  control={control}
                  render={({ field }) => (
                    <FormControl error={!!errors.actionType}>
                      <FormLabel>Action</FormLabel>
                      <RadioGroup {...field}>
                        <FormControlLabel
                          value='Action myself'
                          control={<Radio />}
                          label='Action myself'
                        />
                        <FormControlLabel
                          value='Action Learner'
                          control={<Radio />}
                          label='Action Learner'
                        />
                        <FormControlLabel
                          value='Action employer'
                          control={<Radio />}
                          label='Action employer'
                        />
                        <FormControlLabel
                          value='Session Learner Action'
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
                  render={({ field }) => (
                    <TextField {...field} label='Unit (Optional)' fullWidth />
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
            <form onSubmit={editSubmit(onSubmit)} noValidate>
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
                  name='assessorFeedback'
                  control={editControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Assessor Feedback'
                      fullWidth
                      multiline
                      minRows={2}
                    />
                  )}
                />

                <Controller
                  name='learnerFeedback'
                  control={editControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Learner Feedback'
                      fullWidth
                      multiline
                      minRows={2}
                    />
                  )}
                />

                <Controller
                  name='learnerStatus'
                  control={editControl}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Learner Status</InputLabel>
                      <Select {...field} label='Learner Status'>
                        <MenuItem value='not started'>not started</MenuItem>
                        <MenuItem value='in progress'>in progress</MenuItem>
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
                        <MenuItem value='Not Applicable'>
                          Not Applicable
                        </MenuItem>
                        <MenuItem value='On the Job'>On the Job</MenuItem>
                        <MenuItem value='Off the Job'>Off the Job</MenuItem>
                      </Select>
                      <FormHelperText>
                        {editErrors.onOffJob?.message}
                      </FormHelperText>
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
    </Box>
  )
}

export default SessionList
