'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  TextField,
  Button,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Collapse,
  Divider,
  ListItemAvatar,
  Avatar,
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import { AssessmentMethod } from 'src/app/component/Courses/types'
import { useDispatch } from 'react-redux'
import {
  getRoleAPI,
  selectLearnerManagement,
} from 'app/store/learnerManagement'
import { useSelector } from 'react-redux'

// ✅ API slice imports
import {
  useGetTrainerDetailsQuery,
  useSaveTrainerRiskSettingsMutation,
  useSaveCourseRiskRatingsMutation,
  useSaveAssessmentRiskRatingsMutation,
  useSaveCourseCommentMutation,
} from 'app/store/api/trainer-risk-rating-api'

const riskOptions = ['Low', 'Medium', 'High']

const assessmentMethods: AssessmentMethod[] = [
  { value: 'pe', label: 'PE', fullName: 'Professional Discussion' },
  { value: 'do', label: 'DO', fullName: 'Direct Observation' },
  { value: 'wt', label: 'WT', fullName: 'Witness Testimony' },
  { value: 'qa', label: 'QA', fullName: 'Question and Answer' },
  { value: 'ps', label: 'PS', fullName: 'Product Sample' },
  { value: 'di', label: 'DI', fullName: 'Discussion' },
  { value: 'si', label: 'SI', fullName: 'Simulation' },
  { value: 'ee', label: 'ET', fullName: 'Expert Evidence' },
  { value: 'ba', label: 'RA', fullName: 'Basic Assessment' },
  { value: 'ot', label: 'OT', fullName: 'Other' },
  { value: 'ipl', label: 'RPL', fullName: 'Individual Personal Log' },
  { value: 'lo', label: 'LO', fullName: 'Learning Outcome' },
]

