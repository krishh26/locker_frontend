import React, { useState } from 'react'
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Box,
  Snackbar,
  Alert,
  FormHelperText,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { FileUploader } from 'react-drag-drop-files'
import {
  useCreateAcknowledgementMutation,
  useClearAllAcknowledgementsMutation,
  useGetAcknowledgementsQuery,
  useDeleteAcknowledgementMutation,
  useUpdateAcknowledgementMutation,
} from 'src/app/store/api/acknowledgementApi'

// File types for upload
const fileTypes = ['PDF', 'CSV', 'DOC', 'DOCX']

// Validation schema
const schema = yup.object({
  message: yup
    .string()
    .required('Message is required')
    .max(1000, 'Message must be at most 1000 characters'),
  file: yup
    .mixed<File>()
    .nullable()
    .test('fileSize', 'File is too large', (value) => {
      if (!value) return true // Allow null/undefined
      return value instanceof File && value.size <= 10 * 1024 * 1024 // 10MB
    })
    .test('fileType', 'Unsupported file format', (value) => {
      if (!value) return true // Allow null/undefined
      const extension = value?.name?.split('.').pop()?.toUpperCase()
      return (
        value instanceof File && !!extension && fileTypes.includes(extension)
      )
    }),
})

interface FormData {
  message: string
  file: File | null
}

