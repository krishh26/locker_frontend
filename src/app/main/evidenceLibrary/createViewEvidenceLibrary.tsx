import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import {
  Box,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Button,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
} from '@mui/material'
import { useSelector } from 'react-redux'
import { Controller, useForm } from 'react-hook-form'
import { FileUploader } from 'react-drag-drop-files'
import { yupResolver } from '@hookform/resolvers/yup'

import {
  useGetEvidenceDetailsQuery,
  useGetSessionListQuery,
  useUpdateEvidenceIdMutation,
} from 'app/store/api/evidence-api'
import { assessmentMethod, fileTypes, sessions } from 'src/utils/constants'
import { selectUser } from 'app/store/userSlice'

import { FormValues } from './lib/types'
import { getValidationSchema } from './schema'
import {
  fetchCourseById,
  selectCourseManagement,
} from 'app/store/courseManagement'
import { useDispatch } from 'react-redux'
import { showMessage } from 'app/store/fuse/messageSlice'
import { formatSessionTime } from 'src/utils/string'

const CreateViewEvidenceLibrary = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isEditMode, setIsEditMode] = useState<boolean>(
    location.state && location.state?.isEdit
  )
  const [sessions, setSessions] = useState([])

  const dispatch: any = useDispatch()
  const { id } = useParams()

  const user = sessionStorage.getItem('learnerToken')
    ? { data: JSON.parse(sessionStorage.getItem('learnerToken'))?.user }
    : useSelector(selectUser)

  const { roles, learner_id } = user.data

  const isTrainer = roles.includes('Trainer')

  const singleCourse = useSelector(selectCourseManagement)

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(getValidationSchema(isTrainer)),
    defaultValues: {
      title: '',
      description: '',
      trainer_feedback: '',
      points_for_improvement: '',
      file: null,
      learner_comments: '',
      doYouLike: '',
      session: '',
      grade: '',
      declaration: false,
      assessment_method: [],
      units: [],
    },
  })

  const [evidenceData, setEvidenceData] = useState<{
    course_id: string
    file: {
      key: string
      name: string
      url: string
    }
    created_at: string
    user: {
      name: string
      roles: string[]
    }
    units: [
      {
        id: string
        title: string
        subUnit: [
          {
            id: number
            learnerMap: boolean
            subTitle: string
            comment: string
            trainerMap: boolean
          }
        ]
      }
    ]
  }>({
    course_id: '',
    file: {
      key: '',
      name: '',
      url: '',
    },
    created_at: '',
    user: {
      name: '',
      roles: [],
    },
    units: [
      {
        id: '',
        subUnit: [
          {
            id: 0,
            comment: '',
            learnerMap: false,
            subTitle: '',
            trainerMap: false,
          },
        ],
        title: '',
      },
    ],
  })

  const {
    data: evidenceDetails,
    isLoading,
    isError,
  } = useGetEvidenceDetailsQuery(
    {
      id,
    },
    {
      skip: !id,
      refetchOnMountOrArgChange: true,
    }
  )

  const { data: sessionsData } = useGetSessionListQuery(
    {
      meta: true,
      page: 1,
      limit: 100,
      learners: learner_id,
    },
    {
      skip: !learner_id,
      refetchOnMountOrArgChange: true,
    }
  )

  useEffect(() => {
    if (sessionsData && sessionsData?.data?.length > 0) {
      const payload = sessionsData?.data.map((time) => ({
        id: time.session_id,
        label: formatSessionTime(time.startDate, time.Duration)
      }))
      setSessions(payload)
    }
  }, [sessionsData])

  const [updateEvidenceId, { isLoading: isUpdateLoading }] =
    useUpdateEvidenceIdMutation()

  useEffect(() => {
    if (!id) return navigate('/evidenceLibrary') // Redirect if no ID is provided
  }, [id])

  useEffect(() => {
    if (!isLoading && isError) {
      navigate('/evidenceLibrary') // Redirect if there's an error
      return
    }

    if (evidenceDetails) {
      const {
        course_id,
        created_at,
        file,
        user,
        description,
        grade,
        learner_comments,
        points_for_improvement,
        assessment_method,
        title,
        units,
        trainer_feedback,
        session,
      } = evidenceDetails.data
      dispatch(fetchCourseById(course_id.course_id))
      setEvidenceData({
        created_at,
        file: {
          key: file.key,
          name: file.name,
          url: file.url,
        },
        course_id: '',
        user: {
          name: `${user.first_name} ${user.last_name}`,
          roles: user.roles,
        },
        units: course_id.units,
      })
      setValue('title', title ? title : '')
      setValue('trainer_feedback', trainer_feedback ? trainer_feedback : '')
      setValue('learner_comments', learner_comments ? learner_comments : '')
      setValue(
        'points_for_improvement',
        points_for_improvement ? points_for_improvement : ''
      )
      setValue('description', description ? description : '')
      setValue('grade', grade ? grade : '')
      setValue('assessment_method', assessment_method ? assessment_method : [])
      setValue('units', units ? units : [])
      setValue('session', session ? session : '')
    }
  }, [evidenceDetails, setValue, isError, id, isLoading])

  if (isLoading) {
    return (
      <Container sx={{ mt: 8, mb: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Loading Evidence Details...
        </Typography>
      </Container>
    )
  }

  const openFilePreview = () => {
    if (evidenceData.file && evidenceData.file.url) {
      window.open(evidenceData.file.url, '_blank')
    } else {
      console.error('File URL is not available')
    }
  }

  const unitsWatch = watch('units')

  const handleCheckboxUnits = (event, method) => {
    const currentUnits = [...(unitsWatch || [])]
    const exists = currentUnits.find((unit) => unit.id === method.id)
    let updatedUnits = []

    if (exists) {
      updatedUnits = currentUnits.filter((unit) => unit.id !== method.id)
    } else {
      updatedUnits = [...currentUnits, method]
    }

    setValue('units', updatedUnits, { shouldValidate: true })
  }

  const learnerMapHandler = (row) => {
    const updated = [...unitsWatch]
    updated.forEach((unit) => {
      unit.subUnit.forEach((sub) => {
        if (sub.id === row.id) {
          sub.learnerMap = !sub.learnerMap
        }
      })
    })
    setValue('units', updated)
    trigger('units')
  }

  const trainerMapHandler = (row) => {
    const updated = [...unitsWatch]
    updated.forEach((unit) => {
      unit.subUnit.forEach((sub) => {
        if (sub.id === row.id) {
          sub.trainerMap = !sub.trainerMap
        }
      })
    })
    setValue('units', updated)
  }

  const commentHandler = (e, id) => {
    const updated = [...unitsWatch]
    updated.forEach((unit) => {
      unit.subUnit.forEach((sub) => {
        if (sub.id === id) {
          sub.comment = e.target.value
        }
      })
    })
    setValue('units', updated)
  }

  const onSubmit = async (data: FormValues) => {
    console.log('Submitted Data:', data)
    const payload = {
      ...data,
      id,
    }
    try {
      await updateEvidenceId(payload).unwrap()

      dispatch(
        showMessage({
          message: 'Update successfully',
          variant: 'success',
        })
      )
      navigate(`/evidenceLibrary`)
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Something error',
          variant: 'error',
        })
      )
    }
  }

  return (
    <Container sx={{ mt: 8, mb: 4 }}>
      <div className='flex items-start justify-between'>
        <Typography variant='h4' component='h1' gutterBottom>
          Evidence Details
        </Typography>
        {isEditMode && (
          <Button
            variant='contained'
            className='rounded-md'
            color='primary'
            sx={{ mb: 2 }}
            startIcon={<i className='material-icons'>edit</i>}
            onClick={() => setIsEditMode(false)}
          >
            Edit
          </Button>
        )}
      </div>
      <Paper
        elevation={1}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 2,
          marginBottom: 3,
          padding: 2,
          minHeight: 64,
          border: '1px solid #e0e0e0',
        }}
      >
        <Box
          display='flex'
          alignItems='center'
          gap={2}
          onClick={openFilePreview}
          sx={{ cursor: 'pointer' }}
        >
          <InsertDriveFileOutlinedIcon color='action' />
          <Box>
            <Typography
              variant='body2'
              color='primary'
              sx={{ fontWeight: 500, cursor: 'pointer' }}
            >
              {evidenceData.file?.name}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {/* {Math.round(file.size / 1024)} KB */}
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              display='block'
            >
              {evidenceData.user.name} on{' '}
              {new Date(evidenceData.created_at).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Paper>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='body1' gutterBottom>
              Name
            </Typography>
            <Controller
              name='title'
              control={control}
              render={({ field }) => (
                <TextField
                  size='small'
                  placeholder={'Enter Name'}
                  fullWidth
                  error={!!errors.title}
                  disabled={isEditMode}
                  helperText={errors.title?.message}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body1' gutterBottom>
              Description
            </Typography>
            <Controller
              name='description'
              control={control}
              render={({ field }) => (
                <TextField
                  size='small'
                  fullWidth
                  multiline
                  rows={4}
                  disabled={isEditMode}
                  error={!!errors.description}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='body1' gutterBottom>
              Trainer feedback
            </Typography>
            <Controller
              name='trainer_feedback'
              control={control}
              render={({ field }) => (
                <TextField
                  name='title'
                  size='small'
                  multiline
                  rows={4}
                  fullWidth
                  disabled={!roles.includes('Trainer') || isEditMode}
                  style={
                    !roles.includes('Trainer') || isEditMode
                      ? { backgroundColor: 'whitesmoke' }
                      : {}
                  }
                  error={!!errors.trainer_feedback}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='body1' gutterBottom>
              Points for Improvement
            </Typography>
            <Controller
              name='points_for_improvement'
              control={control}
              render={({ field }) => (
                <TextField
                  name='title'
                  size='small'
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.points_for_improvement}
                  disabled={!roles.includes('Trainer') || isEditMode}
                  style={
                    !roles.includes('Trainer') || isEditMode
                      ? { backgroundColor: 'whitesmoke' }
                      : {}
                  }
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body1' gutterBottom>
              Upload External Feedback
            </Typography>
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
                  disabled={!roles.includes('Trainer') || isEditMode}
                >
                  <div
                    className={`relative border border-dashed border-gray-300 p-20 cursor-pointer rounded-md hover:shadow-md transition-all h-[100px] flex flex-col items-center justify-center ${
                      errors.file ? 'border-red-500' : ''
                    }`}
                    style={
                      !roles.includes('Trainer') || isEditMode
                        ? { backgroundColor: 'whitesmoke' }
                        : {}
                    }
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
            {errors.file && (
              <FormHelperText error className='mt-2'>
                {errors.file.message}
              </FormHelperText>
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body1' gutterBottom>
              Learner Comments
            </Typography>
            <Controller
              name='learner_comments'
              control={control}
              render={({ field }) => (
                <TextField
                  name='title'
                  size='small'
                  fullWidth
                  multiline
                  rows={4}
                  disabled={isEditMode}
                  error={!!errors.learner_comments}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body1' gutterBottom>
              Evidence Method
            </Typography>

            <FormGroup row>
              {assessmentMethod.map((method) => (
                <Tooltip key={method.value} title={method.title}>
                  <FormControlLabel
                    control={
                      <Controller
                        name='assessment_method'
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value?.includes(method.value)}
                            disabled={isEditMode}
                            onChange={(e) => {
                              const newValue = [...(field.value || [])]
                              if (e.target.checked) {
                                newValue.push(method.value)
                              } else {
                                const index = newValue.indexOf(method.value)
                                if (index > -1) newValue.splice(index, 1)
                              }
                              field.onChange(newValue)
                            }}
                          />
                        )}
                      />
                    }
                    label={method.value}
                  />
                </Tooltip>
              ))}
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body1' gutterBottom>
              Evidence to be used in time log?
            </Typography>
            <Controller
              name='doYouLike'
              control={control}
              render={({ field }) => (
                <FormControl component='fieldset' error={!!errors.doYouLike}>
                  <RadioGroup row {...field}>
                    <FormControlLabel
                      value='yes'
                      control={<Radio disabled={isEditMode} />}
                      label='Yes'
                    />
                    <FormControlLabel
                      value='no'
                      control={<Radio disabled={isEditMode} />}
                      label='No'
                      defaultChecked
                    />
                  </RadioGroup>
                  {errors.doYouLike && (
                    <FormHelperText>{errors.doYouLike.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='body1' gutterBottom>
              Session
            </Typography>
            <Controller
              name='session'
              control={control}
              rules={{ required: 'Please select a session' }}
              render={({ field }) => (
                <FormControl fullWidth size='small' error={!!errors.session}>
                  <InputLabel id='session-label'>Select Session</InputLabel>
                  <Select
                    labelId='session-label'
                    label='Select Session'
                    disabled={isEditMode}
                    {...field}
                  >
                    {sessions?.length > 0 &&
                      sessions.map((session) => (
                        <MenuItem key={session.id} value={session.id}>
                          {session.label}
                        </MenuItem>
                      ))}
                  </Select>
                  {errors.session && (
                    <FormHelperText>{errors.session.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='body1' gutterBottom>
              Grade
            </Typography>
            <Controller
              name='grade'
              control={control}
              render={({ field }) => (
                <TextField
                  name='title'
                  size='small'
                  fullWidth
                  disabled={isEditMode}
                  error={!!errors.grade}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body1' gutterBottom>
              Select Unit
            </Typography>
            <FormGroup className='flex flex-row'>
              {singleCourse?.unitData?.map((method) => (
                <FormControlLabel
                  key={method.id}
                  control={
                    <Checkbox
                      checked={unitsWatch?.some(
                        (unit) => unit.id === method.id
                      )}
                      onChange={(e) => handleCheckboxUnits(e, method)}
                      name='units'
                      disabled={!roles.includes('Learner') || isEditMode}
                      style={
                        !roles.includes('Learner')
                          ? { backgroundColor: 'whitesmoke' }
                          : {}
                      }
                    />
                  }
                  label={method.title}
                />
              ))}
            </FormGroup>
            {errors.units && (
              <FormHelperText error>{errors.units.message}</FormHelperText>
            )}
            {unitsWatch?.map((units, unitIndex) => (
              <Box key={units.id} className='flex flex-col gap-2'>
                <Typography variant='h5'>{units.title}</Typography>
                <TableContainer>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell align='center'>Learner's Map</TableCell>
                        <TableCell>Subunit name</TableCell>
                        <TableCell>Trainer Comment</TableCell>
                        <TableCell align='center'>Gap</TableCell>
                        <TableCell align='center'>Trainer's Map</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {units?.subUnit?.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell align='center'>
                            <Checkbox
                              checked={row?.learnerMap || false}
                              onChange={() => learnerMapHandler(row)}
                              disabled={isEditMode}
                            />
                          </TableCell>
                          <TableCell>{row?.subTitle}</TableCell>
                          <TableCell>
                            {roles.includes('Learner') ? (
                              row?.comment
                            ) : (
                              <TextField
                                size='small'
                                value={row?.comment || ''}
                                onChange={(e) => commentHandler(e, row.id)}
                              />
                            )}
                          </TableCell>
                          <TableCell align='center'>
                            <div className='border-2 border-gray-500 w-[16px] h-[16px] p-[1px]'>
                              <div
                                style={{
                                  backgroundColor:
                                    row.learnerMap && row.trainerMap
                                      ? 'green'
                                      : row.learnerMap || row.trainerMap
                                      ? 'orange'
                                      : 'maroon',
                                  width: '100%',
                                  height: '100%',
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell align='center'>
                            <Checkbox
                              checked={row?.trainerMap || false}
                              disabled={roles.includes('Learner') || isEditMode}
                              onChange={() => trainerMapHandler(row)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {errors?.units?.[unitIndex]?.subUnit?.message && (
                  <FormHelperText error>
                    {errors.units[unitIndex].subUnit.message}
                  </FormHelperText>
                )}
              </Box>
            ))}
          </Grid>
          <Grid item xs={12}>
            <Controller
              name='declaration'
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      color='primary'
                      disabled={isEditMode}
                    />
                  }
                  label={
                    <Typography variant='body1'>
                      Please tick to confirm.
                      <br />I declare that all material in this submission is my
                      own work except where there is clear acknowledgement and
                      appropriate reference to the work of others.
                    </Typography>
                  }
                />
              )}
            />
            {errors.declaration && (
              <FormHelperText error>
                {errors.declaration.message}
              </FormHelperText>
            )}
          </Grid>
          <Grid item xs={12} className='w-full flex justify-end gap-10'>
            <Button
              variant='contained'
              color='secondary'
              className='rounded-md'
              disabled={isUpdateLoading}
              onClick={() => navigate('/evidenceLibrary')}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              color='primary'
              className='rounded-md'
              type='submit'
              disabled={isUpdateLoading || isEditMode}
            >
              {isUpdateLoading ? (
                <span className='flex items-center gap-5'>
                  <CircularProgress size={24} />
                  Updating...
                </span>
              ) : (
                <>Update</>
              )}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  )
}

export default CreateViewEvidenceLibrary
