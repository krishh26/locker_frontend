import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'

// Types for Session Type
export interface SessionType {
  id: number
  name: string
  isOffTheJob: boolean
  isActive: boolean
  order: number
  createdAt?: string
  updatedAt?: string
}

// Types for API requests (snake_case for backend)
export interface CreateSessionTypePayload {
  name: string
  is_off_the_job: boolean
  active: boolean
}

export interface UpdateSessionTypePayload {
  name: string
  is_off_the_job: boolean
  active: boolean
}

export interface ReorderSessionTypePayload {
  id: number
  direction: 'UP' | 'DOWN'
}

// API Response types
export interface SessionTypesResponse {
  data: SessionType[]
  message?: string
  status?: boolean
}

export interface SessionTypeResponse {
  data: SessionType
  message?: string
  status?: boolean
}

// Create the API slice
export const sessionTypeApi = createApi({
  reducerPath: 'sessionTypeApi',
  baseQuery: createBaseQueryWithReAuth(),
  tagTypes: ['SessionType'],
  endpoints: (builder) => ({
    /**
     * Get all session types
     */
    getSessionTypes: builder.query<SessionTypesResponse, void>({
      query: () => ({
        url: 'sessionType/list',
        method: 'GET',
      }),
      providesTags: ['SessionType'],
      transformResponse: (response: any) => {
        // Transform snake_case to camelCase
        if (response?.data && Array.isArray(response.data)) {
          return {
            ...response,
            data: response.data.map((item: any) => ({
              id: item.id,
              name: item.name,
              isOffTheJob: item.is_off_the_job ?? item.isOffTheJob,
              isActive: item.active ?? item.isActive,
              order: item.order,
              createdAt: item.created_at ?? item.createdAt,
              updatedAt: item.updated_at ?? item.updatedAt,
            })),
          }
        }
        return response
      },
      transformErrorResponse: (response: any) => {
        throw new Error(
          `Failed to fetch session types: ${response?.data?.message || response?.statusText || 'Unknown error'}`
        )
      },
    }),

    /**
     * Get a single session type by ID
     */
    getSessionType: builder.query<SessionTypeResponse, number>({
      query: (id) => ({
        url: `/user-defined-lists/session-types/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'SessionType', id }],
      transformErrorResponse: (response: any) => {
        throw new Error(
          `Failed to fetch session type: ${response?.data?.message || response?.statusText || 'Unknown error'}`
        )
      },
    }),

    /**
     * Create a new session type
     */
    createSessionType: builder.mutation<SessionTypeResponse, CreateSessionTypePayload>({
      query: (payload) => ({
        url: 'sessionType/create',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['SessionType'],
      transformResponse: (response: any) => {
        // Transform snake_case to camelCase
        if (response?.data) {
          return {
            ...response,
            data: {
              id: response.data.id,
              name: response.data.name,
              isOffTheJob: response.data.is_off_the_job ?? response.data.isOffTheJob,
              isActive: response.data.active ?? response.data.isActive,
              order: response.data.order,
              createdAt: response.data.created_at ?? response.data.createdAt,
              updatedAt: response.data.updated_at ?? response.data.updatedAt,
            },
          }
        }
        return response
      },
      transformErrorResponse: (response: any) => {
        throw new Error(
          `Failed to create session type: ${response?.data?.message || response?.statusText || 'Unknown error'}`
        )
      },
    }),

    /**
     * Update an existing session type
     */
    updateSessionType: builder.mutation<
      SessionTypeResponse,
      { id: number; payload: UpdateSessionTypePayload }
    >({
      query: ({ id, payload }) => ({
        url: `sessionType/update/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['SessionType'],
      transformResponse: (response: any) => {
        // Transform snake_case to camelCase
        if (response?.data) {
          return {
            ...response,
            data: {
              id: response.data.id,
              name: response.data.name,
              isOffTheJob: response.data.is_off_the_job ?? response.data.isOffTheJob,
              isActive: response.data.active ?? response.data.isActive,
              order: response.data.order,
              createdAt: response.data.created_at ?? response.data.createdAt,
              updatedAt: response.data.updated_at ?? response.data.updatedAt,
            },
          }
        }
        return response
      },
      transformErrorResponse: (response: any) => {
        throw new Error(
          `Failed to update session type: ${response?.data?.message || response?.statusText || 'Unknown error'}`
        )
      },
    }),

    /**
     * Toggle session type active status
     */
    toggleSessionType: builder.mutation<SessionTypeResponse, { id: number; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/user-defined-lists/session-types/${id}`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['SessionType'],
      transformErrorResponse: (response: any) => {
        throw new Error(
          `Failed to toggle session type status: ${response?.data?.message || response?.statusText || 'Unknown error'}`
        )
      },
    }),

    /**
     * Reorder session type (move up or down)
     */
    reorderSessionType: builder.mutation<SessionTypesResponse, ReorderSessionTypePayload>({
      query: (payload) => ({
        url: 'sessionType/reorder',
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['SessionType'],
      transformResponse: (response: any) => {
        // Transform snake_case to camelCase
        if (response?.data && Array.isArray(response.data)) {
          return {
            ...response,
            data: response.data.map((item: any) => ({
              id: item.id,
              name: item.name,
              isOffTheJob: item.is_off_the_job ?? item.isOffTheJob,
              isActive: item.active ?? item.isActive,
              order: item.order,
              createdAt: item.created_at ?? item.createdAt,
              updatedAt: item.updated_at ?? item.updatedAt,
            })),
          }
        }
        return response
      },
      transformErrorResponse: (response: any) => {
        throw new Error(
          `Failed to reorder session type: ${response?.data?.message || response?.statusText || 'Unknown error'}`
        )
      },
    }),

    /**
     * Delete a session type
     */
    deleteSessionType: builder.mutation<{ message: string; status: boolean }, number>({
      query: (id) => ({
        url: `/user-defined-lists/session-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SessionType'],
      transformErrorResponse: (response: any) => {
        throw new Error(
          `Failed to delete session type: ${response?.data?.message || response?.statusText || 'Unknown error'}`
        )
      },
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetSessionTypesQuery,
  useGetSessionTypeQuery,
  useCreateSessionTypeMutation,
  useUpdateSessionTypeMutation,
  useToggleSessionTypeMutation,
  useReorderSessionTypeMutation,
  useDeleteSessionTypeMutation,
} = sessionTypeApi

