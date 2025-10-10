import React, { useEffect } from 'react'
import { FormProvider } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
} from '@mui/material'
import {
  getLearnerDetails,
  selectLearnerManagement,
  updateLearnerAPI,
} from 'app/store/learnerManagement'
import { selectGlobalUser } from 'app/store/globalUser'
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
import { useFundingBands } from './hooks/useFundingBands'

const LearnerDetails = () => {
  const navigate = useNavigate()
  const dispatch: any = useDispatch()
  
  const { learner_id } = useSelector(selectGlobalUser).selectedUser
  const { employer, learner } = useSelector(selectLearnerManagement)

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

  const formatDate = (date) => {
    if (!date) return ''
    const formattedDate = date.substr(0, 10)
    return formattedDate
  }

  return (
    <div>
      <div className='flex p-5'>
        <Grid className='w-full'>
          <Grid className='my-20 mx-20 flex flex-col gap-20'>
            <ActionButtons
              onCreatePassword={passwordDialog.handleClickOpen}
              onEmailReset={passwordDialog.handleEmailAlert}
              onCreateEmployer={handleCreateEmployer}
            />

            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <div className='flex flex-col gap-20'>
                  <StudentIdSection />
                  <AboutYouSection />
                  <AddressSection />
                  <EmployerSection employer={employer} />
                  <FundingBodySection />
                  <AdditionalInfoSection />
                  <FundingBandsSection
                    fundingBands={fundingBands.fundingBands}
                    isLoading={fundingBands.isLoading}
                    isUpdating={fundingBands.isUpdating}
                    onUpdateBand={fundingBands.handleSave}
                  />
                </div>

                <div className='flex justify-end mr-24 mb-20 mt-10'>
                  <SecondaryButton
                    className='bg-green-500 hover:bg-green-600'
                    name='Save'
                    type='submit'
                    disabled={form.formState.isSubmitting}
                  />
                </div>
              </form>
            </FormProvider>
          </Grid>
        </Grid>
      </div>

      <Dialog
        open={passwordDialog.dialogType}
        onClose={passwordDialog.handleCloseDialog}
        sx={{
          '.MuiDialog-paper': {
            borderRadius: '4px',
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

export default LearnerDetails
