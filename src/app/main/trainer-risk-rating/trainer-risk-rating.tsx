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
import { themeHelpers } from '../../utils/themeUtils'
import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'

// ✅ API slice imports
import {
  useGetTrainerDetailsQuery,
  useSaveTrainerRiskSettingsMutation,
  useSaveCourseRiskRatingsMutation,
  useSaveCourseCommentMutation,
} from 'app/store/api/trainer-risk-rating-api'

// Styled Components
const ThemedBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
}))

const ThemedCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: themeHelpers.getShadow(theme, 2),
  '&:hover': {
    boxShadow: themeHelpers.getShadow(theme, 4),
  },
}))

const ThemedCardContent = styled(CardContent)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}))

const ThemedPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: themeHelpers.getShadow(theme, 1),
}))

const ThemedTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '& .MuiTableCell-head': {
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
  },
}))

const ThemedTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.04),
  },
}))

const ThemedTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}))

const ThemedButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: themeHelpers.getShadow(theme, 1),
  '&:hover': {
    boxShadow: themeHelpers.getShadow(theme, 3),
  },
}))

const ThemedPrimaryButton = styled(ThemedButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}))

const ThemedSecondaryButton = styled(ThemedButton)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.secondary.dark,
  },
}))

const ThemedOutlinedButton = styled(ThemedButton)(({ theme }) => ({
  borderColor: theme.palette.primary.main,
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.08),
  },
}))

const ThemedIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.08),
  },
  '&:active': {
    backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.12),
  },
}))

const ThemedListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  marginBottom: theme.spacing(0.5),
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  '&:hover': {
    backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.08),
  },
}))

const ThemedTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
}))

const ThemedChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&.MuiChip-colorSuccess': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  '&.MuiChip-colorWarning': {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
  '&.MuiChip-colorError': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}))

const ThemedSnackbar = styled(Snackbar)(({ theme }) => ({
  '& .MuiAlert-root': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius * 2,
  },
}))

const ThemedBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}))

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
  const theme = useTheme()
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [comments, setComments] = useState<{ [key: number]: string }>({})
  const [riskSettings, setRiskSettings] = useState({
    high: '',
    medium: '',
    low: '',
  })
  const [riskSettingsErrors, setRiskSettingsErrors] = useState({
    high: '',
    medium: '',
    low: '',
    general: '',
  })
  const [courseRatings, setCourseRatings] = useState<{ [key: number]: string }>(
    {}
  )
  const [assessmentRiskRating, setAssessmentRiskRating] = useState<{
    [key: number]: string
  }>({})
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
        trainerId: trainerDetails?.data?.risk_rating_info?.id,
        body,
      }).unwrap()

      setExpandedRow(null)
      showSnackbar('Comment saved successfully', 'success')
    } catch (error) {
      showSnackbar('Failed to save comment', 'error')
    }
  }

  const handleSaveRiskSettings = async () => {
    // Validate risk settings before saving
    if (!validateRiskSettings(riskSettings)) {
      showSnackbar('Please fix validation errors before saving', 'error')
      return
    }

    const courses = Object.entries(courseRatings).map(([id, risk]) => ({
      course_id: Number(id),
      overall_risk_level: risk === 'Please select' ? '' : risk,
    }))

    const payload = {
      trainer_id: selectedUser.user_id,
      high_percentage: Number(riskSettings.high),
      medium_percentage: Number(riskSettings.medium),
      low_percentage: Number(riskSettings.low),
      courses,
    }

    try {
      await saveCourseRisk({ data: payload }).unwrap()
      showSnackbar('Risk settings saved successfully', 'success')
    } catch (error) {
      console.error('Error saving risk settings:', error)
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

  // Validation function for risk settings
  const validateRiskSettings = (settings: {
    high: string
    medium: string
    low: string
  }) => {
    const errors = { high: '', medium: '', low: '', general: '' }
    let hasErrors = false

    // Convert to numbers for validation
    const highValue = parseFloat(settings.high) || 0
    const mediumValue = parseFloat(settings.medium) || 0
    const lowValue = parseFloat(settings.low) || 0

    // Check if all fields are filled
    if (!settings.high || !settings.medium || !settings.low) {
      errors.general = 'All risk percentage fields are required'
      hasErrors = true
    }

    // Check if values are valid numbers and within range
    if (
      settings.high &&
      (isNaN(highValue) || highValue < 0 || highValue > 100)
    ) {
      errors.high = 'High risk must be between 0 and 100'
      hasErrors = true
    }

    if (
      settings.medium &&
      (isNaN(mediumValue) || mediumValue < 0 || mediumValue > 100)
    ) {
      errors.medium = 'Medium risk must be between 0 and 100'
      hasErrors = true
    }

    if (settings.low && (isNaN(lowValue) || lowValue < 0 || lowValue > 100)) {
      errors.low = 'Low risk must be between 0 and 100'
      hasErrors = true
    }

    // Check if high risk value limits other fields
    if (highValue > 0 && (mediumValue > highValue || lowValue > highValue)) {
      errors.medium =
        mediumValue > highValue
          ? `Cannot exceed high risk value (${highValue})`
          : ''
      errors.low =
        lowValue > highValue
          ? `Cannot exceed high risk value (${highValue})`
          : ''
      hasErrors = true
    }

    // Check if medium risk value limits low risk field
    if (mediumValue > 0 && lowValue > mediumValue) {
      errors.low = `Cannot exceed medium risk value (${mediumValue})`
      hasErrors = true
    }

    // Check if all values sum to 100
    const total = highValue + mediumValue + lowValue
    if (total !== 100) {
      errors.general = `Risk percentages must sum to 100 (current total: ${total})`
      hasErrors = true
    }

    setRiskSettingsErrors(errors)
    return !hasErrors
  }


  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const getRiskColor = (riskLevel: string) => {
    const option = riskOptions.find((opt) => opt.value === riskLevel)
    return option?.color || 'default'
  }

  return (
    <ThemedBox sx={{ p: 3, minHeight: '100vh' }}>
      <Grid container spacing={3}>
        {/* Trainer List */}
        <Grid item xs={12} md={3}>
          <ThemedCard elevation={2}>
            <ThemedCardContent>
              <Box display='flex' alignItems='center' gap={1} mb={2}>
                <PersonIcon sx={{ color: theme.palette.primary.main }} />
                <ThemedTypography variant='h6' fontWeight='bold' mr={1}>
                  Trainers
                </ThemedTypography>
                <ThemedBadge
                  badgeContent={trainer.length}
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                    },
                  }}
                />
              </Box>
              <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                {trainer.map((user) => (
                  <ListItem key={user.user_id} disablePadding sx={{ mb: 1 }}>
                    <ThemedListItemButton
                      selected={selectedUser?.user_id === user.user_id}
                      onClick={() => {
                        setSelectedUser(user)
                        setExpandedRow(null)
                        setCourseRatings({})
                        setAssessmentRiskRating({})
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
                                ? theme.palette.primary.contrastText
                                : theme.palette.primary.main,
                            color:
                              selectedUser?.user_id === user.user_id
                                ? theme.palette.primary.main
                                : theme.palette.primary.contrastText,
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
                          color: 'inherit',
                        }}
                        secondaryTypographyProps={{
                          color:
                            selectedUser?.user_id === user.user_id
                              ? 'rgba(255,255,255,0.7)'
                              : theme.palette.text.secondary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      />
                    </ThemedListItemButton>
                  </ListItem>
                ))}
              </List>
            </ThemedCardContent>
          </ThemedCard>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {selectedUser ? (
            <Box>
              {/* Header */}
              <ThemedCard elevation={2} sx={{ mb: 3 }}>
                <ThemedCardContent>
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    <Avatar
                      src={selectedUser.avatar?.url || ''}
                      alt={selectedUser.first_name}
                      sx={{ width: 60, height: 60 }}
                    >
                      {selectedUser.first_name[0]}
                    </Avatar>
                    <Box>
                      <ThemedTypography variant='h5' fontWeight='bold'>
                        {selectedUser.first_name} {selectedUser.last_name}
                      </ThemedTypography>
                      <ThemedTypography variant='body2' color='text.secondary'>
                        {selectedUser.email}
                      </ThemedTypography>
                    </Box>
                  </Box>

                  {isLoading && (
                    <Box display='flex' justifyContent='center' p={2}>
                      <CircularProgress
                        sx={{ color: theme.palette.primary.main }}
                      />
                    </Box>
                  )}
                </ThemedCardContent>
              </ThemedCard>

              {/* Risk Settings */}
              <ThemedCard elevation={2} sx={{ mb: 3 }}>
                <ThemedCardContent>
                  <ThemedTypography variant='h6' fontWeight='bold' mb={2}>
                    Risk Settings Configuration
                  </ThemedTypography>
                  <Grid container spacing={2} alignItems='center'>
                    <Grid item xs={12} sm={3}>
                      <ThemedTextField
                        label='High Risk %'
                        value={riskSettings.high}
                        onChange={(e) => {
                          const newSettings = {
                            ...riskSettings,
                            high: e.target.value,
                          }
                          setRiskSettings(newSettings)
                          // Validate in real-time
                          validateRiskSettings(newSettings)
                        }}
                        fullWidth
                        size='small'
                        type='number'
                        error={!!riskSettingsErrors.high}
                        helperText={riskSettingsErrors.high}
                        inputProps={{ min: 0, max: 100 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <ThemedTextField
                        label='Medium Risk %'
                        value={riskSettings.medium}
                        onChange={(e) => {
                          const newSettings = {
                            ...riskSettings,
                            medium: e.target.value,
                          }
                          setRiskSettings(newSettings)
                          // Validate in real-time
                          validateRiskSettings(newSettings)
                        }}
                        fullWidth
                        size='small'
                        type='number'
                        error={!!riskSettingsErrors.medium}
                        helperText={riskSettingsErrors.medium}
                        inputProps={{ min: 0, max: 100 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <ThemedTextField
                        label='Low Risk %'
                        value={riskSettings.low}
                        onChange={(e) => {
                          const newSettings = {
                            ...riskSettings,
                            low: e.target.value,
                          }
                          setRiskSettings(newSettings)
                          // Validate in real-time
                          validateRiskSettings(newSettings)
                        }}
                        fullWidth
                        size='small'
                        type='number'
                        error={!!riskSettingsErrors.low}
                        helperText={riskSettingsErrors.low}
                        inputProps={{ min: 0, max: 100 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <ThemedPrimaryButton
                        variant='contained'
                        onClick={handleSaveRiskSettings}
                        disabled={savingCourseRisk}
                        startIcon={
                          savingCourseRisk ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SaveIcon />
                          )
                        }
                        fullWidth
                      >
                        {savingCourseRisk ? 'Saving...' : 'Save Settings'}
                      </ThemedPrimaryButton>
                    </Grid>
                  </Grid>
                  {riskSettingsErrors.general && (
                    <Alert severity='error' sx={{ mt: 2 }}>
                      {riskSettingsErrors.general}
                    </Alert>
                  )}
                </ThemedCardContent>
              </ThemedCard>

              {/* Courses Section */}
              <ThemedCard elevation={2} sx={{ mb: 3 }}>
                <ThemedCardContent>
                  <Box
                    display='flex'
                    alignItems='center'
                    justifyContent='space-between'
                    mb={3}
                  >
                    <Box display='flex' alignItems='center' gap={1}>
                      <SchoolIcon sx={{ color: theme.palette.primary.main }} />
                      <ThemedTypography variant='h6' fontWeight='bold'>
                        Courses ({courses.length})
                      </ThemedTypography>
                    </Box>
                    <Box display='flex' gap={1} flexWrap='wrap'>
                      <ThemedOutlinedButton
                        variant='outlined'
                        size='small'
                        onClick={() => handleBulkSet('Low')}
                        sx={{
                          borderColor: theme.palette.success.main,
                          color: theme.palette.success.main,
                          '&:hover': {
                            backgroundColor: themeHelpers.withOpacity(
                              theme.palette.success.main,
                              0.08
                            ),
                          },
                        }}
                      >
                        Set All Low
                      </ThemedOutlinedButton>
                      <ThemedOutlinedButton
                        variant='outlined'
                        size='small'
                        onClick={() => handleBulkSet('Medium')}
                        sx={{
                          borderColor: theme.palette.warning.main,
                          color: theme.palette.warning.main,
                          '&:hover': {
                            backgroundColor: themeHelpers.withOpacity(
                              theme.palette.warning.main,
                              0.08
                            ),
                          },
                        }}
                      >
                        Set All Medium
                      </ThemedOutlinedButton>
                      <ThemedOutlinedButton
                        variant='outlined'
                        size='small'
                        onClick={() => handleBulkSet('High')}
                        sx={{
                          borderColor: theme.palette.error.main,
                          color: theme.palette.error.main,
                          '&:hover': {
                            backgroundColor: themeHelpers.withOpacity(
                              theme.palette.error.main,
                              0.08
                            ),
                          },
                        }}
                      >
                        Set All High
                      </ThemedOutlinedButton>
                      <ThemedSecondaryButton
                        variant='contained'
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
                      </ThemedSecondaryButton>
                    </Box>
                  </Box>

                  <ThemedPaper elevation={1}>
                    <Table>
                      <ThemedTableHead>
                        <TableRow>
                          <ThemedTableCell sx={{ fontWeight: 'bold' }}>
                            Course Name
                          </ThemedTableCell>
                          <ThemedTableCell
                            sx={{ fontWeight: 'bold', width: '30%' }}
                          >
                            Risk Level
                          </ThemedTableCell>
                          <ThemedTableCell
                            sx={{ fontWeight: 'bold', width: '100px' }}
                          >
                            Actions
                          </ThemedTableCell>
                        </TableRow>
                      </ThemedTableHead>
                      <TableBody>
                        {courses.map((course: any, index: number) => (
                          <>
                            <TableRow key={course.course_id} hover>
                              <ThemedTableCell>
                                <ThemedTypography
                                  variant='body1'
                                  fontWeight='medium'
                                >
                                  {course.course_name}
                                </ThemedTypography>
                              </ThemedTableCell>
                              <ThemedTableCell>
                                <ThemedTextField
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
                                        <ThemedChip
                                          label={opt.label}
                                          size='small'
                                          color={opt.color as any}
                                          sx={{ ml: 1 }}
                                        />
                                      )}
                                    </MenuItem>
                                  ))}
                                </ThemedTextField>
                              </ThemedTableCell>
                              <ThemedTableCell>
                                <Tooltip title='Add comment'>
                                  <ThemedIconButton
                                    onClick={() =>
                                      setExpandedRow(
                                        expandedRow === index ? null : index
                                      )
                                    }
                                    sx={{
                                      color:
                                        expandedRow === index
                                          ? theme.palette.primary.main
                                          : theme.palette.text.secondary,
                                    }}
                                  >
                                    <AddCircleIcon />
                                  </ThemedIconButton>
                                </Tooltip>
                              </ThemedTableCell>
                            </TableRow>
                            <TableRow>
                              <ThemedTableCell colSpan={3} sx={{ p: 0 }}>
                                <Collapse
                                  in={expandedRow === index}
                                  timeout='auto'
                                  unmountOnExit
                                >
                                  <Box
                                    p={3}
                                    sx={{
                                      backgroundColor:
                                        theme.palette.background.default,
                                      borderTop: `1px solid ${theme.palette.divider}`,
                                    }}
                                  >
                                    <ThemedTypography
                                      variant='subtitle2'
                                      mb={2}
                                      fontWeight='bold'
                                    >
                                      Add Comment for {course.course_name}
                                    </ThemedTypography>
                                    <ThemedTextField
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
                                      <ThemedPrimaryButton
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
                                      </ThemedPrimaryButton>
                                      <ThemedOutlinedButton
                                        variant='outlined'
                                        onClick={() => setExpandedRow(null)}
                                      >
                                        Cancel
                                      </ThemedOutlinedButton>
                                    </Box>
                                  </Box>
                                </Collapse>
                              </ThemedTableCell>
                            </TableRow>
                          </>
                        ))}
                      </TableBody>
                    </Table>
                  </ThemedPaper>
                </ThemedCardContent>
              </ThemedCard>

              {/* Assessment Method Risk */}
              <ThemedCard elevation={2}>
                <ThemedCardContent>
                  <Box
                    display='flex'
                    alignItems='center'
                    justifyContent='space-between'
                    mb={3}
                  >
                    <Box display='flex' alignItems='center' gap={1}>
                      <AssessmentIcon
                        sx={{ color: theme.palette.primary.main }}
                      />
                      <ThemedTypography variant='h6' fontWeight='bold'>
                        Assessment Method Risk ({assessmentMethods.length})
                      </ThemedTypography>
                    </Box>
                    <Box display='flex' gap={1} flexWrap='wrap'>
                      <ThemedOutlinedButton
                        variant='outlined'
                        size='small'
                        onClick={() => handleAssessmentRisk('Low')}
                        sx={{
                          borderColor: theme.palette.success.main,
                          color: theme.palette.success.main,
                          '&:hover': {
                            backgroundColor: themeHelpers.withOpacity(
                              theme.palette.success.main,
                              0.08
                            ),
                          },
                        }}
                      >
                        Set All Low
                      </ThemedOutlinedButton>
                      <ThemedOutlinedButton
                        variant='outlined'
                        size='small'
                        onClick={() => handleAssessmentRisk('Medium')}
                        sx={{
                          borderColor: theme.palette.warning.main,
                          color: theme.palette.warning.main,
                          '&:hover': {
                            backgroundColor: themeHelpers.withOpacity(
                              theme.palette.warning.main,
                              0.08
                            ),
                          },
                        }}
                      >
                        Set All Medium
                      </ThemedOutlinedButton>
                      <ThemedOutlinedButton
                        variant='outlined'
                        size='small'
                        onClick={() => handleAssessmentRisk('High')}
                        sx={{
                          borderColor: theme.palette.error.main,
                          color: theme.palette.error.main,
                          '&:hover': {
                            backgroundColor: themeHelpers.withOpacity(
                              theme.palette.error.main,
                              0.08
                            ),
                          },
                        }}
                      >
                        Set All High
                      </ThemedOutlinedButton>
                      <ThemedSecondaryButton
                        variant='contained'
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
                      </ThemedSecondaryButton>
                    </Box>
                  </Box>

                  <ThemedPaper elevation={1}>
                    <Table>
                      <ThemedTableHead>
                        <TableRow>
                          <ThemedTableCell sx={{ fontWeight: 'bold' }}>
                            Assessment Method
                          </ThemedTableCell>
                          <ThemedTableCell
                            sx={{ fontWeight: 'bold', width: '30%' }}
                          >
                            Risk Level
                          </ThemedTableCell>
                        </TableRow>
                      </ThemedTableHead>
                      <TableBody>
                        {assessmentMethods.map((assessment) => (
                          <TableRow key={assessment.value} hover>
                            <ThemedTableCell>
                              <Box display='flex' alignItems='center' gap={2}>
                                <ThemedChip
                                  label={assessment.label}
                                  size='small'
                                  color='primary'
                                  variant='outlined'
                                />
                                <ThemedTypography variant='body1'>
                                  {assessment.fullName}
                                </ThemedTypography>
                              </Box>
                            </ThemedTableCell>
                            <ThemedTableCell>
                              <ThemedTextField
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
                                      <ThemedChip
                                        label={opt.label}
                                        size='small'
                                        color={opt.color as any}
                                        sx={{ ml: 1 }}
                                      />
                                    )}
                                  </MenuItem>
                                ))}
                              </ThemedTextField>
                            </ThemedTableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ThemedPaper>
                </ThemedCardContent>
              </ThemedCard>
            </Box>
          ) : (
            <ThemedCard elevation={2}>
              <ThemedCardContent>
                <Box
                  display='flex'
                  flexDirection='column'
                  alignItems='center'
                  py={8}
                >
                  <PersonIcon
                    sx={{
                      fontSize: 64,
                      color: theme.palette.text.secondary,
                      mb: 2,
                    }}
                  />
                  <ThemedTypography
                    variant='h6'
                    color='text.secondary'
                    textAlign='center'
                  >
                    Select a trainer from the list to view their courses and
                    assessment methods
                  </ThemedTypography>
                </Box>
              </ThemedCardContent>
            </ThemedCard>
          )}
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <ThemedSnackbar
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
      </ThemedSnackbar>
    </ThemedBox>
  )
}

export default TrainerRiskRating
