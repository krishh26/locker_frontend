import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   learner_id: null,
   user_id: null
};

const storeDataSlice = createSlice({
    name: 'storeData',
    initialState,
    reducers: {
        setLeanerId(state, action) {
            state.learner_id = action.payload.id;
            state.user_id = action.payload.user_id;
        }
    }
});

export const slice = storeDataSlice.actions;
export const selectstoreDataSlice = ({ storeData }) => storeData;

export default storeDataSlice.reducer;
