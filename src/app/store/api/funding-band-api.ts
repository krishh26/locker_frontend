import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'

export const fundingBandAPI = createApi({
  reducerPath: 'funding-band-api',
  baseQuery: createBaseQueryWithReAuth(),
  tagTypes: ['FundingBand'],
  endpoints: (builder) => ({
    getFundingBands: builder.query({
      query: () => ({
        url: `funding-band`,
        method: 'GET',
      }),
      providesTags: ['FundingBand'],
    }),
    addFundingBand: builder.mutation({
      query: (body) => ({
        url: `funding-band`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FundingBand'],
    }),
    updateFundingBand: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `funding-band/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['FundingBand'],
    }),
  }),
})

export const {
  useGetFundingBandsQuery,
  useAddFundingBandMutation,
  useUpdateFundingBandMutation,
} = fundingBandAPI
