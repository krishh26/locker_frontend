import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'

export const awaitingSignatureAPI = createApi({
  reducerPath: 'awaiting-signature-api',
  baseQuery: createBaseQueryWithReAuth(),
  tagTypes: ['AwaitingSignatureList', 'AssessorList', 'CourseList', 'FileTypeList'],
  endpoints: (builder) => ({
    getAwaitingSignatureList: builder.query({
      query: (params) => {
        const queryString = Object.keys(params)
          .filter((key) => params[key] !== '' && params[key] !== null && params[key] !== undefined)
          .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
          )
          .join('&')
        const url = `awaiting-signature/list${queryString ? `?${queryString}` : ''}`
        return { url }
      },
      providesTags: ['AwaitingSignatureList'],
    }),
    getAssessorList: builder.query({
      query: () => ({
        url: 'awaiting-signature/assessors',
        method: 'GET',
      }),
      providesTags: ['AssessorList'],
    }),
    getCourseList: builder.query({
      query: () => ({
        url: 'awaiting-signature/courses',
        method: 'GET',
      }),
      providesTags: ['CourseList'],
    }),
    getFileTypeList: builder.query({
      query: () => ({
        url: 'awaiting-signature/file-types',
        method: 'GET',
      }),
      providesTags: ['FileTypeList'],
    }),
    updateSignatureStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `/awaiting-signature/update-signature/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AwaitingSignatureList'],
    }),
    bulkUpdateSignatures: builder.mutation({
      query: (data) => ({
        url: '/awaiting-signature/bulk-update-signatures',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AwaitingSignatureList'],
    }),
  }),
})

export const {
  useGetAwaitingSignatureListQuery,
  useGetAssessorListQuery,
  useGetCourseListQuery,
  useGetFileTypeListQuery,
  useUpdateSignatureStatusMutation,
  useBulkUpdateSignaturesMutation,
} = awaitingSignatureAPI
