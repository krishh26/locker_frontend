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
    updateSamplePlanDetail: builder.mutation<
      SamplePlanLearnersResponse,
      {
        plan_id: string | number
        completedDate?: string
        feedback?: string
        status?: string
        assessment_methods?: Record<string, boolean>
        iqa_conclusion?: Record<string, any>
        assessor_decision_correct?: boolean
        sample_type?: string
        plannedDate?: string
        type?: string
      }
    >({
      query: ({ plan_id, ...body }) => {
        const encodedId = encodeURIComponent(String(plan_id))
        return {
          url: `sample-plan/detail/${encodedId}`,
          method: 'PATCH',
          body,
        }
      },
    }),
    // Sample Action endpoints
    getSampleActions: builder.query<
      {
        message?: string
        status?: boolean
        data?: SampleAction[]
      },
      string | number
    >({
      query: (planDetailId) => {
        const encodedId = encodeURIComponent(String(planDetailId))
        return {
          url: `sample-action/list/${encodedId}`,
        }
      },
    }),
    createSampleAction: builder.mutation<
      {
        message?: string
        status?: boolean
        data?: SampleAction
      },
      {
        plan_detail_id: string | number
        action_with_id: string | number
        action_required: string
        target_date: string
        status: 'Pending' | 'In Progress' | 'Completed' | 'Closed'
        created_by_id: string | number
        assessor_feedback?: string
      }
    >({
      query: (body) => ({
        url: 'sample-action/create',
        method: 'POST',
        body,
      }),
    }),
    updateSampleAction: builder.mutation<
      {
        message?: string
        status?: boolean
        data?: SampleAction
      },
      {
        actionId: string | number
        action_required?: string
        target_date?: string
        status?: 'Pending' | 'In Progress' | 'Completed' | 'Closed'
        assessor_feedback?: string
        action_with_id?: string | number
      }
    >({
      query: ({ actionId, ...body }) => {
        const encodedId = encodeURIComponent(String(actionId))
        return {
          url: `sample-action/update/${encodedId}`,
          method: 'PATCH',
          body,
        }
      },
    }),
    deleteSampleAction: builder.mutation<
      {
        message?: string
        status?: boolean
      },
      string | number
    >({
      query: (actionId) => {
        const encodedId = encodeURIComponent(String(actionId))
        return {
          url: `sample-action/delete/${encodedId}`,
          method: 'DELETE',
        }
      },
    }),
    // Sample Document endpoints
    getSampleDocuments: builder.query<
      {
        message?: string
        status?: boolean
        data?: SampleDocument[]
      },
      string | number
    >({
      query: (planDetailId) => {
        const encodedId = encodeURIComponent(String(planDetailId))
        return {
          url: `sample-doc/list/${encodedId}`,
        }
      },
    }),
    uploadSampleDocument: builder.mutation<
      {
        message?: string
        status?: boolean
        data?: SampleDocument
      },
      FormData
    >({
      query: (formData) => {
        return {
          url: 'sample-doc/upload',
          method: 'POST',
          body: formData,
        }
      },
    }),
    deleteSampleDocument: builder.mutation<
      {
        message?: string
        status?: boolean
      },
      string | number
    >({
      query: (docId) => {
        const encodedId = encodeURIComponent(String(docId))
        return {
          url: `sample-doc/delete/${encodedId}`,
          method: 'DELETE',
        }
      },
    }),
  }),
})

export interface SampleAction {
  id: number
  action_required: string
  target_date: string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Closed'
  assessor_feedback: string | null
  created_at: string
  updated_at: string
  action_with: {
    user_id: number
    user_name: string
    first_name: string
    last_name: string
    email: string
    [key: string]: unknown
  }
  created_by: {
    user_id: number
    user_name: string
    first_name: string
    last_name: string
    email: string
    [key: string]: unknown
  }
}

export interface SampleDocument {
  id: number
  file_name: string
  file_path?: string
  file_url?: string
  uploaded_at: string
}

export const {
  useGetSamplePlansQuery,
  useLazyGetSamplePlanLearnersQuery,
  useApplySamplePlanLearnersMutation,
  useUpdateSamplePlanDetailMutation,
  useGetSampleActionsQuery,
  useLazyGetSampleActionsQuery,
  useCreateSampleActionMutation,
  useUpdateSampleActionMutation,
  useDeleteSampleActionMutation,
  useGetSampleDocumentsQuery,
  useLazyGetSampleDocumentsQuery,
  useUploadSampleDocumentMutation,
  useDeleteSampleDocumentMutation,
} = samplePlanAPI


