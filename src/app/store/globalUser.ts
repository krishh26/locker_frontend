import { createSlice } from '@reduxjs/toolkit';
import jsonData from 'src/url.json';
import axios from 'axios';

const initialState = {
    currentUser: {},
    selectedUser: {},
    selected: false,
    dataFetchLoading: false,
    dataUpdatingLoadding: false,
    pagination: {
        page_size: 10
    },
    learnerTab: {
        learner_token: "",
        tab: ""
    }
};

const globalUserSlice = createSlice({
    name: 'globalUser',
    initialState,
    reducers: {
        setLoader(state) {
            state.dataFetchLoading = !state.dataFetchLoading;
        },
        setUpdatingLoader(state) {
            state.dataUpdatingLoadding = !state.dataUpdatingLoadding
        },
        setCurrentUser(state, action) {
            state.currentUser = action.payload
        },
        setSelectedUser(state, action) {
            state.selectedUser = action.payload
            state.selected = true
        },
        userLoggedOut(state) {
            state.currentUser = {}
            state.selectedUser = {}
            state.selected = false
        },
        setPagination(state, action) {
            state.pagination = action.payload
        },
        setLearnerTab(state, action) {
            state.learnerTab = action.payload
        }
    },
});

export const slice = globalUserSlice.actions;
export const selectGlobalUser = ({ globalUser }) => globalUser;

export default globalUserSlice.reducer;

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

export const DownloadFile = (fileUrl, fileName = 'fileName') => async (dispatch) => {
    try {
        const response: any = await axios.get(`${URL_BASE_LINK}/file?file=${encodeURIComponent(fileUrl)}`, {
            responseType: 'blob',
        });

        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
        console.log("Error in Download file:", err)
    }
}

export const DownloadLearnerExcel = () => async (dispatch) => {
    try {
        const response: any = await axios.get(`${URL_BASE_LINK}/learner/excel`, {
            responseType: 'blob',
        });

        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = "learner_export.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
        console.log("Error in Download file:", err)
    }
}

export const tokenGetFetch = (email) => async (dispatch) => {
    try {
        const response: any = await axios.post(`${URL_BASE_LINK}/user/token`, { email });
        if (response.data.status) {
            const { accessToken, user } = response.data.data;
            return { accessToken, user }
        } else {
            return null;
        }
    } catch (err) {
        console.log(err)
        return null;;
    }
}