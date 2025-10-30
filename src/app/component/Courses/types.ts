// Course data interface
export interface CourseData {
  brand_guidelines: string;
  course_code: string;
  course_name: string;
  guided_learning_hours: string;
  level: string;
  operational_start_date: string;
  overall_grading_type: string;
  permitted_delivery_types: string;
  course_type: string;
  course_core_type: string;
  qualification_status: string;
  qualification_type: string;
  recommended_minimum_age: string;
  sector: string;
  total_credits: string;
  duration_period: string;
  duration_value: string;
  professional_certification: string;
  two_page_standard_link: string;
  assessment_plan_link: string;
  active: string;
  included_in_off_the_job: string;
  awarding_body: string;
  questions: any[];
  assigned_standards: any[];
  [key: string]: any;
}

// Unit interface
export interface Unit {
  id: string | number;
  unit_ref?: string;
  component_ref?: string;
  title: string;
  mandatory: string;
  level?: string | null;
  glh?: number | null;
  credit_value?: number | null;
  moduleType?: string;
  subUnit: any[];
  learning_outcomes: any[];
  assessment_criteria?: any[];
  [key: string]: any;
}

// Course state interface
export interface CourseState {
  courseData: CourseData;
  mandatoryUnit: Record<string | number, Unit>;
  savedUnits: Record<string | number, boolean>;
  loading: boolean;
}

// Course action types
export type CourseAction =
  | { type: 'SET_COURSE_DATA'; payload: CourseData }
  | { type: 'UPDATE_COURSE_FIELD'; field: string; value: any }
  | { type: 'SET_MANDATORY_UNIT'; payload: Record<string | number, Unit> }
  | { type: 'UPDATE_MANDATORY_UNIT'; unitId: string | number; field: string; value: any }
  | { type: 'ADD_UNIT'; unitId: string | number; unit: Unit }
  | { type: 'REMOVE_UNIT'; unitId: string | number }
  | { type: 'SET_SAVED_UNITS'; payload: Record<string | number, boolean> }
  | { type: 'MARK_UNITS_SAVED' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INITIALIZE_FROM_API'; courseData: CourseData; units: Record<string | number, Unit>; savedUnits: Record<string | number, boolean> };

// Props for the CourseBuilder component
export interface CourseBuilderProps {
  edit?: 'create' | 'edit' | 'view';
  handleClose?: () => void;
}

// Assessment method type
export interface AssessmentMethod {
  value: string;
  label: string;
  fullName: string;
}

// Define the interface for the criterion data
export interface TableCriterion {
  id: string;
  number: string;
  title: string;
  description: string;
  type: 'to-do' | 'to-know' | 'req';
  showOrder: number;
  assessmentMethods: Record<string, string>;
  timesMet: number;
}

// Assessment methods for qualification criteria
export const assessmentMethods: AssessmentMethod[] = [
  { value: 'pe', label: 'PE', fullName: 'Professional Discussion' },
  { value: 'do', label: 'DO', fullName: 'Direct Observation' },
  { value: 'wt', label: 'WT', fullName: 'Witness Testimony' },
  { value: 'qa', label: 'QA', fullName: 'Question and Answer' },
  { value: 'ps', label: 'PS', fullName: 'Product Sample' },
  { value: 'di', label: 'DI', fullName: 'Discussion' },
  { value: 'si', label: 'SI', fullName: 'Simulation' },
  { value: 'ee', label: 'ET', fullName: 'Expert Evidence' },
  { value: 'ba', label: 'RA', fullName: 'Basic Assessment' },
  { value: 'ot', label: 'OT', fullName: 'Other' },
  { value: 'ipl', label: 'RPL', fullName: 'Individual Personal Log' },
  { value: 'lo', label: 'LO', fullName: 'Learning Outcome' }
];
