import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'
export const learnerPlanAPI = createApi({
  reducerPath: 'learner-api',
  baseQuery: createBaseQueryWithReAuth(),
  tagTypes: ['LearnerPlanList'],
  endpoints: (builder) => ({
    getLearnerPlanList: builder.query({
      query: (params) => {
        const queryString = Object.keys(params)
          .filter((key) => params[key] !== '')
          .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
          )
          .join('&')
        const url = `learner-plan/list${queryString ? `?${queryString}` : ''}`
        return { url }
      },
      providesTags: ['LearnerPlanList'],
    }),
    getLernerList: builder.query({
      query: (params) => {
        const queryString = Object.keys(params)
          .filter((key) => params[key] !== '')
          .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
          )
          .join('&')
        const url = `learner/list${queryString ? `?${queryString}` : ''}`
        return { url }
      },
    }),
    getCourseList: builder.query({
      query: (params) => {
        const queryString = Object.keys(params)
          .filter((key) => params[key] !== '')
          .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
          )
          .join('&')
        const url = `learner-plan/courses${
          queryString ? `?${queryString}` : ''
        }`
        return { url }
      },
    }),
    getOptionsList: builder.query({
      query: (params) => {
        const queryString = Object.keys(params)
          .filter((key) => params[key] !== '')
          .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
          )
          .join('&')
        const url = `learner-plan/repeat/options${
          queryString ? `?${queryString}` : ''
        }`
        return { url }
      },
    }),
    createNewSession: builder.mutation({
      query: (data) => ({
        url: `/learner-plan/create`,
        method: 'POST',
        body: data,
      }),
    }),
    updateSession: builder.mutation({
      query: (data) => ({
        url: `/learner-plan/update/${data.id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['LearnerPlanList'],
    }),
    fileUploadSession: builder.mutation({
      query: (data) => ({
        url: `/learner-plan/repeat/upload-files`,
        method: 'POST',
        body: data,
      }),
    })
  }),
})
export const {
  useGetLearnerPlanListQuery,
  useGetLernerListQuery,
  useGetCourseListQuery,
  useGetOptionsListQuery,
  useCreateNewSessionMutation,
  useUpdateSessionMutation,
  useFileUploadSessionMutation,
} = learnerPlanAPI
