import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  Box,
  Container,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import { useSelector } from 'react-redux'
import { Controller, useForm } from 'react-hook-form'

import { selectUser } from 'app/store/userSlice'

type LocationState = {
  courseId: string
  file: File
}

const CreateViewEvidenceLibrary = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | undefined

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({})

  const user = useSelector(selectUser)?.data

    useEffect(() => {
      if (!state?.courseId || !state?.file) {
        navigate('/evidenceLibrary') // Redirect if missing data
      }
    }, [state, navigate])

    if (!state?.courseId || !state?.file) {
      return null // Prevent rendering during redirect
    }

    const { courseId, file } = state || {}

  return (
    <Container sx={{ mt: 8 , mb: 4 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Evidence Details
      </Typography>
      <Paper
        elevation={1}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 2,
          marginBottom: 3,
          padding: 2,
          minHeight: 64,
          border: '1px solid #e0e0e0',
        }}
      >
        <Box display='flex' alignItems='center' gap={2}>
          <InsertDriveFileOutlinedIcon color='action' />
          <Box>
            <Typography
              variant='body2'
              color='primary'
              sx={{ fontWeight: 500, cursor: 'pointer' }}
            >
              {file.name}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {Math.round(file.size / 1024)} KB
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              display='block'
            >
              {user.displayName} on{' '}
              {new Date(file.lastModified).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Paper>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant='body1' gutterBottom>
            Name
          </Typography>
          <Controller
            name='title'
            control={control}
            render={({ field }) => (
              <TextField
                name='title'
                size='small'
                placeholder={'Enter Name'}
                fullWidth
                error={!!errors.title}
                {...field}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant='body1' gutterBottom>
            Description
          </Typography>
          <Controller
            name='title'
            control={control}
            render={({ field }) => (
              <TextField
                name='title'
                size='small'
                fullWidth
                multiline
                rows={4}
                error={!!errors.title}
                {...field}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant='body1' gutterBottom>
            Trainer feedback
          </Typography>
          <Controller
            name='title'
            control={control}
            render={({ field }) => (
              <TextField
                name='title'
                size='small'
                multiline
                rows={4}
                fullWidth
                disabled={user?.role !== 'Trainer'}
                style={
                  user?.role !== 'Trainer'
                    ? { backgroundColor: 'whitesmoke' }
                    : {}
                }
                error={!!errors.title}
                {...field}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant='body1' gutterBottom>
            Points for Improvement
          </Typography>
          <Controller
            name='title'
            control={control}
            render={({ field }) => (
              <TextField
                name='title'
                size='small'
                fullWidth
                multiline
                rows={4}
                error={!!errors.title}
                disabled={user?.role !== 'Trainer'}
                style={
                  user?.role !== 'Trainer'
                    ? { backgroundColor: 'whitesmoke' }
                    : {}
                }
                {...field}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant='body1' gutterBottom>
            Learner Comments
          </Typography>
          <Controller
            name='title'
            control={control}
            render={({ field }) => (
              <TextField
                name='title'
                size='small'
                fullWidth
                multiline
                rows={4}
                error={!!errors.title}
                {...field}
              />
            )}
          />
        </Grid>
      </Grid>
    </Container>
  )
}

export default CreateViewEvidenceLibrary
