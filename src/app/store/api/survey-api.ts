import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'

// Survey Management API Types
export type SurveyStatus = 'Draft' | 'Published' | 'Archived'

export type BackgroundType = 'gradient' | 'image'

export interface Survey {
  id: string
  name: string
  description?: string
  status: SurveyStatus
  background?: {
    type: BackgroundType
    value: string // CSS gradient string or image URL
  }
  // Alternative API format (flat structure)
  backgroundType?: BackgroundType
  backgroundValue?: string
  userId?: string
  organizationId?: string
  createdAt: string
  updatedAt: string
  totalQuestions?: number // Optional: provided by API in list responses
  totalResponses?: number // Optional: provided by API in list responses
}

export interface SurveyBackground {
  type: BackgroundType
  value: string
}

// Request Types
export interface CreateSurveyRequest {
  name: string
  description?: string
  status?: SurveyStatus
  background?: SurveyBackground
  organizationId?: string
}

export interface UpdateSurveyRequest {
  name?: string
  description?: string
  status?: SurveyStatus
  background?: SurveyBackground
}

export interface GetSurveysQueryParams {
  status?: SurveyStatus
  userId?: string
  organizationId?: string
  page?: number
  limit?: number
  search?: string
}

// Response Types
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface GetSurveysResponse {
  success: boolean
  data: {
    surveys: Survey[]
    pagination: PaginationMeta
  }
  error?: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

export interface GetSurveyResponse {
  success: boolean
  data: {
    survey: Survey
  }
  error?: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

export interface CreateSurveyResponse {
  success: boolean
  data: {
    survey: Survey
  }
  error?: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

export interface UpdateSurveyResponse {
  success: boolean
  data: {
    survey: Survey
  }
  error?: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

export interface DeleteSurveyResponse {
  success: boolean
  message?: string
  error?: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

// Question Management API Types

export type QuestionType = 'short-text' | 'long-text' | 'multiple-choice' | 'checkbox' | 'rating' | 'date'

export interface Question {
  id: string
  surveyId: string
  title: string
  description?: string
  type: QuestionType
  required: boolean
  options?: string[] | null
  order: number
  createdAt?: string
  updatedAt?: string
}

// Question Request Types
export interface CreateQuestionRequest {
  title: string
  description?: string
  type: QuestionType
  required: boolean
  options?: string[] | null
  order?: number
}

export interface UpdateQuestionRequest {
  title?: string
  description?: string
  type?: QuestionType
  required?: boolean
  options?: string[] | null
  order?: number
}

export interface ReorderQuestionsRequest {
  questionIds: string[]
}

// Question Response Types
export interface GetQuestionsResponse {
  success: boolean
  data: {
    questions: Question[]
  }
  error?: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

export interface GetQuestionResponse {
  success: boolean
  data: {
    question: Question
  }
  error?: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

export interface CreateQuestionResponse {
  success: boolean
  data: {
    question: Question
  }
  error?: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

export interface UpdateQuestionResponse {
  success: boolean
  data: {
    question: Question
  }
  error?: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

export interface DeleteQuestionResponse {
  success: boolean
  message?: string
  error?: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

export interface ReorderQuestionsResponse {
  success: boolean
  data: {
    questions: Array<{
      id: string
      order: number
    }>
  }
  error?: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

// Response Management API Types

export interface Response {
  id: string
  surveyId: string
  userId?: string
  email?: string
  answers: Record<string, string | string[] | null> // questionId → answer value
  submittedAt: string
}

// Response Request Types
export interface GetResponsesQueryParams {
  page?: number
  limit?: number
  startDate?: string // ISO 8601
  endDate?: string // ISO 8601
}

export interface SubmitResponseRequest {
  userId?: string
  email?: string
  answers: Record<string, string | string[] | null>
}

// Response Response Types
export interface GetResponsesResponse {
  success: boolean
  data: {
    responses: Response[]
    pagination: PaginationMeta
  }
  error?: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

export interface GetResponseResponse {
  success: boolean
  data: {
    response: Response
  }
  error?: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

export interface SubmitResponseResponse {
  success: boolean
  data: {
    response: Response
  }
  error?: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

export interface DeleteResponseResponse {
  success: boolean
  message?: string
  error?: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

// Template Application API Types
export interface ApplyTemplateRequest {
  background?: SurveyBackground
  questions: CreateQuestionRequest[]
}

export interface ApplyTemplateResponse {
  success: boolean
  data: {
    survey: Survey
    questions: Question[]
  }
  message?: string
  error?: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

// Public Survey API Types
export interface GetPublicSurveyResponse {
  success: boolean
  data: {
    survey: Survey
    questions: Question[]
  }
  error?: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

export const surveyAPI = createApi({
  reducerPath: 'survey-api',
  baseQuery: createBaseQueryWithReAuth(),
  tagTypes: ['Survey', 'Question', 'Response'],
  endpoints: (builder) => ({
    // 1.1 Get All Surveys
    getSurveys: builder.query<GetSurveysResponse, GetSurveysQueryParams | void>({
      query: (params = {}) => {
        const {
          status,
          userId,
          organizationId,
          page = 1,
          limit = 10,
          search,
        } = (params || {}) as GetSurveysQueryParams;
        let url = `/surveys?page=${page}&limit=${limit}`
        
        if (status) {
          url += `&status=${status}`
        }
        if (userId) {
          url += `&userId=${userId}`
        }
        if (organizationId) {
          url += `&organizationId=${organizationId}`
        }
        if (search) {
          url += `&search=${encodeURIComponent(search)}`
        }
        
        return { url }
      },
      providesTags: ['Survey'],
      keepUnusedDataFor: 0,
    }),

    // 1.2 Get Survey by ID
    getSurveyById: builder.query<GetSurveyResponse, string>({
      query: (surveyId) => ({
        url: `/surveys/${surveyId}`,
      }),
      providesTags: (result, error, surveyId) => [{ type: 'Survey', id: surveyId }],
      keepUnusedDataFor: 0,
    }),

    // 1.3 Create Survey
    createSurvey: builder.mutation<CreateSurveyResponse, CreateSurveyRequest>({
      query: (body) => ({
        url: '/surveys',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Survey'],
    }),

    // 1.4 Update Survey
    updateSurvey: builder.mutation<
      UpdateSurveyResponse,
      { surveyId: string; updates: UpdateSurveyRequest }
    >({
      query: ({ surveyId, updates }) => ({
        url: `/surveys/${surveyId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { surveyId }) => [
        { type: 'Survey', id: surveyId },
        'Survey',
      ],
    }),

    // 1.5 Delete Survey
    deleteSurvey: builder.mutation<DeleteSurveyResponse, string>({
      query: (surveyId) => ({
        url: `/surveys/${surveyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, surveyId) => [
        { type: 'Survey', id: surveyId },
        'Survey',
      ],
    }),

    // 1.6 Get Public Survey with Questions (No Auth Required)
    getPublicSurvey: builder.query<GetPublicSurveyResponse, string>({
      query: (surveyId) => ({
        url: `/surveys/public/${surveyId}`,
        headers: {
          // Explicitly don't send auth header for public endpoint
          Authorization: undefined,
        },
      }),
      providesTags: (result, error, surveyId) => [
        { type: 'Survey', id: surveyId },
      ],
      keepUnusedDataFor: 0,
    }),

    // 2.1 Get Questions for Survey
    getQuestions: builder.query<GetQuestionsResponse, string>({
      query: (surveyId) => ({
        url: `/surveys/${surveyId}/questions`,
      }),
      providesTags: (result, error, surveyId) => [
        { type: 'Question', id: `LIST-${surveyId}` },
      ],
      keepUnusedDataFor: 0,
    }),

    // 2.2 Create Question
    createQuestion: builder.mutation<
      CreateQuestionResponse,
      { surveyId: string; question: CreateQuestionRequest }
    >({
      query: ({ surveyId, question }) => ({
        url: `/surveys/${surveyId}/questions`,
        method: 'POST',
        body: question,
      }),
      invalidatesTags: (result, error, { surveyId }) => [
        { type: 'Question', id: `LIST-${surveyId}` },
        { type: 'Survey', id: surveyId },
      ],
    }),

    // 2.3 Update Question
    updateQuestion: builder.mutation<
      UpdateQuestionResponse,
      { surveyId: string; questionId: string; updates: UpdateQuestionRequest }
    >({
      query: ({ surveyId, questionId, updates }) => ({
        url: `/surveys/${surveyId}/questions/${questionId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { surveyId }) => [
        { type: 'Question', id: `LIST-${surveyId}` },
        { type: 'Survey', id: surveyId },
      ],
    }),

    // 2.4 Delete Question
    deleteQuestion: builder.mutation<
      DeleteQuestionResponse,
      { surveyId: string; questionId: string }
    >({
      query: ({ surveyId, questionId }) => ({
        url: `/surveys/${surveyId}/questions/${questionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { surveyId }) => [
        { type: 'Question', id: `LIST-${surveyId}` },
        { type: 'Survey', id: surveyId },
      ],
    }),

    // 2.5 Reorder Questions
    reorderQuestions: builder.mutation<
      ReorderQuestionsResponse,
      { surveyId: string; questionIds: string[] }
    >({
      query: ({ surveyId, questionIds }) => ({
        url: `/surveys/${surveyId}/questions/reorder`,
        method: 'PATCH',
        body: { questionIds },
      }),
      invalidatesTags: (result, error, { surveyId }) => [
        { type: 'Question', id: `LIST-${surveyId}` },
        { type: 'Survey', id: surveyId },
      ],
    }),

    // 3.1 Get Responses for Survey
    getResponses: builder.query<
      GetResponsesResponse,
      { surveyId: string; params?: GetResponsesQueryParams }
    >({
      query: ({ surveyId, params = {} }) => {
        const { page = 1, limit = 10, startDate, endDate } = params
        let url = `/surveys/${surveyId}/responses?page=${page}&limit=${limit}`
        
        if (startDate) {
          url += `&startDate=${encodeURIComponent(startDate)}`
        }
        if (endDate) {
          url += `&endDate=${encodeURIComponent(endDate)}`
        }
        
        return { url }
      },
      providesTags: (result, error, { surveyId }) => [
        { type: 'Response', id: `LIST-${surveyId}` },
      ],
      keepUnusedDataFor: 0,
    }),

    // 3.2 Get Response by ID
    getResponseById: builder.query<
      GetResponseResponse,
      { surveyId: string; responseId: string }
    >({
      query: ({ surveyId, responseId }) => ({
        url: `/surveys/${surveyId}/responses/${responseId}`,
      }),
      providesTags: (result, error, { surveyId, responseId }) => [
        { type: 'Response', id: responseId },
        { type: 'Response', id: `LIST-${surveyId}` },
      ],
      keepUnusedDataFor: 0,
    }),

    // 3.3 Submit Survey Response (Public Endpoint)
    submitResponse: builder.mutation<
      SubmitResponseResponse,
      { surveyId: string; response: SubmitResponseRequest }
    >({
      query: ({ surveyId, response }) => ({
        url: `/surveys/${surveyId}/responses`,
        method: 'POST',
        body: response,
      }),
      invalidatesTags: (result, error, { surveyId }) => [
        { type: 'Response', id: `LIST-${surveyId}` },
        { type: 'Survey', id: surveyId },
      ],
    }),

    // 3.4 Delete Response
    deleteResponse: builder.mutation<
      DeleteResponseResponse,
      { surveyId: string; responseId: string }
    >({
      query: ({ surveyId, responseId }) => ({
        url: `/surveys/${surveyId}/responses/${responseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { surveyId }) => [
        { type: 'Response', id: `LIST-${surveyId}` },
        { type: 'Survey', id: surveyId },
      ],
    }),

    // 4. Apply Template (Background + Questions in one call)
    applyTemplate: builder.mutation<
      ApplyTemplateResponse,
      { surveyId: string; template: ApplyTemplateRequest }
    >({
      query: ({ surveyId, template }) => ({
        url: `/surveys/${surveyId}/apply-template`,
        method: 'POST',
        body: template,
      }),
      invalidatesTags: (result, error, { surveyId }) => [
        { type: 'Survey', id: surveyId },
        { type: 'Question', id: `LIST-${surveyId}` },
        'Survey',
      ],
    }),
  }),
})

export const {
  useGetSurveysQuery,
  useGetSurveyByIdQuery,
  useCreateSurveyMutation,
  useUpdateSurveyMutation,
  useDeleteSurveyMutation,
  useGetPublicSurveyQuery,
  useGetQuestionsQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useReorderQuestionsMutation,
  useGetResponsesQuery,
  useGetResponseByIdQuery,
  useSubmitResponseMutation,
  useDeleteResponseMutation,
  useApplyTemplateMutation,
} = surveyAPI

