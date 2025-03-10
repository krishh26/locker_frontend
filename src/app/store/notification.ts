import { createSlice } from '@reduxjs/toolkit';
import axiosInstance from 'src/utils/axios';
import jsonData from 'src/url.json';

const initialState = {
    notification: [],
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        setNotification(state, action) {
            state.notification = action.payload;
        }
    }
});

export const slice = notificationSlice.actions;
export const selectnotificationSlice = ({ notification }) => notification;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

export const fetchNotifications = () => async (dispatch) => {
    try {
        const response = await axiosInstance.get(`${URL_BASE_LINK}/notification/list`)
        dispatch(slice.setNotification(response.data.data));
    } catch (err) {
        dispatch(slice.setNotification([]));
    }
}

export const readNotifications = (id = "") => async (dispatch) => {
    try {
        let url = `${URL_BASE_LINK}/notification/read`
        if (id) {
            url += `/${id}`;
        }
        await axiosInstance.patch(url)
    } catch (err) {
    }
}

export const deleteNotifications = (id = "") => async (dispatch) => {
    try {
        let url = `${URL_BASE_LINK}/notification/delete`
        if (id) {
            url += `/${id}`;
        }
        await axiosInstance.delete(url)
    } catch (err) {
    }
}

export default notificationSlice.reducer;
