/**
 * courseBuilderSlice.ts
 * 
 * Redux slice for managing CourseBuilder state
 * Handles course creation, editing, and form state management
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CourseCoreType = 'Qualification' | 'Standard' | 'Gateway';
export type EditMode = 'create' | 'edit' | 'view';

export interface CourseFormData {
  course_name: string;
  course_code: string;
  course_type: string;
  course_core_type: CourseCoreType;
  level: string;
  sector: string;
  qualification_type: string;
  qualification_status: string;
  guided_learning_hours: string;
  total_credits: string;
  duration_period: string;
  duration_value: number | null;
  operational_start_date: string;
  recommended_minimum_age: string;
  overall_grading_type: string;
  permitted_delivery_types: string;
  professional_certification: string;
  two_page_standard_link: string;
  assessment_plan_link: string;
  brand_guidelines: string;
  active: boolean;
  included_in_off_the_job: boolean;
  awarding_body: string;
  assigned_gateway_id: number | null;
  assigned_gateway_name: string;
  questions: any[];
  assigned_standards: number[];
  [key: string]: any;
}

interface CourseBuilderState {
  // UI state
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Course metadata
  course_id: string | number | null;
  editMode: EditMode;
}

const initialState: CourseBuilderState = {
  isLoading: false,
  isSaving: false,
  error: null,
  course_id: null,
  editMode: 'create',
};

const courseBuilderSlice = createSlice({
  name: 'courseBuilder',
  initialState,
  reducers: {
    // Loading states
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    
    setSaving(state, action: PayloadAction<boolean>) {
      state.isSaving = action.payload;
    },
    
    // Error handling
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    
    clearError(state) {
      state.error = null;
    },
    
    // Course metadata
    setCourseId(state, action: PayloadAction<string | number | null>) {
      state.course_id = action.payload;
    },
    
    setEditMode(state, action: PayloadAction<EditMode>) {
      state.editMode = action.payload;
    },
    
    // Reset state
    resetState(state) {
      state.error = null;
      state.course_id = null;
    },
  },
});

export const {
  setLoading,
  setSaving,
  setError,
  clearError,
  setCourseId,
  setEditMode,
  resetState,
} = courseBuilderSlice.actions;

// Selectors
export const selectCourseBuilder = ({ courseBuilder }: any) => courseBuilder;
export const selectIsLoading = ({ courseBuilder }: any) => courseBuilder.isLoading;
export const selectIsSaving = ({ courseBuilder }: any) => courseBuilder.isSaving;
export const selectCourseId = ({ courseBuilder }: any) => courseBuilder.course_id;
export const selectEditMode = ({ courseBuilder }: any) => courseBuilder.editMode;

export default courseBuilderSlice.reducer;

