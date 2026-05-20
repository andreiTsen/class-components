import { configureStore } from '@reduxjs/toolkit';
import selectedPokemonReducer from './selectedPokemonSlice';

export const setupStore = () =>
  configureStore({
    reducer: {
      selectedPokemon: selectedPokemonReducer,
    },
  });

export const store = setupStore();

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
