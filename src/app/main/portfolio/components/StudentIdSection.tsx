import React from 'react'
import { useFormContext } from 'react-hook-form'
import {
  Box,
  Card,
  Grid,
  TextField,
  Typography,
} from '@mui/material'
import UploadPhoto from '../uploadPhoto'

interface StudentIdSectionProps {
  disabled?: boolean
}

const StudentIdSection: React.FC<StudentIdSectionProps> = ({ disabled = false }) => {
  const { register, formState: { errors } } = useFormContext()

  return (
    <Card className='rounded-6 items-center' variant='outlined'>
      <Grid className='h-full flex flex-col'>
        <Box>
          <Grid xs={12} className='p-10 border-b-2 bg-[#007E84]'>
            <Typography className='font-600 text-white'>
              Student ID
            </Typography>
          </Grid>
          <Box className='m-12 flex flex-row justify-between gap-20'>
            <Grid className='w-1/2 flex flex-col gap-20'>
              <Grid className=''>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  ULN
                </Typography>
                <TextField
                  {...register('uln')}
                  size='small'
                  fullWidth
                  disabled={disabled}
                  error={!!errors.uln}
                  helperText={errors.uln?.message as string}
                  className='bg-none'
                />
              </Grid>
              <Grid className=''>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  MIS Learner ID
                </Typography>
                <TextField
                  {...register('mis_learner_id')}
                  size='small'
                  fullWidth
                  disabled={disabled}
                  error={!!errors.mis_learner_id}
                  helperText={errors.mis_learner_id?.message as string}
                  className='bg-none'
                />
              </Grid>
              <Grid className=''>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Student ID
                </Typography>
                <TextField
                  {...register('student_id')}
                  size='small'
                  fullWidth
                  disabled={disabled}
                  placeholder='Internal Student Number'
                  error={!!errors.student_id}
                  helperText={errors.student_id?.message as string}
                  className='bg-none'
                />
              </Grid>
            </Grid>
            <Grid className='w-1/2 flex justify-center items-center'>
              <UploadPhoto />
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Card>
  )
}

export default StudentIdSection
