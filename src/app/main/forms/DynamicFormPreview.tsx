import React from 'react'
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Alert,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import FileUploadField from './FileUploadField'

export interface SimpleFormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  width?: 'full' | 'half' | 'third'
}

interface Props {
  fields: SimpleFormField[]
  formName: string
  description?: string
}

const widthToGrid = (width?: string) => {
  switch (width) {
    case 'half':
      return 6
    case 'third':
      return 4
    default:
      return 12
  }
}

export const getDynamicYupSchema = (fields: SimpleFormField[]) => {
  return yup.object().shape(
    fields.reduce((acc, field) => {
      const { id, label, required, type } = field

      let schema: yup.Schema<any>

      switch (type) {
        case 'email':
          schema = yup.string().email(`${label} must be a valid email`)
          break

        case 'number':
          schema = yup.number().typeError(`${label} must be a number`)
          break

        case 'checkbox':
          schema = yup.array().of(yup.string())
          break

        case 'file':
          schema = yup
            .mixed()
            .test('required', `${label} is required`, (value) => {
              if (!required) return true

              // If value is a File
              if (value instanceof File) return true

              // If value is an array (e.g. checkboxes)
              if (Array.isArray(value)) return value.length > 0

              // For other types (e.g. string, null, undefined)
              return value !== undefined && value !== null && value !== ''
            })
            .test('fileSize', `${label} is too large`, (value) =>
              value instanceof File ? value.size <= 10 * 1024 * 1024 : true
            )
            .test(
              'fileType',
              `${label} has unsupported file format`,
              (value) => {
                if (!value || !(value instanceof File)) return true
                const extension = value.name.split('.').pop()?.toUpperCase()
                const allowed = [
                  'JPG',
                  'PNG',
                  'GIF',
                  'PDF',
                  'DOCX',
                  'XLSX',
                  'PPTX',
                  'TXT',
                  'ZIP',
                  'MP4',
                ]
                return !!extension && allowed.includes(extension)
              }
            )
          break

        default:
          schema = yup.string()
          break
      }

      if (required) {
        schema = schema.required(`${label} is required`)
      }

      acc[id] = schema
      return acc
    }, {} as Record<string, yup.AnySchema<any, any, any>>)
  )
}