const AcknowledgeMessage: React.FC = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  // API hooks
  const [createAcknowledgement, { isLoading: isCreating }] =
    useCreateAcknowledgementMutation()
  const [updateAcknowledgement, { isLoading: isUpdating }] =
    useUpdateAcknowledgementMutation()
  const [clearAllAcknowledgements, { isLoading: isClearing }] =
    useClearAllAcknowledgementsMutation()
  const [deleteAcknowledgement, { isLoading: isDeleting }] =
    useDeleteAcknowledgementMutation()
  const {
    data: acknowledgements,
    isLoading: isLoadingAcknowledgements,
    refetch,
  } = useGetAcknowledgementsQuery({})

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      message: '',
      file: null,
    },
  })

  const selectedFile = watch('file')

  // Get the latest acknowledgement (first entry in array)
  const latestAcknowledgement =
    acknowledgements && acknowledgements?.data?.length > 0
      ? acknowledgements.data[0]
      : null

  // Handle file selection from FileUploader
  const handleFileChange = (file: File) => {
    setValue('file', file)
  }
  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('message', data.message)

      // Check if latest acknowledgement exists to decide between create/update
      if (latestAcknowledgement) {
        // For update: only append file if it's a new file (not the existing one)
        if (data.file && data.file.size > 0) {
          formData.append('file', data.file)
        }

        // Update existing acknowledgement
        await updateAcknowledgement({
          id: latestAcknowledgement.id,
          data: formData as unknown as Record<string, FormData>,
        }).unwrap()

        setSnackbar({
          open: true,
          message: 'Message updated successfully!',
          severity: 'success',
        })
      } else {
        // For create: always append file if provided
        if (data.file) {
          formData.append('file', data.file)
        }

        // Create new acknowledgement
        await createAcknowledgement(
          formData as unknown as Record<string, FormData>
        ).unwrap()

        setSnackbar({
          open: true,
          message: 'Message acknowledged successfully!',
          severity: 'success',
        })
      }

      // Refetch data to update the list
      refetch()
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        'Failed to acknowledge message. Please try again.'

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      })
    }
  }


  // Handle delete current acknowledgement
  const handleDeleteCurrentAcknowledgement = async () => {
    if (!latestAcknowledgement) {
      reset()
      return
    }

    try {
      await deleteAcknowledgement({ id: latestAcknowledgement.id }).unwrap()

      setSnackbar({
        open: true,
        message: 'Acknowledgement deleted successfully!',
        severity: 'success',
      })

      // Reset form and refetch data
      reset()
      refetch()
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        'Failed to delete acknowledgement. Please try again.'

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      })
    }
  }

  // Handle clear all learner acknowledgment
  const handleClearAllLearnerAcknowledgment = async () => {
    try {
      await clearAllAcknowledgements({}).unwrap()

      setSnackbar({
        open: true,
        message: 'All learner acknowledgments cleared successfully!',
        severity: 'success',
      })

      // Refetch data to update the list
      refetch()
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        'Failed to clear acknowledgments. Please try again.'

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      })
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  // Set form values when acknowledgement data is loaded
  React.useEffect(() => {
    if (acknowledgements && acknowledgements?.data?.length > 0) {
      const latestAcknowledgement = acknowledgements.data[0]
      setValue('message', latestAcknowledgement.message || '')

      // Set file name if file exists
      if (latestAcknowledgement.fileName && latestAcknowledgement.filePath) {
        // Create a dummy file object for display purposes
        const dummyFile = new File([''], latestAcknowledgement.fileName, {
          type: 'application/pdf', // Default type, could be enhanced based on file extension
        })
        setValue('file', dummyFile)
      }
    }
  }, [acknowledgements, setValue])

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h5' component='h1' gutterBottom sx={{ mb: 3 }}>
        Acknowledge Message
      </Typography>

      <Card elevation={2}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {/* Message Field */}
              <Controller
                name='message'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Message'
                    multiline
                    rows={6}
                    fullWidth
                    error={!!errors.message}
                    helperText={
                      errors.message?.message || 'Max 1000 characters'
                    }
                    inputProps={{ maxLength: 1000 }}
                  />
                )}
              />

              <Divider sx={{ my: 2 }} />

              {/* File Upload Section */}
              <Box>
                <Typography variant='h6' gutterBottom>
                  Upload File
                </Typography>

                <Controller
                  name='file'
                  control={control}
                  render={({ field }) => (
                    <FileUploader
                      handleChange={(file: File) => {
                        field.onChange(file)
                        handleFileChange(file)
                      }}
                      name='file'
                      types={fileTypes}
                      multiple={false}
                      maxSize={10}
                    >
                      <div
                        className={`relative border border-dashed border-gray-300 p-20 cursor-pointer rounded-md hover:shadow-md transition-all h-[200px] flex flex-col items-center justify-center ${
                          errors.file ? 'border-red-500' : ''
                        }`}
                      >
                        <div className='flex justify-center mb-4'>
                          <img
                            src='assets/images/svgImage/uploadimage.svg'
                            alt='Upload'
                            className='w-36 h-36 object-contain mx-auto'
                          />
                        </div>
                        {field.value ? (
                          <>
                            <div className='text-center text-gray-700 font-medium'>
                              <p>{field.value.name}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className='text-center mb-2 text-gray-600'>
                              Drag and drop your files here or{' '}
                              <span className='text-blue-500 underline'>
                                Browse
                              </span>
                            </p>
                            <p className='text-center text-sm text-gray-500'>
                              Max 10MB files are allowed (PDF, CSV, DOC, DOCX)
                            </p>
                          </>
                        )}
                      </div>
                    </FileUploader>
                  )}
                />
                {errors.file && (
                  <FormHelperText error className='mt-2'>
                    {errors.file.message}
                  </FormHelperText>
                )}
                 {/* Show file preview if it's an existing file with filePath */}
                 {latestAcknowledgement?.filePath && selectedFile?.name === latestAcknowledgement.fileName && (
                   <Box sx={{ mt: 2, textAlign: 'end' }}>
                     <Button
                       variant='outlined'
                       size='small'
                       onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        window.open(
                          latestAcknowledgement.filePath,
                          '_blank'
                        )
                      }}
                       startIcon={<DownloadIcon />}
                       disabled={isCreating || isUpdating || isClearing || isDeleting}
                     >
                        View Current File
                     </Button>
                   </Box>
                 )}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  type='button'
                  variant='outlined'
                  color='warning'
                  onClick={handleDeleteCurrentAcknowledgement}
                  disabled={
                    isCreating || isUpdating || isClearing || isDeleting
                  }
                >
                  Clear
                </Button>

                <Button
                  type='button'
                  variant='contained'
                  color='error'
                  onClick={handleClearAllLearnerAcknowledgment}
                  disabled={
                    isCreating || isUpdating || isClearing || isDeleting
                  }
                  startIcon={isClearing ? <CircularProgress size={16} /> : null}
                >
                  {isClearing
                    ? 'Clearing...'
                    : 'Clear all learner acknowledgment'}
                </Button>

                <Button
                  type='submit'
                  variant='contained'
                  color='success'
                  disabled={
                    isCreating || isUpdating || isClearing || isDeleting
                  }
                  startIcon={
                    isCreating || isUpdating ? (
                      <CircularProgress size={16} />
                    ) : null
                  }
                >
                  {isClearing || isUpdating || isCreating
                    ? 'Saving...'
                    : 'Save'}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default AcknowledgeMessage
