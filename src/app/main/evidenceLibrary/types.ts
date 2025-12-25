// Evidence Library Types and Interfaces

export interface EvidenceData {
  assignment_id: number
  file: {
    name: string
    key: string
    url: string
  } | null
  declaration: string | null
  title: string | null
  description: string | null
  trainer_feedback: string | null
  external_feedback: string | null
  learner_comments: string | null
  points_for_improvement: string | null
  assessment_method: string | null
  session: string | null
  grade: string | null
  mappings?: Array<{
    mapping_id: number
    unit_code: string
    sub_unit_id: number | null
    learnerMap: boolean
    trainerMap: boolean
    signedOff?: boolean
    comment?: string | null
    course?: {
      course_id: number
      course_name: string
      course_code: string
      units?: any[]
    }
  }>
  status: string
  evidence_time_log: boolean
  created_at: string
  updated_at: string
  course_id: {
    course_id: number
    course_name: string
    course_code: string
  }
}

export interface DialogState {
  fileUpload: boolean
  reupload: boolean
  deleteBox: boolean
  courseSelection: boolean
  fileSelection: boolean
}

export interface DataState {
  evidenceData: EvidenceData[]
  totalItems: number
  totalPages: number
}

export interface UIState {
  selectedRow: EvidenceData | null
  anchorEl: HTMLElement | null
  isDownloading: boolean
}

export interface SelectionState {
  selectedCourses: Set<number>
  selectedFiles: Set<number>
  selectAll: boolean
  selectAllFiles: boolean
}

export type SelectionAction =
  | { type: 'TOGGLE_COURSE'; courseId: number }
  | { type: 'TOGGLE_FILE'; fileId: number }
  | { type: 'SELECT_ALL_COURSES'; courseIds: number[] }
  | { type: 'SELECT_ALL_FILES'; fileIds: number[] }
  | { type: 'DESELECT_ALL_COURSES' }
  | { type: 'DESELECT_ALL_FILES' }
  | { type: 'SYNC_SELECT_ALL_COURSES'; courseIds: number[]; selectedCourses: Set<number> }
  | { type: 'SYNC_SELECT_ALL_FILES'; fileIds: number[]; selectedFiles: Set<number> }
  | { type: 'RESET_COURSES' }
  | { type: 'RESET_FILES' }

export interface CourseOption {
  course_id: number | ''
  course_name: string
  course_code: string
  units?: any[]
}

