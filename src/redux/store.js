import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore } from 'redux-persist';

import authReducer from './slices/authSlice';
import hotelReducer from './slices/hotelSlice';
import employeeReducer from './slices/employeeSlice';
import materialReducer from './slices/materialSlice';
import expenseReducer from './slices/expenseSlice';
import advanceReducer from './slices/advanceSlice';
import reportsReducer from './slices/reportsSlice';

import { getPersistedReducer } from './persistConfig';
import materialItemsReducer from './slices/materialItemsSlice';
import paymentModesReducer from './slices/paymentModesSlice'

const rootReducer = combineReducers({
  auth: getPersistedReducer('auth', authReducer),
  hotel: hotelReducer,
  employee: employeeReducer,
  material: materialReducer,
  expense: expenseReducer,
  advance: advanceReducer,
  reports: reportsReducer,
  materialItems: materialItemsReducer,
  paymentModes: paymentModesReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
