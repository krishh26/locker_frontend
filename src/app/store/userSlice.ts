import history from '@history';
import { createSlice } from '@reduxjs/toolkit';
import { authRoles } from '../auth';
import { slice } from './globalUser';
import { setAuthUser, clearAuthUser } from './authSlice';

const initialState = {
  data: {

  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    userLoggedOut(state) {
      state.data = {};
    },
    setUserDetails(state, action) {
      state.data = action.payload;
    }
  }
});

export const { userLoggedOut } = userSlice.actions;

export const setUser = (user) => async (dispatch) => {

  const userData = {
    id: user?.learner_id,
    ...user
  }

  // Update BOTH old and new slices for backwards compatibility
  dispatch(userSlice.actions.setUserDetails(userData)) // Old slice
  dispatch(setAuthUser(userData)) // New slice ✅

  const data = window.location.href.split("/");
  if (data[data?.length - 1] === "sign-in" || data[data?.length - 1] === "forgot" || data[data?.length - 1] === "reset") {
    history.push("/home")
  }
  history.push(window.location.href)
}


export const logoutUser = (redirection) => async (dispatch) => {
  if (redirection) {
    history.push('/')
    dispatch(slice.userLoggedOut()) // Clear globalUser
    dispatch(userSlice.actions.userLoggedOut()) // Clear old userSlice
    dispatch(clearAuthUser()) // Clear new authSlice ✅
    window.location.reload() // Reload after redirect
  }
}

export const selectUser = ({ user }) => user;

export const selectUserShortcuts = ({ user }) => user.data.shortcuts;

export default userSlice.reducer;

