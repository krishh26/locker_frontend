import { createApi } from '@reduxjs/toolkit/query/react'
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query'

// Types for safeguarding contact data
export interface SafeguardingContact {
  id?: string;
  telNumber: string;
  mobileNumber: string;
  emailAddress: string;
  additionalInfo: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SafeguardingContactResponse {
  data: SafeguardingContact;
  message: string;
  success: boolean;
}

export interface SafeguardingContactListResponse {
  data: SafeguardingContact[];
  message: string;
  success: boolean;
}

export interface CreateSafeguardingContactPayload {
  telNumber: string;
  mobileNumber: string;
  emailAddress: string;
  additionalInfo: string;
}

export interface UpdateSafeguardingContactPayload extends CreateSafeguardingContactPayload {
  id: string;
}

// Create the API slice
export const safeguardingAPI = createApi({
  reducerPath: 'safeguarding-api',
  baseQuery: createBaseQueryWithReAuth(),
  tagTypes: ['SafeguardingContact'],
  endpoints: (builder) => ({
    // Get all safeguarding contacts
    getSafeguardingContacts: builder.query<SafeguardingContactListResponse, void>({
      query: () => ({
        url: '/safeguarding-contact/admin/contacts',
        method: 'GET',
      }),
      providesTags: ['SafeguardingContact'],
      transformErrorResponse: (response: any) => {
        throw new Error(`Failed to fetch safeguarding contacts: ${response?.data?.message || response?.statusText || 'Unknown error'}`);
      },
    }),

    // Get single safeguarding contact by ID
    getSafeguardingContactById: builder.query<SafeguardingContactResponse, string>({
      query: (id) => ({
        url: `/safeguarding-contact/admin/contacts/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'SafeguardingContact', id }],
      transformErrorResponse: (response: any) => {
        throw new Error(`Failed to fetch safeguarding contact: ${response?.data?.message || response?.statusText || 'Unknown error'}`);
      },
    }),

    // Create or Update safeguarding contact (same endpoint for both)
    saveSafeguardingContact: builder.mutation<SafeguardingContactResponse, CreateSafeguardingContactPayload>({
      query: (payload) => ({
        url: '/safeguarding-contact/admin/contacts',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['SafeguardingContact'],
      transformErrorResponse: (response: any) => {
        throw new Error(`Failed to save safeguarding contact: ${response?.data?.message || response?.statusText || 'Unknown error'}`);
      },
    }),
  }),
})

// Export hooks for use in components
export const {
  useGetSafeguardingContactsQuery,
  useGetSafeguardingContactByIdQuery,
  useSaveSafeguardingContactMutation,
} = safeguardingAPI
