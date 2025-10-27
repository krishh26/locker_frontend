import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import LearnerDashboard from 'src/app/component/leaner-dashboard'
import { Box, Typography, IconButton, Button, Paper } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import { getLearnerDetails, selectLearnerManagement } from 'app/store/learnerManagement'
import FuseLoading from '@fuse/core/FuseLoading'

const LearnerDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch: any = useDispatch()
  
  const [validationError, setValidationError] = useState<string | null>(null)
  const { learner, dataFetchLoading } = useSelector(selectLearnerManagement)
  
  // Get learner ID from either URL params or query string
  const learnerId = id || searchParams.get('learner_id') || searchParams.get('id')

  const handleBack = () => {
    navigate(-1) // Go back to previous page
  }

  // Fetch learner details and validate
  useEffect(() => {
    if (learnerId) {
      setValidationError(null)
      
      dispatch(getLearnerDetails(learnerId) as any)
        .then((result: any) => {
          if (!result) {
            setValidationError('Learner not found or unable to fetch learner details')
          }
        })
        .catch((error: any) => {
          setValidationError('Learner not found or unable to fetch learner details')
        })
    }
  }, [learnerId, dispatch])

  // If no learner ID is provided, show an error
  if (!learnerId) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 3,
          padding: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 3,
            maxWidth: 500,
            textAlign: 'center',
            backgroundColor: 'background.paper',
          }}
        >
          <ErrorOutlineIcon
            sx={{
              fontSize: 80,
              color: 'error.main',
              mb: 2,
            }}
          />
          <Typography variant='h4' color='error' gutterBottom sx={{ fontWeight: 600 }}>
            Learner ID Required
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
            Please provide a valid learner ID in the URL to view the dashboard.
          </Typography>
          <Button
            variant='contained'
            color='primary'
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Paper>
      </Box>
    )
  }

  // Show loading state
  if (dataFetchLoading) {
    return <FuseLoading />
  }

  // Show error if learner not found
  if (validationError) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 3,
          padding: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 3,
            maxWidth: 500,
            textAlign: 'center',
            backgroundColor: 'background.paper',
          }}
        >
          <PersonOffIcon
            sx={{
              fontSize: 80,
              color: 'warning.main',
              mb: 2,
            }}
          />
          <Typography variant='h4' color='error' gutterBottom sx={{ fontWeight: 600 }}>
            Learner Not Found
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 1 }}>
            {validationError || 'No learner found with the provided ID'}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Learner ID: <strong>{learnerId}</strong>
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant='outlined'
              color='primary'
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
            >
              Go Back
            </Button>
          </Box>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Back Button */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: 'background.default',
          padding: '16px 24px',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <IconButton
          onClick={handleBack}
          sx={{
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
          aria-label='Go back'
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant='h6' sx={{ fontWeight: 600 }}>
          Learner Dashboard
        </Typography>
      </Box>

      {/* Dashboard Content */}
      <LearnerDashboard learnerId={learnerId} skipFetch={true} />
    </Box>
  )
}

export default LearnerDashboardPage

