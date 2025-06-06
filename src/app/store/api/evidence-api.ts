import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'
export const evidenceAPI = createApi({
  reducerPath: 'evidence-api',
  baseQuery: createBaseQueryWithReAuth(),
   tagTypes: ['EvidenceList'],
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
      providesTags: ['EvidenceList'], 
    }),
    deleteEvidence: builder.mutation({
      query: ({ id }) => ({
        url: `assignment/delete/${id}`,
        method: 'DELETE',
      }),
    }),
    reuploadEvidenceDocument:builder.mutation({
      query:({id,data}) => ({
        url:`/assignment/${id}/reupload`,
        method:'PATCH',
        body:data,
      }),
       invalidatesTags: ['EvidenceList'],
    })
  }),
})
export const {
  useUploadEvidenceFileMutation,
  useGetEvidenceDetailsQuery,
  useGetEvidenceListQuery,
  useUpdateEvidenceIdMutation,
  useDeleteEvidenceMutation,
  useReuploadEvidenceDocumentMutation
} = evidenceAPI
