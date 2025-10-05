import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'

export const gatewayReportAPI = createApi({
  reducerPath: 'gateway-report-api',
  baseQuery: createBaseQueryWithReAuth(),
  tagTypes: ['GatewayReportList', 'AdminList'],
  endpoints: (builder) => ({
    getGatewayReportList: builder.query({
      query: (params) => {
        const queryString = Object.keys(params)
          .filter((key) => params[key] !== '' && params[key] !== null && params[key] !== undefined)
          .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
          )
          .join('&')
        const url = `gateway-report/list${queryString ? `?${queryString}` : ''}`
        return { url }
      },
      providesTags: ['GatewayReportList'],
    }),
    getAdminList: builder.query({
      query: (params = {}) => ({
        url: 'gateway-report/admins',
        method: 'GET',
        params,
      }),
      providesTags: ['AdminList'],
    }),
  }),
})

export const {
  useGetGatewayReportListQuery,
  useGetAdminListQuery,
} = gatewayReportAPI
