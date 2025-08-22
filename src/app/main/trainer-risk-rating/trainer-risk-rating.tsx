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
  Card,
  CardContent,
  Paper,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Badge,
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import SaveIcon from '@mui/icons-material/Save'
import PersonIcon from '@mui/icons-material/Person'
import SchoolIcon from '@mui/icons-material/School'
import AssessmentIcon from '@mui/icons-material/Assessment'
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
  useSaveCourseCommentMutation,
} from 'app/store/api/trainer-risk-rating-api'

const riskOptions = [
  {
    value: 'Please select',
    label: 'Please select',
  },
  {
    value: 'Low',
    label: 'Low',
    color: 'success',
  },
  {
    value: 'Medium',
    label: 'Medium',
    color: 'warning',
  },
  {
    value: 'High',
    label: 'High',
    color: 'error',
  },
]

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
  console.log('🚀 ~ TrainerRiskRating ~ courseRatings:', courseRatings)
  const [assessmentRiskRating, setAssessmentRiskRating] = useState<{
    [key: number]: string
  }>({})
  console.log(
    '🚀 ~ TrainerRiskRating ~ assessmentRiskRating:',
    assessmentRiskRating
  )
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  })

  const dispatch: any = useDispatch()
  const { trainer = [] } = useSelector(selectLearnerManagement)

  useEffect(() => {
    dispatch(getRoleAPI('Trainer'))
  }, [])

  // ✅ API hooks
  const { data: trainerDetails, isLoading } = useGetTrainerDetailsQuery(
    selectedUser?.user_id,
    { skip: !selectedUser }
  )
  const [saveRiskSettings, { isLoading: savingSettings }] =
    useSaveTrainerRiskSettingsMutation()
  const [saveCourseRisk, { isLoading: savingCourseRisk }] =
    useSaveCourseRiskRatingsMutation()
  const [saveCourseComment, { isLoading: savingComment }] =
    useSaveCourseCommentMutation()

  // Mock until API courses returned
  const courses = trainerDetails?.data?.courses || []

  useEffect(() => {
    if (trainerDetails?.data?.assessment_methods) {
      setAssessmentRiskRating(trainerDetails?.data?.assessment_methods)
    }
  }, [trainerDetails])

  useEffect(() => {
    if (
      trainerDetails &&
      Object.keys(trainerDetails?.data?.risk_rating_info.assessment_methods)
        ?.length > 0
    ) {
      const updated: { [key: number]: string } = {}
      // trainerDetails?.data[0]?.assessment_methods.forEach(
      //   (c: any) =>
      //     (updated[c.assessment_method] =
      //       c.risk_level === '' ? 'Please select' : c.risk_level)
      // )
      Object.keys(
        trainerDetails?.data?.risk_rating_info.assessment_methods
      ).forEach(
        (key) =>
          (updated[
            trainerDetails?.data?.risk_rating_info.assessment_methods[
              key
            ].assessment_method
          ] =
            trainerDetails?.data?.risk_rating_info.assessment_methods[key] ===
            ''
              ? 'Please select'
              : trainerDetails?.data?.risk_rating_info.assessment_methods[key]
                  .risk_level)
      )
      console.log('🚀 ~ TrainerRiskRating ~ updated:', updated)

      setAssessmentRiskRating(updated)
    }

    if (trainerDetails?.data?.courses) {
      const updated: { [key: number]: string } = {}
      trainerDetails?.data?.courses.forEach(
        (c: any) =>
          (updated[c.course_id] =
            c.risk_rating.overall_risk_level === ''
              ? 'Please select'
              : c.risk_rating.overall_risk_level)
      )
      setCourseRatings(updated)
    }
  }, [trainerDetails])

  const handleRatingChange = (courseId: number, value: string) => {
    console.log('🚀 ~ handleRatingChange ~ value:', value)
    setCourseRatings((prev) => ({ ...prev, [courseId]: value }))
  }

  const handleAssessmentRatingChange = (method: string, value: string) => {
    setAssessmentRiskRating((prev) => ({ ...prev, [method]: value }))
  }

  const handleBulkSet = (value: string) => {
    const updated: { [key: number]: string } = {}
    courses.forEach((c: any) => (updated[c.course_id] = value))
    setCourseRatings(updated)
    showSnackbar(`All courses set to ${value} risk level`, 'success')
  }

  const handleAssessmentRisk = (value: string) => {
    const updated: { [key: string]: string } = {}
    assessmentMethods.forEach((c) => (updated[c.value] = value))
    setAssessmentRiskRating(updated)
    showSnackbar(`All assessment methods set to ${value} risk level`, 'success')
  }

  const handleSaveComment = async (courseId: number, index: number) => {
    try {
      const body = {
        course_comments: {
          course_id: courseId,
          comment: comments[index],
        },
      }

      await saveCourseComment({
        trainerId: selectedUser.user_id,
        body,
      }).unwrap()

      setExpandedRow(null)
      showSnackbar('Comment saved successfully', 'success')
    } catch (error) {
      showSnackbar('Failed to save comment', 'error')
    }
  }

  const handleSaveRiskSettings = async () => {
    try {
      await saveRiskSettings({
        trainerId: selectedUser.user_id,
        data: riskSettings,
      }).unwrap()
      showSnackbar('Risk settings saved successfully', 'success')
    } catch (error) {
      showSnackbar('Failed to save risk settings', 'error')
    }
  }

  const handleSaveCourseRatings = async () => {
    const courses = Object.entries(courseRatings).map(([id, risk]) => ({
      course_id: Number(id),
      overall_risk_level: risk === 'Please select' ? '' : risk,
    }))

    const payload = {
      trainer_id: selectedUser.user_id,
      courses,
    }

    try {
      await saveCourseRisk({ data: payload }).unwrap()
      showSnackbar('Course risk ratings saved successfully', 'success')
    } catch (error) {
      console.error('Error saving course risk ratings:', error)
      showSnackbar('Failed to save course risk ratings', 'error')
    }
  }

  const handleSaveAssessmentRatings = async () => {
    const assessment_methods = Object.entries(assessmentRiskRating).map(
      ([id, risk]) => ({
        assessment_method: id,
        risk_level: risk === 'Please select' ? '' : risk,
      })
    )

    const payload = {
      trainer_id: selectedUser.user_id,
      assessment_methods,
    }

    try {
      await saveCourseRisk({ data: payload }).unwrap()
      showSnackbar('Assessment risk ratings saved successfully', 'success')
    } catch (error) {
      console.error('Error saving assessment risk ratings:', error)
      showSnackbar('Failed to save assessment risk ratings', 'error')
    }
  }

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning'
  ) => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const getRiskColor = (riskLevel: string) => {
    const option = riskOptions.find((opt) => opt.value === riskLevel)
    return option?.color || 'default'
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        {/* Trainer List */}
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display='flex' alignItems='center' gap={1} mb={2}>
                <PersonIcon color='primary' />
                <Typography variant='h6' fontWeight='bold'>
                  Trainers
                </Typography>
                <Badge
                  badgeContent={trainer.length}
                  color='primary'
                  className='ml-6'
                />
              </Box>
              <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                {trainer.map((user) => (
                  <ListItem key={user.user_id} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      selected={selectedUser?.user_id === user.user_id}
                      onClick={() => {
                        setSelectedUser(user)
                        setExpandedRow(null)
                        setCourseRatings({})
                        setAssessmentRiskRating({})
                      }}
                      sx={{
                        borderRadius: 2,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={user.avatar?.url || ''}
                          alt={user.first_name}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor:
                              selectedUser?.user_id === user.user_id
                                ? 'white'
                                : 'primary.main',
                            color:
                              selectedUser?.user_id === user.user_id
                                ? 'primary.main'
                                : 'white',
                          }}
                        >
                          {user.first_name[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${user.first_name} ${user.last_name}`}
                        secondary={user.email}
                        primaryTypographyProps={{
                          fontWeight:
                            selectedUser?.user_id === user.user_id
                              ? 'bold'
                              : 'normal',
                        }}
                        secondaryTypographyProps={{
                          color:
                            selectedUser?.user_id === user.user_id
                              ? 'rgba(255,255,255,0.7)'
                              : 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {selectedUser ? (
            <Box>
              {/* Header */}
              <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    <Avatar
                      src={selectedUser.avatar?.url || ''}
                      alt={selectedUser.first_name}
                      sx={{ width: 60, height: 60 }}
                    >
                      {selectedUser.first_name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant='h5' fontWeight='bold'>
                        {selectedUser.first_name} {selectedUser.last_name}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {selectedUser.email}
                      </Typography>
                    </Box>
                  </Box>

                  {isLoading && (
                    <Box display='flex' justifyContent='center' p={2}>
                      <CircularProgress />
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Risk Settings */}
              <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant='h6' fontWeight='bold' mb={2}>
                    Risk Settings Configuration
                  </Typography>
                  <Grid container spacing={2} alignItems='center'>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label='High Risk %'
                        value={riskSettings.high}
                        onChange={(e) =>
                          setRiskSettings({
                            ...riskSettings,
                            high: e.target.value,
                          })
                        }
                        fullWidth
                        size='small'
                        type='number'
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label='Medium Risk %'
                        value={riskSettings.medium}
                        onChange={(e) =>
                          setRiskSettings({
                            ...riskSettings,
                            medium: e.target.value,
                          })
                        }
                        fullWidth
                        size='small'
                        type='number'
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label='Low Risk %'
                        value={riskSettings.low}
                        onChange={(e) =>
                          setRiskSettings({
                            ...riskSettings,
                            low: e.target.value,
                          })
                        }
                        fullWidth
                        size='small'
                        type='number'
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Button
                        variant='contained'
                        color='primary'
                        onClick={handleSaveRiskSettings}
                        disabled={savingSettings}
                        startIcon={
                          savingSettings ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SaveIcon />
                          )
                        }
                        fullWidth
                      >
                        {savingSettings ? 'Saving...' : 'Save Settings'}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Courses Section */}
              <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                  <Box
                    display='flex'
                    alignItems='center'
                    justifyContent='space-between'
                    mb={3}
                  >
                    <Box display='flex' alignItems='center' gap={1}>
                      <SchoolIcon color='primary' />
                      <Typography variant='h6' fontWeight='bold'>
                        Courses ({courses.length})
                      </Typography>
                    </Box>
                    <Box display='flex' gap={1} flexWrap='wrap'>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={() => handleBulkSet('Low')}
                        sx={{
                          borderColor: 'success.main',
                          color: 'success.main',
                        }}
                      >
                        Set All Low
                      </Button>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={() => handleBulkSet('Medium')}
                        sx={{
                          borderColor: 'warning.main',
                          color: 'warning.main',
                        }}
                      >
                        Set All Medium
                      </Button>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={() => handleBulkSet('High')}
                        sx={{ borderColor: 'error.main', color: 'error.main' }}
                      >
                        Set All High
                      </Button>
                      <Button
                        variant='contained'
                        color='secondary'
                        onClick={handleSaveCourseRatings}
                        disabled={savingCourseRisk}
                        startIcon={
                          savingCourseRisk ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SaveIcon />
                          )
                        }
                      >
                        {savingCourseRisk ? 'Saving...' : 'Save Courses'}
                      </Button>
                    </Box>
                  </Box>

                  <Paper elevation={1}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            Course Name
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>
                            Risk Level
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 'bold', width: '100px' }}
                          >
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {courses.map((course: any, index: number) => (
                          <>
                            <TableRow key={course.course_id} hover>
                              <TableCell>
                                <Typography variant='body1' fontWeight='medium'>
                                  {course.course_name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <TextField
                                  select
                                  value={
                                    courseRatings[course.course_id] ??
                                    course.risk_rating.overall_risk_level
                                  }
                                  onChange={(e) =>
                                    handleRatingChange(
                                      course.course_id,
                                      e.target.value
                                    )
                                  }
                                  size='small'
                                  fullWidth
                                  sx={{
                                    '& .MuiSelect-select': {
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1,
                                    },
                                  }}
                                >
                                  {riskOptions.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                      {opt.value !== 'Please select' && (
                                        <Chip
                                          label={opt.label}
                                          size='small'
                                          color={opt.color as any}
                                          sx={{ ml: 1 }}
                                        />
                                      )}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </TableCell>
                              <TableCell>
                                <Tooltip title='Add comment'>
                                  <IconButton
                                    onClick={() =>
                                      setExpandedRow(
                                        expandedRow === index ? null : index
                                      )
                                    }
                                    color={
                                      expandedRow === index
                                        ? 'primary'
                                        : 'default'
                                    }
                                  >
                                    <AddCircleIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={3} sx={{ p: 0 }}>
                                <Collapse
                                  in={expandedRow === index}
                                  timeout='auto'
                                  unmountOnExit
                                >
                                  <Box
                                    p={3}
                                    bgcolor='grey.50'
                                    borderTop={1}
                                    borderColor='grey.200'
                                  >
                                    <Typography
                                      variant='subtitle2'
                                      mb={2}
                                      fontWeight='bold'
                                    >
                                      Add Comment for {course.course_name}
                                    </Typography>
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
                                      placeholder='Enter your comment here...'
                                    />
                                    <Box mt={2} display='flex' gap={2}>
                                      <Button
                                        variant='contained'
                                        onClick={() =>
                                          handleSaveComment(
                                            course.course_id,
                                            index
                                          )
                                        }
                                        disabled={savingComment}
                                        startIcon={
                                          savingComment ? (
                                            <CircularProgress size={20} />
                                          ) : (
                                            <SaveIcon />
                                          )
                                        }
                                      >
                                        {savingComment
                                          ? 'Saving...'
                                          : 'Save Comment'}
                                      </Button>
                                      <Button
                                        variant='outlined'
                                        onClick={() => setExpandedRow(null)}
                                      >
                                        Cancel
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
                  </Paper>
                </CardContent>
              </Card>

              {/* Assessment Method Risk */}
              <Card elevation={2}>
                <CardContent>
                  <Box
                    display='flex'
                    alignItems='center'
                    justifyContent='space-between'
                    mb={3}
                  >
                    <Box display='flex' alignItems='center' gap={1}>
                      <AssessmentIcon color='primary' />
                      <Typography variant='h6' fontWeight='bold'>
                        Assessment Method Risk ({assessmentMethods.length})
                      </Typography>
                    </Box>
                    <Box display='flex' gap={1} flexWrap='wrap'>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={() => handleAssessmentRisk('Low')}
                        sx={{
                          borderColor: 'success.main',
                          color: 'success.main',
                        }}
                      >
                        Set All Low
                      </Button>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={() => handleAssessmentRisk('Medium')}
                        sx={{
                          borderColor: 'warning.main',
                          color: 'warning.main',
                        }}
                      >
                        Set All Medium
                      </Button>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={() => handleAssessmentRisk('High')}
                        sx={{ borderColor: 'error.main', color: 'error.main' }}
                      >
                        Set All High
                      </Button>
                      <Button
                        variant='contained'
                        color='secondary'
                        onClick={handleSaveAssessmentRatings}
                        disabled={savingCourseRisk}
                        startIcon={
                          savingCourseRisk ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SaveIcon />
                          )
                        }
                      >
                        {savingCourseRisk ? 'Saving...' : 'Save Assessment'}
                      </Button>
                    </Box>
                  </Box>

                  <Paper elevation={1}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            Assessment Method
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>
                            Risk Level
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {assessmentMethods.map((assessment) => (
                          <TableRow key={assessment.value} hover>
                            <TableCell>
                              <Box display='flex' alignItems='center' gap={2}>
                                <Chip
                                  label={assessment.label}
                                  size='small'
                                  color='primary'
                                  variant='outlined'
                                />
                                <Typography variant='body1'>
                                  {assessment.fullName}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <TextField
                                select
                                value={
                                  assessmentRiskRating[assessment.value] || ''
                                }
                                onChange={(e) =>
                                  handleAssessmentRatingChange(
                                    assessment.value,
                                    e.target.value
                                  )
                                }
                                size='small'
                                fullWidth
                                sx={{
                                  '& .MuiSelect-select': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  },
                                }}
                              >
                                {riskOptions.map((opt) => (
                                  <MenuItem key={opt.label} value={opt.value}>
                                    {opt.label}
                                    {opt.value !== 'Please select' && (
                                      <Chip
                                        label={opt.label}
                                        size='small'
                                        color={opt.color as any}
                                        sx={{ ml: 1 }}
                                      />
                                    )}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Card elevation={2}>
              <CardContent>
                <Box
                  display='flex'
                  flexDirection='column'
                  alignItems='center'
                  py={8}
                >
                  <PersonIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography
                    variant='h6'
                    color='text.secondary'
                    textAlign='center'
                  >
                    Select a trainer from the list to view their courses and
                    assessment methods
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default TrainerRiskRating
