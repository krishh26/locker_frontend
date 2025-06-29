'use client'
import {
  Box,
  Button,
  Card,
  CardContent,
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
  Typography
} from '@mui/material'
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
import {
  redirect,
  useNavigate,
  useParams
} from 'react-router-dom'

const SessionList = () => {
  const [feedback, setFeedback] = useState({})
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sessionListData, setSessionListData] = useState([])
  const { id: learner_id } = useParams()
  const navigate = useNavigate()
  const dispatch: any = useDispatch()
  const { learner } = useSelector(selectLearnerManagement)
  const user =
    JSON.parse(sessionStorage.getItem('learnerToken'))?.user ||
    useSelector(selectUser)?.data

  useEffect(() => {
    if (!learner_id) {
      redirect('/home')
    }
  }, [learner_id])

  const { data, isLoading, isError, error } = useGetLearnerPlanListQuery(
    {
      assessor_id: user.user_id,
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
              onClick={() =>
                navigate(`/add-session`)
              }
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
            label: 'Status',
            value: statusFilter,
            onChange: (val) => handleFilterChange(val, setStatusFilter),
            options: [
              'All',
              'Not started',
              'In progress',
              'Completed',
              'Overdue',
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
                          value={session.Attended}
                          displayEmpty
                          fullWidth
                          onChange={(e) =>
                            handleUpdateSubmit({
                              Attended: e.target.value,
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
                              if (user.user_id !== session.learner?.learner_id)
                                return
                              updateSession({
                                id: session.id,
                                feedback: 'Good',
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
                              if (user.user_id !== session.learner?.learner_id)
                                return
                              updateSession({
                                id: session.id,
                                feedback: 'Neutral',
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
                              if (user.user_id !== session.learner?.learner_id)
                                return
                              updateSession({
                                id: session.id,
                                feedback: 'Bad',
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
                <Typography variant='subtitle1' gutterBottom>
                  {session.courses}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </Box>
  )
}

export default SessionList
