import { createSlice } from '@reduxjs/toolkit';

const offlineSlice = createSlice({
  name: 'offline',
  initialState: {
    pendingActions: [], // { type, payload, timestamp }
    isOnline: navigator.onLine,
  },
  reducers: {
    addPendingAction: (state, action) => {
      state.pendingActions.push(action.payload);
    },
    removePendingAction: (state, action) => {
      state.pendingActions = state.pendingActions.filter(
        (item) => item.timestamp !== action.payload.timestamp
      );
    },
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    clearAllPending: (state) => {
      state.pendingActions = [];
    },
  },
});

export const {
  addPendingAction,
  removePendingAction,
  setOnlineStatus,
  clearAllPending,
} = offlineSlice.actions;

export default offlineSlice.reducer;