const TrainerRiskRating = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [comments, setComments] = useState<{ [key: number]: string }>({})
  const [riskSettings, setRiskSettings] = useState({
    high: '',
    medium: '',
    low: '',
  })
  const [courseRatings, setCourseRatings] = useState<{ [key: number]: string }>(
    {}
  )
  const [assessmentRiskRating, setAssessmentRiskRating] = useState<{
    [key: string]: string
  }>({})

  const dispatch: any = useDispatch()
  const { trainer = [] } = useSelector(selectLearnerManagement)

  useEffect(() => {
    dispatch(getRoleAPI('Trainer'))
  }, [])

  // ✅ API hooks
  const { data: trainerDetails } = useGetTrainerDetailsQuery(
    selectedUser?.user_id,
    { skip: !selectedUser }
  )
  const [saveRiskSettings] = useSaveTrainerRiskSettingsMutation()
  const [saveCourseRisk] = useSaveCourseRiskRatingsMutation()
  const [saveAssessmentRisk] = useSaveAssessmentRiskRatingsMutation()
  const [saveCourseComment] = useSaveCourseCommentMutation()

  // Mock until API courses returned
  const courses = trainerDetails?.courses || []

  const handleRatingChange = (courseId: number, value: string) => {
    setCourseRatings((prev) => ({ ...prev, [courseId]: value }))
  }

  const handleAssessmentRatingChange = (method: string, value: string) => {
    setAssessmentRiskRating((prev) => ({ ...prev, [method]: value }))
  }

  const handleBulkSet = (value: string) => {
    const updated: { [key: number]: string } = {}
    courses.forEach((c: any) => (updated[c.id] = value))
    setCourseRatings(updated)
  }

  const handleAssessmentRisk = (value: string) => {
    const updated: { [key: string]: string } = {}
    assessmentMethods.forEach((c) => (updated[c.value] = value))
    setAssessmentRiskRating(updated)
  }

  const handleSaveComment = async (courseId: number, index: number) => {
    await saveCourseComment({
      trainerId: selectedUser.user_id,
      courseId,
      comment: comments[index],
    })
    setExpandedRow(null)
  }

  const handleSaveRiskSettings = async () => {
    await saveRiskSettings({ trainerId: selectedUser.user_id, data: riskSettings })
  }

  const handleSaveCourseRatings = async () => {
    await saveCourseRisk({ trainerId: selectedUser.user_id, data: courseRatings })
  }

  const handleSaveAssessmentRatings = async () => {
    await saveAssessmentRisk({
      trainerId: selectedUser.user_id,
      data: assessmentRiskRating,
    })
  }

  return (
    <Grid container spacing={2} p={2}>
      {/* User List */}
      <Grid item xs={3}>
        <List
          sx={{ border: '1px solid #ddd', maxHeight: 400, overflow: 'auto' }}
        >
          {trainer.map((user) => (
            <ListItem key={user.user_id} disablePadding>
              <ListItemButton
                selected={selectedUser?.user_id === user.user_id}
                onClick={() => setSelectedUser(user)}
              >
                <ListItemAvatar>
                  <Avatar src={user.avatar?.url || ''} alt={user.first_name}>
                    {user.first_name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${user.first_name} ${user.last_name}`}
                  secondary={user.email}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Grid>

      {/* Risk Settings & Course Table */}
      <Grid item xs={9}>
        {selectedUser ? (
          <>
            <Typography variant='h6' gutterBottom>
              Trainer Risk Rating - {selectedUser.first_name}{' '}
              {selectedUser.last_name}
            </Typography>

            {/* Risk Inputs */}
            <Box display='flex' gap={2} mb={2}>
              <TextField
                label='High %'
                value={riskSettings.high}
                onChange={(e) =>
                  setRiskSettings({ ...riskSettings, high: e.target.value })
                }
              />
              <TextField
                label='Medium %'
                value={riskSettings.medium}
                onChange={(e) =>
                  setRiskSettings({ ...riskSettings, medium: e.target.value })
                }
              />
              <TextField
                label='Low %'
                value={riskSettings.low}
                onChange={(e) =>
                  setRiskSettings({ ...riskSettings, low: e.target.value })
                }
              />
              <TextField
                label='Reminder Date'
                type='date'
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant='contained'
                color='primary'
                onClick={handleSaveRiskSettings}
              >
                Save
              </Button>
            </Box>

            {/* Courses */}
            <Box
              display='flex'
              alignItems='center'
              justifyContent='space-between'
              gap={2}
              mb={2}
            >
              <Box>
                <h2>Courses</h2>
              </Box>
              <Box display='flex' alignItems='center' gap={2}>
                <Button variant='outlined' onClick={() => handleBulkSet('Low')}>
                  Set all Low
                </Button>
                <Button
                  variant='outlined'
                  onClick={() => handleBulkSet('Medium')}
                >
                  Set all Medium
                </Button>
                <Button
                  variant='outlined'
                  onClick={() => handleBulkSet('High')}
                >
                  Set all High
                </Button>
                <Button
                  variant='contained'
                  color='secondary'
                  onClick={handleSaveCourseRatings}
                >
                  Save
                </Button>
              </Box>
            </Box>

            {/* Courses Table */}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Course Name</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.map((course: any, index: number) => (
                  <>
                    <TableRow key={course.id}>
                      <TableCell>{course.name}</TableCell>
                      <TableCell sx={{ width: '30%' }}>
                        <TextField
                          select
                          value={courseRatings[course.id] || 'Medium'}
                          onChange={(e) =>
                            handleRatingChange(course.id, e.target.value)
                          }
                          size='small'
                          fullWidth
                        >
                          {riskOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() =>
                            setExpandedRow(expandedRow === index ? null : index)
                          }
                        >
                          <AddCircleIcon color='primary' />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} sx={{ p: 0 }}>
                        <Collapse
                          in={expandedRow === index}
                          timeout='auto'
                          unmountOnExit
                        >
                          <Box p={2} bgcolor='#f9f9f9'>
                            <TextField
                              label='Comment'
                              multiline
                              fullWidth
                              minRows={3}
                              value={comments[index] || ''}
                              onChange={(e) =>
                                setComments((prev) => ({
                                  ...prev,
                                  [index]: e.target.value,
                                }))
                              }
                            />
                            <Box mt={2} display='flex' gap={2}>
                              <Button
                                variant='contained'
                                onClick={() =>
                                  handleSaveComment(course.id, index)
                                }
                              >
                                Save
                              </Button>
                              <Button
                                variant='outlined'
                                onClick={() => setExpandedRow(null)}
                              >
                                Close
                              </Button>
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>

            <Divider sx={{ my: 2 }} />

            {/* Assessment Method Risk */}
            <Box
              display='flex'
              alignItems='center'
              justifyContent='space-between'
              gap={2}
              mb={2}
            >
              <Box>
                <h2>Assessment Method Risk</h2>
              </Box>
              <Box display='flex' alignItems='center' gap={2}>
                <Button
                  variant='outlined'
                  onClick={() => handleAssessmentRisk('Low')}
                >
                  Set all Low
                </Button>
                <Button
                  variant='outlined'
                  onClick={() => handleAssessmentRisk('Medium')}
                >
                  Set all Medium
                </Button>
                <Button
                  variant='outlined'
                  onClick={() => handleAssessmentRisk('High')}
                >
                  Set all High
                </Button>
                <Button
                  variant='contained'
                  color='secondary'
                  onClick={handleSaveAssessmentRatings}
                >
                  Save
                </Button>
              </Box>
            </Box>

            {/* Assessment Table */}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Assessment Name</TableCell>
                  <TableCell>Risk Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assessmentMethods.map((assessment) => (
                  <TableRow key={assessment.value}>
                    <TableCell>{assessment.fullName}</TableCell>
                    <TableCell sx={{ width: '30%' }}>
                      <TextField
                        select
                        value={assessmentRiskRating[assessment.value] || 'Medium'}
                        onChange={(e) =>
                          handleAssessmentRatingChange(
                            assessment.value,
                            e.target.value
                          )
                        }
                        size='small'
                        fullWidth
                      >
                        {riskOptions.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        ) : (
          <Typography>Select a user to view courses</Typography>
        )}
      </Grid>
    </Grid>
  )
}

export default TrainerRiskRating
