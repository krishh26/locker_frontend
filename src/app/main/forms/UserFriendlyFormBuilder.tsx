import React, { useState, useEffect } from 'react'
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
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  FormGroup,
  FormLabel,
  Card,
  CardContent,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import PreviewIcon from '@mui/icons-material/Preview'
import { useNavigate } from 'react-router-dom'
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

const UserFriendlyFormBuilder: React.FC = () => {
  const navigate = useNavigate()
  const dispatch: any = useDispatch()
  const { singleData, mode, dataUpdatingLoadding } = useSelector(selectFormData)

  const [formMetadata, setFormMetadata] = useState({
    form_name: '',
    description: '',
    type: 'survey',
  })

  const [formFields, setFormFields] = useState<SimpleFormField[]>([])
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')

  useEffect(() => {
    // Load existing form data if in edit mode
    if (mode === 'edit' && singleData) {
      setFormMetadata({
        form_name: singleData.form_name || '',
        description: singleData.description || '',
        type: singleData.type || 'survey',
      })

      // Convert existing form data to our SimpleFormField format
      if (singleData.form_data) {
        const convertedFields = convertFormIOToSimpleFields(
          singleData.form_data
        )
        setFormFields(convertedFields)
      }
    }
  }, [mode, singleData])

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
      width: 'full', // Default to full width
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

      // Add type-specific properties
      if (
        ['select', 'radio', 'checkbox'].includes(field.type) &&
        field.options
      ) {
        return {
          ...baseComponent,
          values: field.options.map((option, index) => ({
            label: option,
            value: option.toLowerCase().replace(/\s+/g, '_'),
          })),
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
    if (!formMetadata.form_name.trim()) {
      alert('Please enter a form name')
      return
    }

    if (formFields.length === 0) {
      alert('Please add at least one field to the form')
      return
    }

    setSaveStatus('saving')

    const formData = {
      id: singleData?.id || null,
      form_name: formMetadata.form_name,
      description: formMetadata.description,
      type: formMetadata.type,
      form_data: convertToFormIOFormat(formFields),
    }

    try {
      let response
      if (mode === 'edit') {
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

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* Header */}
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
              🎨 {mode === 'edit' ? 'Edit Form' : 'Create New Form'}
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
                onClick={handleSave}
                disabled={
                  formFields.length === 0 || !formMetadata.form_name.trim()
                }
              >
                Save Form
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Save Status Alert */}
      {saveStatus === 'saved' && (
        <Alert severity='success' sx={{ m: 2 }}>
          Form saved successfully! Redirecting to forms list...
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert
          severity='error'
          sx={{ m: 2 }}
          onClose={() => setSaveStatus('idle')}
        >
          Error saving form. Please try again.
        </Alert>
      )}

      {/* Form Metadata */}
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
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label='Form Name'
              value={formMetadata.form_name}
              onChange={(e) =>
                setFormMetadata({ ...formMetadata, form_name: e.target.value })
              }
              fullWidth
              required
              placeholder='e.g., Customer Feedback Form'
              error={!formMetadata.form_name.trim() && formFields.length > 0}
              helperText={
                !formMetadata.form_name.trim() && formFields.length > 0
                  ? 'Form name is required'
                  : ''
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label='Form Type'
              value={formMetadata.type}
              onChange={(e) =>
                setFormMetadata({ ...formMetadata, type: e.target.value })
              }
              fullWidth
              placeholder='e.g., survey, feedback, assessment'
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label='Description (Optional)'
              value={formMetadata.description}
              onChange={(e) =>
                setFormMetadata({
                  ...formMetadata,
                  description: e.target.value,
                })
              }
              fullWidth
              multiline
              rows={2}
              placeholder='Describe what this form is for...'
            />
          </Grid>
        </Grid>

        {/* Form Statistics */}
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

      {/* Form Builder */}
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
            {/* <FormPreview /> */}
            <DynamicFormPreview
              fields={formFields}
              formName={formMetadata.form_name}
              description={formMetadata.description}
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
