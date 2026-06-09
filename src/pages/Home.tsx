import { useCallback } from 'react';
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

const closePokemonDetails = (
  navigate: NavigateFunction,
  searchWithCurrentPage: string
): void => {
  void navigate({ pathname: '/', search: searchWithCurrentPage });
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

const renderSearchSection = (
  storedSearchTerm: string,
  handleSearch: (searchTerm: string) => void
) => (
  <SearchSection initialSearchTerm={storedSearchTerm} onSearch={handleSearch} />
);

function Home() {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const [storedSearchTerm, setStoredSearchTerm] = useLocalStorage(
    SEARCH_TERM_STORAGE_KEY
  );
  const navigate = useNavigate();
  const { currentPage, error, isLoading, loadPage, pokemons, totalPages } =
    usePokemonSearch();
  const selectedPokemonId = getSelectedPokemonId(
    useMatch('/details/:pokemonId')?.params.pokemonId
  );
  const searchWithCurrentPage = getSearchWithCurrentPage(
    searchParameters,
    currentPage
  );

  const handleSearch = useCallback(
    (searchTerm: string): void => {
      setStoredSearchTerm(searchTerm);
      setSearchParameters(getFirstPageSearchParameters);
    },
    [setSearchParameters, setStoredSearchTerm]
  );
  const handleCloseDetails = useCallback((): void => {
    closePokemonDetails(navigate, searchWithCurrentPage);
  }, [navigate, searchWithCurrentPage]);

  useHomeSynchronization({
    loadPage,
    storedSearchTerm,
  });

  return (
    <Layout>
      <main className="application-page">
        {renderSearchSection(storedSearchTerm, handleSearch)}
        <PokemonResultsLayout
          onCloseDetails={handleCloseDetails}
          selectedPokemonId={selectedPokemonId}
        >
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
