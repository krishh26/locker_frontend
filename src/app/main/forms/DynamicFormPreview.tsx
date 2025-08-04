import { yupResolver } from '@hookform/resolvers/yup'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material'
import { createUserFormDataAPI, selectFormData } from 'app/store/formData'
import { showMessage } from 'app/store/fuse/messageSlice'
import { selectGlobalUser } from 'app/store/globalUser'
import { selectUser } from 'app/store/userSlice'
import html2pdf from 'html2pdf.js'
import React, { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  FormSubmissionData,
  sendFormSubmissionEmail
} from 'src/app/utils/pdfGenerator'
import {
  formatUserForPDF
} from 'src/app/utils/userHelpers'
import { UserRole } from 'src/enum'
import * as yup from 'yup'
import FileUploadField from './FileUploadField'
import PDFFormRenderer from './PDFFormRenderer'
import SignatureInput from './SignatureInput'

export interface SimpleFormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[]
  width?: 'full' | 'half' | 'third'
  presetField?: string
}

interface Props {
  fields: SimpleFormField[]
  formName: string
  description?: string
  savedFormData?: {
    [key: string]: any
  }
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

        case 'phone':
          schema = yup
            .string()
            .matches(/^\+?[0-9]*$/, `${label} must contain only numbers`)
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

