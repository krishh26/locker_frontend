import { FormField } from './DragDropFormBuilder'

export const roleIcons: Record<string, string> = {
  learner: '🧑‍🎓',
  trainer: '🧑‍🏫',
  employee: '👨‍💼',
}

export interface PresetField {
  type: string
  label: string
  field: FormField
}

export interface RolePresets {
  learner: PresetField[]
  trainer: PresetField[]
  employee: PresetField[]
}

export const PRESET_FIELDS: RolePresets = {
  learner: [
    {
      type: 'awarding_body',
      label: 'Awarding Body',
      field: {
        id: 'awarding_body',
        type: 'textfield',
        label: 'Awarding Body',
        required: false,
        presetField: 'awarding_body',
      },
    },
    {
      type: 'cohort',
      label: 'Cohort',
      field: {
        id: 'cohort',
        type: 'textfield',
        label: 'Cohort',
        required: false,
        presetField: 'cohort',
      },
    },
    {
      type: 'county',
      label: 'County',
      field: {
        id: 'county',
        type: 'textfield',
        label: 'County',
        required: false,
        presetField: 'county',
      },
    },
    {
      type: 'course_actual_end_date',
      label: 'Course Actual End Date',
      field: {
        id: 'course_actual_end_date',
        type: 'date',
        label: 'Course Actual End Date',
        required: false,
        presetField: 'course_actual_end_date',
      },
    },
    {
      type: 'course_expected_end_date',
      label: 'Course Expected End Date',
      field: {
        id: 'course_expected_end_date',
        type: 'date',
        label: 'Course Expected End Date',
        required: false,
        presetField: 'course_expected_end_date',
      },
    },
    {
      type: 'course_name',
      label: 'Course Name',
      field: {
        id: 'course_name',
        type: 'textfield',
        label: 'Course Name',
        required: false,
        presetField: 'course_name',
      },
    },
    {
      type: 'course_start_date',
      label: 'Course Start Date',
      field: {
        id: 'course_start_date',
        type: 'date',
        label: 'Course Start Date',
        required: false,
        presetField: 'course_start_date',
      },
    },
    {
      type: 'current_time_progress',
      label: 'Current Time Progress',
      field: {
        id: 'current_time_progress',
        type: 'textfield',
        label: 'Current Time Progress',
        required: false,
        presetField: 'current_time_progress',
      },
    },
    {
      type: 'date_of_birth',
      label: 'Date of Birth',
      field: {
        id: 'dob',
        type: 'date',
        label: 'Date of Birth',
        required: false,
        presetField: 'dob',
      },
    },
    {
      type: 'employer',
      label: 'Employer',
      field: {
        id: 'employer',
        type: 'textfield',
        label: 'Employer',
        required: true,
        presetField: 'employer',
      },
    },
    {
      type: 'ethnicity',
      label: 'Ethnicity',
      field: {
        id: 'ethnicity',
        type: 'textfield',
        label: 'Ethnicity',
        required: true,
        presetField: 'ethnicity',
      },
    },
    {
      type: 'fs_english_green_progress',
      label: 'FS English Green Progress',
      field: {
        id: 'fs_english_green_progress',
        type: 'textfield',
        label: 'FS English Green Progress',
        required: false,
        presetField: 'fs_english_green_progress',
      },
    },
    {
      type: 'fs_english_orange_progress',
      label: 'FS English Orange Progress',
      field: {
        id: 'fs_english_orange_progress',
        type: 'textfield',
        label: 'FS English Orange Progress',
        required: false,
        presetField: 'fs_english_orange_progress',
      },
    },
    {
      type: 'fs_maths_green_progress',
      label: 'FS Maths Green Progress',
      field: {
        id: 'fs_maths_green_progress',
        type: 'textfield',
        label: 'FS Maths Green Progress',
        required: false,
        presetField: 'fs_maths_green_progress',
      },
    },
    {
      type: 'fs_maths_orange_progress',
      label: 'FS Maths Orange Progress',
      field: {
        id: 'fs_maths_orange_progress',
        type: 'textfield',
        label: 'FS Maths Orange Progress',
        required: false,
        presetField: 'fs_maths_orange_progress',
      },
    },
    {
      type: 'funding_body',
      label: 'Funding Body',
      field: {
        id: 'funding_body',
        type: 'textfield',
        label: 'Funding Body',
        required: false,
        presetField: 'funding_body',
      },
    },
    {
      type: 'funding_contractor',
      label: 'Funding Contractor',
      field: {
        id: 'funding_contractor',
        type: 'textfield',
        label: 'Funding Contractor',
        required: true,
        presetField: 'funding_contractor',
      },
    },
    {
      type: 'gender',
      label: 'Gender',
      field: {
        id: 'gender',
        type: 'radio',
        label: 'Gender',
        required: true,
        options: ['Male', 'Female', 'Other'],
        presetField: 'gender',
      },
    },
    {
      type: 'guided_learning_hours_achieved',
      label: 'Guided Learning Hours Achieved to Date',
      field: {
        id: 'guided_learning_hours_achieved',
        type: 'number',
        label: 'Guided Learning Hours Achieved to Date',
        required: false,
        presetField: 'guided_learning_hours_achieved',
      },
    },
    {
      type: 'home_postcode',
      label: 'Home Postcode',
      field: {
        id: 'home_postcode',
        type: 'textfield',
        label: 'Home Postcode',
        required: false,
        presetField: 'home_postcode',
      },
    },
    {
      type: 'iqas_name',
      label: "IQA's Name",
      field: {
        id: 'iqas_name',
        type: 'textfield',
        label: "IQA's Name",
        required: false,
        presetField: 'iqas_name',
      },
    },
    {
      type: 'lara_code',
      label: 'Lara Code',
      field: {
        id: 'lara_code',
        type: 'textfield',
        label: 'Lara Code',
        required: false,
        presetField: 'lara_code',
      },
    },
    {
      type: 'learner-email',
      label: 'Learner Email',
      field: {
        id: 'learner-email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        required: true,
        presetField: 'LearnerEmail',
      },
    },
    {
      type: 'learner-name',
      label: 'Learner Name',
      field: {
        id: 'learner-name',
        type: 'textfield',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true,
        presetField: 'learnerFullName',
      },
    },
    {
      type: 'learner_disability',
      label: 'Learner Disability',
      field: {
        id: 'learner_disability',
        type: 'textfield',
        label: 'Learner Disability',
        required: false,
        presetField: 'learner_disability',
      },
    },
    {
      type: 'learner_forename',
      label: 'Learner Forename',
      field: {
        id: 'learner_forename',
        type: 'textfield',
        label: 'Learner Forename',
        required: false,
        presetField: 'learner_forename',
      },
    },
    {
      type: 'learner_surname',
      label: 'Learner Surname',
      field: {
        id: 'learner_surname',
        type: 'textfield',
        label: 'Learner Surname',
        required: false,
        presetField: 'learner_surname',
      },
    },
    {
      type: 'learner-phone',
      label: 'Learner Phone',
      field: {
        id: 'learner-phone',
        type: 'phone',
        label: 'Phone Number',
        placeholder: 'Enter your phone number',
        required: true,
        presetField: 'LearnerPhoneNumber',
      },
    },
    {
      type: 'learning_difficulties',
      label: 'Learning Difficulties',
      field: {
        id: 'learning_difficulties',
        type: 'textfield',
        label: 'Learning Difficulties',
        required: false,
        presetField: 'learning_difficulties',
      },
    },
    {
      type: 'location',
      label: 'Location',
      field: {
        id: 'location',
        type: 'textfield',
        label: 'Location',
        required: false,
        presetField: 'location',
      },
    },
    {
      type: 'main_aim_green_progress',
      label: 'Main Aim Green Progress',
      field: {
        id: 'main_aim_green_progress',
        type: 'textfield',
        label: 'Main Aim Green Progress',
        required: false,
        presetField: 'main_aim_green_progress',
      },
    },
    {
      type: 'main_aim_guided_learning_hours_achieved',
      label: 'Main Aim Guided Learning Hours Achieved to Date',
      field: {
        id: 'main_aim_guided_learning_hours_achieved',
        type: 'number',
        label: 'Main Aim Guided Learning Hours Achieved to Date',
        required: false,
        presetField: 'main_aim_guided_learning_hours_achieved',
      },
    },
    {
      type: 'main_aim_orange_progress',
      label: 'Main Aim Orange Progress',
      field: {
        id: 'main_aim_orange_progress',
        type: 'textfield',
        label: 'Main Aim Orange Progress',
        required: false,
        presetField: 'main_aim_orange_progress',
      },
    },
    {
      type: 'manager_name',
      label: 'Manager Name',
      field: {
        id: 'manager_name',
        type: 'textfield',
        label: 'Manager Name',
        required: false,
        presetField: 'manager_name',
      },
    },
    {
      type: 'mis_learner_id',
      label: 'MIS Learner ID',
      field: {
        id: 'mis_learner_id',
        type: 'textfield',
        label: 'MIS Learner ID',
        required: false,
        presetField: 'mis_learner_id',
      },
    },
    {
      type: 'national_ins_no',
      label: 'National Insurance Number',
      field: {
        id: 'national_ins_no',
        type: 'textfield',
        label: 'National Insurance Number',
        required: false,
        presetField: 'national_ins_no',
      },
    },
    {
      type: 'next_planned_review_date',
      label: 'Next Planned Review Date',
      field: {
        id: 'next_planned_review_date',
        type: 'date',
        label: 'Next Planned Review Date',
        required: false,
        presetField: 'next_planned_review_date',
      },
    },
    {
      type: 'next_session_date_type',
      label: 'Next Session Date & Type',
      field: {
        id: 'next_session_date_type',
        type: 'textfield',
        label: 'Next Session Date & Type',
        required: false,
        presetField: 'next_session_date_type',
      },
    },
    {
      type: 'off_the_job_training',
      label: 'Off the Job Training',
      field: {
        id: 'off_the_job_training',
        type: 'textfield',
        label: 'Off the Job Training',
        required: false,
        presetField: 'off_the_job_training',
      },
    },
    {
      type: 'on_track_status',
      label: 'On Track / Off Track Status',
      field: {
        id: 'on_track_status',
        type: 'textfield',
        label: 'On Track / Off Track Status',
        required: false,
        presetField: 'on_track_status',
      },
    },
    {
      type: 'partner',
      label: 'Partner',
      field: {
        id: 'partner',
        type: 'textfield',
        label: 'Partner',
        required: false,
        presetField: 'partner',
      },
    },
    {
      type: 'planned_review_date',
      label: 'Planned Review Date',
      field: {
        id: 'planned_review_date',
        type: 'date',
        label: 'Planned Review Date',
        required: false,
        presetField: 'planned_review_date',
      },
    },
    {
      type: 'primary_assessor_name',
      label: 'Primary Assessor Name',
      field: {
        id: 'primary_assessor_name',
        type: 'textfield',
        label: 'Primary Assessor Name',
        required: false,
        presetField: 'primary_assessor_name',
      },
    },
    {
      type: 'registration_date',
      label: 'Registration Date',
      field: {
        id: 'registration_date',
        type: 'date',
        label: 'Registration Date',
        required: false,
        presetField: 'registration_date',
      },
    },
    {
      type: 'registration_number',
      label: 'Registration Number',
      field: {
        id: 'registration_number',
        type: 'textfield',
        label: 'Registration Number',
        required: false,
        presetField: 'registration_number',
      },
    },
    {
      type: 'review_date',
      label: 'Review Date',
      field: {
        id: 'review_date',
        type: 'date',
        label: 'Review Date',
        required: false,
        presetField: 'review_date',
      },
    },
    {
      type: 'session_actions',
      label: 'Session Actions',
      field: {
        id: 'session_actions',
        type: 'textfield',
        label: 'Session Actions',
        required: false,
        presetField: 'session_actions',
      },
    },
    {
      type: 'status_of_course',
      label: 'Status of Course',
      field: {
        id: 'status_of_course',
        type: 'textfield',
        label: 'Status of Course',
        required: false,
        presetField: 'status_of_course',
      },
    },
    {
      type: 'town',
      label: 'Town',
      field: {
        id: 'town',
        type: 'textfield',
        label: 'Town',
        required: false,
        presetField: 'town',
      },
    },
    {
      type: 'uln',
      label: 'ULN',
      field: {
        id: 'uln',
        type: 'textfield',
        label: 'ULN',
        required: false,
        presetField: 'uln',
      },
    },
    {
      type: 'units_chosen',
      label: 'Units Chosen',
      field: {
        id: 'units_chosen',
        type: 'textfield',
        label: 'Units Chosen',
        required: false,
        presetField: 'units_chosen',
      },
    },
    {
      type: 'user_name',
      label: 'UserName',
      field: {
        id: 'user_name',
        type: 'textfield',
        label: 'UserName',
        required: false,
        presetField: 'user_name',
      },
    },
    {
      type: 'weeks_since_last_review',
      label: 'Number of Weeks Since Last Review',
      field: {
        id: 'weeks_since_last_review',
        type: 'number',
        label: 'Number of Weeks Since Last Review',
        required: false,
        presetField: 'weeks_since_last_review',
      },
    },
  ],
  trainer: [
    {
      type: 'date_last_logged_in',
      label: 'Date Last Logged In',
      field: {
        id: 'date_last_logged_in',
        type: 'date',
        label: 'Date Last Logged In',
        required: false,
        presetField: 'date_last_logged_in',
      },
    },
    {
      type: 'email',
      label: 'Email',
      field: {
        id: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'Enter your email',
        presetField: 'TrainerEmail',
      },
    },
    {
      type: 'mobile',
      label: 'Phone',
      field: {
        id: 'mobile',
        type: 'textfield',
        label: 'Phone',
        placeholder: 'Enter your phone number',
        presetField: 'mobile',
      },
    },
    {
      type: 'number_of_active_learners',
      label: 'Number of Active Learners',
      field: {
        id: 'number_of_active_learners',
        type: 'number',
        label: 'Number of Active Learners',
        required: false,
        presetField: 'number_of_active_learners',
      },
    },
    {
      type: 'trainer-name',
      label: 'Trainer Name',
      field: {
        id: 'trainer-name',
        type: 'textfield',
        label: 'Trainer Name',
        placeholder: 'Enter your name',
        presetField: 'TrainerFullName',
      },
    },
    {
      type: 'user_name',
      label: 'User Name',
      field: {
        id: 'user_name',
        type: 'textfield',
        label: 'User Name',
        required: false,
        presetField: 'user_name',
      },
    },
  ],
  employee: [
    {
      type: 'address_1',
      label: 'Address 1',
      field: {
        id: 'address_1',
        type: 'textfield',
        label: 'Address 1',
        required: false,
        presetField: 'address_1',
      },
    },
    {
      type: 'address_2',
      label: 'Address 2',
      field: {
        id: 'address_2',
        type: 'textfield',
        label: 'Address 2',
        required: false,
        presetField: 'address_2',
      },
    },
    {
      type: 'employer_county',
      label: 'County',
      field: {
        id: 'employer_county',
        type: 'textfield',
        label: 'County',
        required: false,
        presetField: 'employer_county',
      },
    },
    {
      type: 'employer_telephone',
      label: 'Telephone',
      field: {
        id: 'employer_telephone',
        type: 'textfield',
        label: 'Telephone',
        required: false,
        presetField: 'employer_telephone',
      },
    },
    {
      type: 'employer_postcode',
      label: 'Postcode',
      field: {
        id: 'employer_postcode',
        type: 'textfield',
        label: 'Postcode',
        required: false,
        presetField: 'employer_postcode',
      },
    },
    {
      type: 'employer_town_city',
      label: 'Town / City',
      field: {
        id: 'employer_town_city',
        type: 'textfield',
        label: 'Town / City',
        required: false,
        presetField: 'employer_town_city',
      },
    },
    {
      type: 'employee-name',
      label: 'Employee Name',
      field: {
        id: 'employee-name',
        type: 'textfield',
        label: 'Employee Name',
        placeholder: 'Enter your name',
        presetField: 'EmployeeName',
      },
    },
    {
      type: 'health_safety_renewal_date',
      label: 'Health and Safety Renewal Date',
      field: {
        id: 'health_safety_renewal_date',
        type: 'date',
        label: 'Health and Safety Renewal Date',
        required: false,
        presetField: 'health_safety_renewal_date',
      },
    },
    {
      type: 'insurance_renewal_date',
      label: 'Liability Insurance Renewal Date',
      field: {
        id: 'insurance_renewal_date',
        type: 'textfield',
        label: 'Liability Insurance Renewal Date',
        required: false,
        presetField: 'insurance_renewal_date',
      },
    },
    {
      type: 'number_of_learners',
      label: 'Number of Learners',
      field: {
        id: 'number_of_learners',
        type: 'number',
        label: 'Number of Learners',
        required: false,
        presetField: 'number_of_learners',
      },
    },
  ],
}

