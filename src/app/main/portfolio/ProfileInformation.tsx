import React, { useEffect, useState, useMemo } from 'react'
import { FormProvider } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
} from '@mui/material'
import {
  getLearnerDetails,
  selectLearnerManagement,
  updateLearnerAPI,
} from 'app/store/learnerManagement'
import { selectGlobalUser } from 'app/store/globalUser'
import { selectUser } from 'app/store/userSlice'
import { LoadingButton, SecondaryButton, SecondaryButtonOutlined } from 'src/app/component/Buttons'
import UpdatePassword from './updatePassword'

// Import components
import ActionButtons from './components/ActionButtons'
import StudentIdSection from './components/StudentIdSection'
import AboutYouSection from './components/AboutYouSection'
import AddressSection from './components/AddressSection'
import EmployerSection from './components/EmployerSection'
import FundingBodySection from './components/FundingBodySection'
import FundingBandsSection from './components/FundingBandsSection'
import AdditionalInfoSection from './components/AdditionalInfoSection'

// Import hooks
import { useLearnerDetailsForm, LearnerDetailsFormData } from './hooks/useLearnerDetailsForm'
import { usePasswordDialog } from './hooks/usePasswordDialog'
import { slice as globalSlice } from "app/store/globalUser";
import { useFundingBands } from './hooks/useFundingBands'
import { UserRole } from 'src/enum'

// Import CourseManagement component
import CourseTab from './courseTab'

