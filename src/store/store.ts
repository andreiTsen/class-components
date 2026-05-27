import { configureStore, type EnhancedStore } from '@reduxjs/toolkit';
import { pokemonApi } from '../services/pokemonApi';
import selectedPokemonReducer from './selectedPokemonSlice';

export type RootState = {
  selectedPokemon: ReturnType<typeof selectedPokemonReducer>;
  [pokemonApi.reducerPath]: ReturnType<typeof pokemonApi.reducer>;
};

export const setupStore = (): EnhancedStore<RootState> =>
  configureStore({
    reducer: {
      selectedPokemon: selectedPokemonReducer,
      [pokemonApi.reducerPath]: pokemonApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(pokemonApi.middleware),
  });

export const store = setupStore();

export type AppDispatch = typeof store.dispatch;
