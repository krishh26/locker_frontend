import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import jsonData from 'src/url.json';
import { showMessage } from './fuse/messageSlice';
import { userTableMetaData } from '../contanst/metaData';

const initialState = {
    data: [],
    singleData: {},
    dataFetchLoading: false,
    dataUpdatingLoadding: false,
    meta_data: {
        page: 1,
        items: 0,
        page_size: userTableMetaData.page_size,
        pages: 1
    },
    singleAssignmentData: []
};

const assignmentSlice = createSlice({
    name: 'assignment',
    initialState,
    reducers: {
        setLoader(state) {
            state.dataFetchLoading = !state.dataFetchLoading;
        },
        setUpdatingLoader(state) {
            state.dataUpdatingLoadding = !state.dataUpdatingLoadding
        },
        setAssignmentdata(state, action) {
            state.data = action.payload
        },
        setSingleData(state, action) {
            state.singleData = action.payload
        },
        setSingleAssignmentData(state, action) {
            state.singleAssignmentData = action.payload
        }
    }
});

export const slice = assignmentSlice.actions;
export const selectAssignment = ({ assignment }) => assignment;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

export const getAssignmentAPI = (id) => async (dispatch) => {

    try {
        dispatch(slice.setLoader());

        let url = `${URL_BASE_LINK}/assignment/list?user_id=${id}`

        const response = await axios.get(url);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setAssignmentdata(response.data.data))
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(slice.setLoader());
        // dispatch(slice.setAssignmentdata([]))
        return false
    };

}

// create assignment 
export const createAssignmentAPI = (data) => async (dispatch, getStore) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/assignment/create`, data)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setSingleData(response.data.data));
        if (response.data.status) {
            // dispatch(getAssignmentAPI(getStore().user.data.user_id))
            const userId = getStore().storeData?.user_id || getStore().user?.data?.user_id;
            const courseId = getStore().courseManagement?.singleData?.course?.course_id;
            dispatch(getAssignmentByCourseAPI(courseId, userId))
        }
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// update assignment 
export const updateAssignmentAPI = (id, data) => async (dispatch, getStore) => {
    try {

        dispatch(slice.setUpdatingLoader());
        const { ...payload } = data
        const response = await axios.patch(`${URL_BASE_LINK}/assignment/update/${id}`, payload)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        if (response.data.status) {
            // dispatch(getAssignmentAPI(getStore().user.data.user_id))
            const userId = getStore().storeData?.user_id || getStore().user?.data?.user_id;
            const courseId = getStore().courseManagement?.singleData?.course?.course_id;
            dispatch(getAssignmentByCourseAPI(courseId, userId))
        }
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response?.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}

// delete assignment 
export const deleteAssignmentHandler = (id) => async (dispatch, getStore) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.delete(`${URL_BASE_LINK}/assignment/delete/${id}`)
        console.log(response);
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        if (response.data.status) {
            // dispatch(getAssignmentAPI(getStore().user.data.user_id))
            const userId = getStore().storeData?.user_id || getStore().user?.data?.user_id;
            const courseId = getStore().courseManagement?.singleData?.course?.course_id;
            dispatch(getAssignmentByCourseAPI(courseId, userId))
        }
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// Upload PDF
export const uploadPDF = (file: any) => async (dispatch) => {
    try {
        const formData = new FormData();
        console.log(file)

        file.forEach(value => formData.append("files", value));

        formData.append('folder', "assignment");

        dispatch(slice.setUpdatingLoader());
        const response: any = await axios.post(`${URL_BASE_LINK}/upload/files`, formData);
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        return response.data;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// get assignment
export const getAssignmentByCourseAPI = (course_id, user_id) => async (dispatch) => {

    try {
        dispatch(slice.setLoader());

        let url = `${URL_BASE_LINK}/assignment/list?&user_id=${user_id}`;

        if (course_id) {
            url = `${url}&course_id=${course_id}`
        }

        const response = await axios.get(url);
        dispatch(slice.setAssignmentdata(response.data.data));
        dispatch(slice.setSingleAssignmentData(response.data.data));
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}

export default assignmentSlice.reducer;
