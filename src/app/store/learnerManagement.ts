import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import jsonData from 'src/url.json';
import { showMessage } from './fuse/messageSlice';
import { userTableMetaData } from '../contanst/metaData';
import JwtService from '../auth/services/jwtService';
import HelpOutlined from '@mui/icons-material/HelpOutlined';

const initialState = {
    data: [],
    trainer: [],
    IQA: [],
    EQA: [],
    employer: [],
    LIQA: [],
    dataFetchLoading: false,
    dataUpdatingLoadding: false,
    meta_data: {
        page: 1,
        items: 0,
        page_size: userTableMetaData.page_size,
        pages: 1
    },
    learner: {},
    singleData: {},
    courseData: {},
    user_course_id: ""
};

const learnerManagementSlice = createSlice({
    name: 'learnerManagement',
    initialState,
    reducers: {
        updateLearner(state, action) {
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
            state.dataFetchLoading = false;
        },
        setUpdatingLoader(state) {
            state.dataUpdatingLoadding = false;
        },
        updateLearnerById(state, action) {
            const { learner_id, ...rest } = action.payload;
            state.data = state.data.map((value) => {
                if (value.learner_id === learner_id) {
                    return action.payload;
                }
                return value;
            })
        },
        learnerDetails(state, action) {
            state.learner = action.payload
        },
        setTrainer(state, action) {
            state.trainer = action.payload
        },
        setIQA(state, action) {
            state.IQA = action.payload
        },
        setEQA(state, action) {
            state.EQA = action.payload
        },
        setEmployer(state, action) {
            state.employer = action.payload
        },
        setLIQA(state, action) {
            state.LIQA = action.payload
        },
        setSingleData(state, action) {
            state.singleData = action.payload
        },
        setCourseData(state, action) {
            state.courseData = action.payload.course
            if (action.payload.user_course_id)
                state.user_course_id = action.payload.user_course_id
        }

    }
});

export const slice = learnerManagementSlice.actions;
export const selectLearnerManagement = ({ learnerManagement }) => learnerManagement;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

// create learner
export const createLearnerAPI = (data) => async (dispatch) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const response = await axios.post(`${URL_BASE_LINK}/learner/create`, data)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.updateLearner(response.data.data));
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

// get learner
export const fetchLearnerAPI = (data = { page: 1, page_size: 10 }, search_keyword = "", search_role = "") => async (dispatch) => {

    try {
        // dispatch(slice.setLoader());
        const { page = 1, page_size = 10 } = data;

        let url = `${URL_BASE_LINK}/learner/list?page=${page}&limit=${page_size}&meta=true`;

        if (search_keyword) {
            url = `${url}&keyword=${search_keyword}`
        }

        if (search_role) {
            url = `${url}&role=${search_role}`
        }

        const response = await axios.get(url);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.updateLearner(response.data));
        // alert("value")
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setLoader());
        return false
    };

}

export const getRoleAPI = (role) => async (dispatch) => {
    try {
        dispatch(slice.setLoader());
        let url = `${URL_BASE_LINK}/user/list?role=${role}`
        const response = await axios.get(url);
        // dispatch(showMessage({ message: response.data.message, variant: "success" }))
        if (role === "Trainer")
            dispatch(slice.setTrainer(response.data.data))
        else if (role === "IQA")
            dispatch(slice.setIQA(response.data.data))
        else if (role === "EQA")
            dispatch(slice.setEQA(response.data.data))
        else if (role === "Employer")
            dispatch(slice.setEmployer(response.data.data))
        else if (role === "LIQA")
            dispatch(slice.setLIQA(response.data.data))
        dispatch(slice.setLoader());
        return true;

    } catch (err) {
        dispatch(slice.setLoader());
        dispatch(slice.updateLearner([]))
        return false
    };
}
export const getLearnerDetails = (data = "") => async (dispatch, getStore) => {
    try {
        dispatch(slice.setUpdatingLoader());
        const id = data || getStore()?.user?.data?.id
        const response = await axios.get(`${URL_BASE_LINK}/learner/get/${id}`,)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.learnerDetails(response.data.data));
        dispatch(slice.setUpdatingLoader());
        return true;
    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    }
}

export const getLearnerCourseDetails = (data) => async (dispatch) => {
    dispatch(slice.setLoader());
    const response = await axios.get(`${URL_BASE_LINK}/course/user/get?learner_id=${data.learner_id}&course_id=${data.course_id}`,)
    dispatch(showMessage({ message: response.data.message, variant: "success" }))
    dispatch(slice.setCourseData(response.data.data))
    dispatch(slice.setLoader());
}

// update learner
export const updateLearnerAPI = (id, data) => async (dispatch) => {

    try {
        dispatch(slice.setUpdatingLoader());
        const { password, confrimpassword, ...payload } = data
        const response = await axios.patch(`${URL_BASE_LINK}/learner/update/${id}`, payload)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.updateLearnerById(response.data.data));
        dispatch(slice.setUpdatingLoader());
        return true;

    } catch (err) {

        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}


// Delete learner
export const deleteLearnerHandler = (id, meta_data, search_keyword = "", search_role = "") => async (dispatch) => {

    try {
        let { page, page_size, items } = meta_data;
        dispatch(slice.setUpdatingLoader());
        const response = await axios.delete(`${URL_BASE_LINK}/learner/delete/${id}`)
        dispatch(showMessage({ message: response.data.message, variant: "success" }))
        dispatch(slice.setUpdatingLoader());
        if (items % page_size === 1) {
            page--;
        }
        dispatch(fetchLearnerAPI({ page, page_size }, search_keyword, search_role));
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}

export default learnerManagementSlice.reducer;
