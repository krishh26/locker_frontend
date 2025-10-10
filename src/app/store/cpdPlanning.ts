import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import jsonData from 'src/url.json';
import { showMessage } from './fuse/messageSlice';
import { userTableMetaData } from '../contanst/metaData';
import { useCurrentUser } from '../utils/userHelpers';

// Define types for CPD entries
export interface CpdEntry {
    id: string;
    user_id: string;
    activity: string;
    date: string;
    method: string;
    learning: string;
    impact: string;
    [key: string]: any; // Allow for dynamic fields
}

const initialState = {
    data: [] as CpdEntry[],
    singleData: {} as CpdEntry,
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
            dispatch(getCpdPlanningAPI(getStore().user?.data?.user_id, "activities"))
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
            dispatch(getCpdPlanningAPI(getStore().user?.data?.user_id, "evaluations"))
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
            dispatch(getCpdPlanningAPI(getStore().user?.data?.user_id, "evaluations"))
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
            dispatch(getCpdPlanningAPI(getStore().user?.data?.user_id, "reflections"))
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
            dispatch(getCpdPlanningAPI(getStore().user?.data?.user_id, "reflections"))
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
            dispatch(getCpdPlanningAPI(getStore().user?.data?.user_id, "reflections"))
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



// New API functions for the editable table

// Get all CPD entries for a user
export const getCpdEntriesAPI = (userId: string) => async (dispatch: any) => {
    try {
        dispatch(slice.setLoader());

        // For now, we'll use the existing API endpoint and transform the data
        // In a real implementation, you would create a new endpoint for this
        const response = await axios.get(`${URL_BASE_LINK}/cpd/get/${userId}`);

        // Transform the data to match our new structure
        // This is a temporary solution until the backend is updated
        let entries: CpdEntry[] = [];

        if (response.data.data && response.data.data.length > 0) {
            // Combine activities, evaluations, and reflections into a single array
            response.data.data.forEach((cpd: any) => {
                if (cpd.activities) {
                    entries = [...entries, ...cpd.activities.map((activity: any) => ({
                        id: activity.id,
                        user_id: userId,
                        activity: activity.learning_objective || '',
                        date: activity.date || '',
                        method: activity.activity || '',
                        learning: activity.comment || '',
                        impact: activity.support_you || '',
                    }))];
                }
            });
        }

        dispatch(slice.setCPDdata(entries));
        dispatch(slice.setLoader());
        return true;
    } catch (err) {
        dispatch(slice.setLoader());
        dispatch(slice.setCPDdata([]));
        return false;
    }
};

// Create a new CPD entry
export const createCpdEntryAPI = (data: CpdEntry) => async (dispatch: any, getStore: any) => {
    try {
        dispatch(slice.setUpdatingLoader());

        // For now, we'll use the existing activity API endpoint
        // In a real implementation, you would create a new endpoint for this
        const payload = {
            cpd_id: data.cpd_id || getStore().cpdPlanning.data[0]?.id || '',
            learning_objective: data.activity,
            date: data.date,
            activity: data.method,
            comment: data.learning,
            support_you: data.impact,
            completed: 'Fully', // Default value
            timeTake: {
                day: 0,
                hours: 0,
                minutes: 0
            },
            files: []
        };

        const response = await axios.post(`${URL_BASE_LINK}/cpd/activity/create`, payload);

        // Add the new entry to the state directly instead of fetching again
        if (response.data.status) {
            const newEntry: CpdEntry = {
                id: response.data.data.id || data.id,
                user_id: data.user_id,
                activity: data.activity,
                date: data.date,
                method: data.method,
                learning: data.learning,
                impact: data.impact
            };

            // Update the state with the new entry
            const currentData = getStore().cpdPlanning.data;
            dispatch(slice.setCPDdata([...currentData, newEntry]));
        }

        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err: any) {
        dispatch(showMessage({ message: err.response?.data.message || 'Error creating entry', variant: "error" }));
        dispatch(slice.setUpdatingLoader());
        return false;
    }
};

// Update an existing CPD entry
export const updateCpdEntryAPI = (id: string, data: Partial<CpdEntry>) => async (dispatch: any, getStore: any) => {
    try {
        dispatch(slice.setUpdatingLoader());

        const payload = {
            learning_objective: data.activity,
            date: data.date,
            activity: data.method,
            comment: data.learning,
            support_you: data.impact,
        };

        const response = await axios.patch(`${URL_BASE_LINK}/cpd/activity/update/${id}`, payload);

        // Update the state directly instead of fetching again
        if (response.data.status) {
            const currentData = getStore().cpdPlanning.data;
            const updatedData = currentData.map((entry: CpdEntry) =>
                entry.id === id
                    ? { ...entry, ...data }
                    : entry
            );
            dispatch(slice.setCPDdata(updatedData));
        }

        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err: any) {
        dispatch(showMessage({ message: err.response?.data.message || 'Error updating entry', variant: "error" }));
        dispatch(slice.setUpdatingLoader());
        return false;
    }
};

// Delete a CPD entry
export const deleteCpdEntryAPI = (id: string) => async (dispatch: any, getStore: any) => {
    try {
        dispatch(slice.setUpdatingLoader());

        const response = await axios.delete(`${URL_BASE_LINK}/cpd/activity/delete/${id}`);

        // Update the state directly instead of fetching again
        if (response.data.status) {
            const currentData = getStore().cpdPlanning.data;
            const filteredData = currentData.filter((entry: CpdEntry) => entry.id !== id);
            dispatch(slice.setCPDdata(filteredData));
        }

        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err: any) {
        dispatch(showMessage({ message: err.response?.data.message || 'Error deleting entry', variant: "error" }));
        dispatch(slice.setUpdatingLoader());
        return false;
    }
};

export default cpdPlanningSlice.reducer;
