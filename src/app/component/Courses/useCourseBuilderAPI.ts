/**
 * useCourseBuilderAPI.ts
 * 
 * Custom hook for CourseBuilder API operations
 * Integrates with existing courseManagement API functions
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import {
  createCourseAPI,
  updateCourseAPI,
  fetchCourseById,
} from 'app/store/courseManagement';
import jsonData from 'src/url.json';
import {
  CourseFormData,
  setSaving,
  setError,
  setCourseId,
} from 'app/store/courseBuilderSlice';

export const useCourseBuilderAPI = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Create a new course
  const createCourse = useCallback(
    async (formData: CourseFormData) => {
      try {
        dispatch(setSaving(true));
        dispatch(setError(null));

        const response = await dispatch(createCourseAPI(formData) as any);

        if (response && response.data) {
          const newCourseId = response.data.course_id;
          dispatch(setCourseId(newCourseId));

        //   // Update URL without navigation
          window.history.replaceState(
            null,
            '',
            `/courseBuilder/course/${newCourseId}`
          );

        //   // Fetch the created course to ensure proper initialization
        //   await dispatch(fetchCourseById(newCourseId) as any);

        //   dispatch(showMessage({
        //     message: 'Course created successfully',
        //     variant: 'success',
        //   }));

          return { success: true, course_id: newCourseId };
        }

        throw new Error('Failed to create course');
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create course';
        dispatch(setError(errorMessage));
        dispatch(showMessage({
          message: errorMessage,
          variant: 'error',
        }));
        return { success: false, error: errorMessage };
      } finally {
        dispatch(setSaving(false));
      }
    },
    [dispatch]
  );

  // Update an existing course
  const updateCourse = useCallback(
    async (formData: CourseFormData, id: string) => {
      try {
        dispatch(setSaving(true));
        dispatch(setError(null));

        const success = await dispatch(updateCourseAPI(id, formData) as any);

        if (success) {
          // Fetch updated course data
          await dispatch(fetchCourseById(id) as any);

          return { success: true };
        }

        throw new Error('Failed to update course');
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update course';
        dispatch(setError(errorMessage));
        dispatch(showMessage({
          message: errorMessage,
          variant: 'error',
        }));
        return { success: false, error: errorMessage };
      } finally {
        dispatch(setSaving(false));
      }
    },
    [dispatch]
  );

  // Load course data for editing
  const loadCourse = useCallback(
    async (id: string) => {
      try {
        dispatch(setSaving(true));
        const URL_BASE_LINK = jsonData.API_LOCAL_URL;
        const url = `${URL_BASE_LINK}/course/get/${id}`;
        
        const response = await axios.get(url);
        const courseData = response.data.data;

        if (courseData) {
          // Map API response to CourseFormData format
          const formData = {
            course_id: courseData.course_id,
            course_name: courseData.course_name || '',
            course_code: courseData.course_code || '',
            course_type: courseData.course_type || '',
            course_core_type: courseData.course_core_type || '',
            level: courseData.level || '',
            sector: courseData.sector || '',
            qualification_type: courseData.qualification_type || '',
            qualification_status: courseData.qualification_status || '',
            guided_learning_hours: courseData.guided_learning_hours || '',
            total_credits: courseData.total_credits || '',
            duration_period: courseData.duration_period || '',
            duration_value: courseData.duration_value || '',
            operational_start_date: courseData.operational_start_date || '',
            recommended_minimum_age: courseData.recommended_minimum_age || '',
            overall_grading_type: courseData.overall_grading_type || '',
            permitted_delivery_types: courseData.permitted_delivery_types || '',
            professional_certification: courseData.professional_certification || '',
            two_page_standard_link: courseData.two_page_standard_link || '',
            assessment_plan_link: courseData.assessment_plan_link || '',
            brand_guidelines: courseData.brand_guidelines || '',
            active: courseData.active || 'Yes',
            included_in_off_the_job: courseData.included_in_off_the_job || 'Yes',
            awarding_body: courseData.awarding_body || 'No Awarding Body',
            assigned_gateway_id: courseData.assigned_gateway_id || null,
            assigned_gateway_name: courseData.assigned_gateway_name || '',
            questions: courseData.questions || courseData.checklist || [],
            assigned_standards: courseData.assigned_standards
              ? courseData.assigned_standards.map((s: any) => {
                  if (typeof s === 'object' && s !== null && s.id !== undefined) {
                    const idNum = Number(s.id);
                    return isNaN(idNum) ? s.id : idNum;
                  }
                  const idNum = Number(s);
                  return isNaN(idNum) ? s : idNum;
                })
              : [],
          };

          return { success: true, data: formData };
        }

        throw new Error('Failed to load course');
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load course';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      } finally {
        dispatch(setSaving(false));
      }
    },
    [dispatch]
  );

  // Save course (create or update based on courseId)
  const saveCourse = useCallback(
    async (formData: CourseFormData, courseId: string) => {
      if (courseId) {
        return updateCourse(formData, courseId);
      } else {
        return createCourse(formData);
      }
    },
    [createCourse, updateCourse]
  );

  return {
    createCourse,
    updateCourse,
    loadCourse,
    saveCourse,
  };
};

