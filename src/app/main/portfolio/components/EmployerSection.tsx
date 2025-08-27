import React from 'react'
import { useFormContext } from 'react-hook-form'
import {
  Box,
  Card,
  Grid,
  TextField,
  Typography,
  Autocomplete,
  Paper,
} from '@mui/material'

interface EmployerSectionProps {
  employer: any[]
}

const EmployerSection: React.FC<EmployerSectionProps> = ({ employer }) => {
  const { register, setValue, watch, formState: { errors } } = useFormContext()
  const employerId = watch('employer_id')

  return (
    <Card className='rounded-6 items-center' variant='outlined'>
      <Grid className='h-full flex flex-col'>
        <Box>
          <Grid xs={12} className='p-10 border-b-2 bg-[#007E84]'>
            <Typography className='font-600 text-white'>
              Employer
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
                  Employer*
                </Typography>
                <Autocomplete
                  disableClearable
                  fullWidth
                  size='small'
                  options={employer}
                  getOptionLabel={(option: any) =>
                    option.employer?.employer_name
                  }
                  value={
                    employer.find(
                      (emp) =>
                        emp.employer.employer_id === employerId
                    ) || null
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder='Select Employer'
                      name='role'
                      error={!!errors.employer_id}
                      helperText={errors.employer_id?.message as string}
                    />
                  )}
                  onChange={(event, value) => {
                    setValue('employer_id', value?.employer?.employer_id || null)
                  }}
                  sx={{
                    '.MuiAutocomplete-clearIndicator': {
                      color: '#5B718F',
                    },
                  }}
                  PaperComponent={({ children }) => (
                    <Paper style={{ borderRadius: '4px' }}>
                      {children}
                    </Paper>
                  )}
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
                  Branch Name
                </Typography>
                <TextField
                  {...register('cost_centre')}
                  size='small'
                  fullWidth
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
                  Job Title
                </Typography>
                <TextField
                  {...register('job_title')}
                  size='small'
                  fullWidth
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
                  Post Code
                </Typography>
                <TextField
                  {...register('location')}
                  size='small'
                  fullWidth
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
                  Manager Name
                </Typography>
                <TextField
                  {...register('manager_name')}
                  size='small'
                  fullWidth
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
                  Manager Job Title
                </Typography>
                <TextField
                  {...register('manager_job_title')}
                  size='small'
                  fullWidth
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
                  Mentor
                </Typography>
                <TextField
                  {...register('mentor')}
                  size='small'
                  fullWidth
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
                  Funding Contractor
                </Typography>
                <TextField
                  {...register('funding_contractor')}
                  size='small'
                  fullWidth
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
                  Partner
                </Typography>
                <TextField
                  {...register('partner')}
                  size='small'
                  fullWidth
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
                  Sub Area
                </Typography>
                <TextField
                  {...register('sub_area')}
                  size='small'
                  fullWidth
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
                  Cohort
                </Typography>
                <TextField
                  {...register('cohort')}
                  size='small'
                  fullWidth
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
                  Curriculum Area
                </Typography>
                <TextField
                  {...register('curriculum_area')}
                  size='small'
                  fullWidth
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
                  SSA1
                </Typography>
                <TextField
                  {...register('ssa1')}
                  size='small'
                  fullWidth
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
                  SSA2
                </Typography>
                <TextField
                  {...register('ssa2')}
                  size='small'
                  fullWidth
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
                  Director of Curriculum
                </Typography>
                <TextField
                  {...register('director_of_curriculum')}
                  size='small'
                  fullWidth
                  className='bg-none'
                />
              </Grid>
              <Grid className='w-1/2'></Grid>
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Card>
  )
}

export default EmployerSection
