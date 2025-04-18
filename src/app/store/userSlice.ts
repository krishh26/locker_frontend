import history from '@history';
import { createSlice } from '@reduxjs/toolkit';
import { authRoles } from '../auth';
import { slice } from './globalUser';

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

  dispatch(userSlice.actions.setUserDetails(userData))

  const data = window.location.href.split("/");
  if (data[data?.length - 1] === "sign-in" || data[data?.length - 1] === "forgot" || data[data?.length - 1] === "reset") {
    if (user?.role === "Learner") {
      history.push("/portfolio");
    } else {
      history.push("/home")
    }
  }
  history.push(window.location.href)
}


export const logoutUser = (redirection) => async (dispatch) => {
  if (redirection) {
    history.push('/')
    dispatch(slice.userLoggedOut())
    dispatch(userSlice.actions.userLoggedOut())

  }
}

export const selectUser = ({ user }) => user;

export const selectUserShortcuts = ({ user }) => user.data.shortcuts;

export default userSlice.reducer;
