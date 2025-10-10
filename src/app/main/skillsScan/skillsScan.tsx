import AssessmentIcon from '@mui/icons-material/Assessment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonIcon from '@mui/icons-material/Person'
import QuizIcon from '@mui/icons-material/Quiz'
import VisibilityIcon from '@mui/icons-material/Visibility'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Fade,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material'
import { getLearnerDetails } from 'app/store/learnerManagement'
import { selectSkillsScan } from 'app/store/skillsScan'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useCurrentUser } from 'src/app/utils/userHelpers'
import TNAQuestionaire from './tnaQuestionaire'
import TNAUnits from './tnaUnits'
import ViewResults from './viewResults'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  const theme = useTheme()

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in timeout={500}>
          <Box sx={{ 
            mt: 3,
            minHeight: '500px',
            background: theme.palette.mode === 'light' 
              ? `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.background.paper} 100%)`
              : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
            borderRadius: 2,
            p: 3
          }}>
            {children}
          </Box>
        </Fade>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

const SkillsScan = () => {
  const [value, setValue] = useState(0)
  const dispatch: any = useDispatch()
  const theme = useTheme()
  const selectedUser = useCurrentUser()
  const { selectedCourse } = useSelector(selectSkillsScan)
  
  const handleTabChange = (event, newValue) => {
    setValue(newValue)
  }

  useEffect(() => {
      dispatch(getLearnerDetails())
  }, [])

  const steps = [
    { 
      label: 'Choose TNA Units', 
      icon: <AssessmentIcon />, 
      description: 'Select your training units',
      disabled: false
    },
    { 
      label: 'TNA Questionnaire', 
      icon: <QuizIcon />, 
      description: 'Complete the assessment',
      disabled: !selectedCourse
    },
    { 
      label: 'View Results', 
      icon: <VisibilityIcon />, 
      description: 'Review your results',
      disabled: !selectedCourse
    }
  ]

  return (
    <Box sx={{ 
      width: "100%", 
      p: { xs: 1, sm: 2, md: 3 },
      minHeight: '100vh',
      background: theme.palette.mode === 'light' 
        ? `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`
        : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
    }}>
      <Fade in timeout={800}>
        <Box>
          {/* Header Card */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
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
                  <Avatar sx={{ 
                    bgcolor: theme.palette.primary.contrastText, 
                    color: theme.palette.primary.main,
                    mr: 2,
                    width: 56,
                    height: 56
                  }}>
                    <PersonIcon sx={{ fontSize: 32 }} />
                  </Avatar>
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
                      Skills Assessment
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        opacity: 0.9,
                        fontWeight: 400,
                        letterSpacing: '0.5px'
                      }}
                    >
                      {selectedUser?.first_name + ' ' + selectedUser?.last_name}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Training Needs Analysis"
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

          {/* Tab Navigation */}
          <Card
            elevation={0}
            sx={{
              mb: 2,
              borderRadius: 2,
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden"
            }}
          >
            <Tabs
              value={value}
              onChange={handleTabChange}
              aria-label="skills assessment tabs"
              variant="fullWidth"
              sx={{
                '& .MuiTabs-indicator': {
                  height: 4,
                  borderRadius: '2px 2px 0 0',
                  backgroundColor: theme.palette.primary.main,
                },
              }}
            >
              {steps.map((step, index) => (
                <Tab
                  key={index}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {step.icon}
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {step.label}
                      </Typography>
                    </Box>
                  }
                  {...a11yProps(index)}
                  disabled={step.disabled}
                  sx={{
                    minHeight: 64,
                    py: 2,
                    '&.Mui-selected': {
                      color: theme.palette.primary.main,
                      backgroundColor: theme.palette.primary.light + '10',
                    },
                    '&.Mui-disabled': {
                      color: theme.palette.action.disabled,
                      backgroundColor: theme.palette.action.disabledBackground,
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </Tabs>
          </Card>

          {/* Tab Content */}
          <CustomTabPanel value={value} index={0}>
            <TNAUnits handleTabChange={handleTabChange} />
          </CustomTabPanel>

          <CustomTabPanel value={value} index={1}>
            <TNAQuestionaire handleTabChange={handleTabChange} />
          </CustomTabPanel>

          <CustomTabPanel value={value} index={2}>
            <ViewResults />
          </CustomTabPanel>
        </Box>
      </Fade>
    </Box>
  )
}

export default SkillsScan
