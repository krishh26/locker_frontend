import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import jsonData from 'src/url.json';
import { showMessage } from './fuse/messageSlice';

const initialState = {
    data: [],
    dataFetchLoading: false,
    meta_data: {
        page: 1,
        items: 0,
        page_size: 10,
        pages: 1
    }
};

const learnersWaitingToBeSampledSlice = createSlice({
    name: 'learnersWaitingToBeSampled',
    initialState,
    reducers: {
        updateLearnersWaitingToBeSampled(state, action) {
            if (Array.isArray(action.payload.data)) {
                state.data = action.payload.data;
                state.meta_data = action.payload.meta_data;
            } else {
                const items = state.meta_data.items + 1;
                state.meta_data.items = items;
                if (state.meta_data.page * state.meta_data.page_size >= items) {
                    state.data = [...state.data, action.payload];
                }
                state.meta_data.pages = Math.ceil(items / 10);
            }
        },
        setLoader(state, action) {
            state.dataFetchLoading = action.payload;
        },
    }
});

export const slice = learnersWaitingToBeSampledSlice.actions;
export const selectLearnersWaitingToBeSampled = ({ learnersWaitingToBeSampled }) => learnersWaitingToBeSampled;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

// Get learners waiting to be sampled
export const fetchLearnersWaitingToBeSampledAPI = (data = { page: 1, page_size: 10 }, search_keyword = "") => async (dispatch) => {
    try {
        dispatch(slice.setLoader(true));
        const { page = 1, page_size = 10 } = data;

        let url = `${URL_BASE_LINK}/learner/waiting-to-be-sampled?page=${page}&limit=${page_size}&meta=true`;

        if (search_keyword) {
            url = `${url}&keyword=${search_keyword}`;
        }

        const response = await axios.get(url);
        dispatch(slice.updateLearnersWaitingToBeSampled(response.data));
        return true;

    } catch (err) {
        dispatch(showMessage({ message: err.response?.data?.message || 'Failed to fetch learners waiting to be sampled', variant: "error" }));
        return false;
    } finally {
        dispatch(slice.setLoader(false));
    }
};

export default learnersWaitingToBeSampledSlice.reducer;
