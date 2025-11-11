import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'

export interface SamplePlanItem {
  plan_id?: number | string
  planId?: number | string
  id?: number | string
  plan_name?: string
  planName?: string
  name?: string
  title?: string
  [key: string]: unknown
}

export interface SamplePlanResponse {
  data?: SamplePlanItem[] | SamplePlanItem | null
  message?: string
  status?: boolean
  [key: string]: unknown
}

export interface SamplePlanQueryParams {
  course_id: string | number
  iqa_id: string | number
}

export interface SamplePlanLearnerUnit {
  unit_code?: string | null
  unit_name?: string | null
  is_selected?: boolean
  id?: string | number | null
  unit_ref?: string | null
  unitId?: string | number | null
  unitRef?: string | null
  [key: string]: unknown
}

export interface SamplePlanLearner {
  assessor_name?: string
  risk_level?: string
  qa_approved?: boolean
  learner_name?: string
  sample_type?: string
  planned_date?: string | null
  status?: string
  units?: SamplePlanLearnerUnit[]
  learner_id?: string | number
  learnerId?: string | number
  id?: string | number
  [key: string]: unknown
}

export interface SamplePlanLearnerPayload {
  plan_id?: string | number
  course_name?: string
  learners?: SamplePlanLearner[]
  [key: string]: unknown
}

export interface SamplePlanLearnersResponse {
  message?: string
  status?: boolean
  data?: SamplePlanLearnerPayload | SamplePlanLearner[] | null
  [key: string]: unknown
}

export const samplePlanAPI = createApi({
  reducerPath: 'samplePlanAPI',
  baseQuery: createBaseQueryWithReAuth(),
  endpoints: (builder) => ({
    getSamplePlans: builder.query<SamplePlanResponse, SamplePlanQueryParams>({
      query: (params) => {
        const filteredParams = Object.fromEntries(
          Object.entries(params).filter(
            ([, value]) => value !== '' && value !== null && value !== undefined
          )
        )

        return {
          url: 'sample-plan/list',
          params: filteredParams,
        }
      },
    }),
    getSamplePlanLearners: builder.query<SamplePlanLearnersResponse, string | number>({
      query: (planId) => {
        const encodedId = encodeURIComponent(String(planId))
        return {
          url: `sample-plan/${encodedId}/learners`,
        }
      },
    }),
    applySamplePlanLearners: builder.mutation<
      SamplePlanLearnersResponse,
      {
        plan_id: string | number
        sample_type: string
        created_by: string | number
        assessment_methods: Record<string, boolean>
        learners: Array<{
          learner_id: string | number
          plannedDate?: string | null
          units: Array<{
            id: string | number
            unit_ref: string
          }>
        }>
      }
    >({
      query: (body) => ({
        url: 'sample-plan/add-sampled-learners',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGetSamplePlansQuery,
  useLazyGetSamplePlanLearnersQuery,
  useApplySamplePlanLearnersMutation,
} = samplePlanAPI


