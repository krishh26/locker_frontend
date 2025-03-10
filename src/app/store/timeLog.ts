import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import jsonData from 'src/url.json';
import { showMessage } from './fuse/messageSlice';
import { userTableMetaData } from '../contanst/metaData';

const initialState = {
    data: [],
    sliceData: [],
    dataFetchLoading: false,
    dataUpdatingLoadding: false,
    meta_data: {
        page: 1,
        items: 0,
        page_size: userTableMetaData.page_size,
        pages: 1
    },
    timeLogspendData: {},
    singleData: {},
    calenderData: []
};

const timeLogSlice = createSlice({
    name: 'timeLog',
    initialState,
    reducers: {
        setLoader(state) {
            state.dataFetchLoading = !state.dataFetchLoading;
        },
        setUpdatingLoader(state) {
            state.dataUpdatingLoadding = !state.dataUpdatingLoadding
        },
        setTimeLog(state, action) {
            state.data = action.payload
        },
        setSliceData(state, action) {
            state.sliceData = action.payload
        },
        setTimeLogMetadata(state, action) {
            state.meta_data = action.payload
        },
        setTimelogspendData(state, action) {
            state.timeLogspendData = action.payload
        },
        setSingleData(state, action) {
            state.singleData = action.payload
        },
        setCalenderData(state, action) {
            state.calenderData = action.payload
        },
        setTimeLogVerified(state, action){
            console.log()
            state.data = state.data.map(time => {
                if (time.id === action.payload.id) {
                    return {...time, verified: action.payload.verified};
                } else {
                    return time;
                }
            });            
        }
    }
});

export const slice = timeLogSlice.actions;
export const selectTimeLog = ({ timeLog }) => timeLog;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

// create time-log
export const createTimeLogAPI = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/time-log/create`, data)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// update time-log
export const updateTimeLogAPI = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const { ...payload } = data
        const response = await axios.patch(`${URL_BASE_LINK}/time-log/update/${data.id}`, payload)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());

        if(data.verified === true || data.verified === false){
            console.log(data, "{{{{{{}}}}}}}}}}}}}}}}}}}")
            dispatch(slice.setTimeLogVerified(data))
        }
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response?.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}

// delete time-log
export const deleteTimeLogHandler = (id) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.delete(`${URL_BASE_LINK}/time-log/delete/${id}`)
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

export const getTimeLogAPI = (data = { page: 1, page_size: 10 }, user_id, course_id, type, approved = "") => async (dispatch) => {

    try {

        dispatch(slice.setLoader());

        const { page = 1, page_size = 10 } = data;

        let url = `${URL_BASE_LINK}/time-log/list?pagination=true&meta=true&page=${page}&limit=${page_size}&user_id=${user_id}`

        if (course_id) {
            url = `${url}&course_id=${course_id}`
        }

        if (type && type !== "All") {
            url = `${url}&type=${type}`
        }

        if (approved && approved !== "All") {
            url = `${url}&approved=${approved}`
        }

        const response = await axios.get(url);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setTimeLog(response.data.data))
        dispatch(slice.setTimeLogMetadata(response.data.meta_data))
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}

export const getTimeLogSliceData = (user_id, course_id, type) => async (dispatch) => {

    try {

        dispatch(slice.setLoader());

        let url = `${URL_BASE_LINK}/time-log/list?pagination=true&meta=true&page=1&limit=3&user_id=${user_id}`

        if (course_id) {
            url = `${url}&course_id=${course_id}`
        }

        if (type && type !== "All") {
            url = `${url}&type=${type}`
        }

        const response = await axios.get(url);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setSliceData(response.data.data))
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}

export const getTimeLogSpendData = (user_id, course_id, type) => async (dispatch) => {

    try {

        dispatch(slice.setLoader());

        let url = `${URL_BASE_LINK}/time-log/spend?user_id=${user_id}`

        if (course_id) {
            url = `${url}&course_id=${course_id}`
        }

        if (type && type !== "All") {
            url = `${url}&type=${type}`
        }

        const response = await axios.get(url);
        console.log(response.data);
        dispatch(slice.setTimelogspendData(response.data.data))
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}

// get month vise Time Log data
export const getMonthByTimeLogData = (year, month, user_id) => async (dispatch) => {

    try {
        dispatch(slice.setLoader());

        let url = `${URL_BASE_LINK}/time-log/list?user_id=${user_id}&year=${year}&month=${month}`;

        const response = await axios.get(url);
        dispatch(slice.setCalenderData(response.data.data));
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}

export default timeLogSlice.reducer;
