import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'

export const timelogExportAPI = createApi({
  reducerPath: 'timelog-export-api',
  baseQuery: createBaseQueryWithReAuth(),
  endpoints: (builder) => ({
    getTimelogExportData: builder.mutation({
      query: (params) => {
        const queryString = Object.keys(params)
          .filter((key) => params[key] !== '' && params[key] !== null && params[key] !== undefined)
          .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
          )
          .join('&')
        const url = `time-log/list${queryString ? `?${queryString}` : ''}`
        return { url }
      },
    }),
  }),
})

export const {
  useGetTimelogExportDataMutation,
} = timelogExportAPI
