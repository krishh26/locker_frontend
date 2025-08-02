import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'
export const formAPI = createApi({
  reducerPath: 'form-api',
  baseQuery: createBaseQueryWithReAuth(),
  endpoints: (builder) => ({
    getFormDetails: builder.query({
      query: (params) => {
        const url = `form/get/${params?.id}`
        return { url }
      },
      keepUnusedDataFor: 0,
    }),
    getSavedFormDetails: builder.query({
      query: (params) => {
        const url = `form/user/${params?.formId}?user_id=${params?.userId}`
        return { url }
      },
      keepUnusedDataFor: 0,
    }),
  }),
})
export const { useGetFormDetailsQuery, useGetSavedFormDetailsQuery } = formAPI
