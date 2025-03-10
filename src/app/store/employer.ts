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
    singleData: {}
};

const employerSlice = createSlice({
    name: 'employer',
    initialState,
    reducers: {
        setLoader(state) {
            state.dataFetchLoading = !state.dataFetchLoading;
        },
        setUpdatingLoader(state) {
            state.dataUpdatingLoadding = !state.dataUpdatingLoadding
        },
        setEmployer(state, action) {
            state.data = action.payload
        },
        setEmployerMetadata(state, action) {
            state.meta_data = action.payload
        },
        setSingleData(state, action) {
            state.singleData = action.payload
        }
    }
});

export const slice = employerSlice.actions;
export const selectEmployer = ({ employer }) => employer;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

// create employer
export const createEmployerAPI = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/employer/create`, data)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// update employer
export const updateEmployerAPI = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const { ...payload } = data
        const response = await axios.patch(`${URL_BASE_LINK}/employer/update/${data.employer_id}`, payload)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response?.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}

// delete employer
export const deleteEmployerHandler = (id) => async (dispatch, getStore) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.delete(`${URL_BASE_LINK}/employer/delete/${id}`)
        console.log(response);
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        if (response.data.status) {
            dispatch(getEmployerAPI(getStore()))
        }
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

export const getEmployerAPI = (data = { page: 1, page_size: 10 }, search_keyword = "") => async (dispatch) => {

    try {

        dispatch(slice.setLoader());

        const { page = 1, page_size = 10 } = data;

        let url = `${URL_BASE_LINK}/employer/list?meta=true&page=${page}&limit=${page_size}`
        if (search_keyword) {
            url = `${url}&keyword=${search_keyword}`
        }

        const response = await axios.get(url);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setEmployer(response.data.data))
        dispatch(slice.setEmployerMetadata(response.data.meta_data))
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}

export default employerSlice.reducer;
