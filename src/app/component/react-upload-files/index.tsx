import { FC, useState } from 'react'

import {
  Button,
  Divider,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import { useSelector } from 'react-redux'
import { FileUploader } from 'react-drag-drop-files'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import { selectLearnerManagement } from 'app/store/learnerManagement'
import { useNavigate } from 'react-router-dom'

type FormValues = {
  courseId: string
  file: File | null
}

type ReactUploadFileProps = {
  handleClose: () => void;
};

const fileTypes = ['JPG', 'PNG', 'GIF', 'PDF', 'DOCX', 'XLSX', 'PPTX', 'TXT', 'ZIP','MP4']

const schema = yup.object().shape({
  courseId: yup.string().required('Course is required'),
  file: yup
    .mixed<File>()
    .required('A file is required')
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

const ReactUploadFile: FC<ReactUploadFileProps> = ({ handleClose }) => {
    const navigate = useNavigate();
  
  const data =
    useSelector(selectLearnerManagement)?.learner?.course?.map(
      (item) => item?.course
    ) || []

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

  const onSubmit = (values: FormValues) => {
    console.log('Form Data:', values)
    navigate('/evidenceLibrary/create', {
      state: {
        courseId: values.courseId,
        file: values.file,
      },
    })
    handleClose()
  }


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-12 rounded border border-gray-300 max-w-md w-full shadow-md'
    >
      <Grid className='w-full'>
        <Typography className='font-semibold mb-2 '>Select Course</Typography>
        <Controller
          name='courseId'
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              size='small'
              fullWidth
              placeholder='Please select Course'
              displayEmpty
              error={!!errors.courseId}
            >
              <MenuItem value='' disabled>
                Select Course
              </MenuItem>
              {data?.map((data) => (
                <MenuItem key={data.id} value={data.course_id}>
                  {data.course_name}
                </MenuItem>
              ))}
            </Select>
          )}
        />
        {errors.courseId && (
          <FormHelperText error>{errors.courseId.message}</FormHelperText>
        )}
      </Grid>
      <Divider className='my-10' />
      <Grid className='w-full'>
        <Typography className='font-semibold mb-10 '>Upload File</Typography>
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
              <div className={`relative border border-dashed border-gray-300 p-20 cursor-pointer rounded-md hover:shadow-md transition-all h-[200px] flex flex-col items-center justify-center ${errors.file ? 'border-red-500' : ''}`}>
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
        >
          Cancel
        </Button>
        <Button variant='contained' color='primary' className='rounded-md' type="submit">
          Upload
        </Button>
      </Grid>
    </form>
  )
}

export default ReactUploadFile
