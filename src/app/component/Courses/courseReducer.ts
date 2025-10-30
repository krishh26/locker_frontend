// Define types directly to avoid import issues
interface CourseData {
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

interface Unit {
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

interface CourseState {
  courseData: CourseData;
  mandatoryUnit: Record<string | number, Unit>;
  savedUnits: Record<string | number, boolean>;
  loading: boolean;
}

type CourseAction =
  | { type: 'SET_COURSE_DATA'; payload: CourseData }
  | { type: 'UPDATE_COURSE_FIELD'; field: string; value: any }
  | { type: 'SET_MANDATORY_UNIT'; payload: Record<string | number, Unit> }
  | { type: 'UPDATE_MANDATORY_UNIT'; unitId: string | number; field: string; value: any }
  | { type: 'ADD_UNIT'; unitId: string | number; unit: Unit }
  | { type: 'REMOVE_UNIT'; unitId: string | number }
  | { type: 'SET_SAVED_UNITS'; payload: Record<string | number, boolean> }
  | { type: 'MARK_UNITS_SAVED' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET_COURSE_DATA'; courseType: string }
  | { type: 'INITIALIZE_FROM_API'; courseData: CourseData; units: Record<string | number, Unit>; savedUnits: Record<string | number, boolean> };

// Format text utility
export const formatText = (text = ''): string => text.replace(/\n/g, ' ');

// Empty course data constant
export const EMPTY_COURSE_DATA = {
  brand_guidelines: '',
  course_code: '',
  course_name: '',
  guided_learning_hours: '',
  level: '',
  operational_start_date: '',
  overall_grading_type: '',
  permitted_delivery_types: '',
  course_type: '',
  course_core_type: '', // Don't set a default value to avoid overriding API data
  qualification_status: '',
  qualification_type: '',
  recommended_minimum_age: '',
  sector: '',
  total_credits: '',
  duration_period: '',
  duration_value: '',
  professional_certification: '',
  two_page_standard_link: '',
  assessment_plan_link: '',
  active: 'Yes',
  included_in_off_the_job: 'Yes',
  awarding_body: 'No Awarding Body',
  assigned_gateway_id: null,
  assigned_gateway_name: '',
  questions: [],
  assigned_standards: []
};

// Legacy course types
export const LEGACY_COURSE_TYPES = [
  'A2 Level', 'AS Level', 'Btec National', 'CORE', 'Core Skills - Communication',
  'Core Skills - ICT', 'Core Skills - Numeracy', 'Core Skills - Problem Solving',
  'Core Skills - Unknown', 'Core Skills - Working with others', 'ERR',
  'FUNCTIONAL SKILLS', 'Functional Skills - ICT', 'Functional Skills - Maths',
  'Functional Skills English', 'GCSE', 'Key Skills - Communication',
  'Key Skills - ICT', 'Key Skills - Improving own learning', 'Key Skills - Number',
  'Key Skills - unknown', 'MAIN', 'NVQ', 'PLTS', 'SVQ', 'TECH', 'VCQ', 'VRQ'
];

// Initial state
export const initialState: CourseState = {
  courseData: { ...EMPTY_COURSE_DATA },
  mandatoryUnit: {},
  savedUnits: {},
  loading: false
};

// Reducer for course state management
export const courseReducer = (state: CourseState, action: CourseAction): CourseState => {
  switch (action.type) {
    case 'SET_COURSE_DATA':
      return { ...state, courseData: action.payload };

    case 'UPDATE_COURSE_FIELD':
      return {
        ...state,
        courseData: {
          ...state.courseData,
          [action.field]: action.value
        }
      };

    case 'SET_MANDATORY_UNIT':
      return { ...state, mandatoryUnit: action.payload };

    case 'UPDATE_MANDATORY_UNIT':
      // If field is 'all', replace the entire unit with the provided value
      if (action.field === 'all') {
        return {
          ...state,
          mandatoryUnit: {
            ...state.mandatoryUnit,
            [action.unitId]: action.value
          }
        };
      } else {
        // Otherwise, just update the specific field
        return {
          ...state,
          mandatoryUnit: {
            ...state.mandatoryUnit,
            [action.unitId]: {
              ...state.mandatoryUnit[action.unitId],
              [action.field]: action.value
            }
          }
        };
      }

    case 'ADD_UNIT':
      const updatedSavedUnits = { ...state.savedUnits };
      updatedSavedUnits[action.unitId] = false;

      return {
        ...state,
        mandatoryUnit: {
          ...state.mandatoryUnit,
          [action.unitId]: action.unit
        },
        savedUnits: updatedSavedUnits
      };

    case 'REMOVE_UNIT':
      const { [action.unitId]: _, ...remainingUnits } = state.mandatoryUnit;
      const filteredSavedUnits = { ...state.savedUnits };
      delete filteredSavedUnits[action.unitId];

      return {
        ...state,
        mandatoryUnit: remainingUnits,
        savedUnits: filteredSavedUnits
      };

    case 'SET_SAVED_UNITS':
      return { ...state, savedUnits: action.payload };

    case 'MARK_UNITS_SAVED':
      const savedUnits = {};
      Object.keys(state.mandatoryUnit).forEach(id => {
        savedUnits[id] = true;
      });
      return { ...state, savedUnits };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'RESET_COURSE_DATA':
      return {
        ...initialState,
        courseData: {
          ...EMPTY_COURSE_DATA,
          course_core_type: action.courseType
        }
      };

    case 'INITIALIZE_FROM_API':
      // Log the course_core_type before and after merging with EMPTY_COURSE_DATA
      const mergedCourseData = {
        ...EMPTY_COURSE_DATA,
        ...action.courseData
      };
      // Ensure units are properly formatted
      const processedUnits = action.units || {};

      return {
        ...state,
        courseData: mergedCourseData,
        mandatoryUnit: processedUnits,
        savedUnits: action.savedUnits || {}
      };

    default:
      return state;
  }
};
