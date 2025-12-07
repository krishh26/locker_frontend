import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import jsonData from "src/url.json";
import { showMessage } from "./fuse/messageSlice";
import { userTableMetaData } from "../contanst/metaData";

const initialState = {
    data: [],
    dataFetchLoading: false,
    dataUpdatingLoadding: false,
    meta_data: {
        page: 1,
        items: 0,
        page_size: userTableMetaData.page_size,
        pages: 1,
    },
    preFillData: {},
    singleData: {},
    unitData: [],
    learnerOverView: [],
};

const courseManagementSlice = createSlice({
    name: "courseManagement",
    initialState,
    reducers: {
        updateCourse(state, action) {
            if (Array.isArray(action.payload.data)) {
                state.data = action.payload.data;
                state.meta_data = action.payload.meta_data;
            } else {
                const items = state.meta_data.items + 1;
                state.meta_data.items = items;
                if (state.meta_data.page * state.meta_data.page_size >= items) {
                    state.data = [...state.data, action.payload];
                }
                state.meta_data.pages = Math.ceil(items / userTableMetaData.page_size);
            }
        },
        setLoader(state, action) {
            state.dataFetchLoading = action.payload;
        },
        setUpdatingLoader(state) {
            state.dataUpdatingLoadding = !state.dataUpdatingLoadding;
        },
        updateCourseById(state, action) {
            const { course_id, ...rest } = action.payload;
            state.data = state.data.map((value) => {
                if (value.course_id === course_id) {
                    return action.payload;
                }
                return value;
            });
        },
        updatePreFillData(state, action) {
            state.preFillData = action.payload;
        },
        setSingleData(state, action) {
            state.singleData = action.payload;
        },
        setUnitData(state, action) {
            state.unitData = action.payload;
        },
        setLearnerOverView(state, action) {
            state.learnerOverView = action.payload;
        },
        setSingleDataStatus(state, action) {
            state.singleData = { ...state.singleData, course_status: action.payload };
        },
        setGatewayAnswers(state, action) {
            try {
                // action.payload can be either:
                // 1. Response object with full course data: { data: { course: {...} } }
                // 2. Course object directly: { questions: [...], checklist: [...] }
                const payload = action.payload || {};
                
                // Check if payload is a response object with nested data
                let courseData = payload;
                if (payload.data && payload.data.course) {
                    // Response structure: response.data.data.course
                    courseData = payload.data.course;
                } else if (payload.course) {
                    // Response structure: response.data.course
                    courseData = payload.course;
                }
                
                // Determine if questions or checklist
                const key = Array.isArray(courseData.questions) ? 'questions' : (Array.isArray(courseData.checklist) ? 'checklist' : null);
                
                if (key && courseData[key]) {
                    // Update the course data with the response data
                    const currentCourse = (state.singleData as any)?.course || {};
                    state.singleData = {
                        ...state.singleData,
                        course: {
                            ...currentCourse,
                            ...courseData,
                            [key]: courseData[key].map((q: any) => {
                                // Ensure learner_files is always an array (handle null/undefined)
                                return {
                                    ...q,
                                    learner_files: q.learner_files || []
                                };
                            })
                        },
                    } as any;
                }
            } catch (err) {
                console.error('Error updating gateway answers:', err);
            }
        },
        setGatewayAchieved(state, action) {
            try {
                const { questionId, achieved, dateAchieved } = action.payload;
                const course = (state.singleData as any)?.course || {};
                const key = Array.isArray(course.questions) ? 'questions' : (Array.isArray(course.checklist) ? 'checklist' : null);
                if (!key) return;
                const updated = (course[key] || []).map((q) => {
                    if (q.id === questionId) {
                        return { ...q, achieved, dateAchieved };
                    }
                    return q;
                });
                state.singleData = {
                    ...state.singleData,
                    course: {
                        ...course,
                        [key]: updated,
                    },
                } as any;
            } catch {}
        },
        resetCourseData(state) {
            state.preFillData = {};
        },
    },
});

