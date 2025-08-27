import React, { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  Box,
  Card,
  Grid,
  TextField,
  Typography,
  Select,
  MenuItem,
  Checkbox,
} from '@mui/material'

const FundingBodySection: React.FC = () => {
  const { register, watch, formState: { errors } } = useFormContext()
  const [isChecked, setIsChecked] = useState(false)

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked)
  }

  return (
    <Card className='rounded-6 items-center' variant='outlined'>
      <Grid className='h-full flex flex-col'>
        <Box>
          <Grid
            xs={12}
            className='p-10 border-b-2 bg-[#007E84] flex justify-between items-center'
          >
            <Typography className='font-600 text-white'>
              Funding Body
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              <Typography className='font-600 text-white'>
                User Archived{' '}
              </Typography>
              <Checkbox
                sx={{
                  marginLeft: '8px',
                  color: 'white',
                  '&.Mui-checked': {
                    color: 'white',
                  },
                }}
              />
            </Box>
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
                  Allow Archived Access
                </Typography>
                <Select
                  {...register('allow_archived_access')}
                  size='small'
                  fullWidth
                  sx={{
                    '.muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon': {
                      color: 'black',
                    },
                  }}
                >
                  <MenuItem value={true as any}>Yes</MenuItem>
                  <MenuItem value={false as any}>No</MenuItem>
                </Select>
              </Grid>
              <Grid className='w-1/2'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Learner Type
                </Typography>
                <Select
                  {...register('learner_type')}
                  size='small'
                  fullWidth
                  sx={{
                    '.muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon': {
                      color: 'black',
                    },
                  }}
                >
                  <MenuItem value={'Apprentice'}>Apprentice</MenuItem>
                  <MenuItem value={'Commercial'}>Commercial</MenuItem>
                  <MenuItem value={'Learner'}>Learner</MenuItem>
                </Select>
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
                  Funding Body
                </Typography>
                <Select
                  {...register('funding_body')}
                  size='small'
                  fullWidth
                  sx={{
                    '.muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon': {
                      color: 'black',
                    },
                  }}
                >
                  <MenuItem value={'Advanced Learning Loan'}>Advanced Learning Loan</MenuItem>
                  <MenuItem value={'Bursary'}>Bursary</MenuItem>
                  <MenuItem value={'Commercial'}>Commercial</MenuItem>
                  <MenuItem value={'Community Learning'}>Community Learning</MenuItem>
                  <MenuItem value={'EFA'}>Select</MenuItem>
                  <MenuItem value={'Employer'}>Employer</MenuItem>
                  <MenuItem value={'ESF'}>ESF</MenuItem>
                  <MenuItem value={'ESF'}>ESF</MenuItem>
                  <MenuItem value={'ESFA'}>ESFA</MenuItem>
                  <MenuItem value={'Fee Waiver'}>Fee Waiver</MenuItem>
                  <MenuItem value={'FWDF'}>FWDF</MenuItem>
                  <MenuItem value={'ITA'}>ITA</MenuItem>
                  <MenuItem value={'Levy'}>Levy</MenuItem>
                  <MenuItem value={'MA Fully Funded'}>MA Fully Funded</MenuItem>
                  <MenuItem value={'MA-Employer'}>MA-Employer</MenuItem>
                  <MenuItem value={'Non-Levy'}>Non-Levy</MenuItem>
                  <MenuItem value={'Other'}>Other</MenuItem>
                  <MenuItem value={'SAAS'}>SAAS</MenuItem>
                  <MenuItem value={'SAAS-Employer'}>SAAS-Employer</MenuItem>
                  <MenuItem value={'SAAS-Self'}>SAAS-Self</MenuItem>
                  <MenuItem value={'SDS'}>SDS</MenuItem>
                  <MenuItem value={'Self'}>Self</MenuItem>
                  <MenuItem value={'SFA'}>SFA</MenuItem>
                  <MenuItem value={'Student Loan'}>Student Loan</MenuItem>
                </Select>
              </Grid>
              <Grid className='w-1/2'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Expected off the Job hours
                </Typography>
                <TextField
                  {...register('expected_off_the_job_hours')}
                  size='small'
                  type='number'
                  fullWidth
                  disabled={!isChecked}
                  sx={{
                    backgroundColor: !isChecked ? '#f0f0f0' : 'inherit',
                  }}
                />
              </Grid>
            </Grid>

            <Grid className='w-yfull flex flex-row gap-20'>
              <Grid className='w-1/2'>
                <Typography
                  sx={{
                    fontSize: '0.9vw',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Use specified Off the Job hours
                </Typography>
                <Checkbox
                  className='p-0'
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Card>
  )
}

export default FundingBodySection
