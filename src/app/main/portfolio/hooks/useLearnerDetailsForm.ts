import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// Validation schema
const learnerDetailsSchema = yup.object().shape({
  uln: yup.string(),
  mis_learner_id: yup.string(),
  student_id: yup.string(),
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  user_name: yup.string(),
  email: yup.string().email('Invalid email address').required('Email is required'),
  telephone: yup.string(),
  mobile: yup.string(),
  dob: yup.string(),
  gender: yup.string(),
  national_ins_no: yup.string(),
  ethnicity: yup.string(),
  learner_disability: yup.string(),
  learner_difficulity: yup.string(),
  Initial_Assessment_Numeracy: yup.string(),
  Initial_Assessment_Literacy: yup.string(),
  Initial_Assessment_ICT: yup.string(),
  functional_skills: yup.string(),
  technical_certificate: yup.string(),
  err: yup.string(),
  street: yup.string(),
  suburb: yup.string(),
  town: yup.string(),
  country: yup.string(),
  home_postcode: yup.string(),
  country_of_domicile: yup.string(),
  external_data_code: yup.string(),
  employer_id: yup.number().nullable(),
  cost_centre: yup.string(),
  job_title: yup.string(),
  location: yup.string(),
  manager_name: yup.string(),
  manager_job_title: yup.string(),
  mentor: yup.string(),
  funding_contractor: yup.string(),
  partner: yup.string(),
  area: yup.string(),
  sub_area: yup.string(),
  shift: yup.string(),
  cohort: yup.string(),
  lsf: yup.string(),
  curriculum_area: yup.string(),
  ssa1: yup.string(),
  ssa2: yup.string(),
  director_of_curriculum: yup.string(),
  wage: yup.string(),
  wage_type: yup.string(),
  allow_archived_access: yup.boolean(),
  branding_type: yup.string(),
  learner_type: yup.string(),
  funding_body: yup.string(),
  expected_off_the_job_hours: yup.string(),
  // Additional fields
  awarding_body: yup.string(),
  fs_english_green_progress: yup.string(),
  fs_english_orange_progress: yup.string(),
  fs_maths_green_progress: yup.string(),
  fs_maths_orange_progress: yup.string(),
  guided_learning_hours_achieved: yup.string(),
  iqas_name: yup.string(),
  lara_code: yup.string(),
  main_aim_green_progress: yup.string(),
  main_aim_guided_learning_hours_achieved: yup.string(),
  main_aim_orange_progress: yup.string(),
  next_session_date_type: yup.string(),
  off_the_job_training: yup.string(),
  registration_date: yup.string(),
  registration_number: yup.string(),
})  

export interface LearnerDetailsFormData {
  uln: string
  mis_learner_id: string
  student_id: string
  first_name: string
  last_name: string
  user_name: string
  email: string
  telephone: string
  mobile: string
  dob: string
  gender: string
  national_ins_no: string
  ethnicity: string
  learner_disability: string
  learner_difficulity: string
  Initial_Assessment_Numeracy: string
  Initial_Assessment_Literacy: string
  Initial_Assessment_ICT: string
  functional_skills: string
  technical_certificate: string
  err: string
  street: string
  suburb: string
  town: string
  country: string
  home_postcode: string
  country_of_domicile: string
  external_data_code: string
  employer_id: number | null
  cost_centre: string
  job_title: string
  location: string
  manager_name: string
  manager_job_title: string
  mentor: string
  funding_contractor: string
  partner: string
  area: string
  sub_area: string
  shift: string
  cohort: string
  lsf: string
  curriculum_area: string
  ssa1: string
  ssa2: string
  director_of_curriculum: string
  wage: string
  wage_type: string
  allow_archived_access: boolean
  branding_type: string
  learner_type: string
  funding_body: string
  expected_off_the_job_hours: string
  // Additional fields
  awarding_body: string
  fs_english_green_progress: string
  fs_english_orange_progress: string
  fs_maths_green_progress: string
  fs_maths_orange_progress: string
  guided_learning_hours_achieved: string
  iqas_name: string
  lara_code: string
  main_aim_green_progress: string
  main_aim_guided_learning_hours_achieved: string
  main_aim_orange_progress: string
  next_session_date_type: string
  off_the_job_training: string
  registration_date: string
  registration_number: string
}

export const useLearnerDetailsForm = (defaultValues?: Partial<LearnerDetailsFormData>) => {
  const form = useForm<LearnerDetailsFormData>({
    resolver: yupResolver(learnerDetailsSchema),
    defaultValues: {
      uln: '',
      mis_learner_id: '',
      student_id: '',
      first_name: '',
      last_name: '',
      user_name: '',
      email: '',
      telephone: '',
      mobile: '',
      dob: '',
      gender: '',
      national_ins_no: '',
      ethnicity: '',
      learner_disability: '',
      learner_difficulity: '',
      Initial_Assessment_Numeracy: '',
      Initial_Assessment_Literacy: '',
      Initial_Assessment_ICT: '',
      functional_skills: '',
      technical_certificate: '',
      err: '',
      street: '',
      suburb: '',
      town: '',
      country: '',
      home_postcode: '',
      country_of_domicile: '',
      external_data_code: '',
      employer_id: null,
      cost_centre: '',
      job_title: '',
      location: '',
      manager_name: '',
      manager_job_title: '',
      mentor: '',
      funding_contractor: '',
      partner: '',
      area: '',
      sub_area: '',
      shift: '',
      cohort: '',
      lsf: '',
      curriculum_area: '',
      ssa1: '',
      ssa2: '',
      director_of_curriculum: '',
      wage: '',
      wage_type: '',
      allow_archived_access: false,
      branding_type: '',
      learner_type: '',
      funding_body: '',
      expected_off_the_job_hours: '',
      // Additional fields
      awarding_body: '',
      fs_english_green_progress: '',
      fs_english_orange_progress: '',
      fs_maths_green_progress: '',
      fs_maths_orange_progress: '',
      guided_learning_hours_achieved: '',
      iqas_name: '',
      lara_code: '',
      main_aim_green_progress: '',
      main_aim_guided_learning_hours_achieved: '',
      main_aim_orange_progress: '',
      next_session_date_type: '',
      off_the_job_training: '',
      registration_date: '',
      registration_number: '',
      ...defaultValues,
    },
  })

  return form
}
