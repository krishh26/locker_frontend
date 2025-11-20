import FuseLoading from '@fuse/core/FuseLoading'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import FavoriteIcon from '@mui/icons-material/Favorite'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CloseIcon from '@mui/icons-material/Close'
import {
  alpha,
  Avatar,
  Box,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Slide,
  Tab,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useGetSafeguardingContactsQuery } from 'app/store/api/safeguarding-api'
import { slice as courseSlice, slice } from 'app/store/courseManagement'
import {
  getLearnerDetails,
  selectLearnerManagement,
  updateLearnerAPI,
} from 'app/store/learnerManagement'
import { selectstoreDataSlice } from 'app/store/reloadData'
import { sendMail } from 'app/store/userManagement'
import axios from 'axios'
import jsonData from 'src/url.json'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import AcknowledgementPopup from 'src/app/component/AcknowledgementPopup'
import {
  SecondaryButton,
  SecondaryButtonOutlined,
} from 'src/app/component/Buttons'
import { PortfolioCard } from 'src/app/component/Cards'
import DoughnutChart from 'src/app/component/Chart/doughnut'
import { portfolioCard } from 'src/app/contanst'
import { useCurrentUser, useLearnerUserId } from 'src/app/utils/userHelpers'
import { getRandomColor } from 'src/utils/randomColor'
import Calendar from './calendar'
import { PortfolioCountData } from 'src/app/utils/portfolioCountUtils'
import { usePendingSignatureListQuery } from 'app/store/api/evidence-api'

// TypeScript Interfaces
interface EmailData {
  email: string
  subject: string
  message: string
  adminName: string
}

interface PortfolioCardData {
  id: number
  name: string
  color: string
}

interface Learner {
  learner_id: string
  first_name: string
  last_name: string
  email: string
  avatar?: string
  user_name: string
  course?: Array<{
    trainer_id?: {
      first_name: string
      last_name: string
      email: string
    }
    IQA_id?: {
      first_name: string
      last_name: string
    }
    course?: {
      course_name: string
    }
  }>
}

// Styled Components
const StyledContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.main,
    0.05
  )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  minHeight: '100vh',
  marginBottom: '20px',
}))

const StyledTabsContainer = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  overflow: 'hidden',
}))

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 60,
  fontSize: '2rem',
  fontWeight: 600,
  textTransform: 'none',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}))

const StyledCardsContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: theme.spacing(2),
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
  },
}))

const StyledLearnerCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(3, 0),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[4],
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
  },
}))

const StyledLearnerHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
}))

const StyledLearnerContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
}))

const StyledInfoGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
}))

const StyledInfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}))

const StyledInfoLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  minWidth: 140,
  color: theme.palette.text.secondary,
  fontSize: '1.5rem',
}))

const StyledInfoValue = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '1.5rem',
  marginLeft: theme.spacing(1),
}))

const StyledProgressSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  flexWrap: 'wrap',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}))

const StyledActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}))

const StyledEmailDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    minWidth: 500,
    [theme.breakpoints.down('sm')]: {
      minWidth: '90vw',
      margin: theme.spacing(2),
    },
  },
}))

const StyledSafeguardingCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(3, 0),
  borderRadius: theme.spacing(2),
  border: `2px solid ${theme.palette.primary.main}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  overflow: 'hidden',
  position: 'relative',
  width: '50%',
  marginBottom: '20px',
}))

const StyledSafeguardingHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  width: '100%',
}))

const StyledSafeguardingContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  width: '100%',
}))

const StyledContactItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 0),
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}))

const StyledContactLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  minWidth: 80,
  color: theme.palette.text.primary,
  fontSize: '1.5rem',
}))

const StyledContactValue = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '1.5rem',
  marginLeft: theme.spacing(1),
}))

const StyledRedIcon = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  backgroundColor: '#d32f2f',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
  flexShrink: 0,
}))

const StyledBlueIcon = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
}))

const Portfolio: React.FC = () => {
  // State management
  const [open, setOpen] = useState<boolean>(false)
  const [isAcknowledgementOpen, setIsAcknowledgementOpen] =
    useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<number>(0)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [emailData, setEmailData] = useState<EmailData>({
    email: '',
    subject: '',
    message: '',
    adminName: '',
  })

  // Hooks
  const navigate = useNavigate()
  const dispatch: any = useDispatch()
  const theme = useTheme()
  const learnerUserId = useLearnerUserId()
  // Selectors
  const { learner, dataFetchLoading } = useSelector(selectLearnerManagement)
  const data = useSelector(selectstoreDataSlice)
  const { singleData } = useSelector(selectLearnerManagement)
  const [countData, setCountData] = useState<PortfolioCountData>({
    newDocTotal: 0,
  })

  // Time log data state
  const [otjTimeLogData, setOtjTimeLogData] = useState<any>(null)
  const [ofjTimeLogData, setOfjTimeLogData] = useState<any>(null)
  const [loadingTimeLog, setLoadingTimeLog] = useState<boolean>(false)
  // Safeguarding API
  const {
    data: safeguardingData,
    isLoading: isLoadingSafeguarding,
    error: safeguardingError,
  } = useGetSafeguardingContactsQuery()

  const {
    data: pendingSignatureList,
    isLoading: isLoadingPendingSignatureList,
    isError: isErrorPendingSignatureList,
    error: errorPendingSignatureList,
  } = usePendingSignatureListQuery({ id: learnerUserId })

  useEffect(() => {
    if (pendingSignatureList && pendingSignatureList.data) {
      setCountData((prev) => ({
        ...prev,
        newDocTotal: pendingSignatureList.data.length,
      }))
    }
  }, [pendingSignatureList])

  useEffect(() => {
    // Only show acknowledgement after data has finished loading to avoid flickering
    if (!dataFetchLoading && learner && learner.isShowMessage) {
      setIsAcknowledgementOpen(true)
    } else {
      setIsAcknowledgementOpen(false)
    }
  }, [learner, dataFetchLoading])

  // Get current user role
  const user = useCurrentUser()

  // Memoized filtered cards
  const { overviewCards, courseCards } = useMemo(
    () => ({
      overviewCards: portfolioCard.filter((card) =>
        [4, 5, 9, 10, 11].includes(card.id)
      ),
      courseCards: portfolioCard.filter((card) =>
        [1, 2, 3, 6, 7, 8].includes(card.id)
      ),
    }),
    []
  )

  // Event handlers with useCallback for performance
  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleOpen = useCallback(() => {
    setOpen(true)
  }, [])

  const handleOpenProfile = useCallback(() => {
    const learnerId = learner?.learner_id
    if (learnerId) {
      navigate(`/portfolio/profile-information?learner_id=${learnerId}`)
    }
  }, [learner?.learner_id, navigate])

  const handleClickData = useCallback(
    (event: React.MouseEvent, row: any) => {
      dispatch(slice.setSingleData(row))
    },
    [dispatch]
  )

  const handleClickSingleData = useCallback(
    (row: any) => {
      dispatch(courseSlice.setSingleData(row))
    },
    [dispatch]
  )

  const handleOpenEmail = useCallback(() => {
    setIsDialogOpen(true)
  }, [])

  const handleCloseEmail = useCallback(() => {
    setIsDialogOpen(false)
    setEmailData((prev) => ({
      ...prev,
      subject: '',
      message: '',
    }))
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmailData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSend = useCallback(async () => {
    try {
      await dispatch(sendMail(emailData) as any)
    } catch (err) {
      console.error('Failed to send email:', err)
    } finally {
      handleCloseEmail()
    }
  }, [dispatch, emailData, handleCloseEmail])

  const handleTabChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue)
    },
    []
  )

  useEffect(() => {
    if (singleData?.learner_id) {
      dispatch(getLearnerDetails(singleData.learner_id) as any)
    } else if (user?.learner_id) {
      dispatch(getLearnerDetails(user.learner_id) as any)
    }
  }, [singleData?.learner_id, user?.learner_id, dispatch])

  useEffect(() => {
    if (learner?.email) {
      setEmailData((prev) => ({ ...prev, email: learner.email }))
    }
    if (user?.first_name && user?.last_name) {
      setEmailData((prev) => ({
        ...prev,
        adminName: user.first_name + ' ' + user.last_name,
      }))
    }
  }, [learner?.email, user?.first_name, user?.last_name])

  // Fetch time log data for both On the job and Off the job
  useEffect(() => {
    const fetchTimeLogData = async () => {
      const userId = learner?.user_id || learnerUserId || user?.user_id
      if (userId) {
        setLoadingTimeLog(true)
        const URL_BASE_LINK = jsonData.API_LOCAL_URL

        try {
          // Fetch On the job data
          const otjResponse = await axios.get(
            `${URL_BASE_LINK}/time-log/spend?user_id=${userId}&type=On the job`
          )
          setOtjTimeLogData(otjResponse.data.data)

          // Fetch Off the job data
          const ofjResponse = await axios.get(
            `${URL_BASE_LINK}/time-log/spend?user_id=${userId}&type=Off the job`
          )
          setOfjTimeLogData(ofjResponse.data.data)
        } catch (err) {
          console.error('Failed to fetch time log data:', err)
        } finally {
          setLoadingTimeLog(false)
        }
      }
    }

    fetchTimeLogData()
  }, [learner?.user_id, learnerUserId, user?.user_id])

  // Helper function to format time
  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return '0h 0m'
    const [hours, minutes] = timeString.split(':')
    return `${hours || 0}h ${minutes || 0}m`
  }

  // Calculate total hours from both OTJ and OFJ
  const calculateTotalHours = () => {
    const parseTime = (timeString: string | undefined) => {
      if (!timeString) return { hours: 0, minutes: 0 }
      const [hours, minutes] = timeString.split(':')
      return {
        hours: parseInt(hours || '0', 10),
        minutes: parseInt(minutes || '0', 10),
      }
    }

    const otjTotal = parseTime(otjTimeLogData?.total)
    const ofjTotal = parseTime(ofjTimeLogData?.total)

    let totalMinutes =
      otjTotal.hours * 60 +
      otjTotal.minutes +
      ofjTotal.hours * 60 +
      ofjTotal.minutes
    const totalHours = Math.floor(totalMinutes / 60)
    const remainingMinutes = totalMinutes % 60

    if (totalHours === 0 && remainingMinutes === 0) return '0h'
    if (remainingMinutes === 0) return `${totalHours}h`
    return `${totalHours}h ${remainingMinutes}m`
  }

  // Loading state
  if (dataFetchLoading) {
    return <FuseLoading />
  }

  // Convert incoming data to matrix format
  const convertToMatrixData = (data: any) => {
    if (!data)
      return {
        yetToComplete: 0,
        fullyCompleted: 0,
        workInProgress: 0,
        totalUnits: 0,
        duration: 0,
        totalDuration: 0,
        dayPending: 0,
      }

    // Gateway questions-based progress
    try {
      const coreType = data?.course_core_type || data?.course?.course_core_type
      const isGateway = coreType === 'Gateway'
      const questions = Array.isArray(data?.course?.questions)
        ? data.course.questions
        : Array.isArray(data?.questions)
        ? data.questions
        : []

      if (isGateway && questions.length > 0) {
        const totalUnits = questions.length
        const fullyCompleted = questions.filter(
          (q: any) => q?.achieved === true
        ).length

        let duration = 0
        let totalDuration = 1
        let dayPending = 0
        if (data.start_date && data.end_date) {
          const startDate = new Date(data.start_date)
          const endDate = new Date(data.end_date)
          const currentDate = new Date()
          totalDuration = Math.max(
            1,
            Math.ceil(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            )
          )
          duration = Math.max(
            0,
            Math.ceil(
              (currentDate.getTime() - startDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          )
          dayPending = Math.max(
            0,
            Math.ceil(
              (endDate.getTime() - currentDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          )
        }

        return {
          yetToComplete: Math.max(0, totalUnits - fullyCompleted),
          fullyCompleted,
          workInProgress: 0,
          totalUnits,
          duration,
          totalDuration,
          dayPending,
        }
      }
    } catch {}

    // Calculate duration from start and end dates
    const startDate = new Date(data.start_date)
    const endDate = new Date(data.end_date)
    const currentDate = new Date()
    const totalDuration = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const duration = Math.ceil(
      (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const dayPending = Math.ceil(
      (endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    return {
      yetToComplete: data.unitsNotStarted || 0,
      fullyCompleted: data.unitsFullyCompleted || 0,
      workInProgress: data.unitsPartiallyCompleted || 0,
      totalUnits: data.totalUnits || 0,
      duration: Math.max(0, duration),
      totalDuration: Math.max(1, totalDuration),
      dayPending: Math.max(0, dayPending),
    }
  }

  // Calculate overall progress across all courses
  const overallProgressData = useMemo(() => {
    if (!learner?.course || learner.course.length === 0) {
      return {
        yetToComplete: 0,
        fullyCompleted: 0,
        workInProgress: 0,
        totalUnits: 0,
        duration: 0,
        totalDuration: 0,
        dayPending: 0,
        completionPercentage: 0,
      }
    }

    let totalCompleted = 0
    let totalInProgress = 0
    let totalNotStarted = 0
    let totalUnitsAll = 0
    let totalDuration = 0
    let totalTotalDuration = 0

    learner.course.forEach((course) => {
      const progressData = convertToMatrixData(course)
      totalCompleted += progressData.fullyCompleted
      totalInProgress += progressData.workInProgress
      totalNotStarted += progressData.yetToComplete
      totalUnitsAll += progressData.totalUnits
      totalDuration += progressData.duration
      totalTotalDuration += progressData.totalDuration
    })

    const completionPercentage =
      totalUnitsAll > 0
        ? (totalCompleted / totalUnitsAll) * 100 +
          (totalInProgress / totalUnitsAll) * 50
        : 0

    return {
      yetToComplete: totalNotStarted,
      fullyCompleted: totalCompleted,
      workInProgress: totalInProgress,
      totalUnits: totalUnitsAll,
      duration: totalDuration,
      totalDuration: totalTotalDuration,
      dayPending: 0,
      completionPercentage,
    }
  }, [learner?.course])

  return (
    <StyledContainer>
      {/* Header Section */}
      <Box className='mb-10'>
        <Typography
          variant='h4'
          component='h1'
          gutterBottom
          sx={{ fontWeight: 700, color: 'text.primary' }}
        >
          Dashboard
        </Typography>
        <Typography variant='subtitle1' color='text.secondary'>
          Manage your learning journey and track progress
        </Typography>
      </Box>

      {/* Signature Info Message */}
      {/* {pendingSignatureList && pendingSignatureList.data && pendingSignatureList.data.length > 0 && (
        <Fade in={true} timeout={500}>
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.info.main, 0.08),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <InfoOutlinedIcon 
                sx={{ 
                  color: theme.palette.info.main, 
                  fontSize: 20,
                  flexShrink: 0 
                }} 
              />
              <Typography variant='body1' color='text.primary' sx={{ flex: 1 }}>
                You have <strong>{pendingSignatureList.data.length}</strong> document{pendingSignatureList.data.length !== 1 ? 's' : ''} awaiting your signature.
              </Typography>
              <Chip
                label={`${pendingSignatureList.data.length} Pending`}
                color='info'
                variant='outlined'
                size='small'
                sx={{
                  fontWeight: 500,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
          </Box>
        </Fade>
      )} */}

      {/* Tab Navigation */}
      {/* <StyledTabsContainer elevation={2}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label='portfolio sections'
          variant='fullWidth'
        >
          <StyledTab
            icon={<TrendingUpIcon />}
            label='Overview'
            iconPosition='start'
          />
        </Tabs>
      </StyledTabsContainer> */}

      {/* Tab Content with Animation */}
      <Fade in={true} timeout={500}>
        <StyledCardsContainer>
          {overviewCards.map((value, index) => (
            <Slide
              key={value.id}
              direction='up'
              in={true}
              timeout={300 + index * 100}
            >
              <Box>
                <PortfolioCard
                  data={value}
                  index={index}
                  learner={learner || user}
                  countData={countData}
                />
              </Box>
            </Slide>
          ))}
        </StyledCardsContainer>
      </Fade>
      {/* Learner Information Section */}
      {learner && (
        <StyledLearnerCard elevation={4}>
          <StyledLearnerHeader>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 3,
                width: '100%',
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: getRandomColor(
                    learner?.first_name?.toLowerCase().charAt(0)
                  ),
                  border: `3px solid ${theme.palette.primary.contrastText}`,
                  boxShadow: theme.shadows[2],
                  flexShrink: 0,
                }}
                src={data?.learner_id ? learner?.avatar : user?.avatar?.url}
                alt={
                  data?.learner_id
                    ? learner?.first_name?.toUpperCase()?.charAt(0)
                    : user?.first_name?.toUpperCase()?.charAt(0)
                }
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant='h5'
                  component='h2'
                  gutterBottom
                  sx={{ fontWeight: 600, marginBottom: 0.5 }}
                >
                  {learner?.first_name} {learner?.last_name}
                </Typography>
                <Link
                  to={`/portfolio/profile-information?learner_id=${learner?.learner_id}`}
                  style={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(2px)'
                    e.currentTarget.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)'
                    e.currentTarget.style.opacity = '0.9'
                  }}
                >
                  <Typography
                    variant='subtitle1'
                    sx={{
                      opacity: 0.9,
                      color: theme.palette.primary.contrastText,
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 1,
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    View Profile
                  </Typography>
                  <Typography
                    variant='subtitle1'
                    sx={{
                      opacity: 0.7,
                      color: theme.palette.primary.contrastText,
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    →
                  </Typography>
                </Link>

                {/* Personal Information in Header */}
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    flexDirection: 'column',
                    gap: 2,
                    mt: 1,
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 500,
                        color: theme.palette.primary.contrastText,
                        opacity: 0.8,
                      }}
                    >
                      Trainer:
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{ color: theme.palette.primary.contrastText }}
                    >
                      {learner?.course?.[0]?.trainer_id?.first_name}{' '}
                      {learner?.course?.[0]?.trainer_id?.last_name}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 500,
                        color: theme.palette.primary.contrastText,
                        opacity: 0.8,
                      }}
                    >
                      IQA:
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{ color: theme.palette.primary.contrastText }}
                    >
                      {learner?.course?.[0]?.IQA_id?.first_name}{' '}
                      {learner?.course?.[0]?.IQA_id?.last_name}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip
                      label={`Next Visit: ${learner?.nextvisitdate || 'N/A'}`}
                      color='primary'
                      variant='filled'
                      size='medium'
                      sx={{
                        fontWeight: 700,
                        backgroundColor: alpha(
                          theme.palette.primary.contrastText,
                          0.15
                        ),
                        border: `2px solid ${alpha(
                          theme.palette.primary.contrastText,
                          0.3
                        )}`,
                        color: theme.palette.primary.contrastText,
                        height: '32px',
                        borderRadius: '16px',
                        boxShadow: `0 2px 8px ${alpha(
                          theme.palette.primary.contrastText,
                          0.2
                        )}`,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          backgroundColor: alpha(
                            theme.palette.primary.contrastText,
                            0.25
                          ),
                          transform: 'translateY(-1px)',
                          boxShadow: `0 4px 12px ${alpha(
                            theme.palette.primary.contrastText,
                            0.3
                          )}`,
                        },
                        '& .MuiChip-label': {
                          fontSize: '1rem',
                          fontWeight: 700,
                          letterSpacing: '0.5px',
                        },
                        '& .MuiChip-icon': {
                          color: theme.palette.primary.contrastText,
                          fontSize: '1rem',
                        },
                      }}
                    />
                  </Box>
                  {/* Next Visit Date Chip */}
                </Box>
              </Box>

              {/* Overall Progress Bar on Right Side */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexShrink: 0,
                  flexDirection: { xs: 'column', md: 'row' },
                }}
              >
                <Box
                  sx={{
                    minWidth: 300,
                    maxWidth: 350,
                    flexShrink: 0,
                    display: { xs: 'none', md: 'block' },
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(
                        theme.palette.primary.contrastText,
                        0.1
                      ),
                      border: `2px solid ${alpha(
                        theme.palette.primary.contrastText,
                        0.3
                      )}`,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant='subtitle2'
                        sx={{
                          fontWeight: 700,
                          color: theme.palette.primary.contrastText,
                          fontSize: '1.2rem',
                        }}
                      >
                        Overall Progress
                      </Typography>
                      <Chip
                        label={`${overallProgressData.completionPercentage.toFixed(
                          0
                        )}%`}
                        size='small'
                        sx={{
                          backgroundColor: theme.palette.primary.contrastText,
                          color: theme.palette.primary.main,
                          fontWeight: 700,
                          fontSize: '1rem',
                        }}
                      />
                    </Box>

                    <LinearProgress
                      variant='determinate'
                      value={Math.min(
                        overallProgressData.completionPercentage,
                        100
                      )}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: alpha(
                          theme.palette.primary.contrastText,
                          0.2
                        ),
                        mb: 1.5,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 6,
                          background: `linear-gradient(90deg, ${theme.palette.primary.contrastText} 0%, rgba(255, 255, 255, 0.9) 100%)`,
                        },
                      }}
                    />

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant='caption'
                          sx={{
                            color: theme.palette.primary.contrastText,
                            opacity: 0.9,
                            fontSize: '1rem',
                            fontWeight: 600,
                          }}
                        >
                          ✓ Completed
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{
                            color: theme.palette.primary.contrastText,
                            fontWeight: 700,
                            fontSize: '1.5rem',
                          }}
                        >
                          {overallProgressData.fullyCompleted}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant='caption'
                          sx={{
                            color: theme.palette.primary.contrastText,
                            opacity: 0.9,
                            fontSize: '1rem',
                            fontWeight: 600,
                          }}
                        >
                          ⟳ In Progress
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{
                            color: theme.palette.primary.contrastText,
                            fontWeight: 700,
                            fontSize: '1.5rem',
                          }}
                        >
                          {overallProgressData.workInProgress}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant='caption'
                          sx={{
                            color: theme.palette.primary.contrastText,
                            opacity: 0.9,
                            fontSize: '1rem',
                            fontWeight: 600,
                          }}
                        >
                          ○ Pending
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{
                            color: theme.palette.primary.contrastText,
                            fontWeight: 700,
                            fontSize: '1.5rem',
                          }}
                        >
                          {overallProgressData.yetToComplete}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: `1px solid ${alpha(
                          theme.palette.primary.contrastText,
                          0.3
                        )}`,
                      }}
                    >
                      <Typography
                        variant='caption'
                        sx={{
                          color: theme.palette.primary.contrastText,
                          fontSize: '1rem',
                        }}
                      >
                        Total: {overallProgressData.totalUnits} units across{' '}
                        {learner?.course?.length || 0} course
                        {learner?.course?.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Combined Time Log Progress Box - On the Job and Off the Job */}
                <Box
                  sx={{
                    minWidth: 300,
                    maxWidth: 350,
                    flexShrink: 0,
                    display: { xs: 'none', md: 'block' },
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(
                        theme.palette.primary.contrastText,
                        0.1
                      ),
                      border: `2px solid ${alpha(
                        theme.palette.primary.contrastText,
                        0.3
                      )}`,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant='subtitle2'
                        sx={{
                          fontWeight: 700,
                          color: theme.palette.primary.contrastText,
                          fontSize: '1.2rem',
                        }}
                      >
                        Time Log
                      </Typography>
                      <Chip
                        label={loadingTimeLog ? '...' : calculateTotalHours()}
                        size='small'
                        sx={{
                          backgroundColor: theme.palette.primary.contrastText,
                          color: theme.palette.primary.main,
                          fontWeight: 700,
                          fontSize: '1rem',
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                      }}
                    >
                      {/* On The Job Section */}
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant='caption'
                          sx={{
                            color: theme.palette.primary.contrastText,
                            opacity: 0.9,
                            fontSize: '1rem',
                            fontWeight: 600,
                          }}
                        >
                          On The Job
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                          }}
                        >
                          {/* <Box>
                          <Typography
                            variant='caption'
                            sx={{
                              color: theme.palette.text.secondary,
                              opacity: 0.9,
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            This Week
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{
                              color: theme.palette.text.primary,
                              fontWeight: 700,
                              fontSize: '1.1rem',
                            }}
                          >
                            {loadingTimeLog ? '...' : formatTime(otjTimeLogData?.thisWeek)}
                          </Typography>
                        </Box> */}

                          {/* <Box
                          sx={{
                            pt: 1,
                            borderTop: `1px solid ${alpha(
                              theme.palette.divider,
                              0.3
                            )}`,
                          }}
                        >
                          <Typography
                            variant='caption'
                            sx={{
                              color: theme.palette.text.secondary,
                              opacity: 0.9,
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            This Month
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{
                              color: theme.palette.text.primary,
                              fontWeight: 700,
                              fontSize: '1.1rem',
                            }}
                          >
                            {loadingTimeLog ? '...' : formatTime(otjTimeLogData?.thisMonth)}
                          </Typography>
                        </Box> */}

                          <Box
                            sx={{
                              pt: 1,
                              borderTop: `1px solid ${alpha(
                                theme.palette.divider,
                                0.3
                              )}`,
                            }}
                          >
                            <Typography
                              variant='caption'
                              sx={{
                                color: theme.palette.primary.contrastText,
                                fontSize: '1rem',
                              }}
                            >
                              Total
                            </Typography>
                            <Typography
                              variant='body2'
                              sx={{
                                color: theme.palette.primary.contrastText,
                                fontSize: '1.5rem',
                                fontWeight: 700,
                              }}
                            >
                              {loadingTimeLog
                                ? '...'
                                : formatTime(otjTimeLogData?.total)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Divider */}
                      <Box
                        sx={{
                          width: '1px',
                          backgroundColor: alpha(theme.palette.divider, 0.3),
                          my: 1,
                        }}
                      />

                      {/* Off The Job Section */}
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant='caption'
                          sx={{
                            color: theme.palette.primary.contrastText,
                            opacity: 0.9,
                            fontSize: '1rem',
                            fontWeight: 600,
                          }}
                        >
                          Off The Job
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                          }}
                        >
                          {/* <Box>
                          <Typography
                            variant='caption'
                            sx={{
                              color: theme.palette.text.secondary,
                              opacity: 0.9,
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            This Week
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{
                              color: theme.palette.text.primary,
                              fontWeight: 700,
                              fontSize: '1.1rem',
                            }}
                          >
                            {loadingTimeLog ? '...' : formatTime(ofjTimeLogData?.thisWeek)}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            pt: 1,
                            borderTop: `1px solid ${alpha(
                              theme.palette.divider,
                              0.3
                            )}`,
                          }}
                        >
                          <Typography
                            variant='caption'
                            sx={{
                              color: theme.palette.text.secondary,
                              opacity: 0.9,
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            This Month
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{
                              color: theme.palette.text.primary,
                              fontWeight: 700,
                              fontSize: '1.1rem',
                            }}
                          >
                            {loadingTimeLog ? '...' : formatTime(ofjTimeLogData?.thisMonth)}
                          </Typography>
                        </Box> */}

                          <Box
                            sx={{
                              pt: 1,
                              borderTop: `1px solid ${alpha(
                                theme.palette.divider,
                                0.3
                              )}`,
                            }}
                          >
                            <Typography
                              variant='caption'
                              sx={{
                                color: theme.palette.primary.contrastText,
                                fontSize: '1rem',
                              }}
                            >
                              Total
                            </Typography>
                            <Typography
                              variant='body2'
                              sx={{
                                color: theme.palette.primary.contrastText,
                                fontSize: '1.5rem',
                                fontWeight: 700,
                              }}
                            >
                              {loadingTimeLog
                                ? '...'
                                : formatTime(ofjTimeLogData?.total)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </StyledLearnerHeader>

          <StyledLearnerContent>
            <Grid container spacing={3}>
              {/* Progress Column */}
              <Grid item xs={12}>
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Progress Overview
                </Typography>

                {/* Overall Progress Chart */}
                {learner?.course && learner.course.length > 0 && (
                  <>
                    {learner.course.length > 1 && (
                      <>
                        <StyledProgressSection>
                          <Box
                            sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}
                          >
                            {learner.course.map((value, index) => (
                              <Link
                                key={index}
                                to='/portfolio/courseData'
                                style={{
                                  color: 'inherit',
                                  textDecoration: 'none',
                                }}
                                onClick={(e) => {
                                  handleClickSingleData(value)
                                  handleClickData(e, value)
                                }}
                              >
                                <DoughnutChart
                                  value={convertToMatrixData(value)}
                                  variant='matrix'
                                  size={180}
                                  showLabels={true}
                                  animated={true}
                                  title={value.course.course_name}
                                  isGateway={
                                    value.course?.course_core_type === 'Gateway'
                                  }
                                />
                              </Link>
                            ))}
                          </Box>
                        </StyledProgressSection>
                      </>
                    )}
                  </>
                )}
              </Grid>
            </Grid>
          </StyledLearnerContent>
        </StyledLearnerCard>
      )}

      {/* Action Buttons */}
      <StyledActionButtons>
        {user?.role !== 'Learner' && (
          <SecondaryButton
            onClick={handleOpenEmail}
            startIcon={<EmailOutlinedIcon />}
            name='Email Learner'
          />
        )}
        <SecondaryButtonOutlined name='Awaiting Signature' />
        <SecondaryButton name='Calendar' onClick={handleOpen} />
      </StyledActionButtons>

      {/* Calendar Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='lg'
        fullWidth
        sx={{
          '.MuiDialog-paper': {
            borderRadius: theme.spacing(2),
            padding: theme.spacing(2),
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing(2),
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant='h6' component='div' sx={{ fontWeight: 600 }}>
            Calendar
          </Typography>
          <IconButton
            aria-label='close'
            onClick={handleClose}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.text.primary,
                backgroundColor: alpha(theme.palette.action.hover, 0.1),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: theme.spacing(2) }}>
          <Calendar />
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <StyledEmailDialog
        open={isDialogOpen}
        onClose={handleCloseEmail}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: theme.palette.primary.contrastText,
            fontWeight: 600,
          }}
        >
          <EmailOutlinedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Email {learner?.user_name || 'Learner'}
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography
                variant='subtitle2'
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Subject
              </Typography>
              <TextField
                name='subject'
                size='medium'
                placeholder='Enter email subject'
                fullWidth
                value={emailData?.subject}
                onChange={handleChange}
                variant='outlined'
              />
            </Box>
            <Box>
              <Typography
                variant='subtitle2'
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Message
              </Typography>
              <TextField
                name='message'
                size='medium'
                placeholder='Enter your message here...'
                fullWidth
                multiline
                rows={6}
                value={emailData?.message}
                onChange={handleChange}
                variant='outlined'
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <SecondaryButtonOutlined
            name='Cancel'
            onClick={handleCloseEmail}
            sx={{ minWidth: 100 }}
          />
          <SecondaryButton
            name='Send Email'
            disabled={!emailData?.subject || !emailData?.message}
            onClick={handleSend}
            sx={{ minWidth: 120 }}
          />
        </DialogActions>
      </StyledEmailDialog>

      {/* Safeguarding Contact Section */}
      <StyledSafeguardingCard elevation={2}>
        <StyledSafeguardingHeader>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StyledRedIcon>
              <MenuBookIcon sx={{ color: 'white', fontSize: 30 }} />
            </StyledRedIcon>
            <Box>
              <Typography
                variant='h6'
                component='h3'
                sx={{ fontWeight: 700, color: 'text.primary' }}
              >
                Safeguarding Contact
              </Typography>
            </Box>
            <InfoOutlinedIcon
              sx={{
                ml: 1,
                color: 'text.secondary',
                fontSize: 20,
              }}
            />
          </Box>
          <StyledBlueIcon>
            <FavoriteIcon sx={{ color: 'white', fontSize: 20 }} />
          </StyledBlueIcon>
        </StyledSafeguardingHeader>

        <StyledSafeguardingContent>
          {isLoadingSafeguarding ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                Loading contact information...
              </Typography>
            </Box>
          ) : safeguardingError ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Typography variant='body2' color='error'>
                Unable to load contact information
              </Typography>
            </Box>
          ) : safeguardingData?.data && safeguardingData.data.length > 0 ? (
            <>
              {safeguardingData.data[0].telNumber && (
                <StyledContactItem>
                  <StyledContactLabel>Tel:</StyledContactLabel>
                  <StyledContactValue>
                    {safeguardingData.data[0].telNumber}
                  </StyledContactValue>
                </StyledContactItem>
              )}

              {safeguardingData.data[0].mobileNumber && (
                <StyledContactItem>
                  <StyledContactLabel>Mobile:</StyledContactLabel>
                  <StyledContactValue>
                    {safeguardingData.data[0].mobileNumber}
                  </StyledContactValue>
                </StyledContactItem>
              )}

              {safeguardingData.data[0].emailAddress && (
                <StyledContactItem>
                  <StyledContactLabel>Email:</StyledContactLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <StyledContactValue>
                      <a
                        href={`mailto:${safeguardingData.data[0].emailAddress}`}
                        style={{
                          color: 'inherit',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color =
                            theme.palette.primary.main
                          e.currentTarget.style.textDecoration = 'underline'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'inherit'
                          e.currentTarget.style.textDecoration = 'none'
                        }}
                      >
                        {safeguardingData.data[0].emailAddress}
                      </a>
                    </StyledContactValue>
                    <EmailOutlinedIcon
                      sx={{
                        ml: 1,
                        color: theme.palette.primary.main,
                        fontSize: 18,
                      }}
                    />
                  </Box>
                </StyledContactItem>
              )}
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                No contact information available
              </Typography>
            </Box>
          )}
        </StyledSafeguardingContent>
      </StyledSafeguardingCard>
      {/* Acknowledgement Popup */}
      <AcknowledgementPopup
        open={isAcknowledgementOpen}
        onClose={async () => {
          setIsAcknowledgementOpen(false)
          // Update learner isShowMessage to false
          if (learner?.learner_id) {
            await dispatch(
              updateLearnerAPI(learner.learner_id, { isShowMessage: false })
            )
          }
        }}
        onAccept={async () => {
          setIsAcknowledgementOpen(false)
          // Update learner isShowMessage to false
          if (learner?.learner_id) {
            await dispatch(
              updateLearnerAPI(learner.learner_id, { isShowMessage: false })
            )
          }
        }}
        name={learner?.first_name + ' ' + learner?.last_name}
      />
    </StyledContainer>
  )
}

export default Portfolio
