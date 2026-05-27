import { configureStore, type EnhancedStore } from '@reduxjs/toolkit';
import { pokemonApi } from '../services/pokemonApi';
import {
  loadPersistedApiCache,
  savePersistedApiCache,
} from './apiCachePersistence';
import selectedPokemonReducer from './selectedPokemonSlice';

export type RootState = {
  selectedPokemon: ReturnType<typeof selectedPokemonReducer>;
  [pokemonApi.reducerPath]: ReturnType<typeof pokemonApi.reducer>;
};

const subscribeToApiCachePersistence = (
  appStore: EnhancedStore<RootState>
): void => {
  let previousApiState = appStore.getState()[pokemonApi.reducerPath];

  appStore.subscribe(() => {
    const apiState = appStore.getState()[pokemonApi.reducerPath];

    if (apiState === previousApiState) {
      return;
    }

    previousApiState = apiState;
    savePersistedApiCache(apiState);
  });
};

export const setupStore = (): EnhancedStore<RootState> => {
  const persistedApiState = loadPersistedApiCache();
  const appStore: EnhancedStore<RootState> = configureStore({
    reducer: {
      selectedPokemon: selectedPokemonReducer,
      [pokemonApi.reducerPath]: pokemonApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(pokemonApi.middleware),
    preloadedState: persistedApiState
      ? { [pokemonApi.reducerPath]: persistedApiState }
      : undefined,
  });

  subscribeToApiCachePersistence(appStore);

  return appStore;
};

export const store = setupStore();

export type AppDispatch = typeof store.dispatch;
