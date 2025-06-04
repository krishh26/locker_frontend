import {
  BaseQueryFn,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import JwtService from 'src/app/auth/services/jwtService'
import jsonData from 'src/url.json';

let isHandling401 = false

interface BaseQueryOptions {
  baseUrl?: string
  authCheck?: boolean
  timeout?: number
  apiKey?: string
}

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

const createBaseQueryWithReAuth = ({
  baseUrl = URL_BASE_LINK || '',
  authCheck = true,
}: BaseQueryOptions = {}): BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: async (headers) => {
      const token = await JwtService.getAccessToken()

      if (authCheck && token) headers.set('Authorization', `Bearer ${token}`)

      return headers
    },
  })

  return async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions)

    if (result.error?.status === 401 && !isHandling401) {
      isHandling401 = true

      //   api.dispatch(resetAuth())
      localStorage.clear()
      setTimeout(() => (isHandling401 = false), 3000)
      location.replace('/login')

      return { ...result, error: undefined }
    }

    if (result.error?.status === 408) {
      return {
        error: {
          status: 'FETCH_ERROR',
          error: 'Request timed out. Please try again.',
        },
      }
    }

    return result
  }
}

export default createBaseQueryWithReAuth

type FetchArgs = {
  url: string
  method?: string
  body?: unknown
  headers?: HeadersInit
}
