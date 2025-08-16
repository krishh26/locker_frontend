import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'

export const caseloadAPI = createApi({
  reducerPath: 'caseload-api',
  baseQuery: createBaseQueryWithReAuth(),
  tagTypes: ['CaseloadList'],
  endpoints: (builder) => ({
    // Get all line managers with their users (caseload)
    getCaseloadList: builder.query({
      query: (params) => {
        const queryString = Object.keys(params || {})
          .filter((key) => params[key] !== '')
          .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
          )
          .join('&')

        const url = `/caseload/list${queryString ? `?${queryString}` : ''}`
        return { url, method: 'GET' }
      },
      providesTags: ['CaseloadList'],
    }),

    // Get single line manager details with his users
    getCaseloadDetails: builder.query({
      query: (id) => ({
        url: `/caseload/${id}`,
        method: 'GET',
      }),
    }),

  }),
})

export const {
  useGetCaseloadListQuery,
  useGetCaseloadDetailsQuery,
} = caseloadAPI
