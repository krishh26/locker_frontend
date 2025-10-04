import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'

export const acknowledgementApi = createApi({
  reducerPath: 'acknowledgement-api',
  baseQuery: createBaseQueryWithReAuth(),
  endpoints: (builder) => ({
    // Create acknowledgement with message and file
    createAcknowledgement: builder.mutation({
      query: (data) => ({
        url: `/acknowledgement/create`,
        method: 'POST',
        body: data, // FormData { message, file }
      }),
    }),

    // Get all acknowledgements (returns array, first entry is latest)
    getAcknowledgements: builder.query({
      query: () => ({
        url: `/acknowledgement/get-all`,
        method: 'GET',
      }),
    }),

    // Update acknowledgement by ID
    updateAcknowledgement: builder.mutation({
      query: ({ id, data }) => ({
        url: `/acknowledgement/update/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),

    // Delete acknowledgement by ID
    deleteAcknowledgement: builder.mutation({
      query: ({ id }) => ({
        url: `/acknowledgement/delete/${id}`,
        method: 'DELETE',
      }),
    }),

    // Clear all acknowledgements
    clearAllAcknowledgements: builder.mutation({
      query: (_) => ({
        url: `/acknowledgement/clear-all`,
        method: 'DELETE',
      }),
    }),
  }),
})

export const {
  useCreateAcknowledgementMutation,
  useGetAcknowledgementsQuery,
  useUpdateAcknowledgementMutation,
  useDeleteAcknowledgementMutation,
  useClearAllAcknowledgementsMutation,
} = acknowledgementApi
