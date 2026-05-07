import { configureStore } from '@reduxjs/toolkit';
import offlineReducer from './offlineSlice';
import syncMiddleware from './syncMiddleware';

export const store = configureStore({
  reducer: {
    offline: offlineReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(syncMiddleware),
});