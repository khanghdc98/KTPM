import { BaseQueryApi, BaseQueryFn, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import { BASE_BACKEND_URL } from '../constant'

const prepareHeaders = async (
  headers: Headers,
  api: Pick<
    BaseQueryApi,
    'getState' | 'extra' | 'endpoint' | 'type' | 'forced'
  >,
) => {
  if (!headers.has('Authorization')) {
    const token = localStorage.getItem('token')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }
  return headers
}

export const query: BaseQueryFn = fetchBaseQuery({
  baseUrl: BASE_BACKEND_URL,
  prepareHeaders,
})

export const backendQuery: BaseQueryFn = fetchBaseQuery({
  baseUrl: BASE_BACKEND_URL,
  prepareHeaders,
})

export const baseQueryWithRetry = retry(query, { maxRetries: 3 })
