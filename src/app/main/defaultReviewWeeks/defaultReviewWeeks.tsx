import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  Alert,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  InputAdornment,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { LoadingButton } from 'src/app/component/Buttons'
import SaveIcon from '@mui/icons-material/Save'
import SettingsIcon from '@mui/icons-material/Settings'
import WarningIcon from '@mui/icons-material/Warning'
import AssignmentIcon from '@mui/icons-material/Assignment'
import {
  useGetDefaultReviewWeeksConfigQuery,
  useSaveDefaultReviewWeeksConfigMutation,
  type DefaultReviewWeeksConfig,
  type SaveConfigRequest,
} from 'app/store/api/default-review-weeks-api'

// Yup validation schema
const schema = yup.object().shape({
  noReviewWeeks: yup
    .number()
    .required('Review warning weeks is required')
    .min(1, 'Must be at least 1 week')
    .max(52, 'Cannot exceed 52 weeks')
    .integer('Must be a whole number'),
  noInductionWeeks: yup
    .number()
    .required('Induction warning weeks is required')
    .min(1, 'Must be at least 1 week')
    .max(52, 'Cannot exceed 52 weeks')
    .integer('Must be a whole number'),
  requireFileUpload: yup.boolean(),
})

type FormData = SaveConfigRequest

const DefaultReviewWeeks: React.FC = () => {
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // RTK Query hooks
  const {
    data: configResponse,
    isLoading,
    error,
    refetch,
  } = useGetDefaultReviewWeeksConfigQuery()

  const [saveConfig, { isLoading: isSaving }] =
    useSaveDefaultReviewWeeksConfigMutation()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      noReviewWeeks: 5,
      noInductionWeeks: 2,
      requireFileUpload: true,
    },
  })

  // Update form when config data changes
  useEffect(() => {
    if (configResponse?.data && isInitialLoad) {
      // Extract only the form fields from the response data
      const formData = {
        noReviewWeeks: configResponse.data.noReviewWeeks,
        noInductionWeeks: configResponse.data.noInductionWeeks,
        requireFileUpload: configResponse.data.requireFileUpload,
      }
      reset(formData)
      setIsInitialLoad(false)
    }
  }, [configResponse, reset, isInitialLoad])


  const onSubmit = async (data: FormData) => {
    try {
      // Save or update configuration (upsert)
      await saveConfig(data).unwrap()

      // Refetch data to get updated configuration
      refetch()
    } catch (error) {
      console.error('Failed to save configuration:', error)
      setSaveStatus('error')
    }
  }

  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box className='w-full p-28'>
      <Box className='mb-14'>
        <Typography
          variant='h4'
          component='h1'
          className='font-bold text-gray-800 mb-2'
        >
          Default Review Weeks Configuration
        </Typography>
        <Typography variant='body1' className='text-gray-600'>
          Configure the default review period settings for all learner types
          without custom review periods.
        </Typography>
      </Box>

      <Card>
        <CardHeader
          avatar={<SettingsIcon className='text-blue-600' />}
          title={
            <Typography variant='h6' className='font-semibold'>
              Review Period Settings
            </Typography>
          }
          subheader='Configure warning periods for reviews and inductions'
        />
        <Divider />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              {/* Review Warning Setting */}
              <Grid item xs={12} md={6}>
                <Controller
                  name='noReviewWeeks'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Display Warning if there has been no review for:'
                      type='number'
                      fullWidth
                      variant='outlined'
                      error={!!errors.noReviewWeeks}
                      helperText={errors.noReviewWeeks?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <Box
                              sx={{
                                backgroundColor: '#f5f5f5',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                border: '1px solid #e0e0e0',
                                color: '#666',
                                fontSize: '14px',
                                fontWeight: 500,
                              }}
                            >
                              weeks
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#e0e0e0',
                          },
                          '&:hover fieldset': {
                            borderColor: '#1976d2',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1976d2',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Induction Warning Setting */}
              <Grid item xs={12} md={6}>
                <Controller
                  name='noInductionWeeks'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Display Warning if there has been no induction for:'
                      type='number'
                      fullWidth
                      variant='outlined'
                      error={!!errors.noInductionWeeks}
                      helperText={errors.noInductionWeeks?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <Box
                              sx={{
                                backgroundColor: '#f5f5f5',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                border: '1px solid #e0e0e0',
                                color: '#666',
                                fontSize: '14px',
                                fontWeight: 500,
                              }}
                            >
                              weeks
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#e0e0e0',
                          },
                          '&:hover fieldset': {
                            borderColor: '#1976d2',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1976d2',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              {/* File Upload Requirement */}
              <Grid item xs={12}>
                <Controller
                  name='requireFileUpload'
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value}
                          color='primary'
                          sx={{
                            '&.Mui-checked': {
                              color: '#1976d2',
                            },
                          }}
                        />
                      }
                      label={
                        <Box display='flex' alignItems='center' gap={1}>
                          <AssignmentIcon
                            className='text-gray-600'
                            fontSize='small'
                          />
                          <Typography variant='body1' className='font-medium'>
                            Require a file to be uploaded for review sessions
                          </Typography>
                        </Box>
                      }
                    />
                  )}
                />
              </Grid>

              {/* Status Messages */}
              {saveStatus === 'saved' && (
                <Grid item xs={12}>
                  <Alert severity='success' className='rounded-lg'>
                    Configuration saved successfully!
                  </Alert>
                </Grid>
              )}

              {saveStatus === 'error' && (
                <Grid item xs={12}>
                  <Alert severity='error' className='rounded-lg'>
                    Failed to save configuration. Please try again.
                  </Alert>
                </Grid>
              )}

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box display='flex' justifyContent='center' mt={2}>
                  <Button
                    type='submit'
                    variant='contained'
                    size='large'
                    disabled={isSaving}
                    startIcon={<SaveIcon />}
                  >
                    {isSaving ? 'Saving...' : 'Confirm'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className='mt-14' sx={{ backgroundColor: '#f8f9fa' }}>
        <CardHeader
          avatar={<WarningIcon className='text-amber-600' />}
          title={
            <Typography variant='h6' className='font-semibold text-gray-800'>
              Important Information
            </Typography>
          }
        />
        <CardContent>
          <Typography variant='body2' className='text-gray-600 leading-relaxed'>
            These settings will be applied as the default review period for all
            learner types that don't have a custom review period assigned.
            Changes will take effect immediately after saving and will affect
            new review sessions going forward.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default DefaultReviewWeeks
