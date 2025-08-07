import React, { useState, useEffect } from 'react'

import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import PreviewIcon from '@mui/icons-material/Preview'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { SimpleFormBuilder } from 'src/app/component/FormBuilder'
import type { SimpleFormField } from 'src/app/component/FormBuilder'
import {
  createFormDataAPI,
  updateFormDataAPI,
  selectFormData,
  slice,
} from 'app/store/formData'
import { LoadingButton } from 'src/app/component/Buttons'
import DynamicFormPreview from './DynamicFormPreview'
import { useGetFormDetailsQuery } from 'app/store/api/form-api'
import { showMessage } from 'app/store/fuse/messageSlice'

// Typed roles
const roles = [
  'Master Admin',
  'Basic Admin',
  'Assessor',
  'IQA',
  'EQA',
  'Curriculum Manager',
  'Employer Overview',
  'Employer Manager',
  'Partner',
  'Custom Manager',
  'Learner',
] as const

type EmailRole = Role | 'Other'

type Role = (typeof roles)[number]

type MetadataFormValues = {
  form_name: string
  type: string
  description?: string
  accessRights?: Partial<Record<Role, boolean>>
  enableCompleteFunction?: boolean
  completionRoles?: Partial<Record<Role, boolean>>
  requestSignature?: boolean
  emails: {
    [key in EmailRole]?: boolean
  }
  otherEmail?: string
}

// Yup schema
const generateRoleObject = () =>
  roles.reduce((acc, role) => {
    acc[role] = yup.boolean()
    return acc
  }, {} as Record<Role, yup.BooleanSchema>)

