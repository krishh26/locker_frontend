import { 
  Avatar, 
  Tooltip, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  useTheme, 
  Chip, 
  Divider, 
  Fade, 
  Grid,
  Paper
} from '@mui/material'
import { fetchAllLearnerByUserAPI, selectCourseManagement } from 'app/store/courseManagement'
import { selectUser } from 'app/store/userSlice'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import DoughnutChart from 'src/app/component/Chart/doughnut'
import { selectstoreDataSlice, slice } from 'app/store/reloadData'
import { slice as courseSlice } from "app/store/courseManagement";
import { portfolioCard } from 'src/app/contanst'
import LearnerPortfolioCard from 'src/app/component/Cards/LearnerPortfolioCard'
import { getRandomColor } from 'src/utils/randomColor'
import PersonIcon from '@mui/icons-material/Person'
import SchoolIcon from '@mui/icons-material/School'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AssessmentIcon from '@mui/icons-material/Assessment'


const Protfolio = ({ learner, handleClickData, handleClickSingleData }) => {
  const theme = useTheme();

  return (
    <Fade in timeout={500}>
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 3,
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme.shadows[8],
            transform: 'translateY(-2px)'
          }
        }}
      >
        {/* Header Section */}
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ 
            p: 3, 
            background: theme.palette.mode === 'light' 
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            color: theme.palette.primary.contrastText,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              zIndex: 1
            }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 3, 
              position: 'relative', 
              zIndex: 2 
            }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: getRandomColor(learner?.first_name?.toLowerCase().charAt(0)),
                  border: `3px solid ${theme.palette.primary.contrastText}`,
                  boxShadow: theme.shadows[4]
                }}
                src={learner?.learner_id ? learner?.avatar : learner.data?.avatar?.url}
                alt={learner?.first_name?.toUpperCase()?.charAt(0)}
              />
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    background: `linear-gradient(45deg, ${theme.palette.primary.contrastText}, rgba(255,255,255,0.8))`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {learner?.first_name} {learner?.last_name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <PersonIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Learner ID: {learner?.learner_id}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Portfolio Cards Section */}
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AssessmentIcon sx={{ 
                fontSize: 24, 
                color: theme.palette.primary.main,
                mr: 1
              }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Portfolio Modules
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {portfolioCard?.map((value, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={value.id}>
                  <LearnerPortfolioCard 
                    data={value} 
                    index={index} 
                    learner={learner} 
                    handleClickData={handleClickData} 
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider />

        </CardContent>
      </Card>
    </Fade>
  )
}

const LearnerOverview = () => {
  const theme = useTheme();
  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;
  const { learnerOverView } = useSelector(selectCourseManagement)
  const dispatch: any = useDispatch()

  useEffect(() => {
    if (user?.user_id && user?.role) {
      dispatch(fetchAllLearnerByUserAPI(user?.user_id, user?.role))
    }
  }, [user]);

  const handleClickData = (id, user_id) => {
    dispatch(slice.setLeanerId({ id, user_id }))
  }

  const handleClickSingleData = (row) => {
    dispatch(courseSlice.setSingleData(row));
  };

  return (
    <Box sx={{ 
      width: "100%", 
      p: { xs: 1, sm: 2, md: 3 },
      minHeight: '100vh',
      background: theme.palette.mode === 'light' 
        ? `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`
        : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
    }}>
      {/* Header */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 3,
          background: theme.palette.mode === 'light'
            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: theme.palette.primary.contrastText,
          overflow: "hidden",
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            zIndex: 1
          }
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 2, p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
              <Box>
                <Typography 
                  variant="h3" 
                  fontWeight={700}
                  sx={{ 
                    background: `linear-gradient(45deg, ${theme.palette.primary.contrastText}, rgba(255,255,255,0.8))`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  Learner Overview
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    opacity: 0.9,
                    fontWeight: 400,
                    letterSpacing: '0.5px'
                  }}
                >
                  Manage and monitor learner progress
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={<TrendingUpIcon />}
              label={`${learnerOverView?.length || 0} Learner${learnerOverView?.length !== 1 ? 's' : ''}`}
              sx={{
                backgroundColor: theme.palette.primary.contrastText,
                color: theme.palette.primary.main,
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Learners List */}
      <Box>
        {learnerOverView?.length > 0 ? (
          learnerOverView.map((item, index) => (
            <Protfolio 
              key={item.learner_id || index} 
              learner={item} 
              handleClickSingleData={handleClickSingleData} 
              handleClickData={handleClickData} 
            />
          ))
        ) : (
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden"
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <PersonIcon sx={{ 
                fontSize: 64, 
                color: theme.palette.action.disabled,
                mb: 2
              }} />
              <Typography variant="h6" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                No Learners Found
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                There are no learners assigned to your account yet
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  )
}

export default LearnerOverview
