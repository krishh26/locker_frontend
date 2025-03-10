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
    dialogType: "",
    meta_data: {
        page: 1,
        items: 0,
        page_size: userTableMetaData.page_size,
        pages: 1
    },
};

const cpdPlanningSlice = createSlice({
    name: 'cpdPlanning',
    initialState,
    reducers: {
        setLoader(state) {
            state.dataFetchLoading = !state.dataFetchLoading;
        },
        setUpdatingLoader(state) {
            state.dataUpdatingLoadding = !state.dataUpdatingLoadding
        },
        setDialogType(state, action) {
            state.dialogType = action.payload
        },
        setCPDdata(state, action) {
            state.data = action.payload
        },
        setCpdSingledata(state, action) {
            state.singleData = action.payload
        }
    }
});

export const slice = cpdPlanningSlice.actions;
export const selectCpdPlanning = ({ cpdPlanning }) => cpdPlanning;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

export const getCpdPlanningAPI = (id, field) => async (dispatch) => {

    try {
        // activities,evaluations,reflections
        dispatch(slice.setLoader());

        let url = `${URL_BASE_LINK}/cpd/get/${id}?table=${field}`

        const response = await axios.get(url);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setCPDdata(response.data.data))
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(slice.setLoader());
        dispatch(slice.setCPDdata([]))
        return false
    };

}

// create cpd planning
export const createCpdPlanningAPI = (data) => async (dispatch, getStore) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/cpd/create`, data)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        if (response.data.status) {
            dispatch(getCpdPlanningAPI(getStore().user.data.user_id, ""))
        }
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// update cpd planning
export const updateCpdPlanningAPI = (data) => async (dispatch, getStore) => {
    try {

        dispatch(slice.setUpdatingLoader());
        const { ...payload } = data
        const response = await axios.patch(`${URL_BASE_LINK}/cpd/update`, payload)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        if (response.data.status) {
            dispatch(getCpdPlanningAPI(getStore().user.data.user_id, ""))
        }
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response?.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}

// delete cpd Planning
export const deletePlanningHandler = (id) => async (dispatch, getStore) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.delete(`${URL_BASE_LINK}/cpd/delete/${id}`)
        console.log(response);
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        if (response.data.status) {
            dispatch(getCpdPlanningAPI(getStore().user.data.user_id, ""))
        }
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// create cpd Activity
export const createActivityAPI = (data) => async (dispatch, getStore) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/cpd/activity/create`, data)
        console.log(response);
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        if (response.data.status) {
            dispatch(getCpdPlanningAPI(getStore().user.data.user_id, "activities"))
        }
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// update cpd Activity
export const updateActivityAPI = (id, data) => async (dispatch, getStore) => {
    try {

        dispatch(slice.setUpdatingLoader());
        const { ...payload } = data
        const response = await axios.patch(`${URL_BASE_LINK}/cpd/activity/update/${id}`, payload)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        if (response.data.status) {
            dispatch(getCpdPlanningAPI(getStore().user.data.user_id, "activities"))
        }
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response?.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}

// delete cpd Activity
export const deleteActivityHandler = (id) => async (dispatch, getStore) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.delete(`${URL_BASE_LINK}/cpd/activity/delete/${id}`)
        console.log(response);
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        if (response.data.status) {
            dispatch(getCpdPlanningAPI(getStore().user.data.user_id, "activities"))
        }
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// create cpd Evaluation
export const createEvaluationAPI = (data) => async (dispatch, getStore) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/cpd/evaluation/create`, data)
        console.log(response);
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        if (response.data.status) {
            dispatch(getCpdPlanningAPI(getStore().user.data.user_id, "evaluations"))
        }
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// update cpd Evaluation
export const updateEvaluationAPI = (id, data) => async (dispatch, getStore) => {
    try {

        dispatch(slice.setUpdatingLoader());
        const { ...payload } = data
        const response = await axios.patch(`${URL_BASE_LINK}/cpd/evaluation/update/${id}`, payload)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        if (response.data.status) {
            dispatch(getCpdPlanningAPI(getStore().user.data.user_id, "evaluations"))
        }
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response?.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}

// delete cpd Evaluation
export const deleteEvaluationHandler = (id) => async (dispatch, getStore) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.delete(`${URL_BASE_LINK}/cpd/evaluation/delete/${id}`)
        console.log(response);
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        if (response.data.status) {
            dispatch(getCpdPlanningAPI(getStore().user.data.user_id, "evaluations"))
        }
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// create cpd Reflection
export const createReflectionAPI = (data) => async (dispatch, getStore) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/cpd/reflection/create`, data)
        console.log(response);
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        if (response.data.status) {
            dispatch(getCpdPlanningAPI(getStore().user.data.user_id, "reflections"))
        }
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// update cpd Reflections
export const updateReflectionsAPI = (id, data) => async (dispatch, getStore) => {
    try {

        dispatch(slice.setUpdatingLoader());
        const { ...payload } = data
        const response = await axios.patch(`${URL_BASE_LINK}/cpd/reflection/update/${id}`, payload)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        if (response.data.status) {
            dispatch(getCpdPlanningAPI(getStore().user.data.user_id, "reflections"))
        }
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response?.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}

// delete cpd Reflection
export const deleteReflectionHandler = (id) => async (dispatch, getStore) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.delete(`${URL_BASE_LINK}/cpd/reflection/delete/${id}`)
        console.log(response);
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        if (response.data.status) {
            dispatch(getCpdPlanningAPI(getStore().user.data.user_id, "reflections"))
        }
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// Upload Images
export const uploadImages = (file: any) => async (dispatch) => {
    try {
        const formData = new FormData();
        console.log(file)

        file.forEach(value => formData.append("files", value));

        formData.append('folder', "cpd");

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



export default cpdPlanningSlice.reducer;
