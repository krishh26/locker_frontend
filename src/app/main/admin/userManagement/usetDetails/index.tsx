'use client'
import {
  Autocomplete,
  Box,
  Checkbox,
  IconButton,
  InputAdornment,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { roles } from 'src/app/contanst'
import {
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from 'src/app/component/Buttons'
import { timezones } from 'src/app/contanst/timezoneData'
import {
  emailValidationMsg,
  mobileValidationMsg,
  nameValidationMsg,
  passwordValidation,
  usernameValidationMsg,
} from 'src/app/contanst/regValidation'
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined'
import { useEffect, useState } from 'react'
import Style from './style.module.css'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import MobileNumberInput from 'src/app/component/Input/MobileNumberInput'

import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useSelector } from 'react-redux'
import { selectLearnerManagement } from 'app/store/learnerManagement'
import { useDispatch } from 'react-redux'
import {
  createUserAPI,
  selectUserManagement,
  updateUserAPI,
} from 'app/store/userManagement'

const schema = (updateData, lineManagers = []) =>
  yup.object().shape({
    first_name: yup.string().required('Please enter your first name.'),
    last_name: yup.string().required('Please enter your last name.'),
    user_name: yup.string().required('Please enter your user name.'),
    email: yup
      .string()
      .email('Please enter a valid email address.')
      .required('Please enter your email.'),
    password: yup.string().when([], {
      is: () => !updateData, // if updateData is false => required
      then: (schema) => schema.required('Please enter your password.'),
      otherwise: (schema) => schema.notRequired(),
    }),
    confirmPassword: yup.string().when('password', {
      is: (val) => !!val, // only validate if password has value
      then: (schema) =>
        schema
          .oneOf([yup.ref('password')], 'Passwords must match.')
          .required('Please confirm your password.'),
      otherwise: (schema) =>
        updateData
          ? schema.notRequired()
          : schema.required('Please confirm your password.'),
    }),
    mobile: yup.string().required('Please enter your mobile number.'),
    time_zone: yup.string().required('Please select your timezone.'),
    roles: yup.array().min(1, 'Please select at least one role.'),
    line_manager: yup.string().when([], {
      is: () => lineManagers.length > 0, // required only if API returned managers
      then: (schema) => schema.required('Please select your line manager.'),
      otherwise: (schema) => schema.notRequired(),
    }),
  })

const UserDetails = ({ handleClose, updateData, userData }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const dispatch: any = useDispatch()
  const { lineMangers = [] } = useSelector(selectLearnerManagement)
  const { dataUpdatingLoadding } = useSelector(selectUserManagement)

  const validationSchema = schema(updateData, lineMangers)
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      user_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      mobile: '',
      time_zone: '',
      roles: [],
      line_manager: '',
    },
  })

  useEffect(() => {
    if (updateData && userData) {
      reset({
        first_name: userData?.first_name,
        last_name: userData?.last_name,
        user_name: userData?.user_name,
        email: userData?.email,
        password: '',
        confirmPassword: '',
        mobile: userData?.mobile,
        time_zone: userData?.time_zone,
        roles: userData?.roles,
        line_manager: userData?.line_manager,
      })
    }
  }, [updateData, userData])

  const onSubmit = async (data) => {
    // if (updateData) updateUserHandler(data)
    // else createUserHandler(data)

    if (!updateData) {
      console.log('add user', data)
      const response = await dispatch(createUserAPI(data))
      if (response) {
        handleClose()
      }
      return
    }

    console.log('update user', data)
    const response = await dispatch(updateUserAPI(updateData, data))
    if (response) {
      handleClose()
    }
  }

  const handleMouseDownPassword = (event) => {
    event.preventDefault()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='h-full flex flex-col'>
      <Box>
        {/* First & Last Name */}
        <Box className='m-12 flex flex-col justify-between gap-12 sm:flex-row'>
          <div className='w-1/2'>
            <Typography
              sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
              className={Style.name}
            >
              First Name<sup>*</sup>
            </Typography>
            <Controller
              name='first_name'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size='small'
                  placeholder='Enter first name'
                  fullWidth
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                  InputProps={{
                    endAdornment: (
                      <Tooltip
                        title={nameValidationMsg}
                        placement='bottom'
                        arrow
                      >
                        <HelpOutlinedIcon
                          sx={{
                            fontSize: '16px',
                            color: 'gray',
                            marginLeft: '2px',
                            cursor: 'help',
                          }}
                        />
                      </Tooltip>
                    ),
                  }}
                />
              )}
            />
          </div>
          <div className='w-1/2'>
            <Typography
              sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
              className={Style.name}
            >
              Last Name<sup>*</sup>
            </Typography>
            <Controller
              name='last_name'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size='small'
                  placeholder='Enter last name'
                  fullWidth
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                  InputProps={{
                    endAdornment: (
                      <Tooltip
                        title={nameValidationMsg}
                        placement='bottom'
                        arrow
                      >
                        <HelpOutlinedIcon
                          sx={{
                            fontSize: '16px',
                            color: 'gray',
                            marginLeft: '2px',
                            cursor: 'help',
                          }}
                        />
                      </Tooltip>
                    ),
                  }}
                />
              )}
            />
          </div>
        </Box>

        {/* Username & Email */}
        <Box className='m-12 flex flex-col justify-between gap-12 sm:flex-row'>
          <div className='w-1/2'>
            <Typography
              sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
              className={Style.name}
            >
              User Name<sup>*</sup>
            </Typography>
            <Controller
              name='user_name'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size='small'
                  placeholder='Enter username'
                  fullWidth
                  error={!!errors.user_name}
                  helperText={errors.user_name?.message}
                  InputProps={{
                    endAdornment: (
                      <Tooltip
                        title={usernameValidationMsg}
                        placement='bottom'
                        arrow
                      >
                        <HelpOutlinedIcon
                          sx={{
                            fontSize: '16px',
                            color: 'gray',
                            marginLeft: '2px',
                            cursor: 'help',
                          }}
                        />
                      </Tooltip>
                    ),
                  }}
                />
              )}
            />
          </div>
          <div className='w-1/2'>
            <Typography
              sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
              className={Style.name}
            >
              Email<sup>*</sup>
            </Typography>
            <Controller
              name='email'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size='small'
                  placeholder='Enter email'
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    endAdornment: (
                      <Tooltip
                        title={emailValidationMsg}
                        placement='bottom'
                        arrow
                      >
                        <HelpOutlinedIcon
                          sx={{
                            fontSize: '16px',
                            color: 'gray',
                            marginLeft: '2px',
                            cursor: 'help',
                          }}
                        />
                      </Tooltip>
                    ),
                  }}
                />
              )}
            />
          </div>
        </Box>

        {/* Password & Confirm Password */}
        {!updateData && (
          <Box className='m-12 flex flex-col justify-between gap-12 sm:flex-row'>
            <div className='w-1/2'>
              <Typography
                sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
                className={Style.name}
              >
                Password<sup>*</sup>
              </Typography>
              <Controller
                name='password'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size='small'
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            onMouseDown={handleMouseDownPassword}
                            edge='end'
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </div>
            <div className='w-1/2'>
              <Typography
                sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
                className={Style.name}
              >
                Confirm Password<sup>*</sup>
              </Typography>
              <Controller
                name='confirmPassword'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size='small'
                    type={showConfirmPassword ? 'text' : 'password'}
                    fullWidth
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            onMouseDown={handleMouseDownPassword}
                            edge='end'
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </div>
          </Box>
        )}

        {/* Mobile & Timezone */}
        <Box className='m-12 flex flex-col justify-between gap-12 sm:flex-row'>
          <div className='w-1/2'>
            <Typography
              sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
              className={Style.name}
            >
              Mobile<sup>*</sup>
            </Typography>
            <Controller
              name='mobile'
              control={control}
              render={({ field }) => (
                <MobileNumberInput
                  {...field}
                  value={field.value}
                  handleChange={(e) => field.onChange(e.target.value)}
                  name='mobile'
                />
              )}
            />
            {errors.mobile && (
              <Typography color='error' variant='caption'>
                {errors.mobile.message}
              </Typography>
            )}
          </div>
          <div className='w-1/2'>
            <Typography
              sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
              className={Style.name}
            >
              Time Zone<sup>*</sup>
            </Typography>
            <Controller
              name='time_zone'
              control={control}
              render={({ field }) => (
                <Autocomplete
                  fullWidth
                  size='small'
                  value={field.value}
                  onChange={(_, val) => field.onChange(val)}
                  options={timezones.map((option) => option)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder='Select timezone'
                      error={!!errors.time_zone}
                      helperText={errors.time_zone?.message}
                    />
                  )}
                />
              )}
            />
          </div>
        </Box>

        {/* Role */}
        <Box className='m-12'>
          <Typography
            sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
            className={Style.name}
          >
            Role<sup>*</sup>
          </Typography>
          <Controller
            name='roles'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                multiple
                fullWidth
                size='small'
                onChange={(e) => field.onChange(e.target.value)}
                input={<OutlinedInput placeholder='Select Role' />}
                renderValue={(selected) => selected.join(', ')}
              >
                {roles
                  .filter((item) => item.label !== 'Employer')
                  ?.map((item) => (
                    <MenuItem key={item.value} value={item.label}>
                      <Checkbox
                        checked={field.value.indexOf(item.label) > -1}
                      />
                      <ListItemText primary={item.label} />
                    </MenuItem>
                  ))}
                <MenuItem value='Line Manager'>
                  <Checkbox
                    checked={field.value.indexOf('Line Manager') > -1}
                  />
                  <ListItemText primary='Line Manager' />
                </MenuItem>
              </Select>
            )}
          />
          {errors.roles && (
            <Typography color='error' variant='caption'>
              {errors.roles.message}
            </Typography>
          )}
        </Box>

        {/* Line Manager */}
        <Box className='m-12'>
          <Typography
            sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
            className={Style.name}
          >
            Select Your Line Manager<sup>*</sup>
          </Typography>
          <Controller
            name='line_manager'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                fullWidth
                size='small'
                onChange={(e) => field.onChange(e.target.value)}
                input={<OutlinedInput placeholder='Select Line Manager' />}
                renderValue={(selected) => selected}
              >
                {/* Add line manager options here */}
                {lineMangers.length == 0 ? (
                  <MenuItem value='No Line Manager' disabled>
                    <ListItemText primary='No Line Manager' />
                  </MenuItem>
                ) : (
                  lineMangers.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      <ListItemText primary={item.name} />
                    </MenuItem>
                  ))
                )}
              </Select>
            )}
          />
          {errors.line_manager && (
            <Typography color='error' variant='caption'>
              {errors.line_manager.message}
            </Typography>
          )}
        </Box>
      </Box>

      <Box style={{ margin: 'auto 1rem 1rem auto' }}>
        {dataUpdatingLoadding ? (
          <LoadingButton />
        ) : (
          <>
            <SecondaryButtonOutlined
              name='Cancel'
              onClick={handleClose}
              type='button'
              style={{ width: '10rem', marginRight: '2rem' }}
            />
            <SecondaryButton
              name={updateData ? 'Update' : 'Create'}
              style={{ width: '10rem' }}
              type='submit'
            />
          </>
        )}
      </Box>
    </form>
  )
}

export default UserDetails
