import {
    Avatar,
    Box,
    Card,
    CardContent,
    Fade,
    Grid,
    Slide,
    Typography,
    alpha,
    useMediaQuery,
    useTheme
} from '@mui/material'
import { styled } from '@mui/material/styles'
import {
    fetchCourseAPI,
    selectCourseManagement,
    slice
} from 'app/store/courseManagement'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { PortfolioCard } from 'src/app/component/Cards'
import { portfolioCard } from 'src/app/contanst'
import FuseSvgIcon from '@fuse/core/FuseSvgIcon'
import { getAllPortfolioCounts, PortfolioCountData } from 'src/app/utils/portfolioCountUtils'

// Type-safe wrapper for FuseSvgIcon
const Icon = (props: { size?: number; color?: string; children: string }) => {
  return <FuseSvgIcon {...(props as any)} />
}

// Styled Components
const StyledContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.main,
    0.08
  )} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 50%, ${alpha(
    theme.palette.primary.light,
    0.05
  )} 100%)`,
  minHeight: '100vh',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 20% 80%, ${alpha(
      theme.palette.primary.main,
      0.1
    )} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${alpha(
      theme.palette.secondary.main,
      0.1
    )} 0%, transparent 50%)`,
    pointerEvents: 'none',
  },
}))

const StyledCardsContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: theme.spacing(4),
  padding: theme.spacing(2),
  position: 'relative',
  zIndex: 1,
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: theme.spacing(3),
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: theme.spacing(2.5),
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
    padding: theme.spacing(1),
  },
}))

const StyledHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.background.paper,
    0.95
  )} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  position: 'relative',
  zIndex: 1,
}))

const StyledSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.background.paper,
    0.95
  )} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  marginTop: theme.spacing(1),
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  position: 'relative',
  zIndex: 1,
}))

const StyledUserCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.background.paper,
    0.95
  )} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 30px ${alpha(theme.palette.common.black, 0.15)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}))

