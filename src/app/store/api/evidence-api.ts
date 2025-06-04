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
      query: ({id}) => ({
        url: `/assignment/get/${id}`,
        method: 'GET',
      }),
    }),
  }),
})

export const { useUploadEvidenceFileMutation, useGetEvidenceDetailsQuery } =
  evidenceAPI
