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
    courseData: [],
    message: {
        course_course_id: null
    },
};

const forumDataSlice = createSlice({
    name: 'forumData',
    initialState,
    reducers: {
        setLoader(state) {
            state.dataFetchLoading = !state.dataFetchLoading;
        },
        setUpdatingLoader(state) {
            state.dataUpdatingLoadding = !state.dataUpdatingLoadding
        },
        setForumData(state, action) {
            state.data = action.payload.data
            state.meta_data = action.payload.meta_data
        },
        pushForumData(state, action) {
            state.data = [...state.data, action.payload]
        },
        newMassageHandler(state, action) {
            if (state.message?.course_course_id === action.payload.course.course_id) {
                state.data = [...state.data, action.payload]
            }
        },
        setCourseData(state, action) {
            state.courseData = action.payload
        },
        setMessage(state, action) {
            state.message = action.payload
        },
        setResetFormData(state, action) {
            state.data = action.payload.data
        },
    }
});

export const slice = forumDataSlice.actions;
export const selectForumData = ({ forumData }) => forumData;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

// send forum
export const sendMessageAPI = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/forum/send`, data)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

//get message
export const getMessageAPI = (data, course_id) => async (dispatch, getStore) => {

    try {

        dispatch(slice.setLoader());

        const { page = 1, page_size = 25 } = data;
        let courseId = course_id || getStore().forumData.message?.course_course_id
        let url = `${URL_BASE_LINK}/forum/messages/${courseId}?meta=true&page=${1}&limit=${500}`

        const response = await axios.get(url);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setForumData(response.data))
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };
}

//get chat list
export const getChatListAPI = (user_id = "") => async (dispatch) => {
    try {
        dispatch(slice.setLoader());

        let url = `${URL_BASE_LINK}/forum/list`
        if (user_id) {
            url = `${url}?user_id=${user_id}`
        }
        const response = await axios.get(url);
        dispatch(slice.setCourseData(response.data.data))
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };
}

export default forumDataSlice.reducer;
