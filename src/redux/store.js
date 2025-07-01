import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore } from 'redux-persist';

import authReducer from './slices/authSlice';
import hotelReducer from './slices/hotelSlice';
import employeeReducer from './slices/employeeSlice';
import { getPersistedReducer } from './persistConfig';

const rootReducer = combineReducers({
  auth: getPersistedReducer('auth', authReducer),
  hotel: hotelReducer,
  employee: employeeReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
