import { useCallback, useMemo, useRef, useState } from 'react';
import { api, type Pokemon } from '../services/api';

type RequestPokemonsParameters = {
  activeRequestIdRef: { current: number };
  lastRequestRef: { current: { page: number; searchTerm: string } | null };
  normalizedSearchTerm: string;
  page: number;
  requestId: number;
  setCurrentPage: (page: number) => void;
  setError: (error: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setPokemons: (pokemons: Pokemon[]) => void;
  setTotalPages: (totalPages: number) => void;
};

type ApplyPokemonsParameters = Pick<
  RequestPokemonsParameters,
  | 'lastRequestRef'
  | 'normalizedSearchTerm'
  | 'setCurrentPage'
  | 'setPokemons'
  | 'setTotalPages'
> & {
  currentPage: number;
  pokemonPage: Awaited<ReturnType<typeof api.getPokemons>>;
};

const applyPokemonPage = ({
  currentPage,
  lastRequestRef,
  normalizedSearchTerm,
  pokemonPage,
  setCurrentPage,
  setPokemons,
  setTotalPages,
}: ApplyPokemonsParameters): void => {
  lastRequestRef.current = {
    page: currentPage,
    searchTerm: normalizedSearchTerm,
  };
  setCurrentPage(currentPage);
  setPokemons(pokemonPage.pokemons);
  setTotalPages(pokemonPage.totalPages);
};

const applyPokemonError = ({
  lastRequestRef,
  setError,
  setPokemons,
  setTotalPages,
}: Pick<
  RequestPokemonsParameters,
  'lastRequestRef' | 'setError' | 'setPokemons' | 'setTotalPages'
>): void => {
  lastRequestRef.current = null;
  setError('Failed to load data');
  setPokemons([]);
  setTotalPages(0);
};

const requestPokemons = async (
  parameters: RequestPokemonsParameters
): Promise<void> => {
  const currentPage: number = Math.max(parameters.page, 1);
  const isLatestRequest = (): boolean =>
    parameters.activeRequestIdRef.current === parameters.requestId;

  try {
    const pokemonPage: Awaited<ReturnType<typeof api.getPokemons>> =
      await api.getPokemons(parameters.normalizedSearchTerm, currentPage);

    if (!isLatestRequest()) {
      return;
    }

    applyPokemonPage({
      currentPage,
      lastRequestRef: parameters.lastRequestRef,
      normalizedSearchTerm: parameters.normalizedSearchTerm,
      pokemonPage,
      setCurrentPage: parameters.setCurrentPage,
      setPokemons: parameters.setPokemons,
      setTotalPages: parameters.setTotalPages,
    });
  } catch {
    if (isLatestRequest()) {
      applyPokemonError({
        lastRequestRef: parameters.lastRequestRef,
        setError: parameters.setError,
        setPokemons: parameters.setPokemons,
        setTotalPages: parameters.setTotalPages,
      });
    }
  } finally {
    if (isLatestRequest()) {
      parameters.setIsLoading(false);
    }
  }
};

type UsePokemonSearchResult = {
  currentPage: number;
  error: string;
  isLoading: boolean;
  loadPage: (page: number, searchTerm: string) => Promise<void>;
  pokemons: Pokemon[];
  totalPages: number;
};

type PokemonSearchState = Omit<UsePokemonSearchResult, 'loadPage'> & {
  setCurrentPage: (page: number) => void;
  setError: (error: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setPokemons: (pokemons: Pokemon[]) => void;
  setTotalPages: (totalPages: number) => void;
};

type PokemonSearchActions = Pick<
  PokemonSearchState,
  | 'setCurrentPage'
  | 'setError'
  | 'setIsLoading'
  | 'setPokemons'
  | 'setTotalPages'
>;

type LoadPokemonPageParameters = {
  activeRequestIdReference: { current: number };
  lastRequestReference: {
    current: { page: number; searchTerm: string } | null;
  };
  actions: PokemonSearchActions;
  page: number;
  searchTerm: string;
};

const loadPokemonPage = async ({
  activeRequestIdReference,
  actions,
  lastRequestReference,
  page,
  searchTerm,
}: LoadPokemonPageParameters): Promise<void> => {
  const nextPage: number = Math.max(page, 1);
  const normalizedSearchTerm: string = searchTerm.trim();

  if (
    lastRequestReference.current?.searchTerm === normalizedSearchTerm &&
    lastRequestReference.current.page === nextPage
  ) {
    return;
  }

  actions.setError('');
  actions.setIsLoading(true);
  actions.setCurrentPage(nextPage);
  activeRequestIdReference.current += 1;

  await requestPokemons({
    activeRequestIdRef: activeRequestIdReference,
    lastRequestRef: lastRequestReference,
    normalizedSearchTerm,
    page: nextPage,
    requestId: activeRequestIdReference.current,
    setCurrentPage: actions.setCurrentPage,
    setError: actions.setError,
    setIsLoading: actions.setIsLoading,
    setPokemons: actions.setPokemons,
    setTotalPages: actions.setTotalPages,
  });
};

const usePokemonSearchState = (): PokemonSearchState => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);

  return {
    currentPage,
    error,
    isLoading,
    pokemons,
    setCurrentPage,
    setError,
    setIsLoading,
    setPokemons,
    setTotalPages,
    totalPages,
  };
};

const useLoadPage = (
  actions: PokemonSearchActions
): UsePokemonSearchResult['loadPage'] => {
  const activeRequestIdReference = useRef(0);
  const lastRequestReference = useRef<{
    page: number;
    searchTerm: string;
  } | null>(null);

  return useCallback(
    async (page: number, searchTerm: string) => {
      await loadPokemonPage({
        activeRequestIdReference,
        actions,
        lastRequestReference,
        page,
        searchTerm,
      });
    },
    [actions]
  );
};

function usePokemonSearch(): UsePokemonSearchResult {
  const state: PokemonSearchState = usePokemonSearchState();
  const actions: PokemonSearchActions = useMemo(
    () => ({
      setCurrentPage: state.setCurrentPage,
      setError: state.setError,
      setIsLoading: state.setIsLoading,
      setPokemons: state.setPokemons,
      setTotalPages: state.setTotalPages,
    }),
    [
      state.setCurrentPage,
      state.setError,
      state.setIsLoading,
      state.setPokemons,
      state.setTotalPages,
    ]
  );
  const loadPage: UsePokemonSearchResult['loadPage'] = useLoadPage(actions);

  return {
    currentPage: state.currentPage,
    error: state.error,
    isLoading: state.isLoading,
    loadPage,
    pokemons: state.pokemons,
    totalPages: state.totalPages,
  };
}

export default usePokemonSearch;
