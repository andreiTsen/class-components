import { useCallback, useReducer, useRef } from 'react';
import { getPokemons } from '../services/pokemonService';
import type { UsePokemonSearchResult } from '../types';
import {
  initialPokemonSearchState as initialSearchState,
  pokemonSearchReducer as searchReducer,
} from '../reducers/pokemonSearchReducer';

const usePokemonSearch = (): UsePokemonSearchResult => {
  const [state, dispatch] = useReducer(searchReducer, initialSearchState);
  const activeRequestId = useRef(0);
  const lastRequest = useRef<{ page: number; searchTerm: string } | null>(null);
  const loadPage = useCallback(
    async (page: number, searchTerm: string): Promise<void> => {
      const nextPage: number = Math.max(page, 1);
      const normalizedSearchTerm: string = searchTerm.trim();
      if (
        lastRequest.current?.page === nextPage &&
        lastRequest.current.searchTerm === normalizedSearchTerm
      ) {
        return;
      }
      activeRequestId.current += 1;
      const requestId: number = activeRequestId.current;
      dispatch({ page: nextPage, type: 'loading' });
      try {
        const pokemonPage = await getPokemons(normalizedSearchTerm, nextPage);
        if (activeRequestId.current !== requestId) {
          return;
        }
        lastRequest.current = {
          page: nextPage,
          searchTerm: normalizedSearchTerm,
        };
        dispatch({ page: nextPage, pokemonPage, type: 'success' });
      } catch {
        if (activeRequestId.current !== requestId) {
          return;
        }

        lastRequest.current = null;
        dispatch({ type: 'error' });
      }
    },
    []
  );
  return { ...state, loadPage };
};

export default usePokemonSearch;
