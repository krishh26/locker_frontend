// Course type options for the global filter
export const COURSE_TYPE_OPTIONS = [
  { value: "Qualification", label: "Qualification" },
  { value: "Standard", label: "Standard" },
  { value: "Gateway", label: "Gateway" }
] as const;

// Course types for forms
export const COURSE_TYPES = [
  'Functional Skills - Maths',
  'Functional Skills English',
  'Btec National',
  'Diploma',
  'RQF'
] as const;

// Course levels for forms
export const COURSE_LEVELS = [
  'Entry Level',
  'Level 1',
  'Level 2',
  'Level 3',
  'Level 4',
  'Level 5',
  'Level 6',
  'Level 7',
  'Level 8'
] as const;

// Gateway course interface
export interface GatewayCourse {
  course_id: number;
  course_name: string;
  course_code: string;
  active: string;
  [key: string]: any;
}

// Awarding body options
export const AWARDING_BODY_OPTIONS = [
  'EDEXCEL',
  'City and Guilds',
  'OCR',
  'UFI',
  'IMIAL',
  'BCS',
  'ILM',
  'SQA',
  'OCNW',
  'CIMGT',
  'EDI',
  'LLUK',
  'NCFE',
  'EAL',
  'CACHE',
  'GQA',
  'CAA',
  'EQL',
  '1st4sport',
  'CSkills',
  'Future',
  'CMI',
  'AIM',
  'ABBE',
  'FIRST',
  'VTCT',
  'CYQ',
  'CFA',
  'AAT',
  'BIoR',
  'NOCN',
  'NPTC',
  'CIH',
  'SkillsFirst',
  'TBA',
  'IQ',
  'ABC',
  'IAM',
  'SFEDI',
  'IWFM',
  'SEMTA',
  'PAAVQ-SET',
  'CCEA',
  'HABC',
  'Ascentis',
  'ASDAN',
  'FDQ',
  'Active IQ',
  'Pearson',
  'ECITB',
  'CIBTAC',
  'BTEC',
  'People 1st',
  'Skills for Care',
  'CII',
  'CIEH',
  'APT',
  'WJEC',
  'BIIAB',
  'NFOPP',
  'Agored',
  'AQA',
  'SFJ',
  'NCTJ',
  'WAMITAB',
  'IFS',
  'Laser',
  'BPEC',
  'ICQ',
  'NOT USED',
  'PAAVQSET',
  'FAQ',
  'Sports Leaders UK',
  'SVC',
  'CPCAB',
  'LAO',
  'OCNLR',
  'ISMM',
  'BIFM',
  'Open Awards',
  'LCL',
  'CQ',
  'CIPS',
  'REC',
  'CERTA',
  'ASFI',
  'Gateway',
  'ETCAL',
  'CILT',
  'YMCA',
  'RSL',
  'ATHE',
  'N/A',
  'CISI',
  'IAO',
  'CIPD',
  'UAL',
  'CILEx',
  'ASA',
  'Signature',
  'TQUK',
  'ITC',
  'IoH',
  'OAL',
  'MPQC',
  'Proqual',
  'ITEC',
  'Lantra',
  'QA',
  'Highfield',
  'CABWI',
  'CIM',
  'No Awarding Body',
  'CICM',
  'British Safety Council',
  'CIPFA',
  'Vetskill',
  'IQL',
  'BKSB'
] as const;

// Duration period options
export const DURATION_PERIODS = [
  'Days',
  'Weeks',
  'Months',
  'Years'
] as const;

// Yes/No options
export const YES_NO_OPTIONS = ['Yes', 'No'] as const;

