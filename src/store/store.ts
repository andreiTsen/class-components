import {
  configureStore,
  type Tuple,
  type UnknownAction,
} from '@reduxjs/toolkit';
import type { ThunkMiddleware } from 'redux-thunk';
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

type PokemonApiState = ReturnType<typeof pokemonApi.reducer>;
type AppMiddleware = Tuple<
  [typeof pokemonApi.middleware, ThunkMiddleware<RootState, UnknownAction>]
>;
type AppStore = ReturnType<
  typeof configureStore<RootState, UnknownAction, AppMiddleware>
>;

type StoreWithApiCache = {
  getState: () => RootState;
  subscribe: (listener: () => void) => () => void;
};

const subscribeToApiCachePersistence = (appStore: StoreWithApiCache): void => {
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

const createConfiguredStore = (persistedApiState?: PokemonApiState): AppStore =>
  configureStore({
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

export const setupStore = (): AppStore => {
  const persistedApiState = loadPersistedApiCache();
  const appStore = createConfiguredStore(persistedApiState);

  subscribeToApiCachePersistence(appStore);

  return appStore;
};

export const store = setupStore();

export type AppDispatch = typeof store.dispatch;
