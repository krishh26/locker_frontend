import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

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
} from '@mui/material'
import { FileUploader } from 'react-drag-drop-files'
import { Controller, useForm } from 'react-hook-form'

import { useGetEvidenceDetailsQuery } from 'app/store/api/evidence-api'

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

const assessmentMethod = [
  { value: 'Obs', title: 'Observations' },
  { value: 'PA', title: 'Practical assessment' },
  { value: 'ET', title: 'Exams and Tests' },
  { value: 'PD', title: 'Professional discussion' },
  { value: 'I', title: 'Interview' },
  { value: 'Q&A', title: 'Question and Answers' },
  { value: 'P', title: 'Project' },
  { value: 'RA', title: 'Reflective Account' },
  { value: 'WT', title: 'Witness Testimony' },
  { value: 'PE', title: 'Product Evidence' },
  { value: 'SI', title: 'Simulation' },
  { value: 'OT', title: 'Other' },
  { value: 'RPL', title: 'Recognized prior learning' },
]

const sessions = [
  {
    id: 'session1',
    label: '9 June 2025, 9:00 AM - 11:00 AM',
  },
  {
    id: 'session2',
    label: '10 June 2025, 2:00 PM - 4:00 PM',
  },
  {
    id: 'session3',
    label: '12 June 2025, 1:00 PM - 3:00 PM',
  },
]

const CreateViewEvidenceLibrary = () => {
  const navigate = useNavigate()
  const { id } = useParams()
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

  // const evidenceData = useSelector((state: { evidence }) => state.evidence)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({})

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

  useEffect(() => {
    if (!id) return navigate('/evidenceLibrary') // Redirect if no ID is provided
  }, [id])

  useEffect(() => {
    if (!isLoading && isError) {
      navigate('/evidenceLibrary') // Redirect if there's an error
      return
    }

    if (evidenceDetails) {
      console.log('🚀 ~ useEffect ~ evidenceDetails:', evidenceDetails)
      const { course_id, created_at, file, user } = evidenceDetails.data
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

  return (
    <Container sx={{ mt: 8, mb: 4 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Evidence Details
      </Typography>
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
                name='title'
                size='small'
                placeholder={'Enter Name'}
                fullWidth
                error={!!errors.title}
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
            name='title'
            control={control}
            render={({ field }) => (
              <TextField
                name='title'
                size='small'
                fullWidth
                multiline
                rows={4}
                error={!!errors.title}
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
            name='title'
            control={control}
            render={({ field }) => (
              <TextField
                name='title'
                size='small'
                multiline
                rows={4}
                fullWidth
                disabled={!evidenceData.user.roles.includes('Trainer')}
                style={
                  !evidenceData.user.roles.includes('Trainer')
                    ? { backgroundColor: 'whitesmoke' }
                    : {}
                }
                error={!!errors.title}
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
            name='title'
            control={control}
            render={({ field }) => (
              <TextField
                name='title'
                size='small'
                fullWidth
                multiline
                rows={4}
                error={!!errors.title}
                disabled={!evidenceData.user.roles.includes('Trainer')}
                style={
                  !evidenceData.user.roles.includes('Trainer')
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
                disabled={!evidenceData.user.roles.includes('Trainer')}
              >
                <div
                  className={`relative border border-dashed border-gray-300 p-20 cursor-pointer rounded-md hover:shadow-md transition-all h-[100px] flex flex-col items-center justify-center ${
                    errors.file ? 'border-red-500' : ''
                  }`}
                  style={
                    !evidenceData.user.roles.includes('Trainer')
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
              {/* {errors.file.message} */}
            </FormHelperText>
          )}
        </Grid>
        <Grid item xs={12}>
          <Typography variant='body1' gutterBottom>
            Learner Comments
          </Typography>
          <Controller
            name='title'
            control={control}
            render={({ field }) => (
              <TextField
                name='title'
                size='small'
                fullWidth
                multiline
                rows={4}
                error={!!errors.title}
                {...field}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant='body1' gutterBottom>
            Evidence Method
          </Typography>

          <FormGroup className='flex flex-row'>
            {assessmentMethod.map((method) => (
              <Tooltip key={method.value} title={method.title}>
                <FormControlLabel
                  control={<Checkbox name='assessment_method' />}
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
            rules={{ required: 'This field is required' }}
            render={({ field }) => (
              <FormControl component='fieldset' error={!!errors.doYouLike}>
                <RadioGroup row {...field}>
                  <FormControlLabel
                    value='yes'
                    control={<Radio />}
                    label='Yes'
                  />
                  <FormControlLabel
                    value='no'
                    control={<Radio />}
                    label='No'
                    defaultChecked
                  />
                </RadioGroup>
                {errors.doYouLike && <FormHelperText></FormHelperText>}
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
                  {...field}
                >
                  {sessions.map((session) => (
                    <MenuItem key={session.id} value={session.id}>
                      {session.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.session && <FormHelperText></FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant='body1' gutterBottom>
            Grade
          </Typography>
          <Controller
            name='title'
            control={control}
            render={({ field }) => (
              <TextField
                name='title'
                size='small'
                fullWidth
                error={!!errors.title}
                {...field}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant='body1' gutterBottom>
            Select Unit
          </Typography>
          {evidenceData?.units?.map((units) => {
            return (
              <Box key={units.id} className='flex flex-col gap-2'>
                <Typography variant='h5'>{units.title}</Typography>
                <TableContainer>
                  <Table
                    sx={{ minWidth: 650 }}
                    aria-label='simple table'
                    size='small'
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: 130 }} align='center'>
                          Learner's Map
                        </TableCell>
                        <TableCell style={{ width: 400 }}>
                          Subunit name
                        </TableCell>
                        <TableCell style={{ width: 400 }}>
                          Trainer Comment
                        </TableCell>
                        <TableCell align='left' style={{ width: 1 }}>
                          Gap
                        </TableCell>
                        <TableCell style={{ width: 130 }} align='center'>
                          Trainer's Map
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {units?.subUnit?.map((row) => (
                        <TableRow
                          key={row.id}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}
                        >
                          <TableCell align='center'>
                            <Checkbox checked={row.learnerMap} />
                          </TableCell>
                          <TableCell>{row?.subTitle}</TableCell>
                          <TableCell>
                            {evidenceData.user.roles.includes('Learner') ? (
                              row?.comment
                            ) : (
                              <TextField size='small' value={row?.comment} />
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
                              ></div>
                            </div>
                          </TableCell>
                          <TableCell align='center'>
                            <Checkbox
                              checked={row?.trainerMap}
                              disabled={evidenceData.user.roles.includes(
                                'Learner'
                              )}
                              // onChange={() => trainerMapHandler(row)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )
          })}
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Checkbox name='declaration' />}
            label={
              <Typography variant='body1'>
                Please tick to confirm.
                <br /> I declare that all material in this submission is my own
                work except where there is clear acknowledgement and appropriate
                reference to the work of others.
              </Typography>
            }
          />
        </Grid>
        <Grid  item xs={12} className='w-full flex justify-end gap-10'>
          <Button variant='contained' color='secondary' className='rounded-md'>
            Cancel
          </Button>
          <Button variant='contained' color='primary' className='rounded-md'>
            Update
          </Button>
        </Grid>
      </Grid>
    </Container>
  )
}

export default CreateViewEvidenceLibrary
