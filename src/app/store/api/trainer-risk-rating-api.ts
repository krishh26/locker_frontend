// src/app/store/trainerRiskAPI.ts
import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'

export const trainerRiskAPI = createApi({
  reducerPath: 'trainer-risk-api',
  baseQuery: createBaseQueryWithReAuth(),
  tagTypes: ['TrainerRisk'],
  endpoints: (builder) => ({
    // Fetch all trainers
    getTrainerList: builder.query({
      query: () => ({
        url: `/trainers`,
        method: 'GET',
      }),
      providesTags: ['TrainerRisk'],
    }),

    // Fetch trainer details + courses
    getTrainerDetails: builder.query({
      query: (id) => ({
        url: `/trainers/${id}`,
        method: 'GET',
      }),
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
      query: ({ trainerId, data }) => ({
        url: `/trainers/${trainerId}/courses/risk`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TrainerRisk'],
    }),

    // Save assessment method risk ratings
    saveAssessmentRiskRatings: builder.mutation({
      query: ({ trainerId, data }) => ({
        url: `/trainers/${trainerId}/assessments/risk`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TrainerRisk'],
    }),

    // Save comments for specific course
    saveCourseComment: builder.mutation({
      query: ({ trainerId, courseId, comment }) => ({
        url: `/trainers/${trainerId}/courses/${courseId}/comment`,
        method: 'POST',
        body: { comment },
      }),
      invalidatesTags: ['TrainerRisk'],
    }),
  }),
})

export const {
  useGetTrainerListQuery,
  useGetTrainerDetailsQuery,
  useSaveTrainerRiskSettingsMutation,
  useSaveCourseRiskRatingsMutation,
  useSaveAssessmentRiskRatingsMutation,
  useSaveCourseCommentMutation,
} = trainerRiskAPI
