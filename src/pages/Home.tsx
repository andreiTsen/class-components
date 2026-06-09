import { useCallback, useEffect } from 'react';
import { useMatch, useSearchParams } from 'react-router';
import ErrorTestButton from '../components/ErrorTestButton/ErrorTestButton';
import Flyout from '../components/Flyout/Flyout';
import Layout from '../components/Layout/Layout';
import PokemonResultsLayout from '../components/PokemonResultsLayout/PokemonResultsLayout';
import ResultsSection from '../components/ResultsSection/ResultsSection';
import SearchSection from '../components/SearchSection/SearchSection';
import useLocalStorage from '../hooks/useLocalStorage';
import usePokemonSearch from '../hooks/usePokemonSearch';
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

const getSelectedPokemonId = (pokemonId?: string): number | null => {
  return parsePositiveInteger(pokemonId);
};

type RenderResultsProperties = {
  currentPage: number;
  error: string;
  isLoading: boolean;
  pokemons: Pokemon[];
  totalPages: number;
};

const renderResults = ({
  currentPage,
  error,
  isLoading,
  pokemons,
  totalPages,
}: RenderResultsProperties) => (
  <ResultsSection
    currentPage={currentPage}
    error={error}
    isLoading={isLoading}
    pokemons={pokemons}
    totalPages={totalPages}
  />
);

function Home() {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const [storedSearchTerm, setStoredSearchTerm] = useLocalStorage(
    SEARCH_TERM_STORAGE_KEY
  );
  const { currentPage, error, isLoading, loadPage, pokemons, totalPages } =
    usePokemonSearch();
  const selectedPokemonId = getSelectedPokemonId(
    useMatch('/details/:pokemonId')?.params.pokemonId
  );

  const handleSearch = useCallback(
    (searchTerm: string): void => {
      setStoredSearchTerm(searchTerm);
      setSearchParameters(getFirstPageSearchParameters);
    },
    [setSearchParameters, setStoredSearchTerm]
  );

  useEffect(() => {
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
  }, [loadPage, searchParameters, setSearchParameters, storedSearchTerm]);

  return (
    <Layout>
      <main className="application-page">
        <SearchSection
          handleSearch={handleSearch}
          storedSearchTerm={storedSearchTerm}
        />
        <PokemonResultsLayout selectedPokemonId={selectedPokemonId}>
          {renderResults({
            currentPage,
            error,
            isLoading,
            pokemons,
            totalPages,
          })}
        </PokemonResultsLayout>
        <ErrorTestButton />
        <Flyout />
      </main>
    </Layout>
  );
}

export default Home;