export const slice = courseManagementSlice.actions;
export const selectCourseManagement = ({ courseManagement }) =>
    courseManagement;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;


export const createCourseAPI = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/course/create`, data);
        dispatch(slice.updateCourse(response.data.data));
        dispatch(slice.setUpdatingLoader());

        return response.data;
    } catch (err) {
        console.error('createCourseAPI - Error:', err);
        dispatch(slice.setUpdatingLoader());
        return { success: false, error: err.response?.data?.message || 'An error occurred while creating the course' };
    }
};


export const fetchCourseById = (course_id) => async (dispatch) => {
    try {
        dispatch(slice.setLoader(true));

        let url = `${URL_BASE_LINK}/course/get/${course_id}`;

        const response = await axios.get(url);
        const courseData = response.data.data;

        // Log the course data for debugging
        console.log('fetchCourseById - Raw course data:', {
            course_id: courseData.course_id,
            course_name: courseData.course_name,
            units: courseData.units ? courseData.units.map(unit => ({
                id: unit.id,
                title: unit.title,
                assessment_criteria: unit.assessment_criteria ? unit.assessment_criteria.length : 0
            })) : 'No units'
        });

        const preFillData = {
            course_id: courseData.course_id,
            assessment_language: courseData.assessment_language || "",
            assessment_methods: courseData.assessment_methods || "",
            brand_guidelines: courseData.brand_guidelines || "",
            course_code: courseData.course_code || "",
            course_name: courseData.course_name || "",
            guided_learning_hours: courseData.guided_learning_hours || "",
            internal_external: courseData.internal_external || "",
            level: courseData.level || "",
            operational_start_date: courseData.operational_start_date || "",
            overall_grading_type: courseData.overall_grading_type || "",
            permitted_delivery_types: courseData.permitted_delivery_types || "",
            qualification_status: courseData.qualification_status || "",
            qualification_type: courseData.qualification_type || "",
            course_type: courseData.course_type || "",
            course_core_type: courseData.course_core_type || "",
            recommended_minimum_age: courseData.recommended_minimum_age || "",
            sector: courseData.sector || "",
            total_credits: courseData.total_credits || "",
            units: courseData.units || [],

            duration_period: courseData.duration_period || "",
            duration_value: courseData.duration_value || "",
            professional_certification: courseData.professional_certification || "",
            two_page_standard_link: courseData.two_page_standard_link || "",
            assessment_plan_link: courseData.assessment_plan_link || "",

            active: courseData.active || "Yes",
            included_in_off_the_job: courseData.included_in_off_the_job || "Yes",
            awarding_body: courseData.awarding_body || "No Awarding Body",

            assigned_gateway_id: courseData.assigned_gateway_id || null,
            assigned_gateway_name: courseData.assigned_gateway_name || "",
            questions: courseData.questions || courseData.checklist || [],
            assigned_standards: courseData.assigned_standards
              ? // Normalize to array of IDs: support both [1, 2] and [{id: 1, name: '...'}]
                courseData.assigned_standards.map((s: any) => {
                  if (typeof s === 'object' && s !== null && s.id !== undefined) {
                    // Convert object to ID
                    const idNum = Number(s.id)
                    return isNaN(idNum) ? s.id : idNum
                  }
                  // Already an ID, just normalize it
                  const idNum = Number(s)
                  return isNaN(idNum) ? s : idNum
                })
              : [],
        };

        // Log the prefill data for debugging
        console.log('fetchCourseById - Prefill data:', {
            course_id: preFillData.course_id,
            course_name: preFillData.course_name,
            units: preFillData.units ? preFillData.units.map(unit => ({
                id: unit.id,
                title: unit.title,
                assessment_criteria: unit.assessment_criteria ? unit.assessment_criteria.length : 0
            })) : 'No units'
        });

        dispatch(slice.updatePreFillData(preFillData));
        dispatch(slice.setUnitData(courseData.units || []));
        dispatch(slice.updateCourse(response.data.data));
        dispatch(slice.setLoader(false));
        return true;
    } catch (err) {
        console.error('fetchCourseById - Error:', err);
        dispatch(
            showMessage({ message: err.response?.data?.message || 'An error occurred while fetching the course', variant: "error" })
        );
        dispatch(slice.setLoader(false));
        return false;
    }
};


export const fetchCourseAPI =
    (
        data = { page: 1, page_size: 500 },
        search_keyword = "",
        search_role = "",
        core_type = ""
    ) =>
        async (dispatch) => {
            try {
                dispatch(slice.setLoader(true));
                const { page = 1, page_size = 500 } = data;

                let url = `${URL_BASE_LINK}/course/list?page=${page}&limit=${page_size}&meta=true`;

                if (search_keyword) {
                    url = `${url}&keyword=${search_keyword}`;
                }

                if (search_role) {
                    url = `${url}&role=${search_role}`;
                }

                if (core_type) {
                    url = `${url}&core_type=${core_type}`;
                }

                const response = await axios.get(url);

                dispatch(slice.updateCourse(response.data));
                dispatch(slice.setLoader(false));
                return true;
            } catch (err) {
                dispatch(
                    showMessage({ message: err.response.data.message, variant: "error" })
                );
                dispatch(slice.setLoader(false));
                return false;
            }
        };


export const updateCourseAPI = (id, data) => async (dispatch) => {
    try {
        // Log the data being sent to the API for debugging
        console.log('updateCourseAPI - Sending data:', {
            id,
            units: data.units ? data.units.map(unit => ({
                id: unit.id,
                title: unit.title,
                assessment_criteria: unit.assessment_criteria ? unit.assessment_criteria.length : 0
            })) : 'No units'
        });

        dispatch(slice.setUpdatingLoader());
        const { password, confirmPassword, ...payload } = data;
        const response = await axios.patch(
            `${URL_BASE_LINK}/course/update/${id}`,
            payload
        );

        // Log the response data for debugging
        console.log('updateCourseAPI - Response data:', response.data);

        // Update the course data in the store
        dispatch(slice.updateCourseById(response.data.data));

        // Fetch the updated course data to ensure it's properly loaded
        await dispatch(fetchCourseById(id));

        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        console.error('updateCourseAPI - Error:', err);
        dispatch(
            showMessage({ message: err.response?.data?.message || 'An error occurred while updating the course', variant: "error" })
        );
        dispatch(slice.setUpdatingLoader());
        return false;
    }
};


export const updateUserCourse = (id, data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());

        const response = await axios.patch(
            `${URL_BASE_LINK}/course/user/update/${id}`,
            data
        );
        dispatch(slice.setSingleDataStatus(response.data.data.course_status));

        return true;
    } catch (err) {
        dispatch(
            showMessage({ message: err.response.data.message, variant: "error" })
        );
        dispatch(slice.setUpdatingLoader());
        return false;
    }
};


export const deleteCourseHandler =
    (id, meta_data, search_keyword = "", search_role = "") =>
        async (dispatch) => {
            try {
                let { page, page_size, items } = meta_data;
                dispatch(slice.setUpdatingLoader());
                const response = await axios.delete(
                    `${URL_BASE_LINK}/course/delete/${id}`
                );
                dispatch(
                    showMessage({ message: response.data.message, variant: "success" })
                );
                dispatch(slice.setUpdatingLoader());
                if (items % page_size === 1) {
                    page--;
                }
                dispatch(
                    fetchCourseAPI({ page, page_size }, search_keyword, search_role)
                );
                return true;
            } catch (err) {
                dispatch(
                    showMessage({ message: err.response.data.message, variant: "error" })
                );
                dispatch(slice.setUpdatingLoader());
                return false;
            }
        };

export const jsonConverter = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/course/convert`, data);
        console.log("🚀 ~ jsonConverter ~ response:", response.data)
        dispatch(slice.setUpdatingLoader());
        dispatch(slice.updatePreFillData(response.data));
        return true;
    } catch (err) {
        dispatch(slice.setUpdatingLoader());
        dispatch(
            showMessage({ message: err.response.data.message, variant: "error" })
        );
        return false;
    }
};

