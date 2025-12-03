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
    getPlanDetails: builder.query<
      {
        message?: string
        status?: boolean
        data?: {
          qaName?: string
          assessor_name?: string
          plannedDate?: string
          planned_date?: string
          assessmentMethods?: string[]
          assessment_methods?: string[]
          assessmentProcesses?: string
          assessment_processes?: string
          feedback?: string
          type?: string
          completedDate?: string
          completed_date?: string
          sampleType?: string
          sample_type?: string
          iqaConclusion?: string[]
          iqa_conclusion?: string[]
          assessorDecisionCorrect?: 'Yes' | 'No' | ''
          assessor_decision_correct?: 'Yes' | 'No' | ''
          [key: string]: unknown
        } | null
        [key: string]: unknown
      },
      string | number
    >({
      query: (planId) => {
        const encodedId = encodeURIComponent(String(planId))
        return {
          url: `sample-plan/${encodedId}/details`,
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
          url: `sample-plan/deatil/${encodedId}`,
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
    // Sample Question endpoints
    getSampleQuestions: builder.query<
      {
        message?: string
        status?: boolean
        data?: Array<{
          id: number
          question_text: string
          answer: string
        }>
      },
      string | number
    >({
      query: (planDetailId) => {
        const encodedId = encodeURIComponent(String(planDetailId))
        return {
          url: `sample-question/list/${encodedId}`,
        }
      },
    }),
    createSampleQuestions: builder.mutation<
      {
        message?: string
        status?: boolean
        data?: Array<{
          id: number
          question_text: string
          answer: string
        }>
      },
      {
        plan_detail_id: string | number
        answered_by_id: string | number
        questions: Array<{ question_text: string; answer: string }>
      }
    >({
      query: (body) => ({
        url: 'sample-question/create',
        method: 'POST',
        body,
      }),
    }),
    updateSampleQuestion: builder.mutation<
      {
        message?: string
        status?: boolean
        data?: {
          id: number
          question_text: string
          answer: string
        }
      },
      {
        id: string | number
        question_text: string
        answer: string
      }
    >({
      query: ({ id, ...body }) => {
        const encodedId = encodeURIComponent(String(id))
        return {
          url: `sample-question/update/${encodedId}`,
          method: 'PUT',
          body,
        }
      },
    }),
    deleteSampleQuestion: builder.mutation<
      { message?: string; status?: boolean },
      string | number
    >({
      query: (id) => {
        const encodedId = encodeURIComponent(String(id))
        return {
          url: `sample-question/delete/${encodedId}`,
          method: 'DELETE',
        }
      },
    }),
    // Sample Forms endpoints
    getSampleForms: builder.query<
      {
        message?: string
        status?: boolean
        data?: SampleAllocatedForm[]
      },
      string | number
    >({
      query: (planDetailId) => {
        const encodedId = encodeURIComponent(String(planDetailId))
        return {
          url: `sample-form/list/${encodedId}`,
        }
      },
    }),
    createSampleForm: builder.mutation<
      {
        message?: string
        status?: boolean
        data?: SampleAllocatedForm
      },
      {
        plan_detail_id: string | number
        form_id: string | number
        allocated_by_id: string | number
        description?: string
      }
    >({
      query: (body) => ({
        url: 'sample-form/create',
        method: 'POST',
        body,
      }),
    }),
    deleteSampleForm: builder.mutation<
      { message?: string; status?: boolean },
      string | number
    >({
      query: (id) => {
        const encodedId = encodeURIComponent(String(id))
        return {
          url: `sample-form/delete/${encodedId}`,
          method: 'DELETE',
        }
      },
    }),
    completeSampleForm: builder.mutation<
      {
        message?: string
        status?: boolean
        data?: SampleAllocatedForm
      },
      string | number
    >({
      query: (id) => {
        const encodedId = encodeURIComponent(String(id))
        return {
          url: `sample-form/complete/${encodedId}`,
          method: 'PUT',
        }
      },
    }),
    removeSampledLearner: builder.mutation<
      {
        message?: string
        status?: boolean
      },
      string | number
    >({
      query: (detailId) => {
        const encodedId = encodeURIComponent(String(detailId))
        return {
          url: `sample-plan/remove-sampled-learner/${encodedId}`,
          method: 'DELETE',
        }
      },
    }),
    getEvidenceList: builder.query<
      {
        message?: string
        status?: boolean
        data?: Array<{
          assignment_id: number
          title: string
          description: string | null
          file: {
            name: string
            size: number
            key: string
            url: string
          }
          grade: string | null
          assessment_method: string[]
          created_at: string
          unit: {
            unit_ref: string
            title: string
          }
          mappedSubUnits: Array<{
            id: number
            subTitle: string
          }>
          reviews: Record<string, unknown>
        }>
      },
      { planDetailId: string | number; unitCode: string }
    >({
      query: ({ planDetailId, unitCode }) => {
        const encodedId = encodeURIComponent(String(planDetailId))
        const params = new URLSearchParams()
        if (unitCode) {
          params.append('unit_code', unitCode)
        }
        return {
          url: `sample-plan/${encodedId}/evidence${params.toString() ? `?${params.toString()}` : ''}`,
        }
      },
    }),
    addAssignmentReview: builder.mutation<
      {
        message?: string
        status?: boolean
      },
      {
        assignment_id: number
        sampling_plan_detail_id: number
        role: string
        comment: string
        unit_code: string
      }
    >({
      query: (body) => ({
        url: 'sample-plan/assignment-review',
        method: 'POST',
        body,
      }),
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

export interface SampleAllocatedForm {
  id: number
  description?: string | null
  completed_date?: string | null
  created_at?: string
  updated_at?: string
  form?: {
    id: number
    form_name: string
    description?: string
  }
}

export const {
  useGetSamplePlansQuery,
  useLazyGetSamplePlanLearnersQuery,
  useLazyGetPlanDetailsQuery,
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
  useGetSampleQuestionsQuery,
  useLazyGetSampleQuestionsQuery,
  useCreateSampleQuestionsMutation,
  useUpdateSampleQuestionMutation,
  useDeleteSampleQuestionMutation,
  useGetSampleFormsQuery,
  useLazyGetSampleFormsQuery,
  useCreateSampleFormMutation,
  useDeleteSampleFormMutation,
  useCompleteSampleFormMutation,
  useRemoveSampledLearnerMutation,
  useGetEvidenceListQuery,
  useLazyGetEvidenceListQuery,
  useAddAssignmentReviewMutation,
} = samplePlanAPI


