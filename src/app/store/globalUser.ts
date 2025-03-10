import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentUser: {},
    selectedUser: {},
    selected: false,
    dataFetchLoading: false,
    dataUpdatingLoadding: false
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
    },
});

export const slice = globalUserSlice.actions;
export const selectGlobalUser = ({ globalUser }) => globalUser;

export default globalUserSlice.reducer;