export const courseAllocationAPI = (data) => async (dispatch) => {
    try {
        const response = await axios.post(
            `${URL_BASE_LINK}/course/enrollment`,
            data
        );
        dispatch(
            showMessage({ message: response.data.message, variant: "success" })
        );
        return true;
    } catch (err) {
        dispatch(
            showMessage({ message: err.response.data.message, variant: "error" })
        );
        return false;
    }
};

export const fetchAllLearnerByUserAPI = (id, role) => async (dispatch) => {
    try {
        dispatch(slice.setLoader(true));
        const response = await axios.get(
            `${URL_BASE_LINK}/learner/list?user_id=${id}&role=${role}`
        );
        dispatch(slice.setLearnerOverView(response.data.data));
        dispatch(slice.setLoader(false));
        return true;
    } catch (err) {
        dispatch(
            showMessage({ message: err.response.data.message, variant: "error" })
        );
        dispatch(slice.setLoader(false));
        return false;
    }
};


export const fetchActiveGatewayCourses = async () => {
    try {
        const url = `${URL_BASE_LINK}/course/list?limit=100&core_type=Gateway`;
        const response = await axios.get(url);

        const activeGateways = response.data.data.filter(
            (course) => course.active === "Yes"
        );


        return activeGateways;
    } catch (err) {
        console.error('fetchActiveGatewayCourses - Error:', err);
        return [];
    }
};


