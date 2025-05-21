// Export the main CourseBuilder component
import CourseBuilder from './CourseBuilder';

// Export other components that might be needed elsewhere
import QualificationForm from './QualificationForm';
import StandardForm from './StandardForm';
import GatewayForm from './GatewayForm';
import UnitRenderer from './UnitRenderer';
import ModuleEditor from './ModuleEditor';
import StandardTopicEditor from './StandardTopicEditor';
import StepperComponent from './StepperComponent';
import { useCourseBuilder } from './useCourseBuilder';

// Define types directly to avoid import issues
export type CourseData = {
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
  checklist: any[];
  assigned_standards: any[];
  [key: string]: any;
};

export type Unit = {
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
};

export type CourseState = {
  courseData: CourseData;
  mandatoryUnit: Record<string | number, Unit>;
  savedUnits: Record<string | number, boolean>;
  loading: boolean;
};

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

export type CourseBuilderProps = {
  edit?: 'create' | 'edit' | 'view';
  handleClose?: () => void;
};

export type {
  ModuleEditorProps,
  UnitRendererProps,
  TopicEditorProps,
  QualificationCriteriaTableProps,
  StandardTopicEditorProps
} from './componentTypes';

export {
  QualificationForm,
  StandardForm,
  GatewayForm,
  UnitRenderer,
  ModuleEditor,
  StandardTopicEditor,
  StepperComponent,
  useCourseBuilder
};

export default CourseBuilder;
