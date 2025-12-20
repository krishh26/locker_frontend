export type FormValues = {
  title: string
  description: string
  trainer_feedback: string
  points_for_improvement: string
  audio: (File & { url?: string }) | null;
  learner_comments: string
  evidence_time_log: boolean
  session: string
  grade: string
  declaration: boolean
  assessment_method: string[]
  units: Unit[]
  signatures: SignatureData[]
}

export interface SignatureData {
  role: string
  name: string
  signed: boolean
  es?: string
  date?: string
  signature_required: boolean
}

export interface SubUnit {
  id: string
  title: string
  description?: string
  type?: string
  showOrder?: number
  code?: string
  learnerMap?: boolean
  trainerMap?: boolean
  signedOff?: boolean
  comment?: string
}

export interface Unit {
  id: string | number
  title: string
  type?: string
  code?: string
  unit_ref?: string
  mandatory?: boolean
  description?: string
  delivery_method?: string
  otj_hours?: string
  delivery_lead?: string
  sort_order?: string
  active?: boolean
  subUnit: SubUnit[]
  learnerMap?: boolean
  trainerMap?: boolean
  signedOff?: boolean
  comment?: string
  course_id?: string | number
}