import FuseLoading from '@fuse/core/FuseLoading'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PersonIcon from '@mui/icons-material/Person'
import SchoolIcon from '@mui/icons-material/School'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
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
  Paper,
  Slide,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { slice as courseSlice, slice } from 'app/store/courseManagement'
import { selectGlobalUser } from 'app/store/globalUser'
import {
  getLearnerDetails,
  selectLearnerManagement,
} from 'app/store/learnerManagement'
import { selectstoreDataSlice } from 'app/store/reloadData'
import { sendMail } from 'app/store/userManagement'
import { selectUser } from 'app/store/userSlice'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  SecondaryButton,
  SecondaryButtonOutlined,
} from 'src/app/component/Buttons'
import { PortfolioCard } from 'src/app/component/Cards'
import DoughnutChart from 'src/app/component/Chart/doughnut'
import { portfolioCard } from 'src/app/contanst'
import { getRandomColor } from 'src/utils/randomColor'
import Calendar from './calendar'

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
  padding: theme.spacing(3),
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

const Portfolio: React.FC = () => {
  // State management
  const [open, setOpen] = useState<boolean>(false)
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
  const dispatch = useDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Selectors
  const { learner, dataUpdatingLoadding, dataFetchLoading } = useSelector(
    selectLearnerManagement
  )
  const data = useSelector(selectstoreDataSlice)
  const { singleData } = useSelector(selectLearnerManagement)
  const { learnerTab } = useSelector(selectGlobalUser)

  const user = useMemo(() => {
    try {
      return (
        JSON.parse(sessionStorage.getItem('learnerToken') || '{}')?.user ||
        useSelector(selectUser)?.data
      )
    } catch {
      return useSelector(selectUser)?.data
    }
  }, [])

  // Memoized filtered cards
  const { overviewCards, courseCards } = useMemo(
    () => ({
      overviewCards: portfolioCard.filter((card) =>
        [4, 5, 9, 10].includes(card.id)
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
      navigate(`/portfolio/learner-details?learner_id=${learnerId}`)
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

  // Effects
  useEffect(() => {
    if (data?.learner_id) {
      dispatch(getLearnerDetails(data.learner_id) as any)
    }
  }, [data?.learner_id, dispatch])

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
    if (user?.displayName) {
      setEmailData((prev) => ({ ...prev, adminName: user.displayName }))
    }
  }, [learner?.email, user?.displayName])
  // Loading state
  if (dataFetchLoading) {
    return <FuseLoading />
  }

  const matrixData = {
    yetToComplete: 5,
    fullyCompleted: 15,
    workInProgress: 8,
    totalUnits: 28,
    duration: 20,
    totalDuration: 30,
  }

  return (
    <StyledContainer>
      {/* Header Section */}
      <Box>
        <Typography
          variant='h4'
          component='h1'
          gutterBottom
          sx={{ fontWeight: 700, color: 'text.primary' }}
        >
          Portfolio Dashboard
        </Typography>
        <Typography variant='subtitle1' color='text.secondary'>
          Manage your learning journey and track progress
        </Typography>
      </Box>

      {/* Tab Navigation */}
      <StyledTabsContainer elevation={2}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label='portfolio sections'
          variant='fullWidth'
          centered
        >
          <StyledTab
            icon={<TrendingUpIcon />}
            label='Overview'
            iconPosition='start'
          />
          <StyledTab
            icon={<SchoolIcon />}
            label='Course'
            iconPosition='start'
          />
        </Tabs>
      </StyledTabsContainer>

      {/* Tab Content with Animation */}
      <Fade in={true} timeout={500}>
        <StyledCardsContainer>
          {activeTab === 0
            ? // Overview Section - Cards 4, 5, 9, 10
              overviewCards.map((value, index) => (
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
                      learner={learner}
                    />
                  </Box>
                </Slide>
              ))
            : // Course Section - Cards 1, 2, 3, 6, 7, 8
              courseCards.map((value, index) => (
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
                      learner={learner}
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
            <Grid container spacing={3} alignItems='center'>
              <Grid item xs={12} sm={3} md={2}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      backgroundColor: getRandomColor(
                        learner?.first_name?.toLowerCase().charAt(0)
                      ),
                      border: `4px solid ${theme.palette.primary.contrastText}`,
                      boxShadow: theme.shadows[4],
                    }}
                    src={data?.learner_id ? learner?.avatar : user?.avatar?.url}
                    alt={
                      data?.learner_id
                        ? learner?.first_name?.toUpperCase()?.charAt(0)
                        : user?.displayName
                    }
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={9} md={10}>
                <Typography
                  variant='h5'
                  component='h2'
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  {learner?.first_name} {learner?.last_name}
                </Typography>
                <Typography variant='subtitle1' sx={{ opacity: 0.9 }}>
                  Learner Profile
                </Typography>
              </Grid>
            </Grid>
          </StyledLearnerHeader>

          <StyledLearnerContent>
            <Grid container spacing={3}>
              {/* Information Column */}
              <Grid item xs={12} md={6}>
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Personal Information
                </Typography>
                <StyledInfoGrid container spacing={1}>
                  <Grid item xs={12}>
                    <StyledInfoItem>
                      <StyledInfoLabel>Learner Name:</StyledInfoLabel>
                      <StyledInfoValue>
                        {learner?.first_name} {learner?.last_name}
                      </StyledInfoValue>
                    </StyledInfoItem>
                  </Grid>
                  <Grid item xs={12}>
                    <StyledInfoItem>
                      <StyledInfoLabel>Trainer Name:</StyledInfoLabel>
                      <StyledInfoValue>
                        {learner?.course?.[0]?.trainer_id?.first_name}{' '}
                        {learner?.course?.[0]?.trainer_id?.last_name}
                      </StyledInfoValue>
                    </StyledInfoItem>
                  </Grid>
                  <Grid item xs={12}>
                    <StyledInfoItem>
                      <StyledInfoLabel>IQA Name:</StyledInfoLabel>
                      <StyledInfoValue>
                        {learner?.course?.[0]?.IQA_id?.first_name}{' '}
                        {learner?.course?.[0]?.IQA_id?.last_name}
                      </StyledInfoValue>
                    </StyledInfoItem>
                  </Grid>
                  <Grid item xs={12}>
                    <StyledInfoItem>
                      <StyledInfoLabel>Trainer Email:</StyledInfoLabel>
                      <StyledInfoValue>
                        {learner?.course?.[0]?.trainer_id?.email}
                      </StyledInfoValue>
                    </StyledInfoItem>
                  </Grid>
                </StyledInfoGrid>
              </Grid>

              {/* Progress Column */}
              <Grid item xs={12} md={learner?.course?.length > 2 ? 12 : 6}>
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Progress Overview
                </Typography>
                <StyledProgressSection>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label='Next Visit: 02-03-2023'
                      color='primary'
                      variant='outlined'
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {learner?.course?.map((value, index) => (
                      <Tooltip key={index} title={value?.course?.course_name}>
                        <Link
                          to='/portfolio/learnertodata'
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
                            value={matrixData}
                            variant='matrix'
                            size={200}
                            showLabels={true}
                            animated={true}
                          />
                        </Link>
                      </Tooltip>
                    ))}
                  </Box>
                </StyledProgressSection>
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
        <SecondaryButton name='Profile' onClick={handleOpenProfile} />
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
        <Calendar />
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
    </StyledContainer>
  )
}

export default Portfolio
