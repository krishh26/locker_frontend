import FuseLoading from '@fuse/core/FuseLoading'
import { yupResolver } from '@hookform/resolvers/yup'
import { Add, Edit } from '@mui/icons-material'
import {
  Autocomplete,
  Box,
  Chip,
  Dialog,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  courseAllocationAPI,
  selectCourseManagement,
  updateUserCourse,
} from 'app/store/courseManagement'
import { showMessage } from 'app/store/fuse/messageSlice'
import { slice as globalSlice, selectGlobalUser } from 'app/store/globalUser'
import {
  getLearnerDetails,
  selectLearnerManagement,
} from 'app/store/learnerManagement'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from 'src/app/component/Buttons'
import DataNotFound from 'src/app/component/Pages/dataNotFound'
import * as yup from 'yup'

// Course status enum
enum CourseStatus {
  AwaitingInduction = 'Awaiting Induction',
  Certificated = 'Certificated',
  Completed = 'Completed',
  EarlyLeaver = 'Early Leaver',
  Exempt = 'Exempt',
  InTraining = 'In Training',
  IQAApproved = 'IQA Approved',
  TrainingSuspended = 'Training Suspended',
  Transferred = 'Transferred',
}

// Course status options for dropdown
const courseStatusOptions = Object.values(CourseStatus)

// Validation schema
const courseSchema = yup.object().shape({
  course_id: yup.string().required('Please select a course'),
  trainer_id: yup.string().required('Please select a trainer'),
  IQA_id: yup.string().required('Please select an IQA'),
  LIQA_id: yup.string().required('Please select a LIQA'),
  EQA_id: yup.string().required('Please select an EQA'),
  employer_id: yup.string().required('Please select an employer'),
  start_date: yup.string().required('Please select a start date'),
  end_date: yup
    .string()
    .required('Please select an end date')
    .test('end-date', 'End date must be after start date', function (value) {
      const { start_date } = this.parent
      if (!start_date || !value) return true
      return new Date(value) > new Date(start_date)
    }),
  course_status: yup.string().optional(),
})

