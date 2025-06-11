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
}

export interface SubUnit {
  id: number
  subTitle: string
  learnerMap?: boolean
  trainerMap?: boolean
  comment?: string
}

export interface Unit {
  id: string
  title: string
  subUnit: SubUnit[]
}