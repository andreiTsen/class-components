import { useCallback, useMemo } from 'react';
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
import useHomeSynchronization from '../hooks/useHomeSynchronization';
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

const getSelectedPokemonId = (pokemonId?: string): number | null => {
  return parsePositiveInteger(pokemonId);
};

function Home() {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const [storedSearchTerm, setStoredSearchTerm] = useLocalStorage(
    SEARCH_TERM_STORAGE_KEY
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedPokemonIds, selectedPokemonId: storedSelectedPokemonId } =
    useAppSelector((state) => state.selectedPokemon);
  const { currentPage, error, isLoading, loadPage, pokemons, totalPages } =
    usePokemonSearch();
  const selectedPokemonId = getSelectedPokemonId(
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
    loadPage,
    selectedPokemonId,
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
