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
    getAllForms: builder.query({
      query: (params = {}) => {
        const { page = 1, page_size = 1000, search_keyword = '', user_id = '' } = params
        let url = `form/list?meta=true&page=${page}&limit=${page_size}`
        
        if (search_keyword) {
          url = `${url}&keyword=${search_keyword}`
        }
        if (user_id) {
          url = `${url}&user_id=${user_id}`
        }
        
        return { url }
      },
      keepUnusedDataFor: 0,
    }),
    unlockForm: builder.mutation({
      query: (params) => ({
        url: `form/${params.formId}/users/${params.userId}/unlock`,
        method: 'POST',
        body: { 
          reason: params.reason
        },
      }),
    }),
    lockForm: builder.mutation({
      query: (params) => ({
        url: `form/${params.formId}/users/${params.userId}/lock`,
        method: 'POST',
        body: { 
          reason: params.reason
        },
      }),
    }),
  }),
})
export const { 
  useGetFormDetailsQuery, 
  useGetSavedFormDetailsQuery, 
  useGetAllFormsQuery,
  useUnlockFormMutation,
  useLockFormMutation
} = formAPI
