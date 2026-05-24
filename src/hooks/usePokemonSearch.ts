import { useCallback, useReducer, useRef } from 'react';
import { getPokemons } from '../services/pokemonService';
import type { Pokemon, PokemonPage } from '../types';
import {
  initialPokemonSearchState,
  pokemonSearchReducer,
} from './pokemonSearchReducer';
import type { PokemonSearchAction } from './pokemonSearchReducer';

type UsePokemonSearchResult = {
  currentPage: number;
  error: string;
  isLoading: boolean;
  loadPage: (page: number, searchTerm: string) => Promise<void>;
  pokemons: Pokemon[];
  totalPages: number;
};

type PokemonSearchRequest = {
  page: number;
  searchTerm: string;
};

type LoadPokemonPageParameters = {
  activeRequestIdReference: { current: number };
  dispatch: (action: PokemonSearchAction) => void;
  lastRequestReference: { current: PokemonSearchRequest | null };
  page: number;
  searchTerm: string;
};

const loadPokemonPage = async (
  parameters: LoadPokemonPageParameters
): Promise<void> => {
  const nextPage: number = Math.max(parameters.page, 1);
  const normalizedSearchTerm: string = parameters.searchTerm.trim();

  if (
    parameters.lastRequestReference.current?.page === nextPage &&
    parameters.lastRequestReference.current.searchTerm === normalizedSearchTerm
  ) {
    return;
  }

  parameters.activeRequestIdReference.current += 1;
  const requestId: number = parameters.activeRequestIdReference.current;
  parameters.dispatch({ page: nextPage, type: 'loading' });

  try {
    const pokemonPage: PokemonPage = await getPokemons(
      normalizedSearchTerm,
      nextPage
    );

    if (parameters.activeRequestIdReference.current !== requestId) {
      return;
    }

    parameters.lastRequestReference.current = {
      page: nextPage,
      searchTerm: normalizedSearchTerm,
    };
    parameters.dispatch({ page: nextPage, pokemonPage, type: 'success' });
  } catch {
    if (parameters.activeRequestIdReference.current !== requestId) {
      return;
    }

    parameters.lastRequestReference.current = null;
    parameters.dispatch({ type: 'error' });
  }
};

function usePokemonSearch(): UsePokemonSearchResult {
  const [state, dispatch] = useReducer(
    pokemonSearchReducer,
    initialPokemonSearchState
  );
  const activeRequestIdReference = useRef(0);
  const lastRequestReference = useRef<PokemonSearchRequest | null>(null);
  const loadPage: UsePokemonSearchResult['loadPage'] = useCallback(
    async (page: number, searchTerm: string): Promise<void> => {
      await loadPokemonPage({
        activeRequestIdReference,
        dispatch,
        lastRequestReference,
        page,
        searchTerm,
      });
    },
    []
  );

  return { ...state, loadPage };
}

export default usePokemonSearch;
