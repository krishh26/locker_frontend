import { FC } from 'react'
import { Controller } from 'react-hook-form'
import { Typography, FormHelperText } from '@mui/material'
import { FileUploader } from 'react-drag-drop-files'

type FileUploadFieldProps = {
  name: string
  control: any
  error?: string
  label: string
}

const fileTypes = [
  'JPG', 'PNG', 'GIF', 'PDF', 'DOCX', 'XLSX',
  'PPTX', 'TXT', 'ZIP', 'MP4',
]

const FileUploadField: FC<FileUploadFieldProps> = ({
  name,
  control,
  error,
  label
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <>
          <Typography className='font-semibold mb-2'>{label}</Typography>
          <FileUploader
            handleChange={(file: File) => field.onChange(file)}
            name={name}
            types={fileTypes}
            multiple={false}
            maxSize={10}
          >
            <div
              className={`relative border border-dashed border-gray-300 p-20 cursor-pointer rounded-md hover:shadow-md transition-all h-[200px] flex flex-col items-center justify-center ${error ? 'border-red-500' : ''
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
          {error && <FormHelperText error className='mt-2'>{error}</FormHelperText>}
        </>
      )}
    />
  )
}

export default FileUploadField
