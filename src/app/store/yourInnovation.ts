import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import jsonData from 'src/url.json';
import { showMessage } from './fuse/messageSlice';
import { userTableMetaData } from '../contanst/metaData';
import { log } from 'console';

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
    singleData: {}
};

const yourInnovationSlice = createSlice({
    name: 'yourInnovation',
    initialState,
    reducers: {
        setLoader(state) {
            state.dataFetchLoading = !state.dataFetchLoading;
        },
        setUpdatingLoader(state) {
            state.dataUpdatingLoadding = !state.dataUpdatingLoadding
        },
        setYourInnovation(state, action) {
            state.data = action.payload
        },
        setMetaData(state, action) {
            state.meta_data = action.payload
        },
        setSingleData(state, action) {
            state.singleData = action.payload
        },
        setSingleDataForSocket(state: any, action) {
            console.log(state.singleData?.id === action.payload?.id, action.payload, "_____________________________________________")
            if (state.singleData?.id === action.payload?.id) {
                state.singleData = { ...state.singleData, comment: action.payload.comment }
            } else {
                state.singleData = state.singleData
            }
        }
    }
});

export const slice = yourInnovationSlice.actions;
export const selectYourInnovation = ({ yourInnovation }) => yourInnovation;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

// create innovation
export const createYourInnovationAPI = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/innovation/create`, data)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// update innovation
export const updateYourInnovationAPI = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const { ...payload } = data
        const response = await axios.patch(`${URL_BASE_LINK}/innovation/update/${data.id}`, payload)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response?.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}

// delete innovation
export const deleteInnovationHandler = (id) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.delete(`${URL_BASE_LINK}/innovation/delete/${id}`)
        console.log(response);
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

export const getYourInnovationAPI = (data = { page: 1, page_size: 10 }, user_id) => async (dispatch, getStore) => {

    try {

        dispatch(slice.setLoader());

        const { page = 1, page_size = 10 } = data;

        let url = `${URL_BASE_LINK}/innovation/list?meta=true&page=${page}&limit=${page_size}`

        if (getStore().user?.data?.role !== "Admin") {
            url = `${url}&user_id=${user_id}`
        }

        const response = await axios.get(url);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setYourInnovation(response.data.data))
        dispatch(slice.setMetaData(response.data.meta_data))
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}

// create innovation comment
export const createInnovationCommentAPI = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/innovation/comment`, data)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

export const getInnovationCommentAPI = (data = { page: 1, page_size: 10 }, id) => async (dispatch) => {

    try {

        dispatch(slice.setLoader());

        const { page = 1, page_size = 10 } = data;

        let url = `${URL_BASE_LINK}/innovation/get/${id}`

        const response = await axios.get(url);

        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setSingleData(response.data.data))
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}

export default yourInnovationSlice.reducer;
