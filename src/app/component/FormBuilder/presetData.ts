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
      type: 'dob',
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
  ],
  trainer: [
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
      type:'user_name',
      label:'User Name',
      field: {
        id: 'user_name',
        type: 'textfield',
        label: 'User Name',
        required: false,
        presetField: 'user_name',
      }
    }
  ],
  employee: [
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
      type: 'branch_code',
      label: 'Branch Code',
      field: {
        id: 'branch_code',
        type: 'textfield',
        label: 'Branch Code',
        required: false,
        presetField: 'branch_code',
      },
    },
    {
      type: 'business_department',
      label: 'Business Department',
      field: {
        id: 'business_department',
        type: 'textfield',
        label: 'Business Department',
        required: false,
        presetField: 'business_department',
      },
    },
    {
      type: 'business_location',
      label: 'Business Location',
      field: {
        id: 'business_location',
        type: 'textfield',
        label: 'Business Location',
        required: false,
        presetField: 'business_location',
      },
    },
    {
      type: 'country',
      label: 'Country',
      field: {
        id: 'country',
        type: 'textfield',
        label: 'Country',
        required: false,
        presetField: 'country',
      },
    },
    {
      type: 'edrs_number',
      label: 'EDRS Number',
      field: {
        id: 'edrs_number',
        type: 'textfield',
        label: 'EDRS Number',
        required: false,
        presetField: 'edrs_number',
      },
    },
    {
      type: 'key_contact',
      label: 'Key Contact',
      field: {
        id: 'key_contact',
        type: 'textfield',
        label: 'Key Contact',
        required: false,
        presetField: 'key_contact',
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
      type: 'msi_employer_id',
      label: 'MSI Employer ID',
      field: {
        id: 'msi_employer_id',
        type: 'textfield',
        label: 'MSI Employer ID',
        required: false,
        presetField: 'msi_employer_id',
      },
    },
    {
      type: 'city',
      label: 'City',
      field: {
        id: 'city',
        type: 'textfield',
        label: 'City',
        required: false,
        presetField: 'city',
      },
    },
    {
      type: 'website',
      label: 'Website',
      field: {
        id: 'website',
        type: 'textfield',
        label: 'Website',
        required: false,
        presetField: 'website',
      },
    },
  ],
}
