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
    singleData: {
        form_data: []
    },
    formDataDetails: {},
    users: {},
    mode: '',
    formTemplate: [],
    singleFrom: {},
    modeTemaplate: ''
};

const formDataSlice = createSlice({
    name: 'formData',
    initialState,
    reducers: {
        setLoader(state) {
            state.dataFetchLoading = !state.dataFetchLoading;
        },
        setUpdatingLoader(state) {
            state.dataUpdatingLoadding = !state.dataUpdatingLoadding
        },
        setFormData(state, action) {
            state.data = action.payload.data
            state.meta_data = action.payload.meta_data
        },
        setSingleData(state, action) {
            state.singleData = action.payload
        },
        setFormDataDetails(state, action) {
            state.formDataDetails = action.payload
        },
        setUsers(state, action) {
            state.users = action.payload
        },
        setMode(state, action) {
            state.mode = action.payload
        },
        setFormTemplate(state, action) {
            state.formTemplate = action.payload
        },
        storeFormData(state, action) {
            state.singleFrom = action.payload.data
            state.modeTemaplate = action.payload.mode
        }
    }
});

export const slice = formDataSlice.actions;
export const selectFormData = ({ formData }) => formData;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

// create form
export const createFormDataAPI = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/form/create`, data)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// update form
export const updateFormDataAPI = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const { ...payload } = data
        console.log(data);

        const response = await axios.patch(`${URL_BASE_LINK}/form/update/${data.id}`, payload)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response?.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}

// delete form
export const deleteFormHandler = (id) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.delete(`${URL_BASE_LINK}/form/delete/${id}`)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

export const getFormDataAPI = (data = { page: 1, page_size: 10 }, search_keyword = "", user_id = "") => async (dispatch) => {

    try {

        dispatch(slice.setLoader());

        const { page = 1, page_size = 10 } = data;

        let url = `${URL_BASE_LINK}/form/list?meta=true&page=${page}&limit=${page_size}`;

        if (search_keyword) {
            url = `${url}&keyword=${search_keyword}`
        }
        if (user_id) {
            url = `${url}&user_id=${user_id}`
        }

        const response = await axios.get(url);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setFormData(response.data))
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}

// create User form
export const createUserFormDataAPI = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/form/user/create`, data)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// get User form
export const getUserFormDataAPI = (form_id, user_id) => async (dispatch) => {

    try {

        dispatch(slice.setLoader());

        let url = `${URL_BASE_LINK}/form/user/${form_id}`;
        if (user_id) {
            url = `${url}?user_id=${user_id}`
        }

        const response = await axios.get(url);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setFormDataDetails(response.data.data.form_data))
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        // dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}

// get all user
export const fetchUserAllAPI = () => async (dispatch) => {

    try {
        dispatch(slice.setLoader());

        let url = `${URL_BASE_LINK}/user/list`;

        const response = await axios.get(url);
        dispatch(slice.setUsers(response.data));
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}


// Add users to form
export const AddUsersToForm = (form_id, data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const { ...payload } = data
        const response = await axios.patch(`${URL_BASE_LINK}/form/add-user/${form_id}`, payload)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response?.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}

// User form data 

export const getUserAllFormAPI = (data = { page: 1, page_size: 10 }, search_keyword = "") => async (dispatch) => {

    try {

        dispatch(slice.setLoader());

        const { page = 1, page_size = 10 } = data;

        let url = `${URL_BASE_LINK}/form/list/user?meta=true&page=${page}&limit=${page_size}`;

        if (search_keyword) {
            url = `${url}&keyword=${search_keyword}`
        }

        const response = await axios.get(url);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setFormData(response.data))
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}

export const fetchTemplateData = () => async (dispatch) => {
    try {
        const response = await axios.get(`${URL_BASE_LINK}/form-template/list`);
        if (response.data.status) {
            dispatch(slice.setFormTemplate(response.data.data))
        } else {
            dispatch(showMessage({ message: response.data.message, variant: "error" }))
        }
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setFormTemplate([]));
    }

}

export const createTemplateData = (data) => async (dispatch) => {
    try {
        const response = await axios.post(`${URL_BASE_LINK}/form-template/create`, data);
        if (!response.data.status) {
            dispatch(showMessage({ message: response.data.message, variant: "error" }))
        }
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setFormTemplate([]));
    }

}

export const updateTemplate = (id, data) => async (dispatch) => {
    try {
        const response = await axios.patch(`${URL_BASE_LINK}/form-template/update/${id}`, data);
        if (response.data.status) {
            dispatch(fetchTemplateData())
        } else {
            dispatch(showMessage({ message: response.data.message, variant: "error" }))
        }
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
    }

}

export const deleteTemplate = (id) => async (dispatch) => {
    try {
        const response = await axios.delete(`${URL_BASE_LINK}/form-template/delete/${id}`);
        if (response.data.status) {
            dispatch(fetchTemplateData())
        } else {
            dispatch(showMessage({ message: response.data.message, variant: "error" }))
        }
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
    }

}
export default formDataSlice.reducer;
