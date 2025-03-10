import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import jsonData from 'src/url.json';
import { showMessage } from './fuse/messageSlice';
import { userTableMetaData } from '../contanst/metaData';
import JwtService from '../auth/services/jwtService';
import instance from '../auth/services/jwtService/jwtService';
import {slice as globalSlice} from './globalUser'
import { setUser } from './userSlice';

const initialState = {
    data: [],
    avarat: "",
    dataFetchLoading: false,
    dataUpdatingLoadding: false,
    meta_data: {
        page: 1,
        items: 0,
        page_size: userTableMetaData.page_size,
        pages: 1
    },
    learnerData: [],
    trainerData: []
};

const userManagementSlice = createSlice({
    name: 'userManagement',
    initialState,
    reducers: {
        updateUser(state, action) {
            console.log("loglog", action.payload.data, Array.isArray(action.payload.data))
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
        updateUserById(state, action) {
            const { user_id, ...rest } = action.payload;
            state.data = state.data.map((value) => {
                if (value.user_id === user_id) {
                    return rest;
                }
                return value;
            })
        },
        updateAvatar(state, action) {
            state.avarat = action.payload;
        },
        setEQALearnerData(state, action) {
            state.learnerData = action.payload;
        },
        setEQATrainerData(state, action) {
            state.trainerData = action.payload;
        }
    }
});

export const slice = userManagementSlice.actions;
export const selectUserManagement = ({ userManagement }) => userManagement;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

// Send OTP API
export const sendOTPMailHandler = (data) => async (dispatch) => {
    try {
        sessionStorage.setItem("email", data);
        const payload = {
            email: data
        };

        await axios.post(`${URL_BASE_LINK}/otp/sendotp`, payload);
        dispatch(showMessage({ message: "OTP sent successfully", variant: "success" }));

        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }));
        return false;
    }
}

//verify otp 
export const verifyOTPMailHandler = (data, navigate) => async (dispatch) => {
    try {
        const payload = {
            email: sessionStorage.getItem("email"),
            otp: data
        };

        await axios.post(`${URL_BASE_LINK}/otp/validateotp`, payload);
        dispatch(showMessage({ message: "OTP validation successful", variant: "success" }));
        navigate("/reset");

        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }));
        return false;
    }
};


// reset password
export const resetPasswordHandler = (data) => async (dispatch) => {

    try {
        const payload = {
            email: sessionStorage.getItem("email"),
            password: data.password
        };

        if (!payload.email) {
            dispatch(showMessage({ message: "Something went wrong...!", variant: "error" }))
            return "/"
        }
        const response = await axios.post(`${URL_BASE_LINK}/user/updatepassword`, payload);
        dispatch(showMessage({ message: response.data.message, variant: "success" }));
        const resetData = sessionStorage.getItem("reset");
        if (resetData) {
            const data = JSON.parse(resetData);
            await JwtService.setSession(data.token);
            await JwtService.emit('onLogin', data.decoded);
            sessionStorage.removeItem("reset");
            sessionStorage.removeItem("email");
            return "/home"
        }
        sessionStorage.removeItem("email");
        return "/sign-in";

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        return false;

    }
}


// create user
export const createUserAPI = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/user/create`, data)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.updateUser(response.data.data));
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// get user
export const fetchUserAPI = (data = { page: 1, page_size: 10 }, search_keyword = "", search_role = "") => async (dispatch) => {

    try {
        dispatch(slice.setLoader());
        const { page = 1, page_size = 10 } = data;

        let url = `${URL_BASE_LINK}/user/list?page=${page}&limit=${page_size}&meta=true`;

        if (search_keyword) {
            url = `${url}&keyword=${search_keyword}`
        }

        if (search_role) {
            url = `${url}&role=${search_role === "Lead IQA" ? "LIQA" : search_role}`
        }

        const response = await axios.get(url);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.updateUser(response.data));
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}

// update user
export const updateUserAPI = (id, data) => async (dispatch) => {

    try {

        dispatch(slice.setUpdatingLoader());
        const { password, confrimpassword, ...payload } = data
        const response = await axios.patch(`${URL_BASE_LINK}/user/update/${id}`, payload)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.updateUserById(response.data.data));
        dispatch(slice.setUpdatingLoader());
        return true;

    } catch (err) {

        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}


// Delete user
export const deleteUserHandler = (id, meta_data, search_keyword = "", search_role = "") => async (dispatch) => {

    try {
        let { page, page_size, items } = meta_data;
        dispatch(slice.setUpdatingLoader());
        const response = await axios.delete(`${URL_BASE_LINK}/user/delete/${id}`)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        if (items % page_size === 1) {
            page--;
        }
        dispatch(fetchUserAPI({ page, page_size }, search_keyword, search_role));
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}

// Upload user avatar 
export const uploadAvatar = (file) => async (dispatch, getStore) => {
    try {
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('role', getStore()?.user?.data?.role)
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/user/avatar`, formData);
        await JwtService.setSession(response.data.data)
        window.location.reload();
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// chnage user role
export const changeUserRoleHandler = (role) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/user/changerole/`, { role })
        if (response.data.status) {
            dispatch(globalSlice.setCurrentUser(response.data.data.user))
            instance.chnageRole(response.data.data.accessToken);
        }
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}


// Change Password
export const changePassword = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/user/password/change`, data)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response?.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}


// get user
export const getEQAUserData = (data = { page: 1, page_size: 5 }, user, user_id) => async (dispatch) => {

    try {
        dispatch(slice.setLoader());
        const { page = 1, page_size = 5 } = data;

        let url = `${URL_BASE_LINK}/user/list/eqa?meta=true&page=${page}&limit=${page_size}&user=${user}&EQA_id=${user_id}`;

        const response = await axios.get(url);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        if (user === "trainer_id") {
            dispatch(slice.setEQATrainerData(response.data.data));
        }
        if (user === "learner_id") {
            dispatch(slice.setEQALearnerData(response.data.data));
        }
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}
export default userManagementSlice.reducer;
