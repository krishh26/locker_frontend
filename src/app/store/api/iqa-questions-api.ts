import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'

// Types for IQA questions
export interface IQAQuestion {
  id: number
  question: string
  questionType: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface IQAQuestionResponse {
  data: IQAQuestion
  message: string
  status: boolean
}

export interface IQAQuestionListResponse {
  data: IQAQuestion[]
  message: string
  status: boolean
}

export interface CreateIQAQuestionPayload {
  questionType: string
  questions?: Array<{
    id?: number
    question: string
  }>
}

export interface CreateSingleIQAQuestionPayload {
  questionType: string
  question: string
}

export interface UpdateIQAQuestionPayload {
  question: string
  questionType?: string
  isActive?: boolean
}

// Create the API slice
export const iqaQuestionsAPI = createApi({
  reducerPath: 'iqa-questions-api',
  baseQuery: createBaseQueryWithReAuth(),
  tagTypes: ['IQAQuestion'],
  endpoints: (builder) => ({
    // Get all IQA questions by type
    getIQAQuestions: builder.query<IQAQuestionListResponse, { questionType?: string }>({
      query: ({ questionType }) => {
        const params = questionType ? `?type=${questionType}` : ''
        return {
          url: `/iqa-questions/admin/questions${params}`,
          method: 'GET',
        }
      },
      providesTags: ['IQAQuestion'],
      transformErrorResponse: (response: any) => {
        throw new Error(`Failed to fetch IQA questions: ${response?.data?.message || response?.statusText || 'Unknown error'}`)
      },
    }),

    // Create a single IQA question
    createIQAQuestion: builder.mutation<IQAQuestionResponse, CreateSingleIQAQuestionPayload>({
      query: (payload) => ({
        url: '/iqa-questions/admin/questions',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['IQAQuestion'],
      transformErrorResponse: (response: any) => {
        throw new Error(`Failed to create IQA question: ${response?.data?.message || response?.statusText || 'Unknown error'}`)
      },
    }),

    // Create or Update IQA questions (bulk - kept for backward compatibility)
    saveIQAQuestions: builder.mutation<IQAQuestionResponse, CreateIQAQuestionPayload>({
      query: (payload) => ({
        url: '/iqa-questions/admin/questions/bulk-save',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['IQAQuestion'],
      transformErrorResponse: (response: any) => {
        throw new Error(`Failed to save IQA questions: ${response?.data?.message || response?.statusText || 'Unknown error'}`)
      },
    }),

    // Update IQA question by ID
    updateIQAQuestion: builder.mutation<IQAQuestionResponse, { id: number; payload: UpdateIQAQuestionPayload }>({
      query: ({ id, payload }) => ({
        url: `/iqa-questions/admin/questions/${id}`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['IQAQuestion'],
      transformErrorResponse: (response: any) => {
        throw new Error(`Failed to update IQA question: ${response?.data?.message || response?.statusText || 'Unknown error'}`)
      },
    }),

    // Delete IQA question by ID
    deleteIQAQuestion: builder.mutation<{ message: string; success: boolean }, number>({
      query: (id) => ({
        url: `/iqa-questions/admin/questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['IQAQuestion'],
      transformErrorResponse: (response: any) => {
        throw new Error(`Failed to delete IQA question: ${response?.data?.message || response?.statusText || 'Unknown error'}`)
      },
    }),
  }),
})

// Export hooks for use in components
export const {
  useGetIQAQuestionsQuery,
  useCreateIQAQuestionMutation,
  useSaveIQAQuestionsMutation,
  useUpdateIQAQuestionMutation,
  useDeleteIQAQuestionMutation,
} = iqaQuestionsAPI