const CourseTab = () => {
  const dispatch: any = useDispatch()

  const { data } = useSelector(selectCourseManagement)
  const { LIQA, IQA, trainer, employer, EQA, learner } = useSelector(
    selectLearnerManagement
  )
  const learnerUser =
    JSON.parse(sessionStorage.getItem('learnerToken'))?.user ||
    useSelector(selectGlobalUser)?.selectedUser

  const [courseDialog, setCourseDialog] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [loading, setLoading] = useState(false)

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(courseSchema),
    mode: 'onChange',
    defaultValues: {
      course_id: '',
      trainer_id: '',
      IQA_id: '',
      learner_id: learner?.learner_id,
      EQA_id: '',
      LIQA_id: '',
      employer_id: '',
      start_date: '',
      end_date: '',
      course_status: '',
    },
  })

  const handleLearnerRefetch = async () => {
    const data = await dispatch(getLearnerDetails(learnerUser?.learner_id))
    if (data) {
      dispatch(globalSlice.setSelectedUser(data))
    }
  }

  const onSubmit = async (formData) => {
    setLoading(true)
    try {
      if (isEditMode) {
        // Update course logic
        const response = await dispatch(
          updateUserCourse(selectedCourse?.user_course_id, formData)
        )
        if (response) {
          dispatch(
            showMessage({
              message: 'Course updated successfully!',
              variant: 'success',
            })
          )
        } else {
          dispatch(
            showMessage({
              message: 'Failed to update course. Please try again.',
              variant: 'error',
            })
          )
        }
      } else {
        // Add course logic
        const response = await dispatch(courseAllocationAPI(formData))
        if (response) {
          dispatch(
            showMessage({
              message: 'Course added successfully!',
              variant: 'success',
            })
          )
        } else {
          dispatch(
            showMessage({
              message: 'Failed to add course. Please try again.',
              variant: 'error',
            })
          )
        }
      }
      closeCourseDialog()
      handleLearnerRefetch()
    } catch (error) {
      dispatch(
        showMessage({
          message: `Failed to ${
            isEditMode ? 'update' : 'add'
          } course. Please try again.`,
          variant: 'error',
        })
      )
    }
    setLoading(false)
  }

  const handleEditCourse = (course) => {
    setSelectedCourse(course)
    setIsEditMode(true)

    // Pre-populate form with existing data
    setValue('course_id', course?.course?.course_id || '')
    setValue('trainer_id', course?.trainer_id?.user_id || '')
    setValue('IQA_id', course?.IQA_id?.user_id || '')
    setValue('EQA_id', course?.EQA_id?.user_id || '')
    setValue('LIQA_id', course?.LIQA_id?.user_id || '')
    setValue('employer_id', course?.employer_id?.user_id || '')
    setValue('start_date', course?.start_date?.substr(0, 10) || '')
    setValue('end_date', course?.end_date?.substr(0, 10) || '')
    setValue('course_status', course?.course_status || '')

    setCourseDialog(true)
  }

  const { selectedUser, dataFetchLoading } = useSelector(selectGlobalUser)

  const handleCreateCourse = () => {
    setIsEditMode(false)
    setSelectedCourse(null)
    reset() // Reset form to default values
    setCourseDialog(true)
  }

  const closeCourseDialog = () => {
    setCourseDialog(false)
    setIsEditMode(false)
    setSelectedCourse(null)
    reset()
  }

  const formatDate = (date) => {
    if (!date) return '-'
    const formattedDate = date.substr(0, 10)
    return formattedDate
  }

  const getStatusColor = (status) => {
    switch (status) {
      case CourseStatus.AwaitingInduction:
        return 'warning'
      case CourseStatus.Certificated:
        return 'success'
      case CourseStatus.Completed:
        return 'primary'
      case CourseStatus.EarlyLeaver:
        return 'error'
      case CourseStatus.Exempt:
        return 'info'
      case CourseStatus.InTraining:
        return 'success'
      case CourseStatus.IQAApproved:
        return 'success'
      case CourseStatus.TrainingSuspended:
        return 'warning'
      case CourseStatus.Transferred:
        return 'info'
      // Fallback for legacy status values
      case 'active':
      case 'in progress':
        return 'success'
      case 'pending':
        return 'warning'
      case 'cancelled':
      case 'failed':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusChip = (status) => {
    return (
      <Chip
        label={status || 'N/A'}
        color={getStatusColor(status)}
        size='small'
        variant='outlined'
        sx={{
          fontWeight: 500,
          minWidth: '80px',
        }}
      />
    )
  }

  return (
    <>
      <div className='bg-white rounded-lg shadow-sm p-6'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-800 mb-2'>
              Learner Course Management
            </h1>
            <p className='text-gray-600'>
              Manage and track learner course progress
            </p>
          </div>
          <SecondaryButton
            className='py-3 px-6'
            name='Add New Course'
            onClick={handleCreateCourse}
            startIcon={<Add />}
          />
        </div>

        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          {dataFetchLoading ? (
            <div className='flex justify-center items-center h-64'>
              <FuseLoading />
            </div>
          ) : selectedUser?.course?.length ? (
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader size='medium'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>
                      Course Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>
                      Start Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>
                      End Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>
                      Trainer
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>
                      IQA
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedUser?.course?.map((row, index) => (
                    <TableRow
                      key={row?.course?.user_course_id || index}
                      sx={{
                        '&:hover': { backgroundColor: '#f9fafb' },
                        '&:last-child td': { border: 0 },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 500,
                          color: '#1f2937',
                          maxWidth: '200px',
                        }}
                      >
                        <div
                          className='font-medium'
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: '1.2em',
                            maxHeight: '2.4em',
                          }}
                          title={row?.course?.course_name}
                        >
                          {row?.course?.course_name}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusChip(row?.course_status)}</TableCell>
                      <TableCell sx={{ color: '#6b7280' }}>
                        {formatDate(row?.start_date)}
                      </TableCell>
                      <TableCell sx={{ color: '#6b7280' }}>
                        {formatDate(row?.end_date)}
                      </TableCell>
                      <TableCell sx={{ color: '#6b7280' }}>
                        {row?.trainer_id?.first_name &&
                        row?.trainer_id?.last_name
                          ? `${row?.trainer_id?.first_name} ${row?.trainer_id?.last_name}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ color: '#6b7280' }}>
                        {row?.IQA_id?.first_name && row?.IQA_id?.last_name
                          ? `${row?.IQA_id?.first_name} ${row?.IQA_id?.last_name}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-2'>
                          <Tooltip title='Edit Course'>
                            <IconButton
                              size='small'
                              sx={{ color: '#10b981' }}
                              onClick={() => handleEditCourse(row)}
                            >
                              <Edit fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <div className='flex flex-col justify-center items-center py-16'>
              <DataNotFound width='20%' />
              <Typography variant='h6' className='mt-4 text-gray-700'>
                No courses found
              </Typography>
              <Typography
                variant='body2'
                className='text-center text-gray-500 mt-2'
              >
                Start by adding a new course to track learner progress
              </Typography>
              <SecondaryButton
                className='mt-4'
                name='Add Your First Course'
                onClick={handleCreateCourse}
              />
            </div>
          )}
        </div>
      </div>

      {/* Combined Add/Edit Course Dialog */}
      <Dialog
        open={courseDialog}
        onClose={closeCourseDialog}
        maxWidth='md'
        fullWidth
        sx={{
          '.MuiDialog-paper': {
            borderRadius: '12px',
          },
        }}
      >
        <Box className='p-12'>
          <Typography variant='h5' className='mb-2 font-semibold text-gray-800'>
            {isEditMode ? 'Edit Course' : 'Add New Course'}
          </Typography>
          <Typography variant='body2' className='mb-6 text-gray-600'>
            Fields marked with <span className='text-red-500'>*</span> are
            required
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <Typography className='text-sm font-medium text-gray-700 mb-2'>
                Select Course <span className='text-red-500'>*</span>
              </Typography>
              <Controller
                name='course_id'
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    disableClearable
                    fullWidth
                    size='small'
                    options={data || []}
                    getOptionLabel={(option: any) => option.course_name}
                    value={
                      data?.find((c) => c.course_id === field.value) || null
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder='Choose a course'
                        variant='outlined'
                        error={!!errors.course_id}
                        helperText={errors.course_id?.message}
                      />
                    )}
                    onChange={(e, value: any) =>
                      field.onChange(value?.course_id || '')
                    }
                    disabled={isEditMode}
                  />
                )}
              />
            </div>

            {isEditMode && (
              <div>
                <Typography className='text-sm font-medium text-gray-700 mb-2'>
                  Course Status <span className='text-red-500'>*</span>
                </Typography>
                <Controller
                  name='course_status'
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      disableClearable
                      fullWidth
                      size='small'
                      options={courseStatusOptions}
                      value={field.value || null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder='Select course status'
                          variant='outlined'
                          error={!!errors.course_status}
                          helperText={errors.course_status?.message}
                        />
                      )}
                      onChange={(e, value: any) => field.onChange(value || '')}
                    />
                  )}
                />
              </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Typography className='text-sm font-medium text-gray-700 mb-2'>
                  Trainer <span className='text-red-500'>*</span>
                </Typography>
                <Controller
                  name='trainer_id'
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      disableClearable
                      fullWidth
                      size='small'
                      options={trainer || []}
                      getOptionLabel={(option: any) => option.user_name}
                      value={
                        trainer?.find((t) => t.user_id === field.value) || null
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder='Select trainer'
                          variant='outlined'
                          error={!!errors.trainer_id}
                          helperText={errors.trainer_id?.message}
                        />
                      )}
                      onChange={(e, value: any) =>
                        field.onChange(value?.user_id || '')
                      }
                    />
                  )}
                />
              </div>

              <div>
                <Typography className='text-sm font-medium text-gray-700 mb-2'>
                  IQA <span className='text-red-500'>*</span>
                </Typography>
                <Controller
                  name='IQA_id'
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      disableClearable
                      fullWidth
                      size='small'
                      options={IQA || []}
                      getOptionLabel={(option: any) => option.user_name}
                      value={
                        IQA?.find((i) => i.user_id === field.value) || null
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder='Select IQA'
                          variant='outlined'
                          error={!!errors.IQA_id}
                          helperText={errors.IQA_id?.message}
                        />
                      )}
                      onChange={(e, value: any) =>
                        field.onChange(value?.user_id || '')
                      }
                    />
                  )}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Typography className='text-sm font-medium text-gray-700 mb-2'>
                  LIQA <span className='text-red-500'>*</span>
                </Typography>
                <Controller
                  name='LIQA_id'
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      disableClearable
                      fullWidth
                      size='small'
                      options={LIQA || []}
                      getOptionLabel={(option: any) => option.user_name}
                      value={
                        LIQA?.find((l) => l.user_id === field.value) || null
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder='Select LIQA'
                          variant='outlined'
                          error={!!errors.LIQA_id}
                          helperText={errors.LIQA_id?.message}
                        />
                      )}
                      onChange={(e, value: any) =>
                        field.onChange(value?.user_id || '')
                      }
                    />
                  )}
                />
              </div>

              <div>
                <Typography className='text-sm font-medium text-gray-700 mb-2'>
                  EQA <span className='text-red-500'>*</span>
                </Typography>
                <Controller
                  name='EQA_id'
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      disableClearable
                      fullWidth
                      size='small'
                      options={EQA || []}
                      getOptionLabel={(option: any) => option.user_name}
                      value={
                        EQA?.find((e) => e.user_id === field.value) || null
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder='Select EQA'
                          variant='outlined'
                          error={!!errors.EQA_id}
                          helperText={errors.EQA_id?.message}
                        />
                      )}
                      onChange={(e, value: any) =>
                        field.onChange(value?.user_id || '')
                      }
                    />
                  )}
                />
              </div>
            </div>

            <div>
              <Typography className='text-sm font-medium text-gray-700 mb-2'>
                Employer <span className='text-red-500'>*</span>
              </Typography>
              <Controller
                name='employer_id'
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    disableClearable
                    fullWidth
                    size='small'
                    options={employer || []}
                    getOptionLabel={(option: any) =>
                      option.employer?.employer_name
                    }
                    value={
                      employer?.find((e) => e.user_id === field.value) || null
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder='Select employer'
                        variant='outlined'
                        error={!!errors.employer_id}
                        helperText={errors.employer_id?.message}
                      />
                    )}
                    onChange={(e, value: any) =>
                      field.onChange(value?.user_id || '')
                    }
                  />
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Typography className='text-sm font-medium text-gray-700 mb-2'>
                  Start Date <span className='text-red-500'>*</span>
                </Typography>
                <Controller
                  name='start_date'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size='small'
                      type='date'
                      fullWidth
                      variant='outlined'
                      error={!!errors.start_date}
                      helperText={errors.start_date?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Typography className='text-sm font-medium text-gray-700 mb-2'>
                  End Date <span className='text-red-500'>*</span>
                </Typography>
                <Controller
                  name='end_date'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size='small'
                      type='date'
                      fullWidth
                      variant='outlined'
                      error={!!errors.end_date}
                      helperText={errors.end_date?.message}
                    />
                  )}
                />
              </div>
            </div>

            <div className='flex justify-end gap-3 mt-6'>
              <SecondaryButtonOutlined
                name='Cancel'
                onClick={closeCourseDialog}
                type='button'
              />
              {loading ? (
                <LoadingButton style={{ width: '120px' }} />
              ) : (
                <SecondaryButton
                  name={isEditMode ? 'Update Course' : 'Add Course'}
                  type='submit'
                />
              )}
            </div>
          </form>
        </Box>
      </Dialog>
    </>
  )
}

export default CourseTab
