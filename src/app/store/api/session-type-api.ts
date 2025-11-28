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

// Types for API requests
export interface CreateSessionTypePayload {
  name: string
  isOffTheJob: boolean
  isActive?: boolean
  order?: number
}

export interface UpdateSessionTypePayload {
  name?: string
  isOffTheJob?: boolean
  isActive?: boolean
  order?: number
}

export interface UpdateOrderPayload {
  sessionTypes: Array<{
    id: number
    order: number
  }>
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
        url: '/user-defined-lists/session-types',
        method: 'GET',
      }),
      providesTags: ['SessionType'],
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
        url: '/user-defined-lists/session-types',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['SessionType'],
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
        url: `/user-defined-lists/session-types/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['SessionType'],
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
     * Update session types order
     */
    updateSessionTypesOrder: builder.mutation<SessionTypesResponse, UpdateOrderPayload>({
      query: (payload) => ({
        url: '/user-defined-lists/session-types/order',
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['SessionType'],
      transformErrorResponse: (response: any) => {
        throw new Error(
          `Failed to update session types order: ${response?.data?.message || response?.statusText || 'Unknown error'}`
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
  useUpdateSessionTypesOrderMutation,
  useDeleteSessionTypeMutation,
} = sessionTypeApi

