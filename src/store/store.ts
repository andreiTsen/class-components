import { configureStore } from '@reduxjs/toolkit';
import selectedPokemonReducer from './selectedPokemonSlice';

export type RootState = {
  selectedPokemon: ReturnType<typeof selectedPokemonReducer>;
};

export const setupStore = (): ReturnType<typeof configureStore<RootState>> =>
  configureStore({
    reducer: {
      selectedPokemon: selectedPokemonReducer,
    },
  });

export const store = setupStore();

export type AppDispatch = typeof store.dispatch;