const ProfileInformation = () => {
  const navigate = useNavigate()
  const dispatch: any = useDispatch()
  
  const { learner_id } = useSelector(selectGlobalUser).selectedUser
  const { employer, learner } = useSelector(selectLearnerManagement)

  // Get current user role
  const user = useMemo(() => {
    try {
      return (
        JSON.parse(sessionStorage.getItem('learnerToken') || '{}')?.user ||
        useSelector(selectUser)?.data
      )
    } catch {
      return useSelector(selectUser)?.data
    }
  }, [])

  useEffect(() => {
   if(learner){
    dispatch(globalSlice.setSelectedUser(learner))
   }
  }, [learner])
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0)

  // Initialize form with learner data
  const form = useLearnerDetailsForm({
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
    // Additional fields
    awarding_body: learner?.awarding_body || '',
    fs_english_green_progress: learner?.fs_english_green_progress || '',
    fs_english_orange_progress: learner?.fs_english_orange_progress || '',
    fs_maths_green_progress: learner?.fs_maths_green_progress || '',
    fs_maths_orange_progress: learner?.fs_maths_orange_progress || '',
    guided_learning_hours_achieved: learner?.guided_learning_hours_achieved || '',
    iqas_name: learner?.iqas_name || '',
    lara_code: learner?.lara_code || '',
    main_aim_green_progress: learner?.main_aim_green_progress || '',
    main_aim_guided_learning_hours_achieved: learner?.main_aim_guided_learning_hours_achieved || '',
    main_aim_orange_progress: learner?.main_aim_orange_progress || '',
    next_session_date_type: learner?.next_session_date_type || '',
    off_the_job_training: learner?.off_the_job_training || '',
    registration_date: learner?.registration_date || '',
    registration_number: learner?.registration_number || '',
  })

  // Custom hooks
  const passwordDialog = usePasswordDialog()
  const fundingBands = useFundingBands()

  // Load learner details on component mount
  useEffect(() => {
    dispatch(getLearnerDetails(learner_id))
  }, [learner_id, dispatch])

  // Update form when learner data changes
  useEffect(() => {
    if (learner) {
      Object.keys(learner).forEach((key) => {
        if (learner[key] !== undefined) {
          form.setValue(key as keyof LearnerDetailsFormData, learner[key])
        }
      })
    }
  }, [learner, form])

  const handleSubmit = async (data: LearnerDetailsFormData) => {
    try {
      const response = await dispatch(updateLearnerAPI(learner_id, data))
      if (response) {
        navigate('/home')
      }
    } catch (error) {
      console.error('Error updating data:', error)
    }
  }

  const handleClose = () => {
    navigate('/home')
  }

  const handleCreateEmployer = async () => {
    navigate('/admin/employer')
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const formatDate = (date) => {
    if (!date) return ''
    const formattedDate = date.substr(0, 10)
    return formattedDate
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='p-6'>
        <Grid className='w-full'>
          <Grid className='mx-4'>
            {/* Header Section */}
            <div className='mb-8'>
              <div className='flex justify-between items-center mb-6'>
                <div>
                  <Typography variant='h4' className='font-bold text-gray-800 mb-2'>
                    Profile Information
                  </Typography>
                  <Typography variant='body1' className='text-gray-600'>
                    Manage learner profile details and personal information
                  </Typography>
                </div>
                {!user?.roles.includes(UserRole.Learner) && (
                  <ActionButtons
                    onCreatePassword={passwordDialog.handleClickOpen}
                    onEmailReset={passwordDialog.handleEmailAlert}
                    onCreateEmployer={handleCreateEmployer}
                  />
                )}
              </div>
            </div>

            {/* Profile Content with Tabs */}
            <Paper 
              elevation={0} 
              className='rounded-xl shadow-sm border border-gray-200 overflow-hidden'
            >
              {/* Tab Navigation */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant='fullWidth'
                  sx={{
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#10b981',
                      height: 3,
                    },
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#6b7280',
                      padding: '16px 24px',
                      '&.Mui-selected': {
                        color: '#10b981',
                        backgroundColor: '#f0fdf4',
                      },
                      '&:hover': {
                        backgroundColor: '#f9fafb',
                        color: '#374151',
                      },
                    },
                  }}
                >
                  <Tab 
                    label={
                      <Box className='flex items-center gap-2'>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                        </svg>
                        Personal Information
                      </Box>
                    } 
                  />
                  <Tab 
                    label={
                      <Box className='flex items-center gap-2'>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
                        </svg>
                        Course Information
                      </Box>
                    } 
                  />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box className='p-8'>
                {activeTab === 0 && (
                  <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                      <div className='space-y-8'>
                        <StudentIdSection disabled={user?.roles.includes(UserRole.Learner)} />
                        <AboutYouSection disabled={user?.roles.includes(UserRole.Learner)} />
                        <AddressSection disabled={user?.roles.includes(UserRole.Learner)} />
                        <EmployerSection 
                          employer={employer} 
                          disabled={user?.roles.includes(UserRole.Learner)} 
                        />
                        <FundingBodySection disabled={user?.roles.includes(UserRole.Learner)} />
                        <AdditionalInfoSection disabled={user?.roles.includes(UserRole.Learner)} />
                        <FundingBandsSection
                          fundingBands={fundingBands.fundingBands}
                          isLoading={fundingBands.isLoading}
                          isUpdating={fundingBands.isUpdating}
                          onUpdateBand={fundingBands.handleSave}
                          disabled={user?.roles.includes(UserRole.Learner)}
                        />
                      </div>

                      {!user?.roles.includes(UserRole.Learner) && (
                        <div className='flex justify-end mt-8 pt-6 border-t border-gray-200'>
                          <SecondaryButton
                            className='bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200'
                            name='Save Profile'
                            type='submit'
                            disabled={form.formState.isSubmitting}
                          />
                        </div>
                      )}
                    </form>
                  </FormProvider>
                )}

                {activeTab === 1 && (
                  <div>
                   <CourseTab />
                  </div>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </div>

      {/* Password Dialog */}
      <Dialog
        open={passwordDialog.dialogType}
        onClose={passwordDialog.handleCloseDialog}
        sx={{
          '.MuiDialog-paper': {
            borderRadius: '12px',
            width: '100%',
          },
        }}
      >
        <DialogContent className='p-0'>
          <UpdatePassword
            passwordHandler={passwordDialog.passwordHandler}
            newPassword={passwordDialog.newPassword}
          />
        </DialogContent>
        <DialogActions className='mb-4 mr-6'>
          {passwordDialog.loading ? (
            <LoadingButton />
          ) : (
            <>
              <SecondaryButtonOutlined
                onClick={passwordDialog.handleCloseDialog}
                name='Cancel'
              />
              <SecondaryButton
                name='Reset'
                onClick={passwordDialog.resetHandler}
              />
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ProfileInformation
