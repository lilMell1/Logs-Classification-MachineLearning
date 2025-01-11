import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice';
import storage from 'redux-persist/lib/storage/session'; 
import { persistReducer, persistStore } from 'redux-persist';

// Persist Configuration
const persistConfig = {
  key: 'auth',
  storage, // Saves data to sessionStorage
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

// Configure Store
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer, // Use persisted reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }),
});

// Export RootState and Dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Persistor
export const persistor = persistStore(store);
