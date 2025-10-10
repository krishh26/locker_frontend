/**
 * authSlice.ts
 * 
 * Manages the AUTHENTICATED USER (currently logged-in user)
 * This replaces the old userSlice.ts
 * 
 * Usage:
 * - Import: import { selectAuth, setAuthUser, logoutUser } from 'app/store/authSlice'
 * - Selector: const auth = useSelector(selectAuth)
 * - Get user: auth.user
 */

import history from '@history';
import { createSlice } from '@reduxjs/toolkit';
import { slice as globalSlice } from './globalUser';

interface AuthState {
  user: Record<string, any>;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: {},
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser(state, action) {
      const userData = {
        id: action.payload?.learner_id,
        ...action.payload
      };
      state.user = userData;
      state.isAuthenticated = true;
    },
    clearAuthUser(state) {
      state.user = {};
      state.isAuthenticated = false;
    }
  }
});

export const { setAuthUser, clearAuthUser } = authSlice.actions;

// Thunk to set user and handle navigation
export const setUser = (user: any) => async (dispatch: any) => {
  dispatch(setAuthUser(user));

  const data = window.location.href.split("/");
  if (data[data?.length - 1] === "sign-in" || data[data?.length - 1] === "forgot" || data[data?.length - 1] === "reset") {
    history.push("/home");
  }
  history.push(window.location.href);
}

// Thunk to logout user
export const logoutUser = (redirection: boolean) => async (dispatch: any) => {
  if (redirection) {
    history.push('/');
    dispatch(globalSlice.userLoggedOut());
    dispatch(clearAuthUser());
    window.location.reload(); // Reload after redirect
  }
}

// Selectors
export const selectAuth = ({ auth }: any) => auth;
export const selectAuthUser = ({ auth }: any) => auth.user;
export const selectUserShortcuts = ({ auth }: any) => auth.user.shortcuts;

export default authSlice.reducer;

