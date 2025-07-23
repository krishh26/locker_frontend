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
      type: 'learner-phone',
      label: ' Learner Phone',
      field: {
        id: 'learner-phone',
        type: 'phone',
        label: 'Phone Number',
        placeholder: 'Enter your phone number',
        required: true,
        presetField: 'LearnerPhoneNumber',
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
  ],
}
