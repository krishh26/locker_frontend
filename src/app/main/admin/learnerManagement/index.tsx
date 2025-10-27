import React, { useEffect, useState } from 'react'
import Breadcrumb from 'src/app/component/Breadcrumbs'
import { SecondaryButton } from 'src/app/component/Buttons'
import DataNotFound from 'src/app/component/Pages/dataNotFound'
import { AdminRedirect, learnerManagementTableColumn } from 'src/app/contanst'
import Style from '../style.module.css'
import { useSelector } from 'react-redux'
import { selectUser } from 'app/store/userSlice'
import {
  Autocomplete,
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import UserDetails from './usetDetails'
import { useDispatch } from 'react-redux'
import Close from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import {
  emailReg,
  mobileReg,
  nameReg,
  passwordReg,
  usernameReg,
} from 'src/app/contanst/regValidation'
import {
  createLearnerAPI,
  fetchLearnerAPI,
  getRoleAPI,
  selectLearnerManagement,
  updateLearnerAPI,
} from 'app/store/learnerManagement'
import LearnerManagementTable from 'src/app/component/Table/LearnerManagementTable'
import {
  fetchCourseAPI,
  selectCourseManagement,
} from 'app/store/courseManagement'
import { getEmployerAPI, selectEmployer } from 'app/store/employer'
import { DownloadLearnerExcel, selectGlobalUser } from 'app/store/globalUser'
import { FaFolderOpen } from 'react-icons/fa'
import { IconsData } from 'src/utils/randomColor'
import FuseLoading from '@fuse/core/FuseLoading'
import LearnerCsvUpload from './learner-csv-upload'
import { useCurrentUser } from 'src/app/utils/userHelpers'

const Index = () => {
  const { data, dataFetchLoading, dataUpdatingLoadding, meta_data } =
    useSelector(selectLearnerManagement)
  const { pagination } = useSelector(selectGlobalUser)
  const dispatch: any = useDispatch()
  const course = useSelector(selectCourseManagement)?.data
  const employer = useSelector(selectEmployer)?.data
  const currentUserData = useSelector(selectUser)?.data

  // Get current user role
  const currentUser = useCurrentUser()

  // Check if user is admin or trainer
  const canEditComments = currentUser?.role === 'Admin' || currentUser?.role === 'Trainer'

  const [open, setOpen] = useState(false)
  const [isOpenCSV, setIsOpenCSV] = useState(false)
  const [updateData, setUpdateData] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [courseId, setCourseId] = useState('')
  const [filterValue, setFilterValue] = useState('')
  const [employerId, setEmployereId] = useState('')
  const [searchEmployer, setSearchEmployer] = useState('')
  const [commentDialog, setCommentDialog] = useState(false)
  const [selectedLearner, setSelectedLearner] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [checkedLabels, setCheckedLabels] = useState({
    'Awaiting Induction': false,
    Certificated: false,
    Completed: false,
    'Early Leaver': false,
    Exempt: false,
    'In Training': false,
    'IQA Approved': false,
    'Training Suspended': false,
    Transferred: false,
    'Show only archived users': false,
  })

  useEffect(() => {
    dispatch(fetchCourseAPI())
    dispatch(getEmployerAPI())
  }, [dispatch])

  const [learnerFormData, setLearnerFormData] = useState({
    first_name: '',
    last_name: '',
    user_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    employer_id: '',
    funding_body: '',
    national_ins_no: '',
    job_title: '',
    comment: '',
  })

  const [learnerFormDataError, setLearnerFormDataError] = useState({
    first_name: false,
    last_name: false,
    user_name: false,
    email: false,
    password: false,
    confirmPassword: false,
    mobile: false,
    employer_id: false,
    funding_body: false,
    job_title: false,
  })

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    resetValue()
    setUpdateData('')
    setOpen(false)
  }

  const handleCommentDialog = (learner) => {
    setSelectedLearner(learner)
    setCommentText(learner.comment || '')
    setCommentDialog(true)
  }

  const handleCommentClose = () => {
    setCommentDialog(false)
    setSelectedLearner(null)
    setCommentText('')
  }

  const handleCommentSave = async () => {
    if (selectedLearner) {
      const response = await dispatch(updateLearnerAPI(selectedLearner.learner_id, { comment: commentText }))
      if (response) {
        handleCommentClose()
        refetchLearner()
      }
    }
  }

  const handleUpdate = (e) => {
    const { name, value } = e.target
    setLearnerFormData((prev) => ({ ...prev, [name]: value }))
    setLearnerFormDataError((prev) => ({ ...prev, [name]: false }))
  }

  const resetValue = () => {
    setLearnerFormData({
      first_name: '',
      last_name: '',
      user_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      mobile: '',
      employer_id: '',
      funding_body: '',
      national_ins_no: '',
      job_title: '',
      comment: '',
    })
    setLearnerFormDataError({
      first_name: false,
      last_name: false,
      user_name: false,
      email: false,
      password: false,
      confirmPassword: false,
      mobile: false,
      employer_id: false,
      funding_body: false,
      job_title: false,
    })
  }

  const createUserHandler = async () => {
    if (validation()) {
      const response = await dispatch(createLearnerAPI(learnerFormData))
      if (response) {
        resetValue()
        setOpen(false)
      }
    }
  }

  const updateUserHandler = async () => {
    const response = await dispatch(updateLearnerAPI(updateData, learnerFormData))
    if (response) {
      handleClose()
      setUpdateData('')
      setOpen(false)
    }
  }

  const searchByKeywordUser = (e) => {
    if (e.key === 'Enter') {
      searchAPIHandler()
    }
  }

  const searchHandler = (e) => {
    setSearchKeyword(e.target.value)
  }

  const filterHandler = (e, value) => {
    const selectedCourse = course.find((course) => course.course_name === value)
    setCourseId(selectedCourse ? selectedCourse.course_id : '')
    setFilterValue(value)
  }

  const searchEmployerHandler = (e, value) => {
    const selectedEmployer = employer.find(
      (employer) => employer.employer_name === value
    )
    setEmployereId(selectedEmployer ? selectedEmployer.employer_id : '')
    setSearchEmployer(value)
  }

  const searchAPIHandler = () => {
    refetchLearner()
  }

  useEffect(() => {
    dispatch(getRoleAPI('Trainer'))
    dispatch(getRoleAPI('IQA'))
    dispatch(getRoleAPI('EQA'))
    dispatch(getRoleAPI('Employer'))
    dispatch(getRoleAPI('LIQA'))
  }, [])

  const top100Films = [
    { label: 'The Shawshank Redemption', year: 1994 },
    { label: 'The Godfather', year: 1972 },
  ]

  const validation = () => {
    setLearnerFormDataError({
      first_name: !nameReg.test(learnerFormData?.first_name),
      last_name: !nameReg.test(learnerFormData?.last_name),
      user_name: !usernameReg.test(learnerFormData?.user_name),
      email: !emailReg.test(learnerFormData?.email),
      password: !passwordReg.test(learnerFormData?.password),
      confirmPassword:
        learnerFormData?.password !== learnerFormData?.confirmPassword ||
        !passwordReg.test(learnerFormData?.password),
      mobile: !mobileReg.test(learnerFormData.mobile),
      employer_id: learnerFormData?.employer_id === '',
      funding_body: learnerFormData?.funding_body === '',
      job_title: learnerFormData?.job_title === '',
    })
    if (
      nameReg.test(learnerFormData?.first_name) &&
      nameReg.test(learnerFormData?.last_name) &&
      usernameReg.test(learnerFormData?.user_name) &&
      emailReg.test(learnerFormData?.email) &&
      passwordReg.test(learnerFormData?.password) &&
      learnerFormData?.password === learnerFormData?.confirmPassword &&
      // mobileReg.test(learnerFormData.mobile) &&
      learnerFormData?.employer_id !== '' &&
      learnerFormData?.funding_body !== '' &&
      learnerFormData?.job_title !== ''
    ) {
      return true
    }
    return false
  }

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target

    setCheckedLabels((prevState) => ({
      ...prevState,
      [name]: checked,
    }))
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    refetchLearner(searchKeyword, newPage)
  }

  const refetchLearner = (a = searchKeyword, page = 1) => {
    let status = ''
    for (const [label, value] of Object.entries(checkedLabels)) {
      if (value) {
        if (status === '') {
          status += label
        } else {
          status += ', ' + label
        }
      }
    }
    dispatch(
      fetchLearnerAPI(
        { page, page_size: pagination?.page_size },
        a,
        courseId,
        employerId,
        status
      )
    )
  }

  useEffect(() => {
    refetchLearner()
  }, [checkedLabels, courseId, employerId, pagination])
  return (
    <Grid>
      <Card className='m-12 rounded-6'>
        <div className='w-full h-full'>
          <Breadcrumb linkData={[AdminRedirect]} currPage='Learner' />

          <div className={Style.create_user}>
            <div className={Style.search_filed}>
              <TextField
                label='Search by keyword'
                fullWidth
                size='small'
                onKeyDown={searchByKeywordUser}
                onChange={searchHandler}
                value={searchKeyword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      {searchKeyword ? (
                        <Close
                          onClick={() => {
                            setSearchKeyword('')
                            refetchLearner('')
                          }}
                          sx={{
                            color: '#5B718F',
                            fontSize: 18,
                            cursor: 'pointer',
                          }}
                        />
                      ) : (
                        <IconButton
                          id='dashboard-search-events-btn'
                          disableRipple
                          sx={{ color: '#5B718F' }}
                          onClick={() => searchAPIHandler()}
                          size='small'
                        >
                          <SearchIcon fontSize='small' />
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                }}
              />
              <Autocomplete
                fullWidth
                size='small'
                value={filterValue}
                options={course.map((option) => option.course_name)}
                renderInput={(params) => (
                  <TextField {...params} label='Search by course' />
                )}
                onChange={filterHandler}
                sx={{
                  '.MuiAutocomplete-clearIndicator': {
                    color: '#5B718F',
                  },
                  '.muiltr-1okx3q8-MuiButtonBase-root-MuiIconButton-root-MuiAutocomplete-popupIndicator':
                    { color: 'black' },
                }}
                PaperComponent={({ children }) => (
                  <Paper style={{ borderRadius: '4px' }}>{children}</Paper>
                )}
              />
              <Autocomplete
                fullWidth
                size='small'
                value={searchEmployer}
                options={employer.map((option) => option.employer_name)}
                renderInput={(params) => (
                  <TextField {...params} label='Search by employer' />
                )}
                onChange={searchEmployerHandler}
                sx={{
                  '.MuiAutocomplete-clearIndicator': {
                    color: '#5B718F',
                  },
                  '.muiltr-1okx3q8-MuiButtonBase-root-MuiIconButton-root-MuiAutocomplete-popupIndicator':
                    { color: 'black' },
                }}
                PaperComponent={({ children }) => (
                  <Paper style={{ borderRadius: '4px' }}>{children}</Paper>
                )}
              />
            </div>
            <div className='flex gap-10'>
              <SecondaryButton
                name='Export Report'
                onClick={() => {
                  dispatch(DownloadLearnerExcel())
                }}
                startIcon={
                  <img
                    src='assets/images/svgimage/uploadfileicon.svg'
                    alt='Export Report'
                    className='w-6 h-6 mr-2 sm:w-8 sm:h-8 lg:w-10 lg:h-10'
                  />
                }
              />
              <SecondaryButton
                name='Create learner'
                onClick={handleOpen}
                startIcon={
                  <img
                    src='assets/images/svgimage/createcourseicon.svg'
                    alt='Create user'
                    className='w-6 h-6 mr-2 sm:w-8 sm:h-8 lg:w-10 lg:h-10'
                  />
                }
              />
              <Button
                variant='contained'
                component='label'
                startIcon={<CloudUploadIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1.2,
                  backgroundColor: '#007E84',
                  '&:hover': {
                    backgroundColor: '#00666A',
                  },
                }}
                onClick={() => setIsOpenCSV(true)}
              >
                Upload Learners
              </Button>
            </div>
          </div>
          <Dialog
            open={isOpenCSV}
            onClose={() => setIsOpenCSV(false)}
            sx={{
              '.MuiDialog-paper': {
                borderRadius: '4px',
                padding: '1rem',
              },
            }}
          >
            <LearnerCsvUpload handleClose={() => setIsOpenCSV(false)} />
          </Dialog>

          <Grid className='w-full p-12'>
            <Typography
              className='font-600'
              sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
            >
              Status
            </Typography>
            <FormGroup className='flex flex-row flex-wrap'>
              {Object.keys(checkedLabels).map((label) => (
                <FormControlLabel
                  key={label}
                  control={
                    <Checkbox
                      checked={checkedLabels[label]}
                      onChange={handleCheckboxChange}
                      name={label}
                    />
                  }
                  label={label}
                />
              ))}
            </FormGroup>
          </Grid>
          {dataFetchLoading ? (
            <FuseLoading />
          ) : data?.length ? (
            <LearnerManagementTable
              columns={learnerManagementTableColumn}
              rows={data}
              handleOpen={handleOpen}
              setUserData={setLearnerFormData}
              setUpdateData={setUpdateData}
              meta_data={meta_data}
              dataUpdatingLoadding={dataUpdatingLoadding}
              refetchLearner={refetchLearner}
              handleChangePage={handleChangePage}
              handleCommentDialog={handleCommentDialog}
              canEditComments={canEditComments}
            />
          ) : (
            <div
              className='flex flex-col justify-center items-center gap-10'
              style={{ height: '75vh' }}
            >
              <DataNotFound width='25%' />
              <Typography variant='h5'>No data found</Typography>
              <Typography variant='body2' className='text-center'>
                It is a long established fact that a reader will be <br />
                distracted by the readable content.
              </Typography>
            </div>
          )}

          <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            sx={{
              '.MuiDialog-paper': {
                borderRadius: '4px',
                padding: '1rem',
              },
            }}
          >
            <UserDetails
              handleClose={handleClose}
              updateData={Boolean(updateData)}
              userData={learnerFormData}
              handleUpdate={handleUpdate}
              createUserHandler={createUserHandler}
              updateUserHandler={updateUserHandler}
              dataUpdatingLoadding={dataUpdatingLoadding}
              userDataError={learnerFormDataError}
              search_course={filterValue}
              search_employer={searchEmployer}
            />
          </Dialog>

          {/* Comment Dialog */}
          <Dialog
            open={commentDialog}
            onClose={handleCommentClose}
            fullWidth
            maxWidth="sm"
            sx={{
              '.MuiDialog-paper': {
                borderRadius: '4px',
                padding: '1rem',
              },
            }}
          >
            <DialogTitle>
              Add/Edit Comment for {selectedLearner?.first_name} {selectedLearner?.last_name}
            </DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter your comment here..."
                variant="outlined"
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCommentClose} color="primary">
                Cancel
              </Button>
              <Button 
                onClick={handleCommentSave} 
                color="primary" 
                variant="contained"
                disabled={dataUpdatingLoadding}
              >
                {dataUpdatingLoadding ? 'Saving...' : 'Save Comment'}
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </Card>
      <Grid
        container
        spacing={4}
        className='bg-[#e1e1e1] m-12 p-20 rounded-6 w-auto'
      >
        <Grid xs={3} className='p-16'>
          <Grid container direction='column' className='gap-3' spacing={2}>
            <Typography
              sx={{ borderBottom: '1px solid black' }}
              className='pb-10 font-600'
            >
              Portfolio
            </Typography>
            {IconsData.slice(0, 8).map((item, index) => (
              <Grid
                className='flex gap-14'
                item
                key={index}
                container
                alignItems='center'
                spacing={1}
              >
                <FaFolderOpen
                  className='text-2xl -rotate-12'
                  style={{ color: item.color }}
                />
                <span>{item.name}</span>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid xs={3} className='p-16'>
          <Grid container direction='column' className='gap-3' spacing={2}>
            <Typography
              sx={{ borderBottom: '1px solid black' }}
              className='pb-10'
            >
              &nbsp;
            </Typography>
            {IconsData.slice(8).map((item, index) => (
              <Grid
                className='flex gap-10'
                item
                key={index}
                container
                alignItems='center'
                spacing={1}
              >
                <FaFolderOpen
                  className='text-2xl -rotate-12'
                  style={{ color: item.color }}
                />
                <span>{item.name}</span>
              </Grid>
            ))}
            <Grid
              className='flex gap-10'
              item
              container
              alignItems='center'
              spacing={1}
            >
              <Grid className='relative'>
                <FaFolderOpen
                  className='text-3xl -rotate-12'
                  style={{ color: '#9AA9A1' }}
                />
                <Grid>
                  <img
                    src='/assets/icons/guy_archived.gif'
                    className='h-20 absolute top-2'
                  />
                </Grid>
              </Grid>
              <span>Early Leaver</span>
            </Grid>
            <Grid
              className='flex gap-10'
              item
              container
              alignItems='center'
              spacing={1}
            >
              <Grid className='relative'>
                <FaFolderOpen
                  className='text-3xl -rotate-12'
                  style={{ color: '#9AA9A1' }}
                />
                <Grid>
                  <img
                    src='/assets/icons/guy_completed.gif'
                    className='h-20 absolute top-2'
                  />
                </Grid>
              </Grid>
              <span>Course Completed</span>
            </Grid>
            <Grid
              className='flex gap-10'
              item
              container
              alignItems='center'
              spacing={1}
            >
              <Grid className='relative'>
                <FaFolderOpen
                  className='text-3xl -rotate-12'
                  style={{ color: '#9AA9A1' }}
                />
                <Grid>
                  <img
                    src='/assets/icons/guy_lock.gif'
                    className='h-20 absolute top-2'
                  />
                </Grid>
              </Grid>
              <span>Training Suspended</span>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Index
