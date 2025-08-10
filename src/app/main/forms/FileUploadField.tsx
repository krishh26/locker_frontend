import { FC } from 'react'
import { Controller } from 'react-hook-form'
import { Typography, FormHelperText, Box, Button, Paper } from '@mui/material'
import { FileUploader } from 'react-drag-drop-files'

type FileUploadFieldProps = {
  name: string
  control: any
  error?: string
  label: string
  disabled?: boolean
  value: File | string | null
}

const fileTypes = [
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

const FileUploadField: FC<FileUploadFieldProps> = ({
  name,
  control,
  error,
  label,
  value,
  disabled,
}) => {
  const downloadHandler = () => {
    if (!value) return

    if (typeof value === 'string') {
      window.open(value, '_blank')
    } else if (value instanceof File) {
      const fileUrl = URL.createObjectURL(value)
      window.open(fileUrl, '_blank')
    }
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <>
          <Typography className='font-semibold mb-2'>{label}</Typography>

          {/* Always show uploader */}
          <FileUploader
            handleChange={(file: File) => field.onChange(file)}
            name={name}
            types={fileTypes}
            multiple={false}
            maxSize={10}
            disabled={disabled}
          >
            <div
              className={`relative border border-dashed border-gray-300 p-20 cursor-pointer rounded-md hover:shadow-md transition-all h-[200px] flex flex-col items-center justify-center ${
                error ? 'border-red-500' : ''
              }`}
            >
              <div className='flex justify-center mb-4'>
                <img
                  src='assets/images/svgImage/uploadimage.svg'
                  alt='Upload'
                  className='w-36 h-36 object-contain mx-auto'
                />
              </div>
              {field.value && field.value instanceof File ? (
                <div className='text-center text-gray-700 font-medium'>
                  <p>{field.value.name}</p>
                </div>
              ) : (
                <>
                  <p className='text-center mb-2 text-gray-600'>
                    Drag and drop your files here or{' '}
                    <span className='text-blue-500 underline'>Browse</span>
                  </p>
                  <p className='text-center text-sm text-gray-500'>
                    Max 10MB files are allowed
                  </p>
                </>
              )}
            </div>
          </FileUploader>

          {/* Show preview card for existing URL */}
          {typeof value === 'string' && value.startsWith('http') && (
            <Paper
              sx={{
                mt: 2,
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              variant='outlined'
            >
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {<p>{field?.value?.name || field.value.split('/').pop()}</p>}
              </Typography>
              <Box>
                <Button
                  size='small'
                  variant='outlined'
                  onClick={downloadHandler}
                  sx={{ mr: 1 }}
                >
                  View
                </Button>
                {!disabled && (
                  <Button
                    size='small'
                    color='error'
                    variant='outlined'
                    onClick={() => {
                      field.onChange(null)
                    }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            </Paper>
          )}

          {error && (
            <FormHelperText error className='mt-2'>
              {error}
            </FormHelperText>
          )}
        </>
      )}
    />
  )
}

export default FileUploadField
