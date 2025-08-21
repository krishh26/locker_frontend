import {
  Autocomplete,
  Box,
  Card,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Grid,
  ListSubheader,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Close'
import {
  getLearnerDetails,
  selectLearnerManagement,
  updateLearnerAPI,
} from 'app/store/learnerManagement'
import { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from 'src/app/component/Buttons'
import UploadPhoto from './uploadPhoto'
import UpdatePassword from './updatePassword'
import { passwordReg } from 'src/app/contanst/regValidation'
import {
  resetPasswordMail,
  updatePasswordHandler,
} from 'app/store/userManagement'
import { selectGlobalUser } from 'app/store/globalUser'

export const sampleFundingBands = [
  {
    id: 1,
    band_name: 'Beginner Funding',
    amount: 1200,
    course: {
      course_id: 'C101',
      course_name: 'Introduction to Web Development',
      course_code: 'WD101',
      level: '1',
      total_credits: 15,
    },
  },
  {
    id: 2,
    band_name: 'Intermediate Funding',
    amount: 2500,
    course: {
      course_id: 'C102',
      course_name: 'Frontend Development with React',
      course_code: 'FR201',
      level: '2',
      total_credits: 20,
    },
  },
  {
    id: 3,
    band_name: 'Advanced Funding',
    amount: 3500,
    course: {
      course_id: 'C103',
      course_name: 'Full Stack Development',
      course_code: 'FS301',
      level: '3',
      total_credits: 30,
    },
  },
  {
    id: 4,
    band_name: 'Special Funding',
    amount: 1800,
    course: {
      course_id: 'C104',
      course_name: 'Database Design & Management',
      course_code: 'DB202',
      level: '2',
      total_credits: 18,
    },
  },
]

const LearnerDetails = () => {
  //   const { data, isLoading } = useGetFundingBandsQuery(null)
  //   const [updateFundingBand, { isLoading: isUpdating }] =
  //     useUpdateFundingBandMutation()
  const isLoading = false
  const isUpdating = false
  const [fundingBands, setFundingBands] = useState<any[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editedAmount, setEditedAmount] = useState<string>('')

  const { learner_id } = useSelector(selectGlobalUser).selectedUser

  const [isChecked, setIsChecked] = useState(false)
  const dispatch: any = useDispatch()
  const { employer, learner } = useSelector(selectLearnerManagement)
  const globalUser = useSelector(selectGlobalUser)

  const navigate = useNavigate()

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked)
  }

  useEffect(() => {
    dispatch(getLearnerDetails(learner_id))
  }, [learner_id])

  // ✅ Sync API data to local state
  useEffect(() => {
    if (
      learner?.available_funding_bands &&
      learner?.available_funding_bands?.length > 0
    ) {
      setFundingBands(learner?.available_funding_bands)
    }
  }, [learner])

  const [learnerData, setLearnerData] = useState({
    uln: learner?.uln || '',
    mis_learner_id: learner?.mis_learner_id || '',
    student_id: learner?.student_id || '',
    first_name: learner?.first_name || '',
    last_name: learner?.last_name || '',
    user_name: learner?.user_name || '',
    email: learner?.email || '',
    telephone: learner?.telephone || '',
    mobile: learner?.mobile || '',
    dob: learner?.dob || '',
    gender: learner?.gender || '',
    national_ins_no: learner?.national_ins_no || '',
    ethnicity: learner?.ethnicity || '',
    learner_disability: learner?.learner_disability || '',
    learner_difficulity: learner?.learner_difficulity || '',
    Initial_Assessment_Numeracy: learner?.Initial_Assessment_Numeracy || '',
    Initial_Assessment_Literacy: learner?.Initial_Assessment_Literacy || '',
    Initial_Assessment_ICT: learner?.Initial_Assessment_ICT || '',
    functional_skills: learner?.functional_skills || '',
    technical_certificate: learner?.technical_certificate || '',
    err: learner?.err || '',
    street: learner?.street || '',
    suburb: learner?.suburb || '',
    town: learner?.town || '',
    country: learner?.country || '',
    home_postcode: learner?.home_postcode || '',
    country_of_domicile: learner?.country_of_domicile || '',
    external_data_code: learner?.external_data_code || '',
    employer_id: learner?.employer_id || null,
    cost_centre: learner?.cost_centre || '',
    job_title: learner?.job_title || '',
    location: learner?.location || '',
    manager_name: learner?.manager_name || '',
    manager_job_title: learner?.manager_job_title || '',
    mentor: learner?.mentor || '',
    funding_contractor: learner?.funding_contractor || '',
    partner: learner?.partner || '',
    area: learner?.area || '',
    sub_area: learner?.sub_area || '',
    shift: learner?.shift || '',
    cohort: learner?.cohort || '',
    lsf: learner?.lsf || '',
    curriculum_area: learner?.curriculum_area || '',
    ssa1: learner?.ssa1 || '',
    ssa2: learner?.ssa2 || '',
    director_of_curriculum: learner?.director_of_curriculum || '',
    wage: learner?.wage || '',
    wage_type: learner?.wage_type || '',
    allow_archived_access: learner?.allow_archived_access || '',
    branding_type: learner?.branding_type || '',
    learner_type: learner?.learner_type || '',
    funding_body: learner?.funding_body || '',
    expected_off_the_job_hours: learner?.expected_off_the_job_hours || '',
  })

  useEffect(() => {
    setLearnerData({
      uln: learner?.uln || '',
      mis_learner_id: learner?.mis_learner_id || '',
      student_id: learner?.student_id || '',
      first_name: learner?.first_name || '',
      last_name: learner?.last_name || '',
      user_name: learner?.user_name || '',
      email: learner?.email || '',
      telephone: learner?.telephone || '',
      mobile: learner?.mobile || '',
      dob: learner?.dob || '',
      gender: learner?.gender || '',
      national_ins_no: learner?.national_ins_no || '',
      ethnicity: learner?.ethnicity || '',
      learner_disability: learner?.learner_disability || '',
      learner_difficulity: learner?.learner_difficulity || '',
      Initial_Assessment_Numeracy: learner?.Initial_Assessment_Numeracy || '',
      Initial_Assessment_Literacy: learner?.Initial_Assessment_Literacy || '',
      Initial_Assessment_ICT: learner?.Initial_Assessment_ICT || '',
      functional_skills: learner?.functional_skills || '',
      technical_certificate: learner?.technical_certificate || '',
      err: learner?.err || '',
      street: learner?.street || '',
      suburb: learner?.suburb || '',
      town: learner?.town || '',
      country: learner?.country || '',
      home_postcode: learner?.home_postcode || '',
      country_of_domicile: learner?.country_of_domicile || '',
      external_data_code: learner?.external_data_code || '',
      employer_id: learner?.employer_id || null,
      cost_centre: learner?.cost_centre || '',
      job_title: learner?.job_title || '',
      location: learner?.location || '',
      manager_name: learner?.manager_name || '',
      manager_job_title: learner?.manager_job_title || '',
      mentor: learner?.mentor || '',
      funding_contractor: learner?.funding_contractor || '',
      partner: learner?.partner || '',
      area: learner?.area || '',
      sub_area: learner?.sub_area || '',
      shift: learner?.shift || '',
      cohort: learner?.cohort || '',
      lsf: learner?.lsf || '',
      curriculum_area: learner?.curriculum_area || '',
      ssa1: learner?.ssa1 || '',
      ssa2: learner?.ssa2 || '',
      director_of_curriculum: learner?.director_of_curriculum || '',
      wage: learner?.wage || '',
      wage_type: learner?.wage_type || '',
      allow_archived_access: learner?.allow_archived_access || '',
      branding_type: learner?.branding_type || '',
      learner_type: learner?.learner_type || '',
      funding_body: learner?.funding_body || '',
      expected_off_the_job_hours: learner?.expected_off_the_job_hours || '',
    })
  }, [learner])

  const handleDataUpdate = (e) => {
    const { name, value } = e.target
    setLearnerData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    try {
      let response
      response = await dispatch(updateLearnerAPI(learner_id, learnerData))

      if (response) {
        navigate('/home')
      }
    } catch (error) {
      console.error('Error updated data:', error)
    }
    console.log(learnerData)
  }

  const handleClose = () => {
    navigate('/home')
  }

  const formatDate = (date) => {
    if (!date) return ''
    const formattedDate = date.substr(0, 10)
    return formattedDate
  }

  const [dialogType, setDialogType] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState({
    password: '',
    confirmPassword: '',
  })

  const handleClickOpen = () => {
    setDialogType(true)
  }

  const handleCloseDialog = () => {
    setDialogType(false)
    setNewPassword({
      password: '',
      confirmPassword: '',
    })
  }

  const passwordHandler = (e) => {
    setNewPassword((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const resetHandler = async () => {
    if (
      newPassword.password === newPassword.confirmPassword &&
      passwordReg.test(newPassword.password)
    ) {
      setLoading(true)
      await dispatch(
        updatePasswordHandler({
          email: globalUser.selectedUser.email,
          password: newPassword.password,
        })
      )
      setLoading(false)
    }
    handleCloseDialog()
  }

  const handleEmailAlert = async () => {
    const confirmed = confirm(
      `Are you sure you wish to reset the password?\nAn email will be sent to ${globalUser.selectedUser.email} with reset instructions.`
    )

    if (confirmed) {
      try {
        await dispatch(
          resetPasswordMail({ email: globalUser.selectedUser.email })
        )
      } catch (error) {
        console.error('Error sending reset email:', error)
      }
    }
  }

  const handleCreateEmployer = async () => {
    navigate('/admin/employer')
  }

  const handleEditClick = (band: any) => {
    setEditingId(band.id)
    setEditedAmount(band.amount.toString())
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditedAmount('')
  }

  const handleSave = async (band: any) => {
    const newAmount = Number(editedAmount)

    // Optimistically update local state
    setFundingBands((prev) =>
      prev.map((b) => (b.id === band.id ? { ...b, amount: newAmount } : b))
    )

    setEditingId(null)
    setEditedAmount('')

    try {
      //   await updateFundingBand({
      //     id: band.id,
      //     course_id: band.course.course_id,
      //     band_name: band.band_name,
      //     amount: newAmount,
      //   }).unwrap()
    } catch (err) {
      console.error('Error updating amount', err)
      // rollback if failed
      //   setFundingBands(data?.data || [])
    }
  }

  // ✅ Total Funding (live updates)
  const totalFunding = useMemo(() => {
    return fundingBands.reduce((sum: number, band: any) => {
      if (editingId === band.id) {
        // while typing, use editedAmount
        return sum + Number(editedAmount || 0)
      }
      return sum + Number(band.amount || 0)
    }, 0)
  }, [fundingBands, editedAmount, editingId])

  return (
    <div>
      <div className='flex p-5'>
        <Grid className='w-full'>
          <Grid className='my-20 mx-20 flex flex-col gap-20'>
            <div className='flex gap-5 items-center justify-start'>
              <SecondaryButtonOutlined
                className='bg-[#46c2c5] !text-white hover:bg-[#37a1a3]'
                name='Create New Password'
                onClick={handleClickOpen}
              />
              <SecondaryButtonOutlined
                className='bg-[#46c2c5] !text-white hover:bg-[#37a1a3]'
                name='Email Password Reset'
                onClick={handleEmailAlert}
              />
              <SecondaryButtonOutlined
                className='bg-[#46c2c5] !text-white hover:bg-[#37a1a3]'
                name='Create Employer'
                onClick={handleCreateEmployer}
              />
            </div>
            <Card className='rounded-6 items-center ' variant='outlined'>
              <Grid className='h-full flex flex-col'>
                <Box>
                  <Grid xs={12} className='p-10 border-b-2 bg-[#007E84]'>
                    <Typography className='font-600 text-white'>
                      Student ID
                    </Typography>
                  </Grid>
                  <Box className='m-12 flex flex-row justify-between gap-20'>
                    <Grid className='w-1/2 flex flex-col gap-20'>
                      <Grid className=''>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          ULN
                        </Typography>
                        <TextField
                          name='uln'
                          value={learnerData?.uln}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                      <Grid className=''>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          MIS Learner ID
                        </Typography>
                        <TextField
                          name='mis_learner_id'
                          value={learnerData?.mis_learner_id}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                      <Grid className=''>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Student ID
                        </Typography>
                        <TextField
                          name='student_id'
                          value={learnerData?.student_id}
                          size='small'
                          fullWidth
                          placeholder='Internal Student Number'
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                    </Grid>
                    <Grid className='w-1/2 flex justify-center items-center'>
                      {/* <div className='w-96'> */}
                      <UploadPhoto />
                      {/* </div> */}
                    </Grid>
                  </Box>
                </Box>
              </Grid>
            </Card>

            <Card className='rounded-6 items-center ' variant='outlined'>
              <Grid className='h-full flex flex-col'>
                <Box>
                  <Grid xs={12} className='p-10 border-b-2 bg-[#007E84]'>
                    <Typography className='font-600 text-white'>
                      About You
                    </Typography>
                  </Grid>
                  <Box className='m-12 flex flex-col justify-between gap-12 sm:flex-col'>
                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          First Name*
                        </Typography>
                        <TextField
                          name='first_name'
                          value={learnerData?.first_name}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Surname*
                        </Typography>
                        <TextField
                          name='last_name'
                          value={learnerData?.last_name}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                    </Grid>

                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Also Known As
                        </Typography>
                        <TextField
                          name='user_name'
                          value={learnerData?.user_name}
                          size='small'
                          fullWidth
                          placeholder='User Name'
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Email*
                        </Typography>
                        <TextField
                          name='email'
                          value={learnerData?.email}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                    </Grid>

                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Telephone
                        </Typography>
                        <TextField
                          name='telephone'
                          value={learnerData?.telephone}
                          type='number'
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Mobile
                        </Typography>
                        <TextField
                          name='mobile'
                          value={learnerData?.mobile}
                          type='number'
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                    </Grid>

                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Date of birth
                        </Typography>
                        <TextField
                          name='dob'
                          value={formatDate(learnerData?.dob)}
                          size='small'
                          type='date'
                          fullWidth
                          placeholder='Internal Student Number'
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Gender
                        </Typography>
                        <Select
                          name='gender'
                          // label="Username"
                          value={learnerData?.gender}
                          size='small'
                          placeholder='Please Select'
                          fullWidth
                          onChange={handleDataUpdate}
                          sx={{
                            '.muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon': {
                              color: 'black',
                            },
                          }}
                        >
                          <MenuItem value={'Male'}>Male</MenuItem>
                          <MenuItem value={'Female'}>Female</MenuItem>
                          <MenuItem value={'Non-Binary'}>Non-Binary</MenuItem>
                          <MenuItem value={'Other'}>Other</MenuItem>
                        </Select>
                      </Grid>
                    </Grid>

                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/3'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          National Insurance No
                        </Typography>
                        <TextField
                          name='national_ins_no'
                          value={learnerData?.national_ins_no}
                          type='number'
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>

                      <Grid className='w-1/3'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Ethnicity
                        </Typography>
                        <TextField
                          name='ethnicity'
                          value={learnerData?.ethnicity}
                          type='text'
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>

                      <Grid className='w-1/3'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Learner Disability
                        </Typography>
                        <Select
                          name='learner_disability'
                          // label="Username"
                          value={learnerData?.learner_disability}
                          size='small'
                          placeholder='Please Select'
                          fullWidth
                          onChange={handleDataUpdate}
                          sx={{
                            '.muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon': {
                              color: 'black',
                            },
                          }}
                        >
                          <MenuItem value={'Visual impairment'}>
                            Visual impairment
                          </MenuItem>
                          <MenuItem value={"Asperger's syndrome"}>
                            Asperger's syndrome
                          </MenuItem>
                          <MenuItem value={'Hearing impairment'}>
                            Hearing impairment
                          </MenuItem>
                          <MenuItem value={'Disability affecting mobility'}>
                            Disability affecting mobility
                          </MenuItem>
                          <MenuItem value={'Other physical disability'}>
                            Other physical disability
                          </MenuItem>
                          <MenuItem value={'Other medical condition'}>
                            Other medical condition
                          </MenuItem>
                          <MenuItem value={'Emotional/behavioural'}>
                            Emotional/behavioural
                          </MenuItem>
                          <MenuItem value={'Mental health difficulty'}>
                            Mental health difficulty
                          </MenuItem>
                          <MenuItem
                            value={'Temporary disability after illness'}
                          >
                            Temporary disability after illness
                          </MenuItem>
                          <MenuItem value={'Profound complex disabilities'}>
                            Profound complex disabilities
                          </MenuItem>
                          <MenuItem value={'Multiple disabilities'}>
                            Multiple disabilities
                          </MenuItem>
                          <MenuItem value={'Other'}>Other</MenuItem>
                          <MenuItem value={'No disability'}>
                            No disability
                          </MenuItem>
                          <MenuItem value={'Not known / Not provided'}>
                            Not known / Not provided
                          </MenuItem>
                        </Select>
                      </Grid>
                    </Grid>

                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/3'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Learning Difficulties
                        </Typography>
                        <Select
                          name='learner_difficulity'
                          // label="Username"
                          value={learnerData?.learner_difficulity}
                          size='small'
                          placeholder='Please Select'
                          fullWidth
                          onChange={handleDataUpdate}
                          sx={{
                            '.muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon': {
                              color: 'black',
                            },
                          }}
                        >
                          <ListSubheader className='font-700'>
                            English
                          </ListSubheader>
                          <MenuItem value={'Moderate learning difficulty'}>
                            Moderate learning difficulty
                          </MenuItem>
                          <MenuItem value={'Severe learning difficulty'}>
                            Severe learning difficulty
                          </MenuItem>
                          <MenuItem value={'Dyslexia'}>Dyslexia</MenuItem>
                          <MenuItem value={'Dyscalculia'}>Dyscalculia</MenuItem>
                          <MenuItem
                            value={'Other specific learning difficulty'}
                          >
                            Other specific learning difficulty
                          </MenuItem>
                          <MenuItem value={'Autism spectrum disorder'}>
                            Autism spectrum disorder
                          </MenuItem>
                          <MenuItem value={'Multiple learning difficulties'}>
                            Multiple learning difficulties
                          </MenuItem>
                          <MenuItem value={'Other'}>Other</MenuItem>
                          <MenuItem value={'No learning difficulty'}>
                            No learning difficulty
                          </MenuItem>
                          <MenuItem
                            value={'Not known/information not provided'}
                          >
                            Not known/information not provided
                          </MenuItem>
                          <ListSubheader className='font-700'>
                            Welsh
                          </ListSubheader>
                          <MenuItem value={'Visual impairment'}>
                            Visual impairment
                          </MenuItem>
                          <MenuItem value={'Hearing impairment'}>
                            Hearing impairment
                          </MenuItem>
                          <MenuItem
                            value={'Physical and/or medical difficulties'}
                          >
                            Physical and/or medical difficulties
                          </MenuItem>
                          <MenuItem
                            value={
                              'Behavioural, emotional and social difficulties'
                            }
                          >
                            Behavioural, emotional and social difficulties
                          </MenuItem>
                          <MenuItem value={'Multi-sensory impairment'}>
                            Multi-sensory impairment
                          </MenuItem>
                          <MenuItem value={'Autistic spectrum disorders'}>
                            Autistic spectrum disorders
                          </MenuItem>
                          <MenuItem
                            value={
                              'Speech, language and communication difficulties'
                            }
                          >
                            Speech, language and communication difficulties
                          </MenuItem>
                          <MenuItem value={'Moderate Learning Difficulties'}>
                            Moderate Learning Difficulties
                          </MenuItem>
                          <MenuItem value={'Severe Learning Difficulties'}>
                            Severe Learning Difficulties
                          </MenuItem>
                          <MenuItem
                            value={
                              'Profound and Multiple Learning Difficulties'
                            }
                          >
                            Profound and Multiple Learning Difficulties
                          </MenuItem>
                          <MenuItem value={'SPLD - Dyslexia'}>
                            SPLD - Dyslexia
                          </MenuItem>
                          <MenuItem value={'SPLD Dyscalculia'}>
                            SPLD Dyscalculia
                          </MenuItem>
                          <MenuItem value={'SPLD- Dyspraxia'}>
                            SPLD- Dyspraxia
                          </MenuItem>
                          <MenuItem
                            value={
                              'SPLD - Attention Deficit Hyperactivity Disorder'
                            }
                          >
                            SPLD - Attention Deficit Hyperactivity Disorder
                          </MenuItem>
                          <MenuItem value={'General Learning Difficulties'}>
                            General Learning Difficulties
                          </MenuItem>
                          <MenuItem value={'Does not apply'}>
                            Does not apply
                          </MenuItem>
                        </Select>
                      </Grid>
                      <Grid className='w-1/3'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Initial Assessment Numeracy
                        </Typography>
                        <TextField
                          name='Initial_Assessment_Numeracy'
                          value={learnerData?.Initial_Assessment_Numeracy}
                          type='text'
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>

                      <Grid className='w-1/3'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Initial Assessment Literacy
                        </Typography>
                        <TextField
                          name='Initial_Assessment_Literacy'
                          value={learnerData?.Initial_Assessment_Literacy}
                          type='text'
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>

                      {/* <Grid className='w-1/3'>
                                                <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", fontWeight: "500" }}>Initial Assessment ICT</Typography>
                                                <TextField
                                                    name="Initial_Assessment_ICT"
                                                    value={learnerData?.Initial_Assessment_ICT}
                                                    type='text'
                                                    size="small"
                                                    fullWidth
                                                    onChange={handleDataUpdate}
                                                    className='bg-none '
                                                />
                                            </Grid> */}
                    </Grid>

                    {/* <Grid className='w-full flex flex-row gap-20'>
                                            <Grid className='w-1/3'>
                                                <FormControlLabel
                                                    control={<Checkbox sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", fontWeight: "200" }} />}
                                                    label="Functional Skills"
                                                />
                                                <TextField
                                                    name="functional_skills"
                                                    value={formatDate(learnerData?.functional_skills)}
                                                    type='date'
                                                    size="small"
                                                    fullWidth
                                                    onChange={handleDataUpdate}
                                                    className='bg-none '
                                                />
                                            </Grid>

                                            <Grid className='w-1/3'>
                                                <FormControlLabel
                                                    control={<Checkbox sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", fontWeight: "200" }} />}
                                                    label="Technical Certificate"
                                                />
                                                <TextField
                                                    name="technical_certificate"
                                                    value={formatDate(learnerData?.technical_certificate)}
                                                    type='date'
                                                    size="small"
                                                    fullWidth
                                                    onChange={handleDataUpdate}
                                                    className='bg-none '
                                                />
                                            </Grid>

                                            <Grid className='w-1/3'>
                                                <FormControlLabel
                                                    control={<Checkbox sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", fontWeight: "200" }} />}
                                                    label="ERR"
                                                />
                                                <TextField
                                                    name="err"
                                                    value={formatDate(learnerData?.err)}
                                                    type='date'
                                                    size="small"
                                                    fullWidth
                                                    onChange={handleDataUpdate}
                                                    className='bg-none '
                                                />
                                            </Grid>

                                        </Grid> */}
                  </Box>
                </Box>
              </Grid>
            </Card>

            <Card className='rounded-6 items-center ' variant='outlined'>
              <Grid className='h-full flex flex-col'>
                <Box>
                  <Grid xs={12} className='p-10 border-b-2 bg-[#007E84]'>
                    <Typography className='font-600 text-white'>
                      Address
                    </Typography>
                  </Grid>
                  <Box className='m-12 flex flex-col justify-between gap-12 sm:flex-col'>
                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          House No/Name and Street
                        </Typography>
                        <TextField
                          name='street'
                          value={learnerData?.street}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Suburb/Village
                        </Typography>
                        <TextField
                          name='suburb'
                          value={learnerData?.suburb}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                    </Grid>
                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Town/City
                        </Typography>
                        <TextField
                          name='town'
                          value={learnerData?.town}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          County
                        </Typography>
                        <TextField
                          name='country'
                          value={learnerData?.country}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                    </Grid>

                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Home Postcode
                        </Typography>
                        <TextField
                          name='home_postcode'
                          value={learnerData?.home_postcode}
                          type='number'
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>

                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Country of Domicile
                        </Typography>
                        <Select
                          name='country_of_domicile'
                          // label="Username"
                          value={learnerData?.country_of_domicile}
                          size='small'
                          placeholder='Please Select'
                          fullWidth
                          onChange={handleDataUpdate}
                          sx={{
                            '.muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon': {
                              color: 'black',
                            },
                          }}
                        >
                          <MenuItem value={'XF - England'}>
                            XF - England
                          </MenuItem>
                          <MenuItem value={'XG Northern Ireland'}>
                            XG Northern Ireland
                          </MenuItem>
                          <MenuItem value={'XH Scotland'}>XH Scotland</MenuItem>
                          <MenuItem value={'XI - Wales'}>XI - Wales</MenuItem>
                          <MenuItem value={'XK Channel Islands'}>
                            XK Channel Islands
                          </MenuItem>
                          <MenuItem value={'IM Isle of Man'}>
                            IM Isle of Man
                          </MenuItem>
                          <MenuItem value={'GB United Kingdom'}>
                            GB United Kingdom
                          </MenuItem>
                          <MenuItem value={'AU Australia'}>
                            AU Australia
                          </MenuItem>
                        </Select>
                      </Grid>

                      {/* <Grid className='w-1/3'>
                                                <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", fontWeight: "500" }}>External Data Code</Typography>
                                                <TextField
                                                    name="external_data_code"
                                                    value={learnerData?.external_data_code}
                                                    type='text'
                                                    size="small"
                                                    fullWidth
                                                    onChange={handleDataUpdate}
                                                    className='bg-none '
                                                />
                                            </Grid> */}
                    </Grid>
                  </Box>
                </Box>
              </Grid>
            </Card>

            <Card className='rounded-6 items-center ' variant='outlined'>
              <Grid className='h-full flex flex-col'>
                <Box>
                  <Grid xs={12} className='p-10 border-b-2 bg-[#007E84]'>
                    <Typography className='font-600 text-white'>
                      Employer
                    </Typography>
                  </Grid>
                  <Box className='m-12 flex flex-col justify-between gap-12 sm:flex-col'>
                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Employer*
                        </Typography>
                        <Autocomplete
                          disableClearable
                          fullWidth
                          size='small'
                          options={employer}
                          getOptionLabel={(option: any) =>
                            option.employer?.employer_name
                          }
                          value={
                            employer.find(
                              (emp) =>
                                emp.employer.employer_id ===
                                learnerData.employer_id
                            ) || null
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder='Select Employer'
                              name='role'
                            />
                          )}
                          onChange={(event, value) => {
                            setLearnerData((prevData) => ({
                              ...prevData,
                              employer_id: value?.employer?.employer_id || null,
                            }))
                          }}
                          sx={{
                            '.MuiAutocomplete-clearIndicator': {
                              color: '#5B718F',
                            },
                          }}
                          PaperComponent={({ children }) => (
                            <Paper style={{ borderRadius: '4px' }}>
                              {children}
                            </Paper>
                          )}
                        />
                      </Grid>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Branch Name
                        </Typography>
                        <TextField
                          name='cost_centre'
                          value={learnerData?.cost_centre}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                    </Grid>

                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Job Title
                        </Typography>
                        <TextField
                          name='job_title'
                          value={learnerData?.job_title}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Post Code
                        </Typography>
                        <TextField
                          name='location'
                          value={learnerData?.location}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                    </Grid>

                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Manager Name
                        </Typography>
                        <TextField
                          name='manager_name'
                          value={learnerData?.manager_name}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Manager Job Title
                        </Typography>
                        <TextField
                          name='manager_job_title'
                          value={learnerData?.manager_job_title}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                    </Grid>

                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Mentor
                        </Typography>
                        <TextField
                          name='mentor'
                          value={learnerData?.mentor}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Funding Contractor
                        </Typography>
                        <TextField
                          name='funding_contractor'
                          value={learnerData?.funding_contractor}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                    </Grid>

                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Partner
                        </Typography>
                        <TextField
                          name='partner'
                          value={learnerData?.partner}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Sub Area
                        </Typography>
                        <TextField
                          name='sub_area'
                          value={learnerData?.sub_area}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                      {/* <Grid className='w-1/2'>
                                                <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", fontWeight: "500" }}>Area</Typography>
                                                <TextField
                                                    name="area"
                                                    value={learnerData?.area}
                                                    size="small"
                                                    fullWidth
                                                    onChange={handleDataUpdate}
                                                    className='bg-none '
                                                />
                                            </Grid> */}
                    </Grid>

                    {/* <Grid className='w-full flex flex-row gap-20'>

                                            <Grid className='w-1/2'>
                                                <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", fontWeight: "500" }}>Shift</Typography>
                                                <TextField
                                                    name="shift"
                                                    value={learnerData?.shift}
                                                    size="small"
                                                    fullWidth
                                                    onChange={handleDataUpdate}
                                                    className='bg-none '
                                                />
                                            </Grid>
                                        </Grid> */}

                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Cohort
                        </Typography>
                        <TextField
                          name='cohort'
                          value={learnerData?.cohort}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                      {/* <Grid className='w-1/2'>
                                                <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", fontWeight: "500" }}>LSF</Typography>
                                                <TextField
                                                    name="lsf"
                                                    value={learnerData?.lsf}
                                                    size="small"
                                                    fullWidth
                                                    onChange={handleDataUpdate}
                                                    className='bg-none '
                                                />
                                            </Grid> */}
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Curriculum Area
                        </Typography>
                        <TextField
                          name='curriculum_area'
                          value={learnerData?.curriculum_area}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                    </Grid>

                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          SSA1
                        </Typography>
                        <TextField
                          name='ssa1'
                          value={learnerData?.ssa1}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          SSA2
                        </Typography>
                        <TextField
                          name='ssa2'
                          value={learnerData?.ssa2}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                    </Grid>

                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Director of Curriculum
                        </Typography>
                        <TextField
                          name='director_of_curriculum'
                          value={learnerData?.director_of_curriculum}
                          size='small'
                          fullWidth
                          onChange={handleDataUpdate}
                          className='bg-none '
                        />
                      </Grid>
                      <Grid className='w-1/2'></Grid>
                    </Grid>

                    {/* <Grid className='w-full flex flex-row gap-20'>
                                            <Grid className='w-1/2'>
                                                <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", fontWeight: "500" }}>Wage(£)</Typography>
                                                <TextField
                                                    name="wage"
                                                    value={learnerData?.wage}
                                                    size="small"
                                                    fullWidth
                                                    onChange={handleDataUpdate}
                                                    className='bg-none '
                                                />
                                            </Grid>
                                            <Grid className='w-1/2'>
                                                <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", fontWeight: "500" }}>Wage Type</Typography>
                                                <Select
                                                    name="wage_type"
                                                    // label="Username"
                                                    value={learnerData?.wage_type}
                                                    size="small"
                                                    placeholder='Please Select'
                                                    fullWidth
                                                    onChange={handleDataUpdate}
                                                    sx={{ ".muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon": { color: "black" } }}
                                                >
                                                    <MenuItem value={"Per Hour"}>Per Hour</MenuItem>
                                                    <MenuItem value={"Per Annum"}>Per Annum</MenuItem>
                                                </Select>
                                            </Grid>
                                        </Grid> */}
                  </Box>
                </Box>
              </Grid>
            </Card>

            <Card className='rounded-6 items-center ' variant='outlined'>
              <Grid className='h-full flex flex-col'>
                <Box>
                  <Grid
                    xs={12}
                    className='p-10 border-b-2 bg-[#007E84] flex justify-between items-center'
                  >
                    <Typography className='font-600 text-white'>
                      Funding Body
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                      }}
                    >
                      <Typography className='font-600 text-white'>
                        User Archived{' '}
                      </Typography>
                      <Checkbox
                        sx={{
                          marginLeft: '8px',
                          color: 'white',
                          '&.Mui-checked': {
                            color: 'white', // checked color
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                  <Box className='m-12 flex flex-col justify-between gap-12 sm:flex-col'>
                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Allow Archived Access
                        </Typography>
                        <Select
                          name='allow_archived_access'
                          // label="Username"
                          value={learnerData?.allow_archived_access}
                          size='small'
                          placeholder='Please Select'
                          fullWidth
                          onChange={handleDataUpdate}
                          sx={{
                            '.muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon': {
                              color: 'black',
                            },
                          }}
                        >
                          <MenuItem value={true as any}>Yes</MenuItem>
                          <MenuItem value={false as any}>No</MenuItem>
                        </Select>
                      </Grid>
                      {/* <Grid className='w-1/2'>
                                                <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", fontWeight: "500" }}>Branding Type:</Typography>
                                                <Select
                                                    name="branding_type"
                                                    // label="Username"
                                                    value={learnerData?.branding_type}
                                                    size="small"
                                                    placeholder='Please Select'
                                                    fullWidth
                                                    onChange={handleDataUpdate}
                                                    sx={{ ".muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon": { color: "black" } }}
                                                >
                                                    <MenuItem value={""}>Select Branding Type</MenuItem>
                                                </Select>
                                            </Grid> */}
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Learner Type
                        </Typography>
                        <Select
                          name='learner_type'
                          // label="Username"
                          value={learnerData?.learner_type}
                          size='small'
                          placeholder='Please Select'
                          fullWidth
                          onChange={handleDataUpdate}
                          sx={{
                            '.muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon': {
                              color: 'black',
                            },
                          }}
                        >
                          <MenuItem value={'Apprentice'}>Apprentice</MenuItem>
                          <MenuItem value={'Commercial'}>Commercial</MenuItem>
                          <MenuItem value={'Learner'}>Learner</MenuItem>
                        </Select>
                      </Grid>
                    </Grid>

                    <Grid className='w-full flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Funding Body
                        </Typography>
                        <Select
                          name='funding_body'
                          // label="Username"
                          value={learnerData?.funding_body}
                          size='small'
                          placeholder='Please Select'
                          fullWidth
                          onChange={handleDataUpdate}
                          sx={{
                            '.muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon': {
                              color: 'black',
                            },
                          }}
                        >
                          <MenuItem value={'Advanced Learning Loan'}>
                            Advanced Learning Loan
                          </MenuItem>
                          <MenuItem value={'Bursary'}>Bursary</MenuItem>
                          <MenuItem value={'Commercial'}>Commercial</MenuItem>
                          <MenuItem value={'Community Learning'}>
                            Community Learning
                          </MenuItem>
                          <MenuItem value={'EFA'}>Select</MenuItem>
                          <MenuItem value={'Employer'}>Employer</MenuItem>
                          <MenuItem value={'ESF'}>ESF</MenuItem>
                          <MenuItem value={'ESF'}>ESF</MenuItem>
                          <MenuItem value={'ESFA'}>ESFA</MenuItem>
                          <MenuItem value={'Fee Waiver'}>Fee Waiver</MenuItem>
                          <MenuItem value={'FWDF'}>FWDF</MenuItem>
                          <MenuItem value={'ITA'}>ITA</MenuItem>
                          <MenuItem value={'Levy'}>Levy</MenuItem>
                          <MenuItem value={'MA Fully Funded'}>
                            MA Fully Funded
                          </MenuItem>
                          <MenuItem value={'MA-Employer'}>MA-Employer</MenuItem>
                          <MenuItem value={'Non-Levy'}>Non-Levy</MenuItem>
                          <MenuItem value={'Other'}>Other</MenuItem>
                          <MenuItem value={'SAAS'}>SAAS</MenuItem>
                          <MenuItem value={'SAAS-Employer'}>
                            SAAS-Employer
                          </MenuItem>
                          <MenuItem value={'SAAS-Self'}>SAAS-Self</MenuItem>
                          <MenuItem value={'SDS'}>SDS</MenuItem>
                          <MenuItem value={'Self'}>Self</MenuItem>
                          <MenuItem value={'SFA'}>SFA</MenuItem>
                          <MenuItem value={'Student Loan'}>
                            Student Loan
                          </MenuItem>
                        </Select>
                      </Grid>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Expected off the Job hours
                        </Typography>
                        <TextField
                          name='expected_off_the_job_hours'
                          value={learnerData?.expected_off_the_job_hours}
                          size='small'
                          type='number'
                          fullWidth
                          onChange={handleDataUpdate}
                          disabled={!isChecked}
                          sx={{
                            backgroundColor: !isChecked ? '#f0f0f0' : 'inherit',
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Grid className='w-yfull flex flex-row gap-20'>
                      <Grid className='w-1/2'>
                        <Typography
                          sx={{
                            fontSize: '0.9vw',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          Use specified Off the Job hours
                        </Typography>
                        <Checkbox
                          className='p-0'
                          checked={isChecked}
                          onChange={handleCheckboxChange}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Grid>
            </Card>

            <Card className='rounded-6 items-center' variant='outlined'>
              <Grid className='h-full flex flex-col'>
                {/* Header */}
                <Grid
                  xs={12}
                  className='p-10 border-b-2 bg-[#007E84] flex justify-between items-center'
                >
                  <Typography className='font-600 text-white'>
                    Funding Bands
                  </Typography>
                </Grid>

                {/* Content */}
                <Box className='m-12 flex flex-col gap-12'>
                  {isLoading ? (
                    <Box display='flex' justifyContent='center' mt={2}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    fundingBands.map((band: any) => (
                      <Box
                        key={band.id}
                        className='flex justify-between items-center p-4 border rounded-lg shadow-sm'
                      >
                        <Box>
                          <Typography className='font-500'>
                            {band.course.course_name} (Level {band.course.level}
                            )
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Code: {band.course.course_code} 
                          </Typography>
                        </Box>

                        {/* Inline Amount Editing */}
                        <Box className='flex items-center gap-2'>
                          {editingId === band.id ? (
                            <>
                              <TextField
                                size='small'
                                type='number'
                                value={editedAmount}
                                onChange={(e) =>
                                  setEditedAmount(e.target.value)
                                }
                              />
                              <IconButton
                                color='primary'
                                onClick={() => handleSave(band)}
                                disabled={isUpdating}
                              >
                                {isUpdating ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <SaveIcon />
                                )}
                              </IconButton>
                              <IconButton color='error' onClick={handleCancel}>
                                <CancelIcon />
                              </IconButton>
                            </>
                          ) : (
                            <>
                              <Typography className='font-600 text-lg'>
                                £{band.amount}
                              </Typography>
                              {/* <IconButton
                                color='primary'
                                onClick={() => handleEditClick(band)}
                              >
                                <EditIcon />
                              </IconButton> */}
                            </>
                          )}
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>

                {/* ✅ Total Funding Footer (updates live while typing) */}
                <Box className='p-6 border-t-2 bg-gray-50 flex justify-between items-center'>
                  <Typography className='font-600'>Total Funding</Typography>
                  <Typography className='font-700 text-lg text-[#007E84]'>
                    £{totalFunding}
                  </Typography>
                </Box>
              </Grid>
            </Card>

            <div className='flex justify-end mr-24 mb-20'>
              <SecondaryButton
                className='bg-green-500 hover:bg-green-600'
                name='Save'
                onClick={handleSubmit}
              />
            </div>
          </Grid>
        </Grid>
      </div>

      <Dialog
        open={dialogType}
        onClose={handleCloseDialog}
        sx={{
          '.MuiDialog-paper': {
            borderRadius: '4px',
            width: '100%',
          },
        }}
      >
        <DialogContent className='p-0'>
          <UpdatePassword
            passwordHandler={passwordHandler}
            newPassword={newPassword}
          />
        </DialogContent>
        <DialogActions className='mb-4 mr-6'>
          {loading ? (
            <LoadingButton />
          ) : (
            <>
              <SecondaryButtonOutlined
                onClick={handleCloseDialog}
                name='Cancel'
              />
              <SecondaryButton
                name='Reset'
                onClick={resetHandler}
                disable={
                  newPassword.password !== newPassword.confirmPassword ||
                  !passwordReg.test(newPassword.password)
                }
              />
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  )
}
export default LearnerDetails
