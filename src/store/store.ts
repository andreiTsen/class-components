import { configureStore } from '@reduxjs/toolkit';
import countriesReducer from './countriesSlice';
import submissionsReducer from './submissionsSlice';

export const store = configureStore({
  reducer: {
    countries: countriesReducer,
    submissions: submissionsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
