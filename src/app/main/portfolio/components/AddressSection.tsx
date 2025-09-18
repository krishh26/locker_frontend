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
} from '@mui/material'

interface AddressSectionProps {
  disabled?: boolean
}

const AddressSection: React.FC<AddressSectionProps> = ({ disabled = false }) => {
  const { register, formState: { errors } } = useFormContext()

  return (
    <Card className='rounded-6 items-center' variant='outlined'>
      <Grid className='h-full flex flex-col'>
        <Box>
          <Grid xs={12} className='p-10 border-b-2 bg-[#007E84]'>
            <Typography className='font-600 text-white'>
              Address
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
                  House No/Name and Street
                </Typography>
                <TextField
                  {...register('street')}
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
                  Suburb/Village
                </Typography>
                <TextField
                  {...register('suburb')}
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
                  Town/City
                </Typography>
                <TextField
                  {...register('town')}
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
                  County
                </Typography>
                <TextField
                  {...register('country')}
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
                  Home Postcode
                </Typography>
                <TextField
                  {...register('home_postcode')}
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
                  Country of Domicile
                </Typography>
                <Select
                  {...register('country_of_domicile')}
                  size='small'
                  fullWidth
                  disabled={disabled}
                  sx={{
                    '.muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon': {
                      color: 'black',
                    },
                  }}
                >
                  <MenuItem value={'XF - England'}>XF - England</MenuItem>
                  <MenuItem value={'XG Northern Ireland'}>XG Northern Ireland</MenuItem>
                  <MenuItem value={'XH Scotland'}>XH Scotland</MenuItem>
                  <MenuItem value={'XI - Wales'}>XI - Wales</MenuItem>
                  <MenuItem value={'XK Channel Islands'}>XK Channel Islands</MenuItem>
                  <MenuItem value={'IM Isle of Man'}>IM Isle of Man</MenuItem>
                  <MenuItem value={'GB United Kingdom'}>GB United Kingdom</MenuItem>
                  <MenuItem value={'AU Australia'}>AU Australia</MenuItem>
                </Select>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Card>
  )
}

export default AddressSection
