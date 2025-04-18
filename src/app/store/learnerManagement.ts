import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import jsonData from 'src/url.json';
import { showMessage } from './fuse/messageSlice';
import { userTableMetaData } from '../contanst/metaData';
import LearnerDetails from '../main/portfolio/learnerDeatils';

const initialState = {
    data: [],
    trainer: [],
    IQA: [],
    EQA: [],
    employer: [],
    LIQA: [],
    dataFetchLoading: false,
    dataUpdatingLoadding: false,
    meta_data: {
        page: 1,
        items: 0,
        page_size: userTableMetaData.page_size,
        pages: 1
    },
    learner: {},
    singleData: {},
    learnerDetails: {},
    courseData: {},
    user_course_id: ""
};

const learnerManagementSlice = createSlice({
    name: 'learnerManagement',
    initialState,
    reducers: {
        updateLearner(state, action) {
            if (Array.isArray(action.payload.data)) {
                state.data = action.payload.data;
                state.meta_data = action.payload.meta_data
            } else {

                const items = state.meta_data.items + 1;
                state.meta_data.items = items;
                if (state.meta_data.page * state.meta_data.page_size >= items) {
                    state.data = [...state.data, action.payload]
                }
                state.meta_data.pages = Math.ceil(items / userTableMetaData.page_size)
            }
        },
        setLoader(state, action) {
            state.dataFetchLoading = action.payload;
        },
        setUpdatingLoader(state, action) {
            state.dataUpdatingLoadding = action.payload;
        },
        updateLearnerById(state, action) {
            const { learner_id, ...rest } = action.payload;
            state.data = state.data.map((value) => {
                if (value.learner_id === learner_id) {
                    return { ...action.payload, course: value.course };
                }
                return value;
            })
        },
        learnerDetails(state, action) {
            state.learner = action.payload
        },
        setTrainer(state, action) {
            state.trainer = action.payload
        },
        setIQA(state, action) {
            state.IQA = action.payload
        },
        setEQA(state, action) {
            state.EQA = action.payload
        },
        setEmployer(state, action) {
            state.employer = action.payload
        },
        setLIQA(state, action) {
            state.LIQA = action.payload
        },
        setSingleData(state, action) {
            state.singleData = action.payload
        },
        setCourseData(state, action) {
            state.courseData = action.payload.course
            if (action.payload.user_course_id)
                state.user_course_id = action.payload.user_course_id
        },
        setLearnerDetail(state, action) {
            state.learnerDetails = action.payload
        },

    }
});

export const slice = learnerManagementSlice.actions;
export const selectLearnerManagement = ({ learnerManagement }) => learnerManagement;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

// create learner
export const createLearnerAPI = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader(true));
        const response = await axios.post(`${URL_BASE_LINK}/learner/create`, data)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.updateLearner(response.data.data));
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        return false;
    } finally {
        dispatch(slice.setUpdatingLoader(false));
    }
}

// get learner
export const fetchLearnerAPI = (data = { page: 1, page_size: 10 }, search_keyword = "", search_course = "", search_employer = "", status = "") => async (dispatch) => {

    try {
        dispatch(slice.setLoader(true));
        const { page = 1, page_size = 10 } = data;

        let url = `${URL_BASE_LINK}/learner/list?page=${page}&limit=${page_size}&meta=true`;

        if (search_keyword) {
            url = `${url}&keyword=${search_keyword}`
        }

        if (search_course) {
            url = `${url}&course_id=${search_course}`
        }

        if (search_employer) {
            url = `${url}&employer_id=${search_employer}`
        }

        if (status) {
            url = `${url}&status=${status}`
        }

        const response = await axios.get(url);
        dispatch(slice.updateLearner(response.data));
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        return false
    } finally {
        dispatch(slice.setLoader(false));
    }
}

export const getRoleAPI = (role) => async (dispatch) => {
    try {
        let url = `${URL_BASE_LINK}/user/list?role=${role}`
        const response = await axios.get(url);
        if (role === "Trainer")
            dispatch(slice.setTrainer(response.data.data))
        else if (role === "IQA")
            dispatch(slice.setIQA(response.data.data))
        else if (role === "EQA")
            dispatch(slice.setEQA(response.data.data))
        else if (role === "Employer")
            dispatch(slice.setEmployer(response.data.data))
        else if (role === "LIQA")
            dispatch(slice.setLIQA(response.data.data))
        return true;

    } catch (err) {
        dispatch(slice.updateLearner([]))
        return false
    };
}
export const getLearnerDetails = (learner_id = "") => async (dispatch, getStore) => {
    try {
        dispatch(slice.setUpdatingLoader(true));
        const id = learner_id || getStore()?.user?.data?.id
        const response = await axios.get(`${URL_BASE_LINK}/learner/get/${id}`,)
        dispatch(slice.learnerDetails(response.data.data));
        return response.data.data;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        return false;
    } finally {
        dispatch(slice.setUpdatingLoader(false));
    }
}

export const getLearnerDetailsReturn = (id = "") => async (dispatch) => {
    try {
        dispatch(slice.setLoader(true));
        const response = await axios.get(`${URL_BASE_LINK}/learner/get/${id}`,)
        dispatch(slice.setLearnerDetail(response.data.data));
        dispatch(slice.setLoader(false));
        return response.data.data;
    } catch (err) {
        dispatch(slice.setLoader(true));
        return null;
    }
}

export const getLearnerCourseDetails = (data) => async (dispatch) => {
    const response = await axios.get(`${URL_BASE_LINK}/course/user/get?learner_id=${data.learner_id}&course_id=${data.course_id}`,)
    dispatch(slice.setCourseData(response.data.data))
}

// update learner
export const updateLearnerAPI = (id, data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader(true));
        const { password, confrimpassword, ...payload } = data
        const response = await axios.patch(`${URL_BASE_LINK}/learner/update/${id}`, payload)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.updateLearnerById(response.data.data));
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        return false;
    } finally {
        dispatch(slice.setUpdatingLoader(false));
    }
}


// Delete learner
export const deleteLearnerHandler = (id) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader(true));
        const response = await axios.delete(`${URL_BASE_LINK}/learner/delete/${id}`)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        return false;
    } finally {
        dispatch(slice.setUpdatingLoader(false));
    }
}

// restore learner
export const restoreLearnerHandler = (id) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader(true));
        const response = await axios.post(`${URL_BASE_LINK}/learner/restore/${id}`)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        return false;
    } finally {
        dispatch(slice.setUpdatingLoader(false));
    }
}

export default learnerManagementSlice.reducer;