export const fetchActiveStandardCourses = async () => {
    try {
        const url = `${URL_BASE_LINK}/course/list?limit=100&core_type=Standard`;
        const response = await axios.get(url);


        const activeStandards = response.data.data.filter(
            (course) => course.active === "Yes"
        );

        return activeStandards;
    } catch (err) {
        return [];
    }
};

// Action to reset course data in the Redux store
export const resetCourseData = () => (dispatch) => {
    dispatch(slice.resetCourseData());
};

// Submit gateway answers and update store
export const submitGatewayAnswers = (courseId, learnerId, responses) => async (dispatch) => {
    try {
        const payload = { learner_id: Number(learnerId), responses };
        const response = await axios.post(`${URL_BASE_LINK}/course/gateway/${courseId}/submit-answers`, payload);
        // Pass the full response data to update the state with the complete course data
        dispatch(slice.setGatewayAnswers(response.data));
        
        dispatch(showMessage({ message: response.data?.message || 'Answers saved', variant: 'success' }));
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response?.data?.message || 'Failed to save answers', variant: 'error' }));
        return false;
    }
};

// Review gateway answer (achieved toggle) - admin/trainer only
export const reviewGatewayResponse = (user_course_id, questionId, achieved) => async (dispatch) => {
    try {
        const payload = { questionId, achieved };
        const response = await axios.patch(`${URL_BASE_LINK}/course/gateway-response/${user_course_id}/review`, payload);
        const dateAchieved = achieved ? new Date().toISOString() : undefined;
        dispatch(slice.setGatewayAchieved({ questionId, achieved, dateAchieved }));
        dispatch(showMessage({ message: response.data?.message || 'Updated', variant: 'success' }));
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response?.data?.message || 'Failed to update', variant: 'error' }));
        return false;
    }
};

// Upload gateway evidence files
export const uploadGatewayEvidence = (files: File[]) => async (dispatch) => {
    try {
        const formData = new FormData();
        files.forEach((f) => formData.append('files', f));
        formData.append('folder', 'gateway_evidence');
        const response: any = await axios.post(`${URL_BASE_LINK}/upload/files`, formData);
        return response.data; // expected to contain uploaded file metadata
    } catch (err) {
        dispatch(showMessage({ message: err.response?.data?.message || 'Upload failed', variant: 'error' }));
        return false;
    }
};

export default courseManagementSlice.reducer;