const UserCard = ({ user }) => {
  const theme = useTheme()
  
  return (
    <StyledUserCard>
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems='center'>
          <Grid item>
            <Avatar
              src={user.avatar?.url || '/default-avatar.png'}
              alt={`${user.first_name} ${user.last_name}`}
              sx={{ 
                width: 64, 
                height: 64,
                border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            />
          </Grid>
          <Grid item xs>
            <Typography 
              variant='h6' 
              sx={{ 
                fontWeight: 700, 
                color: 'text.primary',
                mb: 1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {user.role.join() === 'Employer'
                ? user?.employer?.employer_name
                : user.first_name + ' ' + user.last_name}
            </Typography>
            <Typography 
              variant='body2' 
              sx={{ 
                color: 'text.secondary',
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Icon size={16} color="primary">heroicons-outline:envelope</Icon>
              {user.email}
            </Typography>
            <Typography 
              variant='body2' 
              sx={{ 
                color: 'text.secondary',
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Icon size={16} color="primary">heroicons-outline:phone</Icon>
              {user.mobile}
            </Typography>
            <Typography 
              variant='body2' 
              sx={{ 
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Icon size={16} color="primary">heroicons-outline:user-group</Icon>
              {user.role.join(', ')}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </StyledUserCard>
  )
}

function getUniqueUserData(singleData) {
  // Extract user IDs
  const ids = [
    { ...singleData.EQA_id, role: 'EQA' },
    { ...singleData.IQA_id, role: 'IQA' },
    { ...singleData.LIQA_id, role: 'LIQA' },
    { ...singleData.employer_id, role: 'Employer' },
    { ...singleData.trainer_id, role: 'Trainer' },
  ]

  return Object.values(
    ids.reduce((acc, user) => {
      const userId = user.user_id
      if (userId === undefined) {
        return acc
      }
      if (acc[userId]) {
        acc[userId] = { ...user, role: [...acc[userId].role, user.role] }
      } else {
        acc[userId] = { ...user, role: [user.role] }
      }
      return acc
    }, {})
  )
}

const CourseData = () => {
  // Hooks
  const dispatch: any = useDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  
  // State for count data
  const [countData, setCountData] = useState<PortfolioCountData>({
    evidenceTotal: 0,
    evidenceUploaded: 0,
    unitsTotal: 0,
    unitsCompleted: 0,
    progressPercentage: 0,
    gapsTotal: 0,
    gapsResolved: 0,
    availableUnits: 0,
    selectedUnits: 0,
    sessionsTotal: 0,
    sessionsCompleted: 0,
    resourcesTotal: 0,
    resourcesAccessed: 0,
  })
  
  // Selectors
  const { singleData, data, dataFetchLoading } = useSelector(
    selectCourseManagement
  )
  const course = singleData?.course

  // Memoized filtered cards
  const { courseCards } = useMemo(
    () => ({
      courseCards: portfolioCard.filter((card) =>
        [1, 2, 3, 6, 7, 8].includes(card.id)
      ),
    }),
    []
  )


  const handleCourseClick = useCallback(
    (id, userId) => {
      // For demonstration, create mock course data based on the card clicked
      const mockCourseData = {
        course_id: id,
        course: {
          course_name: `Course ${id}`,
          course_code: `C${id.toString().padStart(3, '0')}`,
          level: 'Level 3',
          sector: 'Education',
          qualification_type: 'NVQ',
          recommended_minimum_age: '16',
          total_credits: '120',
          operational_start_date: '2024-01-01',
          guided_learning_hours: '600',
          brand_guidelines: 'Standard Guidelines',
          qualification_status: 'Active',
          overall_grading_type: 'Pass/Fail',
        },
        course_status: 'In Training',
        user_course_id: `uc_${id}`,
        // Mock progress data
        unitsNotStarted: 2,
        unitsFullyCompleted: 3,
        unitsPartiallyCompleted: 1,
        totalUnits: 6,
        duration: 30,
        totalDuration: 90,
        dayPending: 60,
      }

      dispatch(slice.setSingleData(mockCourseData))
    },
    [dispatch]
  )

  const handleBackToCourses = useCallback(() => {
    navigate('/home')
  }, [])

  const formatDate = useCallback((dateString) => {
    return dayjs(dateString).format('D MMMM YYYY')
  }, [])


  useEffect(() => {
    // Fetch courses if not already loaded
    if (!data || data.length === 0) {
      dispatch(fetchCourseAPI({ page: 1, page_size: 25 }))
    }
  }, [data, dispatch])

  // Fetch count data when singleData changes
  useEffect(() => {
    const fetchCountData = async () => {
      if (singleData && singleData.course) {
        try {
          // Get learner ID from session storage or props
          const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user
          const learnerId = user?.learner_id || user?.user_id
          
          if (learnerId) {
            const counts = await getAllPortfolioCounts(learnerId, singleData.course)
            setCountData(counts)
          }
        } catch (error) {
          console.error('Error fetching portfolio count data:', error)
        }
      }
    }

    fetchCountData()
  }, [singleData])

  // Loading state
  if (dataFetchLoading) {
    return (
      <StyledContainer>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          gap: 3
        }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)', opacity: 1 },
              '50%': { transform: 'scale(1.1)', opacity: 0.7 },
              '100%': { transform: 'scale(1)', opacity: 1 },
            }
          }}>
            <Icon size={40} color="white">heroicons-outline:academic-cap</Icon>
          </Box>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'text.primary',
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Loading Course Data...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please wait while we fetch the latest information
          </Typography>
        </Box>
      </StyledContainer>
    )
  }

  return (
    <StyledContainer>
      {/* Header Section */}
      <StyledHeader>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant='h4'
              component='h1'
              sx={{ 
                fontWeight: 700, 
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                m: 0
              }}
            >
              Course Details
            </Typography>
          </Box>

          <Box>
            <button
              onClick={handleBackToCourses}
              style={{
                padding: '8px 16px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.transform = 'translateY(-1px)'
                target.style.boxShadow = `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.transform = 'translateY(0)'
                target.style.boxShadow = `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              <Icon size={14} color="inherit">heroicons-outline:arrow-left</Icon>
              Back to Courses
            </button>
          </Box>
        </Box>
      </StyledHeader>
      <Fade in={true} timeout={500}>
        <StyledCardsContainer>
          {courseCards.map((value, index) => (
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
                  handleClickData={handleCourseClick}
                  countData={countData}
                />
              </Box>
            </Slide>
          ))}
        </StyledCardsContainer>
      </Fade>
      <Fade in={true} timeout={500}>
        <StyledSection>
          {/* Course Information Cards */}
          <Typography
            variant='h4'
            sx={{ 
              fontWeight: 700, 
              color: 'text.primary',
              mb: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Icon size={28} color="primary">heroicons-outline:book-open</Icon>
            Course Information
          </Typography>
          
          <Grid container spacing={3}>
            {/* Card 1 - Course Details */}
            <Grid item xs={12} md={6}>
              <Card sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                borderRadius: 2,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant='h5'
                    sx={{ 
                      fontWeight: 700, 
                      color: 'primary.main',
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Icon size={24} color="primary">heroicons-outline:academic-cap</Icon>
                    {course?.course_name || 'Course Name'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon size={16} color="primary">heroicons-outline:tag</Icon>
                      <Typography variant='body1' sx={{ color: 'text.primary' }}>
                        Course Code:{' '}
                        <Typography component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {course?.course_code || 'N/A'}
                        </Typography>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon size={16} color="primary">heroicons-outline:chart-bar</Icon>
                      <Typography variant='body1' sx={{ color: 'text.primary' }}>
                        Level:{' '}
                        <Typography component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {course?.level || 'N/A'}
                        </Typography>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon size={16} color="primary">heroicons-outline:building-office</Icon>
                      <Typography variant='body1' sx={{ color: 'text.primary' }}>
                        Sector:{' '}
                        <Typography component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {course?.sector || 'N/A'}
                        </Typography>
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 2 - Qualification Details */}
            <Grid item xs={12} md={6}>
              <Card sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.light, 0.02)} 100%)`,
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                borderLeft: `4px solid ${theme.palette.secondary.main}`,
                borderRadius: 2,
                boxShadow: `0 4px 20px ${alpha(theme.palette.secondary.main, 0.1)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 30px ${alpha(theme.palette.secondary.main, 0.15)}`,
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant='h5'
                    sx={{ 
                      fontWeight: 700, 
                      color: 'secondary.main',
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Icon size={24} color="secondary">heroicons-outline:document-text</Icon>
                    Qualification Details
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon size={16} color="secondary">heroicons-outline:document</Icon>
                      <Typography variant='body1' sx={{ color: 'text.primary' }}>
                        Qualification Type:{' '}
                        <Typography component="span" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                          {course?.qualification_type || 'N/A'}
                        </Typography>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon size={16} color="secondary">heroicons-outline:calendar</Icon>
                      <Typography variant='body1' sx={{ color: 'text.primary' }}>
                        Min. Age:{' '}
                        <Typography component="span" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                          {course?.recommended_minimum_age || 'N/A'}
                        </Typography>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon size={16} color="secondary">heroicons-outline:star</Icon>
                      <Typography variant='body1' sx={{ color: 'text.primary' }}>
                        Total Credits:{' '}
                        <Typography component="span" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                          {course?.total_credits || 'N/A'}
                        </Typography>
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 3 - Key Dates */}
            <Grid item xs={12} md={6}>
              <Card sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.warning.light, 0.02)} 100%)`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                borderLeft: `4px solid ${theme.palette.warning.main}`,
                borderRadius: 2,
                boxShadow: `0 4px 20px ${alpha(theme.palette.warning.main, 0.1)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 30px ${alpha(theme.palette.warning.main, 0.15)}`,
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant='h5'
                    sx={{ 
                      fontWeight: 700, 
                      color: 'warning.main',
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Icon size={24} color="warning">heroicons-outline:clock</Icon>
                    Key Dates & Hours
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon size={16} color="warning">heroicons-outline:calendar-days</Icon>
                      <Typography variant='body1' sx={{ color: 'text.primary' }}>
                        Start Date:{' '}
                        <Typography component="span" sx={{ fontWeight: 600, color: 'warning.main' }}>
                          {formatDate(course?.operational_start_date) || 'N/A'}
                        </Typography>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon size={16} color="warning">heroicons-outline:clock</Icon>
                      <Typography variant='body1' sx={{ color: 'text.primary' }}>
                        Learning Hours:{' '}
                        <Typography component="span" sx={{ fontWeight: 600, color: 'warning.main' }}>
                          {course?.guided_learning_hours || 'N/A'}
                        </Typography>
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 4 - Additional Information */}
            <Grid item xs={12} md={6}>
              <Card sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.light, 0.02)} 100%)`,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderLeft: `4px solid ${theme.palette.info.main}`,
                borderRadius: 2,
                boxShadow: `0 4px 20px ${alpha(theme.palette.info.main, 0.1)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 30px ${alpha(theme.palette.info.main, 0.15)}`,
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant='h5'
                    sx={{ 
                      fontWeight: 700, 
                      color: 'info.main',
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Icon size={24} color="info">heroicons-outline:information-circle</Icon>
                    Additional Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon size={16} color="info">heroicons-outline:document-duplicate</Icon>
                      <Typography variant='body1' sx={{ color: 'text.primary' }}>
                        Brand Guidelines:{' '}
                        <Typography component="span" sx={{ fontWeight: 600, color: 'info.main' }}>
                          {course?.brand_guidelines || 'N/A'}
                        </Typography>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon size={16} color="info">heroicons-outline:check-circle</Icon>
                      <Typography variant='body1' sx={{ color: 'text.primary' }}>
                        Status:{' '}
                        <Typography component="span" sx={{ fontWeight: 600, color: 'info.main' }}>
                          {course?.qualification_status || 'N/A'}
                        </Typography>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon size={16} color="info">heroicons-outline:chart-bar-square</Icon>
                      <Typography variant='body1' sx={{ color: 'text.primary' }}>
                        Grading Type:{' '}
                        <Typography component="span" sx={{ fontWeight: 600, color: 'info.main' }}>
                          {course?.overall_grading_type || 'N/A'}
                        </Typography>
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Learner Supervisors Section */}
          <Box sx={{ mt: 6 }}>
            <Typography
              variant='h4'
              sx={{ 
                fontWeight: 700, 
                color: 'text.primary',
                mb: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Icon size={28} color="primary">heroicons-outline:user-group</Icon>
              Learner Supervisors
            </Typography>

            <Grid container spacing={3}>
              {getUniqueUserData(singleData)?.map((user: any) => (
                <Grid item xs={12} sm={6} md={4} key={user.user_id}>
                  <UserCard user={user} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </StyledSection>
      </Fade>
    </StyledContainer>
  )
}

export default CourseData
