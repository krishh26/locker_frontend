import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import jsonData from 'src/url.json';
import { showMessage } from './fuse/messageSlice';

const initialState = {
    data: []
};

const contractWorkSlice = createSlice({
    name: 'contractWork',
    initialState,
    reducers: {
        setContractWorkdata(state, action) {
            state.data = action.payload
        }
    },
});

export const slice = contractWorkSlice.actions;
export const selectContractWork = ({ contractWork }) => contractWork;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

// get Contract Work 
export const getContractWork = (id) => async (dispatch) => {

    try {

        let url = `${URL_BASE_LINK}/contractwork/list?learner_id=${id}`

        const response = await axios.get(url);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setContractWorkdata(response.data.data))
        return true;

    } catch (err) {
        dispatch(slice.setContractWorkdata([]))
        return false
    };

}

// create Contract Work 
export const createContractWorkAPI = (data) => async (dispatch) => {
    try {
        const response = await axios.post(`${URL_BASE_LINK}/contractwork/create`, data)
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        return false;
    }
}

// update contractWork 
export const updateContractWorkAPI = (contractwork_id, data) => async (dispatch, getStore) => {
    try {

        const { ...payload } = data
        const response = await axios.patch(`${URL_BASE_LINK}/contractwork/update/${contractwork_id}`, payload)
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))

        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response?.data.message, variant: "error" }))
        return false;
    };
}

// delete contractWork 
export const deleteContractWorkHandler = (id) => async (dispatch, getStore) => {
    try {
        const response = await axios.delete(`${URL_BASE_LINK}/contractwork/delete/${id}`)
        console.log(response);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))

        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        return false;
    }
}

export default contractWorkSlice.reducer;
