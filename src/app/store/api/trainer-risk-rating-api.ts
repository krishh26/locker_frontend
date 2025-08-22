// src/app/store/trainerRiskAPI.ts
import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'

export const trainerRiskAPI = createApi({
  reducerPath: 'trainer-risk-api',
  baseQuery: createBaseQueryWithReAuth(),
  tagTypes: ['TrainerRisk'],
  endpoints: (builder) => ({
    // Fetch trainer details + courses
    getTrainerDetails: builder.query({
      query: (id) => ({
        url: `/course/trainer/${id}`,
        method: 'GET',
      }),
      providesTags: ['TrainerRisk'],
    }),

    // Save risk settings (high, medium, low %)
    saveTrainerRiskSettings: builder.mutation({
      query: ({ trainerId, data }) => ({
        url: `/trainers/${trainerId}/risk-settings`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TrainerRisk'],
    }),

    // Save course risk ratings
    saveCourseRiskRatings: builder.mutation({
      query: ({ data }) => ({
        url: `/risk-rating`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TrainerRisk'],
    }),

    // Save comments for specific course
    saveCourseComment: builder.mutation({
      query: ({ trainerId, body }) => ({
        url: `/risk-rating/${trainerId}/course-comments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TrainerRisk'],
    }),
  }),
})

export const {
  useGetTrainerDetailsQuery,
  useSaveTrainerRiskSettingsMutation,
  useSaveCourseRiskRatingsMutation,
  useSaveCourseCommentMutation,
} = trainerRiskAPI
