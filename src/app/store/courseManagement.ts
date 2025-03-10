import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import jsonData from 'src/url.json';
import { showMessage } from './fuse/messageSlice';
import { userTableMetaData } from '../contanst/metaData';

const initialState = {
    data: [],
    dataFetchLoading: false,
    dataUpdatingLoadding: false,
    meta_data: {
        page: 1,
        items: 0,
        page_size: userTableMetaData.page_size,
        pages: 1
    },
    preFillData: {},
    singleData: {},
    unitData: [],
    learnerOverView: []
};

const courseManagementSlice = createSlice({
    name: 'courseManagement',
    initialState,
    reducers: {
        updateCourse(state, action) {
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
        setLoader(state) {
            state.dataFetchLoading = !state.dataFetchLoading;
        },
        setUpdatingLoader(state) {
            state.dataUpdatingLoadding = !state.dataUpdatingLoadding
        },
        updateCourseById(state, action) {
            const { course_id, ...rest } = action.payload;
            state.data = state.data.map((value) => {
                if (value.course_id === course_id) {
                    return rest;
                }
                return value;
            })
        },
        updatePreFillData(state, action) {
            state.preFillData = action.payload
        },
        setSingleData(state, action) {
            state.singleData = action.payload
        },
        setUnitData(state, action) {
            state.unitData = action.payload
        },
        setLearnerOverView(state, action) {
            state.learnerOverView = action.payload
        }
    }
});

export const slice = courseManagementSlice.actions;
export const selectCourseManagement = ({ courseManagement }) => courseManagement;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

// create learner
export const createCourseAPI = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/course/create`, data)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.updateCourse(response.data.data));
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// get Course By Id
export const fetchCourseById = (course_id) => async (dispatch) => {

    try {
        dispatch(slice.setLoader());

        let url = `${URL_BASE_LINK}/course/get/${course_id}`;

        const response = await axios.get(url);

        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUnitData(response.data.data.units));
        dispatch(slice.updateCourse(response.data));
        
        // dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}

// get Course
export const fetchCourseAPI = (data = { page: 1, page_size: 25 }, search_keyword = "", search_role = "") => async (dispatch) => {

    try {
        // dispatch(slice.setLoader());
        const { page = 1, page_size = 25 } = data;

        let url = `${URL_BASE_LINK}/course/list?page=${page}&limit=${page_size}&meta=true`;

        if (search_keyword) {
            url = `${url}&keyword=${search_keyword}`
        }

        if (search_role) {
            url = `${url}&role=${search_role}`
        }

        const response = await axios.get(url);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.updateCourse(response.data));
        // dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}

// update learner
export const updateCourseAPI = (id, data) => async (dispatch) => {

    try {

        dispatch(slice.setUpdatingLoader());
        const { password, confrimpassword, ...payload } = data
        const response = await axios.patch(`${URL_BASE_LINK}/course/update/${id}`, payload)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.updateCourseById(response.data.data));
        dispatch(slice.setUpdatingLoader());
        return true;

    } catch (err) {

        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}


// Delete learner
export const deleteCourseHandler = (id, meta_data, search_keyword = "", search_role = "") => async (dispatch) => {

    try {
        let { page, page_size, items } = meta_data;
        dispatch(slice.setUpdatingLoader());
        const response = await axios.delete(`${URL_BASE_LINK}/course/delete/${id}`)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        if (items % page_size === 1) {
            page--;
        }
        dispatch(fetchCourseAPI({ page, page_size }, search_keyword, search_role));
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}

export const jsonConverter = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/course/convert`, data);
        dispatch(slice.setUpdatingLoader());
        dispatch(slice.updatePreFillData(response.data.data));
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        return false
    }
}

export const courseAllocationAPI = (data) => async (dispatch) => {

    try {
        const response = await axios.post(`${URL_BASE_LINK}/course/enrollment`, data)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        return true;

    } catch (err) {

        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        return false;
    };
}


export const fetchAllLearnerByUserAPI = (id, role) => async (dispatch) => {
    try {
        dispatch(slice.setLoader());
        const response = await axios.get(`${URL_BASE_LINK}/learner/list?user_id=${id}&role=${role}`)
        dispatch(slice.setLearnerOverView(response.data.data));
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false;
    };
}
export default courseManagementSlice.reducer;
