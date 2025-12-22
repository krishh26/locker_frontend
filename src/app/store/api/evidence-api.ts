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
    reuploadEvidenceDocument: builder.mutation({
      query: ({ id, data }) => ({
        url: `/assignment/${id}/reupload`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['EvidenceList'],
    }),
    getSessionList: builder.query({
      query: (params) => {
        const queryString = Object.keys(params)
          .filter((key) => params[key] !== '')
          .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
          )
          .join('&')
        const url = `session/list${queryString ? `?${queryString}` : ''}`
        return { url }
      },
    }),
    uploadExternalEvidenceFile: builder.mutation({
      query: ({ id, data }) => ({
        url: `/assignment/${id}/external-feedback`,
        method: 'POST',
        body: data,
      }),
    }),
    requestSignature: builder.mutation({
      query: ({ id, data }) => ({
        url: `/assignment/${id}/request-signature`,
        method: 'POST',
        body: data,
      }),
    }),
    pendingSignatureList: builder.query({
      query: ({ id }) => ({
        url: `/user/${id}/pending-signatures`,
        method: 'GET',
      }),
    }),
    getSignatureList: builder.query({
      query: ({ id }) => ({
        url: `/assignment/${id}/signatures`,
        method: 'GET',
      }),
    }),
    saveSignature: builder.mutation({
      query: ({ id, data }) => ({
        url: `/assignment/${id}/sign`,
        method: 'POST',
        body: data,
      }),
    }),
    // AssignmentMapping endpoints
    getAssignmentMappings: builder.query({
      query: ({ assignment_id }) => ({
        url: `/assignment/${assignment_id}/mappings`,
        method: 'GET',
      }),
    }),
    createAssignmentMapping: builder.mutation({
      query: (data) => ({
        url: `/assignment-mapping/create`,
        method: 'POST',
        body: data,
      }),
    }),
    updateAssignmentMapping: builder.mutation({
      query: ({ mapping_id, data }) => ({
        url: `/assignment-mapping/update/${mapping_id}`,
        method: 'PATCH',
        body: data,
      }),
    }),
    deleteAssignmentMapping: builder.mutation({
      query: ({ mapping_id }) => ({
        url: `/assignment-mapping/delete/${mapping_id}`,
        method: 'DELETE',
      }),
    }),
    // Mapping-based signatures
    getMappingSignatureList: builder.query({
      query: ({ mapping_id }) => ({
        url: `/assignment-mapping/${mapping_id}/signatures`,
        method: 'GET',
      }),
    }),
    requestMappingSignature: builder.mutation({
      query: ({ mapping_id, data }) => ({
        url: `/assignment-mapping/${mapping_id}/request-signature`,
        method: 'POST',
        body: data,
      }),
    }),
    saveMappingSignature: builder.mutation({
      query: ({ mapping_id, data }) => ({
        url: `/assignment-mapping/${mapping_id}/sign`,
        method: 'POST',
        body: data,
      }),
    }),
    // Update PC ticks (learnerMap/trainerMap/signedOff) for mapping
    updateMappingPC: builder.mutation({
      query: ({ mapping_id, data }) => ({
        url: `/assignment-mapping/${mapping_id}/pc`,
        method: 'PATCH',
        body: data,
      }),
    }),
  }),
})
export const {
  useUploadEvidenceFileMutation,
  useGetEvidenceDetailsQuery,
  useGetEvidenceListQuery,
  useUpdateEvidenceIdMutation,
  useDeleteEvidenceMutation,
  useReuploadEvidenceDocumentMutation,
  useGetSessionListQuery,
  useUploadExternalEvidenceFileMutation,
  useRequestSignatureMutation,
  usePendingSignatureListQuery,
  useGetSignatureListQuery,
  useSaveSignatureMutation,
  useGetAssignmentMappingsQuery,
  useCreateAssignmentMappingMutation,
  useUpdateAssignmentMappingMutation,
  useDeleteAssignmentMappingMutation,
  useGetMappingSignatureListQuery,
  useRequestMappingSignatureMutation,
  useSaveMappingSignatureMutation,
  useUpdateMappingPCMutation,
} = evidenceAPI
