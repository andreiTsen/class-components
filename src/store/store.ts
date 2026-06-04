import { configureStore } from '@reduxjs/toolkit';
import submissionsReducer from './submissionsSlice';

export const store = configureStore({
  reducer: {
    submissions: submissionsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
