import React from 'react'
import { useFormContext } from 'react-hook-form'
import {
  Box,
  Card,
  Grid,
  TextField,
  Typography,
  Select,
  MenuItem,
  ListSubheader,
} from '@mui/material'

interface AboutYouSectionProps {
  disabled?: boolean
}

const AboutYouSection: React.FC<AboutYouSectionProps> = ({ disabled = false }) => {
  const { register, formState: { errors } } = useFormContext()

  return (
    <Card className='rounded-6 items-center' variant='outlined'>
      <Grid className='h-full flex flex-col'>
        <Box>
          <Grid xs={12} className='p-10 border-b-2 bg-[#007E84]'>
            <Typography className='font-600 text-white'>
              About You
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
                  First Name*
                </Typography>
                <TextField
                  {...register('first_name', { required: 'First name is required' })}
                  size='small'
                  fullWidth
                  disabled={disabled}
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message as string}
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
                  Surname*
                </Typography>
                <TextField
                  {...register('last_name', { required: 'Last name is required' })}
                  size='small'
                  disabled={disabled}
                  fullWidth
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message as string}
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
                  Also Known As
                </Typography>
                <TextField
                  {...register('user_name')}
                  size='small'
                  disabled={disabled}
                  fullWidth
                  placeholder='User Name'
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
                  Email*
                </Typography>
                <TextField
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  size='small'
                  fullWidth
                  disabled={disabled}
                  error={!!errors.email}
                  helperText={errors.email?.message as string}
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
                  Telephone
                </Typography>
                <TextField
                  {...register('telephone')}
                  type='number'
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
                  Mobile
                </Typography>
                <TextField
                  {...register('mobile')}
                  type='number'
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
                  Date of birth
                </Typography>
                <TextField
                  {...register('dob')}
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
                  Gender
                </Typography>
                <Select
                  {...register('gender')}
                  size='small'
                  fullWidth
                  disabled={disabled}
                  sx={{
                    '.muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon': {
                      color: 'black',
                    },
                  }}
                >
                  <MenuItem value={'Male'}>Male</MenuItem>
                  <MenuItem value={'Female'}>Female</MenuItem>
                  <MenuItem value={'Non-Binary'}>Non-Binary</MenuItem>
                  <MenuItem value={'Other'}>Other</MenuItem>
                </Select>
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
                  National Insurance No
                </Typography>
                <TextField
                  {...register('national_ins_no')}
                  type='number'
                  size='small'
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
                  Ethnicity
                </Typography>
                <TextField
                  {...register('ethnicity')}
                  type='text'
                  size='small'
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
                  Learner Disability
                </Typography>
                <Select
                  {...register('learner_disability')}
                  size='small'
                  fullWidth
                  disabled={disabled}
                  sx={{
                    '.muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon': {
                      color: 'black',
                    },
                  }}
                >
                  <MenuItem value={'Visual impairment'}>Visual impairment</MenuItem>
                  <MenuItem value={"Asperger's syndrome"}>Asperger's syndrome</MenuItem>
                  <MenuItem value={'Hearing impairment'}>Hearing impairment</MenuItem>
                  <MenuItem value={'Disability affecting mobility'}>Disability affecting mobility</MenuItem>
                  <MenuItem value={'Other physical disability'}>Other physical disability</MenuItem>
                  <MenuItem value={'Other medical condition'}>Other medical condition</MenuItem>
                  <MenuItem value={'Emotional/behavioural'}>Emotional/behavioural</MenuItem>
                  <MenuItem value={'Mental health difficulty'}>Mental health difficulty</MenuItem>
                  <MenuItem value={'Temporary disability after illness'}>Temporary disability after illness</MenuItem>
                  <MenuItem value={'Profound complex disabilities'}>Profound complex disabilities</MenuItem>
                  <MenuItem value={'Multiple disabilities'}>Multiple disabilities</MenuItem>
                  <MenuItem value={'Other'}>Other</MenuItem>
                  <MenuItem value={'No disability'}>No disability</MenuItem>
                  <MenuItem value={'Not known / Not provided'}>Not known / Not provided</MenuItem>
                </Select>
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
                  Learning Difficulties
                </Typography>
                <Select
                  {...register('learner_difficulity')}
                  size='small'
                  fullWidth
                  disabled={disabled}
                  sx={{
                    '.muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon': {
                      color: 'black',
                    },
                  }}
                >
                  <ListSubheader className='font-700'>English</ListSubheader>
                  <MenuItem value={'Moderate learning difficulty'}>Moderate learning difficulty</MenuItem>
                  <MenuItem value={'Severe learning difficulty'}>Severe learning difficulty</MenuItem>
                  <MenuItem value={'Dyslexia'}>Dyslexia</MenuItem>
                  <MenuItem value={'Dyscalculia'}>Dyscalculia</MenuItem>
                  <MenuItem value={'Other specific learning difficulty'}>Other specific learning difficulty</MenuItem>
                  <MenuItem value={'Autism spectrum disorder'}>Autism spectrum disorder</MenuItem>
                  <MenuItem value={'Multiple learning difficulties'}>Multiple learning difficulties</MenuItem>
                  <MenuItem value={'Other'}>Other</MenuItem>
                  <MenuItem value={'No learning difficulty'}>No learning difficulty</MenuItem>
                  <MenuItem value={'Not known/information not provided'}>Not known/information not provided</MenuItem>
                  <ListSubheader className='font-700'>Welsh</ListSubheader>
                  <MenuItem value={'Visual impairment'}>Visual impairment</MenuItem>
                  <MenuItem value={'Hearing impairment'}>Hearing impairment</MenuItem>
                  <MenuItem value={'Physical and/or medical difficulties'}>Physical and/or medical difficulties</MenuItem>
                  <MenuItem value={'Behavioural, emotional and social difficulties'}>Behavioural, emotional and social difficulties</MenuItem>
                  <MenuItem value={'Multi-sensory impairment'}>Multi-sensory impairment</MenuItem>
                  <MenuItem value={'Autistic spectrum disorders'}>Autistic spectrum disorders</MenuItem>
                  <MenuItem value={'Speech, language and communication difficulties'}>Speech, language and communication difficulties</MenuItem>
                  <MenuItem value={'Moderate Learning Difficulties'}>Moderate Learning Difficulties</MenuItem>
                  <MenuItem value={'Severe Learning Difficulties'}>Severe Learning Difficulties</MenuItem>
                  <MenuItem value={'Profound and Multiple Learning Difficulties'}>Profound and Multiple Learning Difficulties</MenuItem>
                  <MenuItem value={'SPLD - Dyslexia'}>SPLD - Dyslexia</MenuItem>
                  <MenuItem value={'SPLD Dyscalculia'}>SPLD Dyscalculia</MenuItem>
                  <MenuItem value={'SPLD- Dyspraxia'}>SPLD- Dyspraxia</MenuItem>
                  <MenuItem value={'SPLD - Attention Deficit Hyperactivity Disorder'}>SPLD - Attention Deficit Hyperactivity Disorder</MenuItem>
                  <MenuItem value={'General Learning Difficulties'}>General Learning Difficulties</MenuItem>
                  <MenuItem value={'Does not apply'}>Does not apply</MenuItem>
                </Select>
              </Grid>
              <Grid className='w-1/3'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Initial Assessment Numeracy
                </Typography>
                <TextField
                  {...register('Initial_Assessment_Numeracy')}
                  type='text'
                  size='small'
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
                  Initial Assessment Literacy
                </Typography>
                <TextField
                  {...register('Initial_Assessment_Literacy')}
                  type='text'
                  size='small'
                  fullWidth
                  disabled={disabled}
                  className='bg-none'
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Card>
  )
}

export default AboutYouSection
