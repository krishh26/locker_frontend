import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import jsonData from 'src/url.json';
import { showMessage } from './fuse/messageSlice';
import { userTableMetaData } from '../contanst/metaData';

const initialState = {
    data: [], //[]
    dataFetchLoading: false,
    dataUpdatingLoadding: false,
    meta_data: {
        page: 1,
        items: 0,
        page_size: userTableMetaData.page_size,
        pages: 1
    },
    singleData: {}
};

const skillsScanSlice = createSlice({
    name: 'skillsScan',
    initialState,
    reducers: {
        setLoader(state) {
            state.dataFetchLoading = !state.dataFetchLoading;
        },
        setUpdatingLoader(state) {
            state.dataUpdatingLoadding = !state.dataUpdatingLoadding
        },
        setSkillsScan(state, action) {
            state.data = action.payload
        },
        setSupportMetadata(state, action) {
            state.meta_data = action.payload
        },
        setSingleData(state, action) {
            state.singleData = action.payload
        }
    }
});

export const slice = skillsScanSlice.actions;
export const selectSkillsScan = ({ skillsScan }) => skillsScan;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

export const updateCourseUnitSkillAPI = (data) => async (dispatch, getStore) => {

    try {
        const id = getStore()?.learnerManagement?.user_course_id || "";
        dispatch(slice.setUpdatingLoader());
        const response = await axios.patch(`${URL_BASE_LINK}/course/user/update/${id}`, { course: data })
        dispatch(showMessage({ message: "Skill scan updated", variant: "success" }))
        return true;

    } catch (err) {

        dispatch(showMessage({ message: err.response.data.message, variant: "error" }))
        dispatch(slice.setUpdatingLoader());
        return false;
    };
}


export default skillsScanSlice.reducer;