const schema = yup.object().shape({
  form_name: yup.string().required('Form name is required'),
  type: yup.string().required('Form type is required'),
  description: yup.string().notRequired(),
  accessRights: yup
    .object()
    .shape(generateRoleObject())
    .test(
      'at-least-one-access-role',
      'Select at least one access right',
      function (value) {
        return Object.values(value || {}).some((v) => v === true)
      }
    ),
  enableCompleteFunction: yup.boolean(),
  completionRoles: yup
    .object()
    .shape(generateRoleObject())
    .test(
      'at-least-one-selected',
      'Select at least one completion role',
      function (value) {
        const { enableCompleteFunction } = this.parent
        if (!enableCompleteFunction) return true // ✅ Skip validation if function is disabled
        return Object.values(value || {}).some((v) => v === true)
      }
    ),
  requestSignature: yup.boolean(),
  emails: yup
    .object()
    .shape(generateRoleObject())
    .test({
      name: 'at-least-one-email',
      message: 'Select at least one email recipient',
      test: (value) => !!value && Object.values(value).some((v) => v),
    }),
  otherEmail: yup.string().when('emails.Other', {
    is: true,
    then: (schema) =>
      schema
        .required('Please enter other emails')
        .test(
          'valid-emails',
          'Enter valid email(s) separated by commas',
          (val) =>
            val
              ?.split(',')
              .map((e) => e.trim())
              .every((email) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
        ),
    otherwise: (schema) => schema.notRequired(),
  }),
})

const formTypeOptions = [
  'ILP',
  'Review',
  'Enrolment',
  'Survey',
  'Workbook',
  'Test/Exams',
  'Others',
]

const UserFriendlyFormBuilder: React.FC = () => {
  const navigate = useNavigate()
  const param = useParams()
  const dispatch: any = useDispatch()
  const formId: string | boolean = param?.id ?? false
  const { singleData, mode, dataUpdatingLoadding } = useSelector(selectFormData)

  const [formFields, setFormFields] = useState<SimpleFormField[]>([])
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')

  const {
    control,
    handleSubmit,
    getValues,
    reset,
    watch,
    trigger,
    formState: { errors },
  } = useForm<MetadataFormValues>({
    defaultValues: {
      form_name: '',
      type: '',
      description: '',
      accessRights: roles.reduce((acc, role) => {
        acc[role] = true // ✅ All Access Rights checked
        return acc
      }, {} as Record<Role, boolean>),
      enableCompleteFunction: true, // ✅ Checked by default
      completionRoles: {},
      emails: roles.reduce((acc, role) => {
        acc[role] = false
        return acc
      }, {} as Record<Role, boolean>),
      otherEmail: '',
      requestSignature: false,
    },
    resolver: yupResolver(schema),
    mode: 'all',
  })

  const {
    data: formDetails,
    isLoading: isFormDetailsLoading,
    isError: isFormDetailsError,
    error: formDetailsError,
  } = useGetFormDetailsQuery(
    { id: formId },
    { skip: !formId, refetchOnMountOrArgChange: false }
  )

  useEffect(() => {
    if (isFormDetailsError && formDetailsError) {
      console.error('Error fetching form details:', formDetailsError)
      dispatch(
        showMessage({
          message: 'Error fetching form details',
          variant: 'error',
        })
      )
      navigate('/forms')
    }

    if (formDetails && !isFormDetailsLoading) {
      const {
        form_name,
        type,
        description,
        form_data,
        accessRights,
        completionRoles,
        enableCompleteFunction,
        requestSignature,
      } = formDetails.data

      reset({
        form_name,
        type,
        description,
        accessRights:
          accessRights ||
          roles.reduce((acc, role) => {
            acc[role] = true
            return acc
          }, {} as Record<Role, boolean>),
        completionRoles: completionRoles || {},
        enableCompleteFunction: enableCompleteFunction ?? true,
        requestSignature: requestSignature ?? false,
      })

      setFormFields(form_data)
    }
  }, [formDetails, isFormDetailsLoading, isFormDetailsError, formDetailsError])

  const enableCompleteFunction = watch('enableCompleteFunction')

  const handleSave = async () => {
    const values = getValues()
    console.log('🚀 ~ handleSave ~ values:', values)

    if (!values.form_name.trim()) {
      alert('Please enter a form name')
      return
    }

    if (formFields.length === 0) {
      alert('Please add at least one field to the form')
      return
    }

    // setSaveStatus('saving')

    const formData = {
      id: formId || null,
      form_name: values.form_name,
      description: values.description,
      type: values.type,
      form_data: formFields,
      access_rights: Object.entries(values.accessRights)
        .filter(([_, value]) => value)
        .map(([key]) => `'${key}'`) // wrap each key in single quotes
        .join(','),
      completion_roles: Object.entries(values.completionRoles)
        .filter(([_, value]) => value)
        .map(([key]) => `'${key}'`) // wrap each key in single quotes
        .join(','),
      enable_complete_function: values.enableCompleteFunction,
      set_request_signature: values.requestSignature,
      email_roles: Object.entries(values.emails)
        .filter(([_, value]) => value)
        .map(([key]) => `'${key}'`) // wrap each key in single quotes
        .join(','),
      other_emails: values.otherEmail || null,
    }

    try {
      let response
      if (formId) {
        response = await dispatch(updateFormDataAPI(formData))
      } else {
        response = await dispatch(createFormDataAPI(formData))
      }

      if (response) {
        setSaveStatus('saved')
        setTimeout(() => navigate('/forms'), 1500)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Error saving form:', error)
      setSaveStatus('error')
    }
  }

  const handleCancel = () => {
    navigate('/forms')
    dispatch(slice.setSingleData({ form_data: [] }))
    dispatch(slice.setMode(''))
  }

  const getFieldCountByType = () => {
    const counts: { [key: string]: number } = {}
    formFields.forEach((field) => {
      counts[field.type] = (counts[field.type] || 0) + 1
    })
    return counts
  }

  const fieldCounts = getFieldCountByType()

  if (isFormDetailsLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
          fontSize: '24px',
          fontWeight: 'bold',
          gap: '10px',
        }}
      >
        <CircularProgress />
        please wait while we load the form details...
      </Box>
    )
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
      }}
    >
      <AppBar
        position='static'
        color='default'
        elevation={1}
        sx={{ backgroundColor: 'white' }}
      >
        <Toolbar>
          <IconButton edge='start' onClick={handleCancel} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='h6' sx={{ fontWeight: 600, color: '#1976d2' }}>
              🎨 {formId ? 'Edit Form' : 'Create New Form'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Simply drag components to build your form - no complex setup
              needed!
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {formFields.length > 0 && (
              <Chip
                label={`${formFields.length} fields`}
                color='primary'
                variant='outlined'
                size='small'
              />
            )}

            <Button
              variant='outlined'
              startIcon={<PreviewIcon />}
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              disabled={formFields.length === 0}
            >
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>

            {dataUpdatingLoadding || saveStatus === 'saving' ? (
              <LoadingButton />
            ) : (
              <Button
                variant='contained'
                startIcon={<SaveIcon />}
                onClick={handleSubmit(handleSave)}
              >
                Save Form
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {saveStatus === 'saved' && (
        <Alert severity='success' sx={{ m: 2 }}>
          Form saved successfully! Redirecting...
        </Alert>
      )}
      {saveStatus === 'error' && (
        <Alert severity='error' sx={{ m: 2 }}>
          Error saving form. Please try again.
        </Alert>
      )}

      <Paper
        elevation={1}
        sx={{ p: 3, m: 2, backgroundColor: 'white', borderRadius: 3 }}
      >
        <Typography
          variant='h6'
          gutterBottom
          sx={{ fontWeight: 600, color: '#1976d2' }}
        >
          📋 Form Information
        </Typography>

        <Grid container spacing={3} className='mt-4'>
          <Grid item xs={12} md={6}>
            <Controller
              name='form_name'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Form Name'
                  fullWidth
                  required
                  placeholder='e.g., Customer Feedback Form'
                  error={!!errors.form_name}
                  helperText={errors.form_name?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name='type'
              control={control}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.type}>
                  <InputLabel>Form Type</InputLabel>
                  <Select {...field} label='Form Type'>
                    {formTypeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors.type?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name='description'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Description (Optional)'
                  fullWidth
                  multiline
                  rows={2}
                  placeholder='Describe what this form is for...'
                />
              )}
            />
          </Grid>
        </Grid>

        {formFields.length > 0 && (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
              Form Statistics:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.entries(fieldCounts).map(([type, count]) => (
                <Chip
                  key={type}
                  label={`${count} ${type} field${count > 1 ? 's' : ''}`}
                  size='small'
                  variant='outlined'
                />
              ))}
            </Box>
          </Box>
        )}

        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12}>
            <Typography variant='subtitle1' fontWeight={600} gutterBottom>
              Access Rights:
            </Typography>
            <FormGroup row>
              {roles.map((role) => (
                <FormControlLabel
                  key={role}
                  control={
                    <Controller
                      name={`accessRights.${role}` as const}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          {...field}
                          checked={field.value || false}
                          onChange={(e) => {
                            field.onChange(e)
                            trigger('accessRights')
                          }}
                        />
                      )}
                    />
                  }
                  label={role}
                />
              ))}
              {errors.accessRights?.message && (
                <FormHelperText error sx={{ mt: 1 }}>
                  {errors.accessRights.message}
                </FormHelperText>
              )}
            </FormGroup>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='subtitle1' fontWeight={600} gutterBottom>
              Completion:
            </Typography>
            <FormControlLabel
              control={
                <Controller
                  name='enableCompleteFunction'
                  control={control}
                  render={({ field }) => (
                    <Checkbox {...field} checked={field.value || false} />
                  )}
                />
              }
              label='Enable Complete Function'
            />

            {enableCompleteFunction && (
              <Box
                sx={{ border: '1px solid #ccc', p: 2, borderRadius: 2, mt: 2 }}
              >
                <FormGroup row>
                  {roles.map((role) => (
                    <FormControlLabel
                      key={role}
                      control={
                        <Controller
                          name={`completionRoles.${role}` as const}
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              {...field}
                              checked={field.value || false}
                            />
                          )}
                        />
                      }
                      label={role}
                    />
                  ))}
                </FormGroup>
                {errors.completionRoles?.message && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    {errors.completionRoles.message}
                  </FormHelperText>
                )}
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Controller
                  name='requestSignature'
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      {...field}
                      checked={field.value || false}
                      onChange={(e) => {
                        field.onChange(e)
                        trigger(`requestSignature`)
                      }}
                    />
                  )}
                />
              }
              label='Set Request Signature'
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant='subtitle1' fontWeight={600} gutterBottom>
              Emails:
            </Typography>
            <FormGroup row>
              {roles.map((role) => (
                <FormControlLabel
                  key={role}
                  control={
                    <Controller
                      name={`emails.${role}` as const}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          {...field}
                          checked={field.value || false}
                          onChange={(e) => {
                            field.onChange(e)
                            trigger(`emails`)
                          }}
                        />
                      )}
                    />
                  }
                  label={role}
                />
              ))}
            </FormGroup>

            {/* Show 'Other' email input if checked */}
            {watch('emails.Other') && (
              <Controller
                name='otherEmail'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Other Emails'
                    placeholder='Email are separated by comma(,)'
                    fullWidth
                    size='small'
                    margin='dense'
                    error={!!errors.otherEmail}
                    helperText={errors.otherEmail?.message}
                    sx={{ mt: 1 }}
                  />
                )}
              />
            )}

            {/* Show error for emails group */}
            {errors.emails?.message && (
              <FormHelperText error sx={{ mt: 1 }}>
                {errors.emails.message}
              </FormHelperText>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ flex: 1 }}>
        {isPreviewMode ? (
          <Box
            sx={{
              p: 3,
              m: 2,
              height: 'calc(100% - 32px)',
              backgroundColor: '#f5f5f5',
              borderRadius: 3,
              overflow: 'auto',
            }}
          >
            <Typography
              variant='h5'
              gutterBottom
              sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}
            >
              👀 Interactive Form Preview
            </Typography>
            <DynamicFormPreview
              fields={formFields}
              formName={getValues('form_name')}
              description={getValues('description')}
            />
          </Box>
        ) : (
          <SimpleFormBuilder
            initialFields={formFields}
            onChange={setFormFields}
            onSave={handleSave}
          />
        )}
      </Box>
    </Box>
  )
}

export default UserFriendlyFormBuilder
