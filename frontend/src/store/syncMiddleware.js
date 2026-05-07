import { addPendingAction, removePendingAction, setOnlineStatus } from './offlineSlice';

const API_BASE = 'http://localhost:8000';

const syncMiddleware = (store) => (next) => async (action) => {
  // First, dispatch the action normally
  const result = next(action);

  // If we just added a pending action, try to sync it immediately if online
  if (action.type === 'offline/addPendingAction') {
    const { payload } = action;
    if (store.getState().offline.isOnline) {
      await syncAction(store, payload);
    }
  }

  return result;
};

// Function to sync a single pending action with the backend
export const syncAction = async (store, pendingAction) => {
  const { type, payload, timestamp } = pendingAction;
  let endpoint = '';
  let method = 'POST';
  let body = null;

  if (type === 'CREATE_LISTING') {
    endpoint = `${API_BASE}/listings/`;
    body = JSON.stringify(payload);
  } else if (type === 'PLACE_BID') {
    endpoint = `${API_BASE}/bids/`;
    body = JSON.stringify(payload);
  } else {
    return; // unknown action type
  }

  try {
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (response.ok) {
      // Success – remove from pending queue
      store.dispatch(removePendingAction({ timestamp }));
      console.log('Synced offline action:', type);
    } else {
      console.error('Sync failed (server error):', await response.text());
    }
  } catch (error) {
    console.error('Sync failed (network):', error);
  }
};

// Background sync when coming back online
export const startOnlineListener = (store) => {
  const handleOnline = () => {
    store.dispatch(setOnlineStatus(true));
    const { pendingActions } = store.getState().offline;
    for (const action of pendingActions) {
      syncAction(store, action);
    }
  };
  const handleOffline = () => {
    store.dispatch(setOnlineStatus(false));
  };
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  // Initial sync if already online
  if (navigator.onLine) {
    handleOnline();
  }
};

export default syncMiddleware;