        case 'signature':
          schema = yup.mixed()
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
  savedFormData,
}) => {
  const param = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const formId: string | boolean = param?.id ?? false
  const userId: string | boolean = param?.userId ?? false
  const isSubmitPath = location.pathname === `/forms/${formId}/submit`
  const isSavedViewedPath =
    location.pathname === `/forms/view-saved-form/${formId}/user/${userId}`

  const formRef = useRef()

  const user =
    JSON.parse(sessionStorage.getItem('learnerToken'))?.user ||
    useSelector(selectUser)?.data
  const currentUser =
    JSON.parse(sessionStorage.getItem('learnerToken'))?.user ||
    useSelector(selectGlobalUser)?.currentUser

  // State for PDF generation and email sending
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  // Build Yup schema from fields
  const validationSchema = getDynamicYupSchema(fields)

  const dispatch: any = useDispatch()
  const {
    data,
    formDataDetails,
    dataUpdatingLoadding,
    singleData,
    mode,
    singleFrom = null,
    modeTemaplate = '',
  } = useSelector(selectFormData)

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onSubmit',
    defaultValues: fields.reduce((acc, field) => {
      acc[field.id] = field.type === 'checkbox' ? [] : ''
      return acc
    }, {} as Record<string, any>),
  })

  const formValues = getValues()

  useEffect(() => {
    if (isSubmitPath) {
      const presetMap = {
        learnerFullName: currentUser.displayName,
        LearnerEmail: currentUser.email,
        LearnerPhoneNumber: currentUser.mobile,
      }

      reset(
        Object.fromEntries(
          fields.map((field) => [
            field.id,
            currentUser.roles.includes(UserRole.Learner) && field.presetField
              ? presetMap[field.presetField] ??
                (field.type === 'checkbox' ? [] : '')
              : field.type === 'checkbox'
              ? []
              : '',
          ])
        )
      )
    }
  }, [isSubmitPath, fields])

  useEffect(() => {
    if (
      isSavedViewedPath &&
      formDataDetails &&
      Object.keys(formDataDetails).length > 0
    ) {
      reset(formDataDetails)
    }
  }, [reset, formDataDetails, isSavedViewedPath])

  const onSubmit = async (data: any) => {
    if (isSubmitPath && formId) {
      setIsSubmitting(true)
      setSubmitStatus({ type: null, message: '' })

      try {
        const formData = new FormData()

        // Split into two objects
        const fileFields: Record<string, File> = {}
        const textFields: Record<string, string> = {}

        Object.entries(data).forEach(([key, value]) => {
          if (value instanceof File) {
            fileFields[key] = value
          } else {
            textFields[key] = String(value)
          }
        })

        formData.append('form_data', JSON.stringify(textFields))

        Object.entries(fileFields).forEach(([key, value]) => {
          formData.append(key, value, value.name)
        })

        formData.append('form_id', formId)
        formData.append('user_id', currentUser.user_id)

        if (user.role !== UserRole.Admin) {
          // First, submit the form data
          await dispatch(
            createUserFormDataAPI({
              form_id: formId,
              form_data: data,
              user_id: currentUser.user_id,
            })
          )

          // Generate PDF of the submitted form
          const formSubmissionData: FormSubmissionData = {
            formName,
            description,
            submittedBy: formatUserForPDF(currentUser),
            submissionDate: new Date().toLocaleString(),
            formData: data,
            fields: fields.map((field) => ({
              id: field.id,
              type: field.type,
              label: field.label,
              required: field.required,
              options: field.options,
            })),
          }

          try {
            // Try to generate PDF from HTML first (better visual representation)
            const pdfBlob = await exportPDF(formRef.current)

            await sendFormSubmissionEmail(pdfBlob, formId.toString())

            setSubmitStatus({
              type: 'success',
              message:
                'Form submitted successfully and notification sent to admin!',
            })
          } catch (pdfError) {
            console.error('PDF generation or email sending failed:', pdfError)
            setSubmitStatus({
              type: 'success',
              message:
                'Form submitted successfully, but PDF generation failed.',
            })
          }

          // Navigate after a short delay to show the success message
          setTimeout(() => {
            navigate('/forms')
          }, 2000)
        }
      } catch (err) {
        console.log(err)
        setSubmitStatus({
          type: 'error',
          message: 'Failed to submit form. Please try again.',
        })
        dispatch(
          showMessage({
            message: 'Something went wrong!',
            variant: 'error',
          })
        )
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const onClear = () => {
    reset({
      ...fields.reduce((acc, field) => {
        acc[field.id] = field.type === 'checkbox' ? [] : ''
        return acc
      }, {} as Record<string, any>),
    })
  }

  const exportPDF = async (elementRef: HTMLDivElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      html2pdf()
        .set({
          margin: 0.5,
          filename: 'submitted-form.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        })
        .from(elementRef)
        .toPdf()
        .outputPdf('blob')
        .then((pdfBlob: Blob) => resolve(pdfBlob))
        .catch(reject)
    })
  }

  return (
    <>
      <Card
        elevation={2}
        sx={{ maxWidth: 900, mx: 'auto' }}
        id='form-container'
      >
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
                                type={
                                  field.type === 'number' ? 'number' : 'text'
                                }
                                error={error}
                                helperText={helperText}
                                disabled={isSavedViewedPath}
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
                                disabled={isSavedViewedPath}
                              />
                            )

                          case 'select':
                            return (
                              <FormControl
                                fullWidth
                                required={field.required}
                                error={error}
                                disabled={isSavedViewedPath}
                              >
                                <InputLabel>{field.label}</InputLabel>
                                <Select
                                  {...controllerField}
                                  label={field.label}
                                  value={controllerField.value || ''}
                                >
                                  {field.options?.map((opt, i) => (
                                    <MenuItem key={i} value={opt.value}>
                                      {opt.label}
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
                                disabled={isSavedViewedPath}
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
                                      value={opt.value}
                                      control={<Radio />}
                                      label={opt.label}
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
                                disabled={isSavedViewedPath}
                              >
                                <FormLabel component='legend'>
                                  {field.label}
                                </FormLabel>
                                <FormGroup>
                                  {field.options?.map((opt, i) => (
                                    <FormControlLabel
                                      key={i}
                                      control={
                                        <Checkbox
                                          checked={
                                            controllerField.value?.includes(
                                              opt.value
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
                                                opt.value,
                                              ])
                                            } else {
                                              controllerField.onChange(
                                                valueArr.filter(
                                                  (v) => v !== opt.value
                                                )
                                              )
                                            }
                                          }}
                                        />
                                      }
                                      label={opt.label}
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
                                disabled={isSavedViewedPath}
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
                                  disabled={isSavedViewedPath}
                                  value={controllerField.value}
                                />
                              </Box>
                            )

                          case 'signature':
                            return (
                              <Box key={field.id} sx={{ mt: 2, mb: 1 }}>
                                <SignatureInput
                                  label={field.label}
                                  required={field.required}
                                  value={controllerField.value}
                                  onChange={controllerField.onChange}
                                  error={!!fieldState.error}
                                  helperText={fieldState.error?.message}
                                  disabled={isSavedViewedPath}
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
                                disabled={isSavedViewedPath}
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
                <Button
                  type='button'
                  variant='outlined'
                  disabled={isSavedViewedPath}
                  onClick={() => onClear()}
                >
                  Clear Form
                </Button>
                <Button
                  type='submit'
                  variant='contained'
                  disabled={isSubmitting || isSavedViewedPath}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color='inherit' />
                    ) : null
                  }
                  sx={{
                    minWidth: 120,
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </Box>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Status Notification */}
      <Snackbar
        open={submitStatus.type !== null}
        autoHideDuration={6000}
        onClose={() => setSubmitStatus({ type: null, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={submitStatus.type || 'info'}
          onClose={() => setSubmitStatus({ type: null, message: '' })}
          sx={{ width: '100%' }}
        >
          {submitStatus.message}
        </Alert>
      </Snackbar>

      <div style={{ display: 'none' }}>
        <PDFFormRenderer
          ref={formRef}
          formName={formName}
          description={description}
          fields={fields}
          data={formValues}
        />
      </div>
    </>
  )
}

export default DynamicFormPreview
