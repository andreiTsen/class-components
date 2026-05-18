import { useCallback, useRef, useState } from 'react';
import { api, type Pokemon } from '../services/api';

type RequestPokemonsParams = {
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

const requestPokemons = async ({
  activeRequestIdRef,
  lastRequestRef,
  normalizedSearchTerm,
  page,
  requestId,
  setCurrentPage,
  setError,
  setIsLoading,
  setPokemons,
  setTotalPages,
}: RequestPokemonsParams) => {
  const currentPage = Math.max(page, 1);
  const isLatestRequest = () => activeRequestIdRef.current === requestId;

  try {
    const pokemonPage = await api.getPokemons(
      normalizedSearchTerm,
      currentPage
    );

    if (!isLatestRequest()) {
      return;
    }

    lastRequestRef.current = {
      page: currentPage,
      searchTerm: normalizedSearchTerm,
    };
    setCurrentPage(currentPage);
    setPokemons(pokemonPage.pokemons);
    setTotalPages(pokemonPage.totalPages);
  } catch {
    if (isLatestRequest()) {
      lastRequestRef.current = null;
      setError('Failed to load data');
      setPokemons([]);
      setTotalPages(0);
    }
  } finally {
    if (isLatestRequest()) {
      setIsLoading(false);
    }
  }
};

type UsePokemonSearchResult = {
  currentPage: number;
  error: string;
  isLoading: boolean;
  loadPage: (page: number, searchTerm: string) => Promise<void>;
  loadPokemons: (searchTerm: string) => Promise<void>;
  pokemons: Pokemon[];
  totalPages: number;
};

function usePokemonSearch(): UsePokemonSearchResult {
  const activeRequestIdRef = useRef(0);
  const lastRequestRef = useRef<{ page: number; searchTerm: string } | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const loadPage = useCallback(async (page: number, searchTerm: string) => {
    const nextPage = Math.max(page, 1);
    const normalizedSearchTerm = searchTerm.trim();

    if (
      lastRequestRef.current?.searchTerm === normalizedSearchTerm &&
      lastRequestRef.current.page === nextPage
    ) {
      return;
    }

    setError('');
    setIsLoading(true);
    setCurrentPage(nextPage);

    const requestId = activeRequestIdRef.current + 1;
    activeRequestIdRef.current = requestId;

    await requestPokemons({
      activeRequestIdRef,
      lastRequestRef,
      normalizedSearchTerm,
      page: nextPage,
      requestId,
      setCurrentPage,
      setError,
      setIsLoading,
      setPokemons,
      setTotalPages,
    });
  }, []);

  const loadPokemons = async (searchTerm: string) => {
    await loadPage(1, searchTerm);
  };

  return {
    currentPage,
    error,
    isLoading,
    loadPage,
    loadPokemons,
    pokemons,
    totalPages,
  };
}

export default usePokemonSearch;
