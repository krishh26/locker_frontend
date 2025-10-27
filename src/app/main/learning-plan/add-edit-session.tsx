import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Typography
} from '@mui/material'
import {
  useCreateNewSessionMutation,
  useFileUploadSessionMutation,
  useGetLernerListQuery,
  useGetOptionsListQuery
} from 'app/store/api/learner-plan-api'
import { showMessage } from 'app/store/fuse/messageSlice'
import { selectLearnerManagement } from 'app/store/learnerManagement'
import { getLearnerAPI, getTrainerAPI, selectSession } from 'app/store/session'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { LoadingButton } from 'src/app/component/Buttons'
import { useCurrentUser } from 'src/app/utils/userHelpers'
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
  learners: yup.array().min(1, 'At least one learner must be selected'),
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
  include_weekends: yup.boolean(),
  end_date: yup.string().when('repeat_session', {
    is: true,
    then: (schema) => schema.required('End date is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
})

const AddEditSession = (props) => {
  const dispatch: any = useDispatch()
  const navigate = useNavigate()
  const session = useSelector(selectSession)

  const user = useCurrentUser()
  const { learner } = useSelector(selectLearnerManagement)

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
      learners: [],
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
      include_weekends: false,
      end_date: '',
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

  // Prefill trainer_id if user is a Trainer
  useEffect(() => {
    if (user?.role === 'Trainer' && user?.user_id) {
      setValue('trainer_id', user.user_id.toString())
      setValue('learners', [learner.learner_id])
    }
  }, [user, setValue])

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
  const selectedNames = learnerList.filter((learner) =>
    selectedLearner.includes(learner.learner_id)
  )

  const courseList = selectedNames ?? []

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
      title: data.title,
      description: data.description,
      location: data.location,
      startDate: data.startDate,
      Duration: totalMinutes.toString(),
      type: data.type,
      repeatSession: data.repeat_session,
      number_of_participants: data.courses.length,
      participants: data.courses,
      ...(data.repeat_session && {
        repeat_frequency: data.repeat_frequency,
        repeat_every: data.repeat_every,
        include_weekends: data.include_weekends,
        repeat_end_date: data.end_date,
      }),
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
                      <Select {...field} fullWidth size='small' displayEmpty disabled={user?.role === 'Trainer'}>
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
                    Select Learner(s)
                  </Typography>
                  <Controller
                    name='learners'
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        fullWidth
                        size='small'
                        displayEmpty
                        multiple
                        value={field.value || []} // ensure array
                        onChange={(e) => field.onChange(e.target.value)} // update value
                        renderValue={(selected) => {
                          if (selected.length === 0) {
                            return <em>Select Learners</em>
                          }

                          const selectedNames = learnerList
                            .filter((learner) =>
                              selected.includes(learner.learner_id)
                            )
                            .map(
                              (learner) =>
                                `${learner.first_name} ${learner.last_name}`
                            )
                            .join(', ')

                          return selectedNames
                        }}
                      >
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
                      const { value = [], onChange } = field
                      const trainerId = watch('trainer_id')
                      const learners = watch('learners')

                      const selectedLearners = learnerList.filter((l) =>
                        learners.includes(l.learner_id)
                      )

                      const getCoursesForLearner = (learnerId) =>
                        value.find((entry) => entry.learner_id === learnerId)
                          ?.courses || []

                      const updateCoursesForLearner = (
                        learnerId,
                        updatedCourses
                      ) => {
                        const newValue = value.some(
                          (entry) => entry.learner_id === learnerId
                        )
                          ? value.map((entry) =>
                              entry.learner_id === learnerId
                                ? { ...entry, courses: updatedCourses }
                                : entry
                            )
                          : [
                              ...value,
                              { learner_id: learnerId, courses: updatedCourses },
                            ]

                        onChange(newValue)
                      }

                      const handleToggle = (learnerId, courseId) => {
                        const selected = getCoursesForLearner(learnerId)
                        const updated = selected.includes(courseId)
                          ? selected.filter((id) => id !== courseId)
                          : [...selected, courseId]

                        updateCoursesForLearner(learnerId, updated)
                      }

                      const handleToggleAll = (learnerId, allCourseIds) => {
                        const selected = getCoursesForLearner(learnerId)
                        const alreadyAllSelected =
                          selected.length === allCourseIds.length
                        const updated = alreadyAllSelected ? [] : allCourseIds

                        updateCoursesForLearner(learnerId, updated)
                      }

                      if (!trainerId || learners?.length === 0) {
                        return (
                          <Typography color='Highlight' fontSize='14px'>
                            Please select trainer and learner first
                          </Typography>
                        )
                      }

                      return (
                        <FormGroup>
                          {selectedLearners.map((learner) => {
                            const courseList = learner.course.map(
                              (c) => c.course
                            )
                            const selected = getCoursesForLearner(
                              learner.learner_id
                            )

                            return (
                              <div
                                key={learner.learner_id}
                                style={{ marginBottom: '1rem' }}
                              >
                                <Typography
                                  variant='subtitle1'
                                  fontWeight='bold'
                                >
                                  {learner.first_name} {learner.last_name}
                                </Typography>

                                {courseList.length > 0 && (
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={
                                          selected.length === courseList.length
                                        }
                                        onChange={() =>
                                          handleToggleAll(
                                            learner.learner_id,
                                            courseList.map((c) => c.course_id)
                                          )
                                        }
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
                                        checked={selected.includes(
                                          course.course_id
                                        )}
                                        onChange={() =>
                                          handleToggle(
                                            learner.learner_id,
                                            course.course_id
                                          )
                                        }
                                      />
                                    }
                                    label={course.course_name}
                                  />
                                ))}
                              </div>
                            )
                          })}
                        </FormGroup>
                      )
                    }}
                  />
                  <ErrorText>{errors.courses?.message}</ErrorText>
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
