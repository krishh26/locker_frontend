import { configureStore } from '@reduxjs/toolkit';
import createReducer from './rootReducer';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [
    'storeData',
    'globalUser',
    'userManagement',
    'learnerManagement',
    'courseManagement'
  ]
};

const persistedReducer = persistReducer(persistConfig, createReducer());

const middlewares = [];

if (process.env.NODE_ENV === 'development') {
  const { createLogger } = require('redux-logger');
  const logger = createLogger({ collapsed: (getState, action, logEntry) => !logEntry.error });

  middlewares.push(logger);
}

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat(middlewares),
  devTools: true,
});

store.asyncReducers = {};

export const injectReducer = (key, reducer) => {
  if (store.asyncReducers[key]) {
    return false;
  }
  store.asyncReducers[key] = reducer;
  store.replaceReducer(persistReducer(persistConfig, createReducer(store.asyncReducers)));
  return store;
};

export const persistor = persistStore(store);

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./rootReducer', () => {
    const newRootReducer = require('./rootReducer').default;
    store.replaceReducer(persistReducer(persistConfig, newRootReducer()));
  });
}

export default store;
