import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'
export const evidenceAPI = createApi({
  reducerPath: 'evidence-api',
  baseQuery: createBaseQueryWithReAuth(),
  endpoints: (builder) => ({
    uploadEvidenceFile: builder.mutation({
      query: (data) => ({
        url: `/assignment/create`,
        method: 'POST',
        body: data,
      }),
    }),
    getEvidenceDetails: builder.query({
      query: ({ id }) => ({
        url: `/assignment/get/${id}`,
        method: 'GET',
      }),
    }),
    // getEvidenceList: builder.query({
    //  query: ({ id }) => ({
    //   url: `assignment/list?user_id=${id}`,
    //   method: 'GET',
    //  }),
    // }),
    updateEvidenceId: builder.mutation({
      query: (data) => ({
        url: `/assignment/update/${data.id}`,
        method: 'PATCH',
        body: data,
      }),
    }),
    getEvidenceList: builder.query({
      query: (params) => {
        const queryString = Object.keys(params)
          .filter((key) => params[key] !== '')
          .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
          )
          .join('&')
        const url = `assignment/list${queryString ? `?${queryString}` : ''}`
        return { url }
      },
    }),
  }),
})
export const {
  useUploadEvidenceFileMutation,
  useGetEvidenceDetailsQuery,
  useGetEvidenceListQuery,
  useUpdateEvidenceIdMutation,
} = evidenceAPI
