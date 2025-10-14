import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'

export const awaitingSignatureAPI = createApi({
  reducerPath: 'awaiting-signature-api',
  baseQuery: createBaseQueryWithReAuth(),
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
        const url = `assignment/list-with-signatures${queryString ? `?${queryString}` : ''}`
        return { url }
      },
    }),
  }),
})

export const {
  useGetAwaitingSignatureListQuery,
} = awaitingSignatureAPI
