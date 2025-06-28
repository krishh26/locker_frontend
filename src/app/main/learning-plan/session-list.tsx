'use client'
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  TextField,
  LinearProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Collapse,
  IconButton,
} from '@mui/material'
import { useEffect, useState } from 'react'
import {
  ExpandLess,
  ExpandMore,
  InsertEmoticon,
  SentimentNeutral,
  SentimentDissatisfied,
} from '@mui/icons-material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral'
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied'
import { redirect, useNavigate, useNavigation, useParams } from 'react-router-dom'
import {
  getLearnerDetails,
  selectLearnerManagement,
} from 'app/store/learnerManagement'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
const sessions = [
  {
    sessionNo: 2,
    date: '02/07/2025',
    start: '11:00',
    end: '12:00',
    type: 'General',
    assessor: 'Anushka Kerai',
    attended: '',
    feedback: '',
    course: 'TQUK Level 3 Diploma for Residential Childcare (RQF) - 60355554',
  },
  {
    sessionNo: 1,
    date: '06/06/2025',
    start: '12:30',
    end: '13:30',
    type: 'Induction',
    assessor: 'Anushka Kerai',
    attended: '',
    feedback: '',
    course: 'TQUK Level 3 Diploma for Residential Childcare (RQF) - 60355554',
  },
]

const SessionList = () => {
  const [feedback, setFeedback] = useState({})

  const { id: learner_id } = useParams()
 const navigate = useNavigate();
  const dispatch: any = useDispatch()
  const { learner } = useSelector(selectLearnerManagement)
  console.log('🚀 ~ SessionList ~ learner:', learner)

  useEffect(() => {
    if (!learner_id) {
      redirect('/home')
    }
  }, [learner_id])

  useEffect(() => {
    dispatch(getLearnerDetails(learner_id))
  }, [learner_id])

  const renderFilter = (label, options, value, onChange) => (
    <FormControl size='small' fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={onChange}>
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )

  if (!learner) {
    return <h1>Loading...</h1>
  }

  const handleFeedbackChange = (sessionNo, value) => {
    setFeedback((prev) => ({ ...prev, [sessionNo]: value }))
  }

  return (
    <Box p={3}>
      <div className='flex justify-between items-center'>
        <Typography variant='h4' mb={2} className='capitalize'>
          {learner.first_name} {learner.last_name} - All Courses
        </Typography>
        <div>
          <Button className='rounded-md' color='secondary' variant='outlined' onClick={() => navigate('/add-session')}>
            Add New Session
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Grid container spacing={2} mb={2}>
        {/* <Grid item xs={12} sm={2}>{renderFilter('Assessor', ['Anushka Kerai'], 'Anushka Kerai', () => {})}</Grid> */}
        {/* <Grid item xs={12} sm={2}>{renderFilter('Actions', ['View', 'Edit'], '', () => {})}</Grid> */}
        <Grid item xs={12} sm={2}>
          {renderFilter(
            'Status',
            ['Not started', 'In progress', 'Completed', 'Overdue'],
            '',
            () => {}
          )}
        </Grid>
        <Grid item xs={12} sm={2}>
          {renderFilter(
            'Type',
            [
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
            '',
            () => {}
          )}
        </Grid>
        <Grid item xs={12} sm={2}>
          {renderFilter('Unit', ['All Units'], '', () => {})}
        </Grid>
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
          {renderFilter('Course Name', ['All', 'Course 1'], 'All', () => {})}
        </Grid>
        {/* <Grid item xs={12} sm={4}>
          <Typography>
            <strong>Progress:</strong>
          </Typography>
          <LinearProgress variant='determinate' value={6} />
        </Grid> */}
      </Grid>

      {sessions.map((session, index) => (
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
                  <TableCell>{session.date}</TableCell>
                  <TableCell>{session.start}</TableCell>
                  <TableCell>{session.end}</TableCell>
                  <TableCell>{session.type}</TableCell>
                  <TableCell>{session.assessor}</TableCell>
                  <TableCell style={{ width: 150 }}>
                    <Select
                      size='small'
                      value={session.attended}
                      displayEmpty
                      fullWidth
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
                  <TableCell>
                    <Box display='flex' alignItems='center' gap={1}>
                      <IconButton
                        size='small'
                        onClick={() =>
                          handleFeedbackChange(session.sessionNo, 'happy')
                        }
                        color={
                          feedback[session.sessionNo] === 'happy'
                            ? 'primary'
                            : 'default'
                        }
                      >
                        <EmojiEmotionsIcon />
                      </IconButton>
                      <IconButton
                        size='small'
                        onClick={() =>
                          handleFeedbackChange(session.sessionNo, 'neutral')
                        }
                        color={
                          feedback[session.sessionNo] === 'neutral'
                            ? 'primary'
                            : 'default'
                        }
                      >
                        <SentimentNeutralIcon />
                      </IconButton>
                      <IconButton
                        size='small'
                        onClick={() =>
                          handleFeedbackChange(session.sessionNo, 'sad')
                        }
                        color={
                          feedback[session.sessionNo] === 'sad'
                            ? 'primary'
                            : 'default'
                        }
                      >
                        <SentimentDissatisfiedIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Typography variant='subtitle1' gutterBottom>
              {session.course}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

export default SessionList
