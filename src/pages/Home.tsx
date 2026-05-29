import { useCallback, useEffect, useMemo } from 'react';
import {
  useMatch,
  useNavigate,
  useSearchParams,
  type NavigateFunction,
} from 'react-router';
import ErrorTestButton from '../components/ErrorTestButton/ErrorTestButton';
import Flyout from '../components/Flyout/Flyout';
import Layout from '../components/Layout/Layout';
import PokemonResultsLayout from '../components/PokemonResultsLayout/PokemonResultsLayout';
import ResultsSection from '../components/ResultsSection/ResultsSection';
import SearchSection from '../components/SearchSection/SearchSection';
import useLocalStorage from '../hooks/useLocalStorage';
import usePokemonSearch from '../hooks/usePokemonSearch';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  clearSelectedPokemon,
  selectPokemon,
  setPokemonSelection,
} from '../store/selectedPokemonSlice';
import type { AppDispatch } from '../store/store';
import type { Pokemon } from '../types';
import { parsePositiveInteger } from '../utils/parsePositiveInteger';
import './Home.css';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';
type SetSearchParameters = ReturnType<typeof useSearchParams>[1];
type HomeSynchronizationProperties = {
  dispatch: AppDispatch;
  loadPage: (page: number, searchTerm: string) => Promise<void>;
  searchParameters: URLSearchParams;
  selectedPokemonId: number | null;
  setSearchParameters: SetSearchParameters;
  storedSearchTerm: string;
  storedSelectedPokemonId: number | null;
};

const getFirstPageSearchParameters = (
  currentSearchParameters: URLSearchParams
): URLSearchParams => {
  const nextSearchParameters = new URLSearchParams(currentSearchParameters);
  nextSearchParameters.set('page', '1');
  return nextSearchParameters;
};

const getSearchWithCurrentPage = (
  searchParameters: URLSearchParams,
  currentPage: number
): string => {
  const nextSearchParameters = new URLSearchParams(searchParameters);
  nextSearchParameters.set('page', String(currentPage));
  return `?${nextSearchParameters.toString()}`;
};

const openPokemonDetails = (
  dispatch: AppDispatch,
  navigate: NavigateFunction,
  pokemonId: number,
  searchWithCurrentPage: string,
  storedSelectedPokemonId: number | null
): void => {
  if (storedSelectedPokemonId !== pokemonId) {
    dispatch(selectPokemon(pokemonId));
  }

  void navigate({
    pathname: `/details/${String(pokemonId)}`,
    search: searchWithCurrentPage,
  });
};

const closePokemonDetails = (
  dispatch: AppDispatch,
  navigate: NavigateFunction,
  searchWithCurrentPage: string
): void => {
  dispatch(clearSelectedPokemon());
  void navigate({ pathname: '/', search: searchWithCurrentPage });
};

const loadCurrentPokemonPage = (
  loadPage: (page: number, searchTerm: string) => Promise<void>,
  searchParameters: URLSearchParams,
  setSearchParameters: SetSearchParameters,
  storedSearchTerm: string
): void => {
  const currentPageFromUrl =
    parsePositiveInteger(searchParameters.get('page')) ?? 1;

  if (searchParameters.get('page') !== String(currentPageFromUrl)) {
    setSearchParameters(
      (currentSearchParameters) => {
        const nextSearchParameters = new URLSearchParams(
          currentSearchParameters
        );
        nextSearchParameters.set('page', String(currentPageFromUrl));
        return nextSearchParameters;
      },
      { replace: true }
    );
    return;
  }

  void loadPage(currentPageFromUrl, storedSearchTerm);
};

const synchronizeSelectedPokemon = (
  dispatch: AppDispatch,
  selectedPokemonId: number | null,
  storedSelectedPokemonId: number | null
): void => {
  if (selectedPokemonId === null) {
    if (storedSelectedPokemonId !== null) {
      dispatch(clearSelectedPokemon());
    }
    return;
  }

  if (storedSelectedPokemonId !== selectedPokemonId) {
    dispatch(selectPokemon(selectedPokemonId));
  }
};

function useHomeSynchronization({
  dispatch,
  loadPage,
  searchParameters,
  selectedPokemonId,
  setSearchParameters,
  storedSearchTerm,
  storedSelectedPokemonId,
}: HomeSynchronizationProperties) {
  useEffect(() => {
    loadCurrentPokemonPage(
      loadPage,
      searchParameters,
      setSearchParameters,
      storedSearchTerm
    );
  }, [loadPage, searchParameters, setSearchParameters, storedSearchTerm]);

  useEffect(() => {
    synchronizeSelectedPokemon(
      dispatch,
      selectedPokemonId,
      storedSelectedPokemonId
    );
  }, [dispatch, selectedPokemonId, storedSelectedPokemonId]);
}

const useSelectedPokemonState = () =>
  useAppSelector((state) => state.selectedPokemon);

function Home() {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const [storedSearchTerm, setStoredSearchTerm] = useLocalStorage(
    SEARCH_TERM_STORAGE_KEY
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedPokemonIds, selectedPokemonId: storedSelectedPokemonId } =
    useSelectedPokemonState();
  const { currentPage, error, isLoading, loadPage, pokemons, totalPages } =
    usePokemonSearch();
  const selectedPokemonId = parsePositiveInteger(
    useMatch('/details/:pokemonId')?.params.pokemonId
  );
  const searchWithCurrentPage = useMemo(
    () => getSearchWithCurrentPage(searchParameters, currentPage),
    [currentPage, searchParameters]
  );

  const handleSearch = useCallback(
    (searchTerm: string): void => {
      setStoredSearchTerm(searchTerm);
      setSearchParameters(getFirstPageSearchParameters);
    },
    [setSearchParameters, setStoredSearchTerm]
  );
  const handlePokemonSelect = useCallback(
    (pokemonId: number): void => {
      openPokemonDetails(
        dispatch,
        navigate,
        pokemonId,
        searchWithCurrentPage,
        storedSelectedPokemonId
      );
    },
    [dispatch, navigate, searchWithCurrentPage, storedSelectedPokemonId]
  );
  const handleCloseDetails = useCallback((): void => {
    closePokemonDetails(dispatch, navigate, searchWithCurrentPage);
  }, [dispatch, navigate, searchWithCurrentPage]);
  const handlePokemonSelectionChange = useCallback(
    (pokemon: Pokemon, isSelected: boolean): void => {
      dispatch(setPokemonSelection({ isSelected, pokemon }));
    },
    [dispatch]
  );

  useHomeSynchronization({
    dispatch,
    loadPage,
    searchParameters,
    selectedPokemonId,
    setSearchParameters,
    storedSearchTerm,
    storedSelectedPokemonId,
  });

  return (
    <Layout>
      <main className="application-page">
        <SearchSection
          initialSearchTerm={storedSearchTerm}
          onSearch={handleSearch}
        />
        <PokemonResultsLayout
          onCloseDetails={handleCloseDetails}
          selectedPokemonId={selectedPokemonId}
        >
          <ResultsSection
            currentPage={currentPage}
            error={error}
            isLoading={isLoading}
            onPokemonSelectionChange={handlePokemonSelectionChange}
            onPokemonSelect={handlePokemonSelect}
            pokemons={pokemons}
            selectedPokemonId={selectedPokemonId}
            selectedPokemonIds={selectedPokemonIds}
            totalPages={totalPages}
          />
        </PokemonResultsLayout>
        <ErrorTestButton />
        <Flyout />
      </main>
    </Layout>
  );
}

export default Home;
