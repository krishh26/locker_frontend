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
    singleData: []
};

const resourceManagementSlice = createSlice({
    name: 'resourceManagement',
    initialState,
    reducers: {
        updateResource(state, action) {
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
        updateResourceById(state, action) {
            const { resource_id, ...rest } = action.payload;
            state.data = state.data.map((value) => {
                if (value.resource_id === resource_id) {
                    return rest;
                }
                return value;
            })
        },
        setSingleData(state, action) {
            state.singleData = action.payload
        },
        updateResourceData(state, action) {
            state.singleData = state.singleData.map((value) => value.resource_id === action.payload ? ({ ...value, isAccessed: true }) : value)
        }
    }
});

export const slice = resourceManagementSlice.actions;
export const selectResourceManagement = ({ resourceManagement }) => resourceManagement;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

// create resource
export const createResourceAPI = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/resource/create`, data)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(fetchResourceAPI());
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// get resource
export const fetchResourceAPI = (data = { page: 1, page_size: 25 }, search_keyword = "", search_role = "") => async (dispatch) => {

    try {
        dispatch(slice.setLoader());
        const { page = 1, page_size = 25 } = data;

        let url = `${URL_BASE_LINK}/resource/list?page=${page}&limit=${page_size}&meta=true`;

        if (search_keyword) {
            url = `${url}&keyword=${search_keyword}`
        }

        if (search_role) {
            url = `${url}&role=${search_role}`
        }

        const response = await axios.get(url);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.updateResource(response.data));
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}

// update resource
export const updateResourceAPI = (id, data) => async (dispatch) => {

    try {

        dispatch(slice.setUpdatingLoader());
        const { password, confrimpassword, ...payload } = data
        const response = await axios.patch(`${URL_BASE_LINK}/resource/update/${id}`, payload)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.updateResourceById(response.data.data));
        dispatch(slice.setUpdatingLoader());
        return true;

    } catch (err) {

        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}


// Delete resource
// export const deleteResourceHandler = (id, meta_data, search_keyword = "", search_role = "") => async (dispatch) => {
export const deleteResourceHandler = (id) => async (dispatch) => {

    try {
        // let { page, page_size, items } = meta_data;
        dispatch(slice.setUpdatingLoader());
        const response = await axios.delete(`${URL_BASE_LINK}/resource/delete/${id}`)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        // if (items % page_size === 1) {
        //     page--;
        // }
        // dispatch(fetchResourceAPI({ page, page_size }, search_keyword, search_role));
        dispatch(fetchResourceAPI());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}

// get resource
export const fetchResourceByCourseAPI = (course_id, user_id) => async (dispatch) => {

    try {
        dispatch(slice.setLoader());

        let url = `${URL_BASE_LINK}/resource/list-by-course?course_id=${course_id}&user_id=${user_id}`;

        const response = await axios.get(url);
        dispatch(slice.setSingleData(response.data.data));
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}

export const resourceAccess = (resource_id, user_id) => async (dispatch) => {

    try {
        let url = `${URL_BASE_LINK}/resource-status/create`;

        const response = await axios.post(url, { resource_id, user_id });
        if (response.data.status) {
            dispatch(slice.updateResourceData(resource_id));
        }
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}
export default resourceManagementSlice.reducer;