const DynamicFormPreview: React.FC<Props> = ({
  fields,
  formName,
  description,
}) => {
  // Build Yup schema from fields
  const validationSchema = getDynamicYupSchema(fields)

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onSubmit',
    defaultValues: fields.reduce((acc, field) => {
      acc[field.id] = field.type === 'checkbox' ? [] : ''
      return acc
    }, {} as Record<string, any>),
  })

  const onSubmit = (data: any) => {
    console.log('Form submitted:', data)
    alert('Form submitted successfully!')
  }

  return (
    <Card elevation={2} sx={{ maxWidth: 900, mx: 'auto' }}>
      <CardContent sx={{ p: 4 }}>
        <Typography
          variant='h4'
          gutterBottom
          sx={{ fontWeight: 600, color: '#1976d2' }}
        >
          {formName || 'Untitled Form'}
        </Typography>

        {description && (
          <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
            {description}
          </Typography>
        )}

        {fields.length === 0 ? (
          <Alert severity='info'>No fields added to the form.</Alert>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={3}>
              {fields.map((field) => (
                <Grid key={field.id} item xs={widthToGrid(field.width)}>
                  <Controller
                    name={field.id}
                    control={control}
                    render={({ field: controllerField, fieldState }) => {
                      const error = !!fieldState.error
                      const helperText = fieldState.error?.message

                      switch (field.type) {
                        case 'text':
                        case 'email':
                        case 'number':
                          return (
                            <TextField
                              {...controllerField}
                              label={field.label}
                              placeholder={field.placeholder}
                              fullWidth
                              required={field.required}
                              type={field.type === 'number' ? 'number' : 'text'}
                              error={error}
                              helperText={helperText}
                            />
                          )

                        case 'textarea':
                          return (
                            <TextField
                              {...controllerField}
                              label={field.label}
                              placeholder={field.placeholder}
                              fullWidth
                              required={field.required}
                              multiline
                              rows={4}
                              error={error}
                              helperText={helperText}
                            />
                          )

                        case 'select':
                          return (
                            <FormControl
                              fullWidth
                              required={field.required}
                              error={error}
                            >
                              <InputLabel>{field.label}</InputLabel>
                              <Select
                                {...controllerField}
                                label={field.label}
                                value={controllerField.value || ''}
                              >
                                {field.options?.map((opt, i) => (
                                  <MenuItem key={i} value={opt}>
                                    {opt}
                                  </MenuItem>
                                ))}
                              </Select>
                              {helperText && (
                                <Typography variant='caption' color='error'>
                                  {helperText}
                                </Typography>
                              )}
                            </FormControl>
                          )

                        case 'radio':
                          return (
                            <FormControl
                              component='fieldset'
                              required={field.required}
                              error={error}
                            >
                              <FormLabel>{field.label}</FormLabel>
                              <RadioGroup
                                {...controllerField}
                                onChange={(e) =>
                                  controllerField.onChange(e.target.value)
                                }
                              >
                                {field.options?.map((opt, i) => (
                                  <FormControlLabel
                                    key={i}
                                    value={opt}
                                    control={<Radio />}
                                    label={opt}
                                  />
                                ))}
                              </RadioGroup>
                              {helperText && (
                                <Typography variant='caption' color='error'>
                                  {helperText}
                                </Typography>
                              )}
                            </FormControl>
                          )

                        case 'checkbox':
                          return (
                            <FormControl
                              component='fieldset'
                              required={field.required}
                              error={error}
                            >
                              <FormLabel>{field.label}</FormLabel>
                              <FormGroup>
                                {field.options?.map((opt, i) => (
                                  <FormControlLabel
                                    key={i}
                                    control={
                                      <Checkbox
                                        checked={
                                          controllerField.value?.includes(
                                            opt
                                          ) || false
                                        }
                                        onChange={(e) => {
                                          const checked = e.target.checked
                                          const valueArr = Array.isArray(
                                            controllerField.value
                                          )
                                            ? controllerField.value
                                            : []

                                          if (checked) {
                                            controllerField.onChange([
                                              ...valueArr,
                                              opt,
                                            ])
                                          } else {
                                            controllerField.onChange(
                                              valueArr.filter((v) => v !== opt)
                                            )
                                          }
                                        }}
                                      />
                                    }
                                    label={opt}
                                  />
                                ))}
                              </FormGroup>
                              {helperText && (
                                <Typography variant='caption' color='error'>
                                  {helperText}
                                </Typography>
                              )}
                            </FormControl>
                          )

                        case 'date':
                          return (
                            <TextField
                              {...controllerField}
                              type='date'
                              label={field.label}
                              fullWidth
                              required={field.required}
                              InputLabelProps={{ shrink: true }}
                              error={error}
                              helperText={helperText}
                            />
                          )

                        case 'file':
                          return (
                            <Box key={field.id} sx={{ mt: 2, mb: 1 }}>
                              <FileUploadField
                                name={field.id}
                                control={control}
                                label={field.label}
                                error={errors[field.id]?.message as string}
                              />
                            </Box>
                          )

                        default:
                          return (
                            <TextField
                              {...controllerField}
                              label={field.label}
                              placeholder={field.placeholder}
                              fullWidth
                              required={field.required}
                              error={error}
                              helperText={helperText}
                            />
                          )
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>

            <Box
              sx={{
                mt: 4,
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-end',
              }}
            >
              <Button type='button' variant='outlined' onClick={() => reset()}>
                Clear Form
              </Button>
              <Box
                component='button'
                type='submit'
                style={{
                  padding: '8px 16px',
                  fontSize: '16px',
                  fontWeight: 500,
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#1976d2',
                  color: '#fff',
                  opacity: 0.6,
                }}
              >
                Submit
              </Box>
            </Box>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export default DynamicFormPreview
