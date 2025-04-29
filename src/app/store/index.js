import { configureStore } from '@reduxjs/toolkit';
import createReducer from './rootReducer';

// Load state from sessionStorage
const loadState = () => {
  try {
    const serializedState = sessionStorage.getItem('reduxState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

// Throttle function to limit how often we save to sessionStorage
const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return (...args) => {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

// Save state to sessionStorage
const saveState = (state) => {
  try {
    // Only save the slices we want to persist
    const persistedState = {
      storeData: state.storeData,
      globalUser: state.globalUser,
      userManagement: state.userManagement,
      learnerManagement: state.learnerManagement,
      courseManagement: state.courseManagement,
      cpdLearner: state.cpdLearner,
      fuse: state.fuse,
    };

    const serializedState = JSON.stringify(persistedState);
    sessionStorage.setItem('reduxState', serializedState);
  } catch (err) {
    // Silent error handling
  }
};

// Throttled version of saveState that only runs at most once per 500ms
const throttledSaveState = throttle(saveState, 500);

const preloadedState = loadState();

const middlewares = [];

if (process.env.NODE_ENV === 'development') {
  const { createLogger } = require('redux-logger');
  const logger = createLogger({
    collapsed: (_getState, _action, logEntry) => !logEntry.error,
  });

  middlewares.push(logger);
}

const store = configureStore({
  reducer: createReducer(),
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat(middlewares),
  devTools: true,
});

// Subscribe to store changes to save state
store.subscribe(() => {
  throttledSaveState(store.getState());
});

store.asyncReducers = {};

export const injectReducer = (key, reducer) => {
  if (store.asyncReducers[key]) {
    return false;
  }
  store.asyncReducers[key] = reducer;
  store.replaceReducer(createReducer(store.asyncReducers));
  return store;
};

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./rootReducer', () => {
    const newRootReducer = require('./rootReducer').default;
    store.replaceReducer(newRootReducer());
  });
}

export default store;
