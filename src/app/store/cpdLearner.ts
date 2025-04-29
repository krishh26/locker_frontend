import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import jsonData from 'src/url.json';
import { showMessage } from './fuse/messageSlice';

// Define types for CPD learner entries
export interface CpdLearnerEntry {
    id?: string;
    what_training: string;
    date: string;
    how_you_did: string;
    what_you_learned: string;
    how_it_improved_work: string;
    [key: string]: any; // Allow for dynamic fields
}

const initialState = {
    data: [] as CpdLearnerEntry[],
    dataFetchLoading: false,
    dataUpdatingLoading: false,
};

const cpdLearnerSlice = createSlice({
    name: 'cpdLearner',
    initialState,
    reducers: {
        setLoader(state, action) {
            state.dataFetchLoading = action.payload;
        },
        setUpdatingLoader(state, action) {
            state.dataUpdatingLoading = action.payload;
        },
        setCpdLearnerData(state, action) {
            state.data = action.payload;
        },
        addCpdLearnerEntry(state, action) {
            state.data = [...state.data, action.payload];
        },
        updateCpdLearnerEntry(state, action) {
            const { id, ...updatedData } = action.payload;
            state.data = state.data.map(entry => 
                entry.id === id ? { ...entry, ...updatedData } : entry
            );
        },
        deleteCpdLearnerEntry(state, action) {
            state.data = state.data.filter(entry => entry.id !== action.payload);
        }
    }
});

export const slice = cpdLearnerSlice.actions;
export const selectCpdLearner = ({ cpdLearner }) => cpdLearner;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

// Get all CPD learner entries
export const getCpdLearnerListAPI = () => async (dispatch) => {
    try {
        dispatch(slice.setLoader(true));
        
        const response = await axios.get(`${URL_BASE_LINK}/cpd/learner/list`);
        
        if (response.data && response.data.data) {
            dispatch(slice.setCpdLearnerData(response.data.data));
        } else {
            dispatch(slice.setCpdLearnerData([]));
        }
        
        dispatch(slice.setLoader(false));
        return true;
    } catch (err) {
        dispatch(slice.setLoader(false));
        dispatch(slice.setCpdLearnerData([]));
        return false;
    }
};

// Create a new CPD learner entry
export const createCpdLearnerEntryAPI = (data: CpdLearnerEntry) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader(true));
        
        const response = await axios.post(`${URL_BASE_LINK}/cpd/learner/create`, data);
        
        if (response.data && response.data.status) {
            const newEntry = {
                ...data,
                id: response.data.data.id
            };
            dispatch(slice.addCpdLearnerEntry(newEntry));
            dispatch(showMessage({ 
                message: response.data.message || "CPD entry created successfully", 
                variant: "success" 
            }));
        }
        
        dispatch(slice.setUpdatingLoader(false));
        return true;
    } catch (err) {
        dispatch(showMessage({ 
            message: err.response?.data?.message || "Failed to create CPD learner entry", 
            variant: "error" 
        }));
        dispatch(slice.setUpdatingLoader(false));
        return false;
    }
};

// Update an existing CPD learner entry
export const updateCpdLearnerEntryAPI = (id: string, data: Partial<CpdLearnerEntry>) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader(true));
        
        const response = await axios.patch(`${URL_BASE_LINK}/cpd/learner/update/${id}`, data);
        
        if (response.data && response.data.status) {
            dispatch(slice.updateCpdLearnerEntry({ id, ...data }));
            dispatch(showMessage({ 
                message: response.data.message || "CPD entry updated successfully", 
                variant: "success" 
            }));
        }
        
        dispatch(slice.setUpdatingLoader(false));
        return true;
    } catch (err) {
        dispatch(showMessage({ 
            message: err.response?.data?.message || "Failed to update CPD learner entry", 
            variant: "error" 
        }));
        dispatch(slice.setUpdatingLoader(false));
        return false;
    }
};

// Delete a CPD learner entry
export const deleteCpdLearnerEntryAPI = (id: string) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader(true));
        
        const response = await axios.delete(`${URL_BASE_LINK}/cpd/learner/delete/${id}`);
        
        if (response.data && response.data.status) {
            dispatch(slice.deleteCpdLearnerEntry(id));
            dispatch(showMessage({ 
                message: response.data.message || "CPD entry deleted successfully", 
                variant: "success" 
            }));
        }
        
        dispatch(slice.setUpdatingLoader(false));
        return true;
    } catch (err) {
        console.error("Error deleting CPD learner entry:", err);
        dispatch(showMessage({ 
            message: err.response?.data?.message || "Failed to delete CPD learner entry", 
            variant: "error" 
        }));
        dispatch(slice.setUpdatingLoader(false));
        return false;
    }
};

export default cpdLearnerSlice.reducer;
