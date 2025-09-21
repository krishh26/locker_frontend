import { createApi } from '@reduxjs/toolkit/query/react';
import createBaseQueryWithReAuth from 'src/utils/fetch-base-query';

// Types for WellbeingResource
export interface WellbeingResource {
  id: string;
  resource_name: string;
  description: string;
  location: string;
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
  updatedBy: string;
  resourceType: 'FILE' | 'URL';
  lastOpenedDate?: string;
}

// Types for LearnerResourceActivity
export interface LearnerResourceActivity {
  id: string;
  resourceId: string;
  learnerId: string;
  openedAt: string;
  feedback?: string;
  feedbackSubmittedAt?: string;
}

// Types for API requests
export interface AddResourcePayload {
  resource_name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
}

export interface UpdateResourcePayload {
  resource_name?: string;
  description?: string;
  content?: string;
  category?: string;
  tags?: string[];
}

export interface FeedbackPayload {
  feedback: string;
}

// API Response types
export interface ResourcesResponse {
  data: WellbeingResource[];
  total: number;
  page: number;
  limit: number;
}

export interface ResourceResponse {
  data: WellbeingResource;
}

export interface LearnerResourcesResponse {
  data: WellbeingResource[];
}

export interface ActivityResponse {
  data: LearnerResourceActivity;
}

export interface FeedbackResponse {
  data: LearnerResourceActivity;
}

// Create the API slice
export const resourcesApi = createApi({
  reducerPath: 'resourcesApi',
  baseQuery: createBaseQueryWithReAuth(),
  tagTypes: ['WellbeingResource', 'LearnerResourceActivity'],
  endpoints: (builder) => ({
    // Admin Resource Management Functions
    
    /**
     * Get admin resources with optional search
     */
    getAdminResources: builder.query<ResourcesResponse, { search?: string; page?: number; limit?: number }>({
      query: ({ search, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        return {
          url: `/wellbeing/admin/resources?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['WellbeingResource'],
      transformErrorResponse: (response: any) => {
        throw new Error(`Failed to fetch admin resources: ${response?.data?.message || response?.statusText || 'Unknown error'}`);
      },
    }),

    /**
     * Add a new resource
     */
    addResource: builder.mutation<ResourceResponse, AddResourcePayload>({
      query: (payload) => ({
        url: '/wellbeing/admin/resources',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['WellbeingResource'],
      transformErrorResponse: (response: any) => {
        throw new Error(`Failed to add resource: ${response?.data?.message || response?.statusText || 'Unknown error'}`);
      },
    }),

    /**
     * Update an existing resource
     */
    updateResource: builder.mutation<ResourceResponse, { id: string; payload: UpdateResourcePayload }>({
      query: ({ id, payload }) => ({
        url: `/wellbeing/admin/resources/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['WellbeingResource'],
      transformErrorResponse: (response: any) => {
        throw new Error(`Failed to update resource: ${response?.data?.message || response?.statusText || 'Unknown error'}`);
      },
    }),

    /**
     * Toggle resource active status
     */
    toggleResource: builder.mutation<ResourceResponse, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/wellbeing/admin/resources/${id}`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['WellbeingResource'],
      transformErrorResponse: (response: any) => {
        throw new Error(`Failed to toggle resource status: ${response?.data?.message || response?.statusText || 'Unknown error'}`);
      },
    }),

    /**
     * Delete a resource (optional)
     */
    deleteResource: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WellbeingResource'],
      transformErrorResponse: (response: any) => {
        throw new Error(`Failed to delete resource: ${response?.data?.message || response?.statusText || 'Unknown error'}`);
      },
    }),

    // Learner Resource Functions

    /**
     * Get resources available to learners
     */
    getLearnerResources: builder.query<LearnerResourcesResponse, void>({
      query: () => ({
        url: '/wellbeing/learner/resources',
        method: 'GET',
      }),
      providesTags: ['LearnerResourceActivity'],
      transformErrorResponse: (response: any) => {
        throw new Error(`Failed to fetch learner resources: ${response?.data?.message || response?.statusText || 'Unknown error'}`);
      },
    }),

    /**
     * Track when a learner opens a resource
     */
    trackResourceOpen: builder.mutation<ActivityResponse, { resourceId: string }>({
      query: (body) => ({
        url: `/wellbeing/learner/resources/track`,
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['LearnerResourceActivity'],
      transformErrorResponse: (response: any) => {
        throw new Error(`Failed to track resource open: ${response?.data?.message || response?.statusText || 'Unknown error'}`);
      },
    }),

    /**
     * Submit feedback for a resource
     */
    submitFeedback: builder.mutation<FeedbackResponse, { resourceId: number; feedback: string }>({
      query: ({ resourceId, feedback }) => ({
        url: `/wellbeing/learner/resources/feedback`,
        method: 'POST',
        body: {resourceId, feedback },
      }),
      invalidatesTags: ['LearnerResourceActivity'],
      transformErrorResponse: (response: any) => {
        throw new Error(`Failed to submit feedback: ${response?.data?.message || response?.statusText || 'Unknown error'}`);
      },
    }),

  }),
});

// Export hooks for usage in functional components
export const {
  useGetAdminResourcesQuery,
  useAddResourceMutation,
  useUpdateResourceMutation,
  useToggleResourceMutation,
  useDeleteResourceMutation,
  useGetLearnerResourcesQuery,
  useTrackResourceOpenMutation,
  useSubmitFeedbackMutation,
} = resourcesApi;

