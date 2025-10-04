import { createApi } from '@reduxjs/toolkit/query/react'
import { showMessage } from '../fuse/messageSlice'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'

export interface DefaultReviewWeeksConfig {
  id: number
  noReviewWeeks: number
  noInductionWeeks: number
  requireFileUpload: boolean
  createdAt: string
  updatedAt: string
}

export interface DefaultReviewWeeksResponse {
  data: DefaultReviewWeeksConfig
  message: string
  status: boolean
}

export interface SaveConfigRequest {
  noReviewWeeks: number
  noInductionWeeks: number
  requireFileUpload: boolean
}

export interface SaveConfigResponse {
  data: DefaultReviewWeeksConfig
  message: string
  status: boolean
}

export const defaultReviewWeeksApi = createApi({
  reducerPath: 'defaultReviewWeeksApi',
  baseQuery: createBaseQueryWithReAuth(),
  tagTypes: ['DefaultReviewWeeks'],
  endpoints: (builder) => ({
    // Get default review weeks configuration
    getDefaultReviewWeeksConfig: builder.query<DefaultReviewWeeksResponse, void>({
      query: () => 'review-setting/get',
      providesTags: ['DefaultReviewWeeks'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (error: any) {
          // Show error message if API call fails
          dispatch(
            showMessage({
              message: error?.data?.message || 'Failed to fetch configuration',
              variant: 'error',
            })
          )
        }
      },
    }),

    // Save or update default review weeks configuration (upsert)
    saveDefaultReviewWeeksConfig: builder.mutation<SaveConfigResponse, SaveConfigRequest>({
      query: (config) => ({
        url: 'review-setting/add',
        method: 'POST',
        body: config,
      }),
      invalidatesTags: ['DefaultReviewWeeks'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled
          dispatch(
            showMessage({
              message: result.data.message || 'Configuration saved successfully!',
              variant: 'success',
            })
          )
        } catch (error: any) {
          dispatch(
            showMessage({
              message: error?.data?.message || 'Failed to save configuration',
              variant: 'error',
            })
          )
        }
      },
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetDefaultReviewWeeksConfigQuery,
  useSaveDefaultReviewWeeksConfigMutation,
} = defaultReviewWeeksApi
