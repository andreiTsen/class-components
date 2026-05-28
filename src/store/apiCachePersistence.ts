import { QueryStatus } from '@reduxjs/toolkit/query';
import { apiCacheTtlSeconds } from '../config/apiConfig';
import type { pokemonApi } from '../services/pokemonApi';

type PokemonApiState = ReturnType<typeof pokemonApi.reducer>;

type PersistedApiCache = {
  expiresAt: number;
  state: PokemonApiState;
};

const API_CACHE_STORAGE_KEY = 'pokemon-api-cache';
const MILLISECONDS_PER_SECOND = Number('1000');

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isPokemonApiState = (value: unknown): value is PokemonApiState => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isRecord(value.queries) &&
    isRecord(value.mutations) &&
    isRecord(value.provided) &&
    isRecord(value.subscriptions) &&
    isRecord(value.config)
  );
};

const isPersistedApiCache = (value: unknown): value is PersistedApiCache => {
  return (
    isRecord(value) &&
    typeof value.expiresAt === 'number' &&
    isPokemonApiState(value.state)
  );
};

const removePersistedApiCache = (): void => {
  try {
    globalThis.localStorage.removeItem(API_CACHE_STORAGE_KEY);
  } catch {
    return;
  }
};

export const loadPersistedApiCache = (): PokemonApiState | undefined => {
  try {
    const rawCache = globalThis.localStorage.getItem(API_CACHE_STORAGE_KEY);

    if (rawCache === null) {
      return undefined;
    }

    const cache: unknown = JSON.parse(rawCache);

    if (!isPersistedApiCache(cache) || cache.expiresAt <= Date.now()) {
      removePersistedApiCache();
      return undefined;
    }

    return {
      ...cache.state,
      subscriptions: {},
    };
  } catch {
    removePersistedApiCache();
    return undefined;
  }
};

export const savePersistedApiCache = (state: PokemonApiState): void => {
  const queryStates = Object.values(state.queries);

  if (queryStates.length === 0) {
    removePersistedApiCache();
    return;
  }

  if (
    queryStates.some(
      (queryState) => queryState?.status !== QueryStatus.fulfilled
    )
  ) {
    return;
  }

  const cache: PersistedApiCache = {
    expiresAt: Date.now() + apiCacheTtlSeconds * MILLISECONDS_PER_SECOND,
    state,
  };

  try {
    globalThis.localStorage.setItem(
      API_CACHE_STORAGE_KEY,
      JSON.stringify(cache)
    );
  } catch {
    return;
  }
};
