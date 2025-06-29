import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Typography
} from '@mui/material'
import {
  useCreateNewSessionMutation,
  useFileUploadSessionMutation,
  useGetCourseListQuery,
  useGetLernerListQuery,
  useGetOptionsListQuery,
} from 'app/store/api/learner-plan-api'
import { showMessage } from 'app/store/fuse/messageSlice'
import {
  getLearnerAPI,
  getTrainerAPI,
  selectSession
} from 'app/store/session'
import { useEffect, useState } from 'react'
import { FileUploader } from 'react-drag-drop-files'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  LoadingButton
} from 'src/app/component/Buttons'
import * as yup from 'yup'

const repeatOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 20, 24]
const FileTypes = [
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
  trainer_id: yup.string().required('Trainer is required'),
  learners: yup.string().required('Learner is required'),
  title: yup.string().required('Title is required'),
  description: yup.string().optional(),
  location: yup.string().required('Location is required'),
  startDate: yup.string().required('Session date & time is required'),
  courses: yup
    .array()
    .min(1, 'At least one course must be selected')
    .required('Course selection is required'),
  hours: yup
    .number()
    .typeError('Hours must be a number')
    .min(0, 'Minimum 0 hours')
    .max(23, 'Maximum 23 hours')
    .required('Hours are required'),
  minutes: yup
    .number()
    .typeError('Minutes must be a number')
    .min(0, 'Minimum 0 minutes')
    .max(59, 'Maximum 59 minutes')
    .required('Minutes are required'),
  type: yup.string().required('Session type is required'),
  repeat_session: yup.boolean(),
  repeat_frequency: yup.string().when('repeat_session', {
    is: true,
    then: (schema) => schema.required('Repeat frequency is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  repeat_every: yup.string().when('repeat_session', {
    is: true,
    then: (schema) =>
      schema
        .required('Repeat every X days is required')
        .min(1, 'Repeat days must be at least 1'),
    otherwise: (schema) => schema.notRequired(),
  }),
  include_holidays: yup.boolean(),
  include_weekends: yup.boolean(),
  end_date: yup.string().when('repeat_session', {
    is: true,
    then: (schema) => schema.required('End date is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  upload_attachment: yup.boolean(),
  file: yup.mixed<File>().when('upload_attachment', {
    is: true,
    then: (schema) =>
      schema
        .required('A file is required')
        .test('fileSize', 'File is too large', (value): value is File => {
          return value instanceof File && value.size <= 10 * 1024 * 1024 // 10MB
        })
        .test('fileType', 'Unsupported file format', (value): value is File => {
          const extension = value?.name?.split('.').pop()?.toUpperCase()
          return (
            value instanceof File &&
            !!extension &&
            FileTypes.includes(extension)
          )
        }),
    otherwise: (schema) => schema.notRequired(),
  }),
  file_type: yup.string().when('upload_attachment', {
    is: true,
    then: (schema) => schema.required('File type is required'),
  }),
  session_type: yup.string().when('upload_attachment', {
    is: true,
    then: (schema) => schema.required('Session type is required'),
  }),
})

const AddEditSession = (props) => {
  const [sessionData, setSessionData] = useState({
    trainer_id: '',
    learners: [],
    title: '',
    description: '',
    method: 'Traditional',
    location: '',
    startDate: '',
    Duration: '0:0',
    type: '',
  })
  const { edit, handleCloseDialog } = props
  const dispatch: any = useDispatch()
  const navigate = useNavigate()
  const session = useSelector(selectSession)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      trainer_id: '',
      learners: '',
      title: '',
      description: '',
      location: '',
      startDate: '',
      hours: '',
      minutes: '',
      type: '',
      courses: [],

      // 🔁 Repeat session section
      repeat_session: false,
      repeat_frequency: '',
      repeat_every: '',
      include_holidays: false,
      include_weekends: false,
      end_date: '',
      upload_attachment: false,
      file: null,
      file_type: '',
      session_type: '',
    },
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    dispatch(getTrainerAPI('Trainer'))
  }, [dispatch])

  useEffect(() => {
    dispatch(getLearnerAPI())
  }, [dispatch])

  const selectedTrainer = watch('trainer_id')
  const selectedLearner = watch('learners')
  const repeatFrequency = watch('repeat_frequency')
  const { data: learnerListData, isLoading } = useGetLernerListQuery(
    {
      trainer_id: selectedTrainer,
    },
    {
      skip: !selectedTrainer,
    }
  )

  const learnerList = learnerListData?.data ?? []

  const { data: courseListData, isLoading: isCourseLoading } =
    useGetCourseListQuery(
      {
        trainer_id: selectedTrainer,
        learner_id: selectedLearner,
      },
      {
        skip: !selectedTrainer || !selectedLearner,
      }
    )
  const courseList = courseListData?.data?.courses ?? []

  const { data: optionsList, isLoading: isOptionsLoading } =
    useGetOptionsListQuery(
      {},
      {
        refetchOnMountOrArgChange: true,
      }
    )

  const [createNewSession, { isLoading: isLoadingCreate }] =
    useCreateNewSessionMutation()

  const [fileUploadSession] = useFileUploadSessionMutation()

  const fileTypes = optionsList?.data?.file_types ?? []
  const sessionTypes = optionsList?.data?.session_types ?? []
  const frequenciesList = optionsList?.data?.frequencies ?? []

  const { dataUpdatingLoadding } = props

  const onSubmit = async (data) => {
    const Duration = `${data.hours}:${data.minutes}`
    const [hours, minutes] = Duration.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes
    const payload = {
      assessor_id: data.trainer_id,
      learners: [parseInt(data.learners, 10)],
      courses: data.courses,
      title: data.title,
      description: data.description,
      location: data.location,
      startDate: data.startDate,
      Duration: totalMinutes.toString(),
      type: data.type,
      repeatSession: data.repeat_session,
      ...(data.repeat_session && {
        repeat_frequency: data.repeat_frequency,
        repeat_every: data.repeat_every,
        include_holidays: data.include_holidays,
        include_weekends: data.include_weekends,
        repeat_end_date: data.end_date,
        upload_attachment: data.upload_attachment,
        ...(data.upload_attachment && {
          file_attachments: [],
        }),
      }),
    }

    let fileResponse

    if (data.upload_attachment) {
      const formData = new FormData()
      formData.append('assessor_id', data.trainer_id)
      formData.append('file', data.file)
      formData.append('file_type', data.file_type)
      formData.append('session_type', data.session_type)

      try {
        fileResponse = await fileUploadSession(formData).unwrap()
      } catch (error) {
        console.error('Error uploading file:', error)
        return
      }

      if (fileResponse.status) {
        const { data } = fileResponse
        const file_attachments = []
        file_attachments.push({
          file_type: data.uploaded_file.file_type,
          session_type: data.uploaded_file.session_type,
          file_url: data.uploaded_file.file_url,
          file_name: data.uploaded_file.file_name,
          file_size: data.uploaded_file.file_size,
          s3_key: data.s3_key,
          uploaded_at: data.uploaded_file.uploaded_at,
        })
        payload.file_attachments = file_attachments
      }
    }

    try {
      await createNewSession(payload).unwrap()

      dispatch(
        showMessage({
          message: 'Session created successfully',
          variant: 'success',
        })
      )

      reset()
    } catch (error) {
      console.error('Error:', error)
      dispatch(
        showMessage({
          message: 'Failed to create session',
          variant: 'error',
        })
      )
    }
  }

  const handleClose = () => {
    reset()
  }

  const sessionDataFromStorage = JSON.parse(
    sessionStorage.getItem('learnerToken')
  )?.user
  const selectedLearnerId = sessionDataFromStorage?.learner_id || null

  useEffect(() => {
    if (session.update) {
      setSessionData({
        ...session.singleData,
        trainer_id: session.singleData?.trainer_id?.user_id,
        learners: session.singleData?.learners.map(
          (learner) => learner.learner_id
        ),
        startDate: new Date(session.singleData?.startDate),
      })
    }
    if (selectedLearnerId) {
      setSessionData((prevState) => ({
        ...prevState,
        learners: [selectedLearnerId],
      }))
    }
  }, [])

  return (
    <Grid>
      <Grid className='my-20 mx-20'>
        <Card className='rounded-6 items-center ' variant='outlined'>
          <Grid className='h-full flex flex-col'>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='m-12 flex flex-col justify-between gap-12 sm:flex-col'
            >
              <Box>
                <Grid xs={12} className='p-10 border-b-2 bg-gray-100'>
                  <Typography className='font-600 '>
                    Book a new Session
                  </Typography>
                </Grid>

                <Grid className='w-full'>
                  <Typography variant='body1' gutterBottom>
                    Select Trainer
                  </Typography>
                  <Controller
                    name='trainer_id'
                    control={control}
                    render={({ field }) => (
                      <Select {...field} fullWidth size='small' displayEmpty>
                        <MenuItem value='' disabled>
                          Select Trainer
                        </MenuItem>
                        {session.trainer.map((data) => (
                          <MenuItem key={data.id} value={data.user_id}>
                            {data.first_name} {data.last_name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <ErrorText>{errors.trainer_id?.message}</ErrorText>
                </Grid>

                <Grid className='w-full'>
                  <Typography variant='body1' gutterBottom>
                    Select Learner
                  </Typography>
                  <Controller
                    name='learners'
                    control={control}
                    render={({ field }) => (
                      <Select {...field} fullWidth size='small' displayEmpty>
                        {!selectedTrainer ? (
                          <MenuItem disabled>
                            Please select a trainer first
                          </MenuItem>
                        ) : isLoading ? (
                          Array.from({ length: 5 }).map((_, index) => (
                            <MenuItem key={index} disabled>
                              <Skeleton
                                variant='text'
                                width={100}
                                height={20}
                              />
                            </MenuItem>
                          ))
                        ) : learnerList.length === 0 ? (
                          <MenuItem disabled>
                            No learners available for this trainer
                          </MenuItem>
                        ) : (
                          learnerList.map((learner) => (
                            <MenuItem
                              key={learner.learner_id}
                              value={learner.learner_id}
                            >
                              {learner.first_name} {learner.last_name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    )}
                  />
                  <ErrorText>{errors.learners?.message}</ErrorText>
                </Grid>

                <Grid className='w-full'>
                  <Typography variant='body1' gutterBottom>
                    Title
                  </Typography>
                  <Controller
                    name='title'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size='small'
                        placeholder='Title'
                      />
                    )}
                  />
                  <ErrorText>{errors.title?.message}</ErrorText>
                </Grid>

                <Grid className='w-full'>
                  <Typography variant='body1' gutterBottom>
                    Enter Session Location
                  </Typography>
                  <Controller
                    name='location'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size='small'
                        placeholder='Location'
                      />
                    )}
                  />
                  <ErrorText>{errors.location?.message}</ErrorText>
                </Grid>

                <Grid className='w-full'>
                  <Typography variant='body1' gutterBottom>
                    Select Courses
                  </Typography>
                  <Controller
                    name='courses'
                    control={control}
                    render={({ field }) => {
                      const { value, onChange } = field
                      const trainerId = watch('trainer_id')
                      const learners = watch('learners')

                      const handleToggle = (id: number) => {
                        if (value.includes(id)) {
                          onChange(value.filter((v) => v !== id))
                        } else {
                          onChange([...value, id])
                        }
                      }

                      const handleToggleAll = () => {
                        if (value.length === courseList.length) {
                          onChange([])
                        } else {
                          onChange(courseList.map((c) => c.course_id))
                        }
                      }

                      const showCourseCheckboxes = trainerId && learners

                      if (!showCourseCheckboxes) {
                        return (
                          <Typography color='Highlight' fontSize='14px'>
                            Please select trainer and learner first
                          </Typography>
                        )
                      }

                      if (courseList.length === 0) {
                        return (
                          <Typography color='Highlight' fontSize='14px'>
                            No courses available for this selection
                          </Typography>
                        )
                      }

                      return (
                        <FormGroup>
                          {courseList.length > 0 && (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={value.length === courseList.length}
                                  onChange={handleToggleAll}
                                />
                              }
                              label='Select All'
                            />
                          )}
                          {courseList.map((course) => (
                            <FormControlLabel
                              key={course.course_id}
                              control={
                                <Checkbox
                                  checked={value.includes(course.course_id)}
                                  onChange={() =>
                                    handleToggle(course.course_id)
                                  }
                                />
                              }
                              label={course.course_name}
                            />
                          ))}
                        </FormGroup>
                      )
                    }}
                  />
                  <ErrorText>{errors.courses?.message}</ErrorText>
                </Grid>

                <Grid className='w-full'>
                  <Typography variant='body1' gutterBottom>
                    Select Session Date and Time
                  </Typography>
                  <Controller
                    name='startDate'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type='datetime-local'
                        fullWidth
                        size='small'
                      />
                    )}
                  />
                  <ErrorText>{errors.startDate?.message}</ErrorText>
                </Grid>

                <Grid className='w-full flex gap-4'>
                  <Grid className='w-full'>
                    <Typography variant='body1' gutterBottom>
                      Hours
                    </Typography>
                    <Controller
                      name='hours'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size='small'
                          type='number'
                        />
                      )}
                    />
                    <ErrorText>{errors.hours?.message}</ErrorText>
                  </Grid>
                  <Grid className='w-full'>
                    <Typography variant='body1' gutterBottom>
                      Minutes
                    </Typography>
                    <Controller
                      name='minutes'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size='small'
                          type='number'
                        />
                      )}
                    />
                    <ErrorText>{errors.minutes?.message}</ErrorText>
                  </Grid>
                </Grid>

                <Grid className='w-full'>
                  <Typography variant='body1' gutterBottom>
                    Select Session Type
                  </Typography>
                  <Controller
                    name='type'
                    control={control}
                    render={({ field }) => (
                      <Select {...field} fullWidth size='small' displayEmpty>
                        <MenuItem value='' disabled>
                          Select Session Type
                        </MenuItem>
                        {[
                          'General',
                          'Induction',
                          'Formal Review',
                          'Telephone',
                          'Exit Session',
                          'Out Of the Workplace',
                          'Tests/Exams',
                          'Learner Support',
                          'Initial Session',
                          'Gateway Ready',
                          'EPA',
                          'Furloughed',
                        ].map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <ErrorText>{errors.type?.message}</ErrorText>
                </Grid>

                <Grid className='w-full'>
                  <Typography variant='body1' gutterBottom>
                    Planning notes
                  </Typography>
                  <Controller
                    name='description'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        multiline
                        rows={5}
                        fullWidth
                        size='small'
                        placeholder='please enter planning notes'
                      />
                    )}
                  />
                  <ErrorText>{errors.description?.message}</ErrorText>
                </Grid>

                <Grid className='w-full'>
                  <Controller
                    name='repeat_session'
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label='Repeat session?'
                      />
                    )}
                  />
                </Grid>

                {watch('repeat_session') && (
                  <>
                    <Grid className='w-full'>
                      <Typography variant='body1' gutterBottom>
                        Repeat frequency:
                      </Typography>
                      <Controller
                        name='repeat_frequency'
                        control={control}
                        render={({ field }) => (
                          <Select {...field} fullWidth size='small'>
                            {frequenciesList?.map((item) => (
                              <MenuItem key={item} value={item}>
                                {item}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      <ErrorText>{errors.repeat_frequency?.message}</ErrorText>
                    </Grid>

                    <Grid className='w-full'>
                      <Typography variant='body1' gutterBottom>
                        {repeatFrequency === 'Weekly'
                          ? 'Repeat every (x) week(s):'
                          : repeatFrequency === 'Monthly'
                          ? 'Repeat every (x) month(s):'
                          : 'Repeat every (x) day(s):'}
                      </Typography>
                      <Controller
                        name='repeat_every'
                        control={control}
                        render={({ field }) => (
                          <Select {...field} fullWidth size='small'>
                            {repeatOptions.map((val) => (
                              <MenuItem key={val} value={val}>
                                {val}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      <ErrorText>{errors.repeat_every?.message}</ErrorText>
                    </Grid>

                    <FormGroup>
                      <Controller
                        name='include_holidays'
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox {...field} checked={field.value} />
                            }
                            label='Include holidays?'
                          />
                        )}
                      />
                      <Controller
                        name='include_weekends'
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox {...field} checked={field.value} />
                            }
                            label='Include weekends?'
                          />
                        )}
                      />
                    </FormGroup>

                    <Grid className='w-full'>
                      <Typography variant='body1' gutterBottom>
                        End date:
                      </Typography>
                      <Controller
                        name='end_date'
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            placeholder='DD/MM/YYYY'
                            fullWidth
                            size='small'
                            type='date'
                          />
                        )}
                      />
                      <ErrorText>{errors.end_date?.message}</ErrorText>
                    </Grid>

                    <FormGroup>
                      <Controller
                        name='upload_attachment'
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox {...field} checked={field.value} />
                            }
                            label='Upload session file attachment?'
                          />
                        )}
                      />
                      {watch('upload_attachment') && (
                        <>
                          {/* File type dropdown */}
                          <Grid container spacing={2} className='my-2'>
                            {/* File Type */}
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth size='small'>
                                <InputLabel id='file-type-label'>
                                  File Type
                                </InputLabel>
                                <Controller
                                  name='file_type'
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      labelId='file-type-label'
                                      label='File Type'
                                    >
                                      {fileTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                          {type}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  )}
                                />
                              </FormControl>
                              <ErrorText>{errors.file_type?.message}</ErrorText>
                            </Grid>

                            {/* Session Type */}
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth size='small'>
                                <InputLabel id='session-type-label'>
                                  Session Type
                                </InputLabel>
                                <Controller
                                  name='session_type'
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      {...field}
                                      labelId='session-type-label'
                                      label='Session Type'
                                    >
                                      {sessionTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                          {type}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  )}
                                />
                              </FormControl>
                              <ErrorText>
                                {errors.session_type?.message}
                              </ErrorText>
                            </Grid>
                          </Grid>
                          <Grid className='w-full mt-4'>
                            {/* File upload */}

                            <Controller
                              name='file'
                              control={control}
                              render={({ field }) => (
                                <FileUploader
                                  handleChange={(file: File) => {
                                    field.onChange(file)
                                  }}
                                  name='file'
                                  types={FileTypes}
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
                                          <span className='text-blue-500 underline'>
                                            Browse
                                          </span>
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
                            <ErrorText>{errors.file?.message}</ErrorText>
                          </Grid>
                        </>
                      )}
                    </FormGroup>
                  </>
                )}
              </Box>

              <Box style={{ margin: 'auto 1rem 1rem auto' }}>
                {isLoadingCreate ? (
                  <LoadingButton />
                ) : (
                  <>
                    <Button
                      className='rounded-md mr-6'
                      color='secondary'
                      variant='outlined'
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      className='rounded-md'
                      color='primary'
                      variant='contained'
                      type='submit'
                    >
                      Save
                    </Button>
                  </>
                )}
              </Box>
            </form>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AddEditSession

const ErrorText = ({ children }) =>
  children ? (
    <Typography color='error' fontSize='12px'>
      {children}
    </Typography>
  ) : null
