import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Box, Card, Grid, TextField, Typography } from '@mui/material'

interface AdditionalInfoSectionProps {
  disabled?: boolean
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({ disabled = false }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <Card className='rounded-6 items-center' variant='outlined'>
      <Grid className='h-full flex flex-col'>
        <Box>
          <Grid xs={12} className='p-10 border-b-2 bg-[#007E84]'>
            <Typography className='font-600 text-white'>
              Additional Information
            </Typography>
          </Grid>
          <Box className='m-12 flex flex-col justify-between gap-12 sm:flex-col'>
            <Grid className='w-full flex flex-row gap-20'>
              <Grid className='w-1/2'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Awarding Body
                </Typography>
                <TextField
                  {...register('awarding_body')}
                  size='small'
                  fullWidth
                  disabled={disabled}
                  className='bg-none'
                />
              </Grid>
              <Grid className='w-1/2'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Registration Number
                </Typography>
                <TextField
                  {...register('registration_number')}
                  size='small'
                  fullWidth
                  disabled={disabled}
                  className='bg-none'
                />
              </Grid>
            </Grid>

            <Grid className='w-full flex flex-row gap-20'>
              <Grid className='w-1/2'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Registration Date
                </Typography>
                <TextField
                  {...register('registration_date')}
                  size='small'
                  type='date'
                  fullWidth
                  disabled={disabled}
                  className='bg-none'
                />
              </Grid>
              <Grid className='w-1/2'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  LARA Code
                </Typography>
                <TextField
                  {...register('lara_code')}
                  size='small'
                  fullWidth
                  disabled={disabled}
                  className='bg-none'
                />
              </Grid>
            </Grid>

            <Grid className='w-full flex flex-row gap-20'>
              <Grid className='w-1/2'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  IQAS Name
                </Typography>
                <TextField
                  {...register('iqas_name')}
                  size='small'
                  fullWidth
                  disabled={disabled}
                  className='bg-none'
                />
              </Grid>

              <Grid className='w-1/2'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Off the Job Training
                </Typography>
                <TextField
                  {...register('off_the_job_training')}
                  size='small'
                  type='number'
                  fullWidth
                  disabled={disabled}
                  className='bg-none'
                />
              </Grid>
            </Grid>

            <Grid className='w-full flex flex-row gap-20'>
              <Grid className='w-1/3'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  FS English Green Progress
                </Typography>
                <TextField
                  {...register('fs_english_green_progress')}
                  size='small'
                  type='number'
                  fullWidth
                  disabled={disabled}
                  className='bg-none'
                />
              </Grid>
              <Grid className='w-1/3'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  FS English Orange Progress
                </Typography>
                <TextField
                  {...register('fs_english_orange_progress')}
                  size='small'
                  type='number'
                  fullWidth
                  disabled={disabled}
                  className='bg-none'
                />
              </Grid>
              <Grid className='w-1/3'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Guided Learning Hours Achieved
                </Typography>
                <TextField
                  {...register('guided_learning_hours_achieved')}
                  size='small'
                  type='number'
                  fullWidth
                  disabled={disabled}
                  className='bg-none'
                />
              </Grid>
            </Grid>

            <Grid className='w-full flex flex-row gap-20'>
              <Grid className='w-1/3'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  FS Maths Green Progress
                </Typography>
                <TextField
                  {...register('fs_maths_green_progress')}
                  size='small'
                  type='number'
                  fullWidth
                  disabled={disabled}
                  className='bg-none'
                />
              </Grid>
              <Grid className='w-1/3'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  FS Maths Orange Progress
                </Typography>
                <TextField
                  {...register('fs_maths_orange_progress')}
                  size='small'
                  type='number'
                  fullWidth
                  disabled={disabled}
                  className='bg-none'
                />
              </Grid>
              <Grid className='w-1/3'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Main Aim Guided Learning Hours Achieved
                </Typography>
                <TextField
                  {...register('main_aim_guided_learning_hours_achieved')}
                  size='small'
                  type='number'
                  fullWidth
                  disabled={disabled}
                  className='bg-none'
                />
              </Grid>
            </Grid>

            <Grid className='w-full flex flex-row gap-20'>
              <Grid className='w-1/3'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Main Aim Green Progress
                </Typography>
                <TextField
                  {...register('main_aim_green_progress')}
                  size='small'
                  type='number'
                  fullWidth
                  disabled={disabled}
                  className='bg-none'
                />
              </Grid>
              <Grid className='w-1/3'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Main Aim Orange Progress
                </Typography>
                <TextField
                  {...register('main_aim_orange_progress')}
                  size='small'
                  type='number'
                  fullWidth
                  disabled={disabled}
                  className='bg-none'
                />
              </Grid>
              <Grid className='w-1/3'></Grid>
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Card>
  )
}

export default AdditionalInfoSection
