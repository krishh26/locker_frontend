import { Dispatch } from 'react';

// Import types directly from the file to avoid circular dependencies
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

type CourseAction =
  | { type: 'SET_COURSE_DATA'; payload: any }
  | { type: 'UPDATE_COURSE_FIELD'; field: string; value: any }
  | { type: 'SET_MANDATORY_UNIT'; payload: Record<string | number, Unit> }
  | { type: 'UPDATE_MANDATORY_UNIT'; unitId: string | number; field: string; value: any }
  | { type: 'ADD_UNIT'; unitId: string | number; unit: Unit }
  | { type: 'REMOVE_UNIT'; unitId: string | number }
  | { type: 'SET_SAVED_UNITS'; payload: Record<string | number, boolean> }
  | { type: 'MARK_UNITS_SAVED' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INITIALIZE_FROM_API'; courseData: any; units: Record<string | number, Unit>; savedUnits: Record<string | number, boolean> };

// Props for ModuleEditor component
export interface ModuleEditorProps {
  courseId?: string;
  courseData?: any;
  modules?: any[];
  onSave?: (updatedModules: any[]) => void;
  onClose?: () => void;
  readOnly?: boolean;
  mandatoryUnit?: Record<string | number, Unit>;
  courseDispatch?: Dispatch<CourseAction>;
  savedUnits?: Record<string | number, boolean>;
  setCourseSaved?: Dispatch<React.SetStateAction<boolean>>;
  edit?: 'create' | 'edit' | 'view';
  showModuleEditor?: boolean;
  setShowModuleEditor?: Dispatch<React.SetStateAction<boolean>>;
  onEditModules?: () => void;
}

// Props for UnitRenderer component
export interface UnitRendererProps {
  courseId?: string;
  mandatoryUnit: Record<string | number, Unit>;
  courseDispatch: Dispatch<CourseAction>;
  savedUnits: Record<string | number, boolean>;
  setCourseSaved: Dispatch<React.SetStateAction<boolean>>;
  edit: 'create' | 'edit' | 'view';
  setUnitData?: (unitId: string | number, data: { name: string, value: any }) => void;
  removeUnitHandler?: (unitId: string | number) => void;
  addSubUnitHandler?: (unitId: string | number) => void;
  setSubUnitData?: (unitId: string | number, subUnitId: string | number, data: { name: string, value: any }) => void;
  removeSubUnitHandler?: (unitId: string | number, subUnitId: string | number) => void;
  setSubTopicData?: (unitId: string | number, subUnitId: string | number, subTopicId: string | number, data: { name: string, value: any }) => void;
  removeSubTopicHandler?: (unitId: string | number, subUnitId: string | number, subTopicId: string | number) => void;
  addTopicHandler?: (unitId: string | number, subUnitId: string | number) => void;
  courseType?: string;
  saveCourse?: () => Promise<boolean>;
}

// Props for TopicEditor component
export interface TopicEditorProps {
  courseId?: string;
  courseData?: any;
  modules?: any[];
  onSave?: (updatedModules: any[]) => void;
  onClose?: () => void;
  onEditModules?: () => void;
  readOnly?: boolean;
  mandatoryUnit?: Record<string | number, Unit>;
  courseDispatch?: Dispatch<CourseAction>;
  savedUnits?: Record<string | number, boolean>;
  edit?: 'create' | 'edit' | 'view';
  showTopicEditor?: boolean;
  setShowTopicEditor?: Dispatch<React.SetStateAction<boolean>>;
}

// Props for QualificationCriteriaTable component
export interface QualificationCriteriaTableProps {
  courseId?: string;
  mandatoryUnit: Record<string | number, Unit>;
  courseDispatch: Dispatch<CourseAction>;
  savedUnits: Record<string | number, boolean>;
  edit: 'create' | 'edit' | 'view';
}

// Props for StandardTopicEditor component
export interface StandardTopicEditorProps {
  courseId?: string;
  mandatoryUnit: Record<string | number, Unit>;
  courseDispatch?: Dispatch<CourseAction>;
  savedUnits?: Record<string | number, boolean>;
  edit?: 'create' | 'edit' | 'view';
  showTopicEditor?: boolean;
  setShowTopicEditor?: Dispatch<React.SetStateAction<boolean>>;
  saveCourse?: () => Promise<boolean>;
}
