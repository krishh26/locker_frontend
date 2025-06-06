import { FC } from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import {
  Button,
  CircularProgress,
  Divider,
  FormHelperText,
  Grid,
  Typography,
} from '@mui/material'
import { FileUploader } from 'react-drag-drop-files'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import * as yup from 'yup'

import { useReuploadEvidenceDocumentMutation, useUploadEvidenceFileMutation } from 'app/store/api/evidence-api'
import { showMessage } from 'app/store/fuse/messageSlice'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

type FormValues = {
  courseId: string
  file: File | null
}

type ReactUploadFileProps = {
  handleClose: () => void
  id: number
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

const schema = yup.object().shape({
  file: yup
    .mixed<File>()
    .required('A document is required')
    .test('fileSize', 'File is too large', (value): value is File => {
      return value instanceof File && value.size <= 10 * 1024 * 1024 // 10MB
    })
    .test('fileType', 'Unsupported file format', (value): value is File => {
      const extension = value?.name?.split('.').pop()?.toUpperCase()
      return (
        value instanceof File && !!extension && fileTypes.includes(extension)
      )
    }),
})

const ReuploadEvidenceLibrary: FC<ReactUploadFileProps> = ({ handleClose,id }) => {
  console.log("🚀 ~ id:", id)
  const navigate = useNavigate()
  const dispatch: any = useDispatch()

  const [reuploadEvidenceDocument, { isLoading }] = useReuploadEvidenceDocumentMutation()

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      courseId: '',
      file: null,
    },
  })

  const onSubmit = async (values: FormValues) => {
    const fromData = new FormData()
    fromData.append('file', values.file as File)

    const payload ={
        id,
        data:fromData
    }

    try {
      const response = await reuploadEvidenceDocument(payload).unwrap()

      if (response.status) {
        dispatch(
          showMessage({
            message: 'Reupload your document successfully.',
            variant: 'success',
          })
        )
        handleClose()
      }
    } catch {
      console.error('Error uploading file:', 'File upload failed')
      dispatch(showMessage({ message: 'File upload failed', variant: 'error' }))
      return
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-12 rounded border border-gray-300 max-w-md w-full shadow-md'
    >
      <Typography variant='h6' className='mb-8'>Reupload Your Evidence Document</Typography>
      <Divider className='my-10' />
      <Grid className='w-full'>
        <Controller
          name='file'
          control={control}
          render={({ field }) => (
            <FileUploader
              handleChange={(file: File) => {
                field.onChange(file)
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
                    <div className='text-center text-gray-700 font-medium '>
                      <p>{field.value.name}</p>
                    </div>
                  </>
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
          )}
        />
        {errors.file && (
          <FormHelperText error className='mt-2'>
            {errors.file.message}
          </FormHelperText>
        )}
      </Grid>
      <Divider className='my-10' />
      <Grid className='w-full flex justify-end gap-10'>
        <Button
          variant='contained'
          color='secondary'
          className='rounded-md'
          onClick={handleClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant='contained'
          color='primary'
          className='rounded-md'
          type='submit'
          disabled={isLoading}
        >
          {isLoading ? (
            <span className='flex items-center gap-5'>
              <CircularProgress size={24} />
              Uploading...
            </span>
          ) : (
            'Upload'
          )}
        </Button>
      </Grid>
    </form>
  )
}

export default ReuploadEvidenceLibrary
