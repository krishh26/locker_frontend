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

const schema = yup.object().shape({
  form_name: yup.string().required('Form name is required'),
  type: yup.string().required('Form type is required'),
  description: yup.string().notRequired(),
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

type MetadataFormValues = {
  form_name: string
  type: string
  description?: string
}

const UserFriendlyFormBuilder: React.FC = () => {
  const navigate = useNavigate()
  const param = useParams()

  const formId: string | boolean = param?.id ?? false

  const dispatch: any = useDispatch()
  const { singleData, mode, dataUpdatingLoadding } = useSelector(selectFormData)

  const [formFields, setFormFields] = useState<SimpleFormField[]>([])
  console.log('🚀 ~ formFields:', formFields)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')

  const {
    control,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<MetadataFormValues>({
    defaultValues: {
      form_name: '',
      type: '',
      description: '',
    },
    resolver: yupResolver(schema),
    mode: 'onSubmit',
  })

  const {
    data: formDetails,
    isLoading: isFormDetailsLoading,
    isError: isFormDetailsError,
    error: formDetailsError,
  } = useGetFormDetailsQuery(
    {
      id: formId,
    },
    {
      skip: !formId,
      refetchOnMountOrArgChange: false,
    }
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
      const { form_name, type, form_data, description } = formDetails.data

      reset({
        form_name,
        type,
        description,
      })

      setFormFields(form_data)
    }
  }, [formDetails, isFormDetailsLoading, isFormDetailsError, formDetailsError])

  const convertFormIOToSimpleFields = (
    formIOComponents: any[]
  ): SimpleFormField[] => {
    return formIOComponents.map((component, index) => ({
      id: component.key || `field_${index}`,
      type: mapFormIOTypeToSimpleType(component.type),
      label: component.label || component.placeholder || 'Untitled Field',
      placeholder: component.placeholder,
      required: component.validate?.required || false,
      options:
        component.values?.map((v: any) => v.label || v.value) ||
        component.data?.values?.map((v: any) => v.label),
      width: 'full',
    }))
  }

  const mapFormIOTypeToSimpleType = (formIOType: string): string => {
    const typeMap: { [key: string]: string } = {
      textfield: 'text',
      textarea: 'textarea',
      select: 'select',
      radio: 'radio',
      checkbox: 'checkbox',
      number: 'number',
      email: 'email',
      datetime: 'date',
      file: 'file',
      phoneNumber: 'phone',
    }
    return typeMap[formIOType] || 'text'
  }

  const convertToFormIOFormat = (fields: SimpleFormField[]) => {
    return fields.map((field) => {
      const baseComponent = {
        key: field.id,
        type: mapSimpleTypeToFormIO(field.type),
        label: field.label,
        placeholder: field.placeholder,
        input: true,
        validate: {
          required: field.required,
        },
      }

      if (
        ['select', 'radio', 'checkbox'].includes(field.type) &&
        field.options
      ) {
        return {
          ...baseComponent,
          // values: field.options.map((option, index) => ({
          //   label: option,
          //   value: option.toLowerCase().replace(/\s+/g, '_'),
          // })),
        }
      }

      return baseComponent
    })
  }

  const mapSimpleTypeToFormIO = (simpleType: string): string => {
    const typeMap: { [key: string]: string } = {
      text: 'textfield',
      textarea: 'textarea',
      select: 'select',
      radio: 'radio',
      checkbox: 'checkbox',
      number: 'number',
      email: 'email',
      date: 'datetime',
      file: 'file',
      phone: 'phoneNumber',
    }
    return typeMap[simpleType] || 'textfield'
  }

  const handleSave = async () => {
    const values = getValues()

    if (!values.form_name.trim()) {
      alert('Please enter a form name')
      return
    }

    if (formFields.length === 0) {
      alert('Please add at least one field to the form')
      return
    }

    setSaveStatus('saving')

    const formData = {
      id: formId || null,
      form_name: values.form_name,
      description: values.description,
      type: values.type,
      form_data: formFields,
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
        setTimeout(() => {
          navigate('/forms')
        }, 1500)
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
      <div
        style={{
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
      </div>
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
            <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
              This is exactly how your form will appear to users. You can
              interact with all fields to test the user experience.
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
