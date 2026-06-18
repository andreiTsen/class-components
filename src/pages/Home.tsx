import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import ErrorTestButton from '../components/ErrorTestButton/ErrorTestButton';
import Flyout from '../components/Flyout/Flyout';
import Layout from '../components/Layout/Layout';
import PokemonResultsLayout from '../components/PokemonResultsLayout/PokemonResultsLayout';
import ResultsSection from '../components/ResultsSection/ResultsSection';
import SearchSection from '../components/SearchSection/SearchSection';
import useLocalStorage from '../hooks/useLocalStorage';
import {
  getNormalizedSearchParameters,
  getSearchParametersWithSearchTerm,
  getSearchTermFromSearchParameters,
} from '../utils/pokemonSearchParameters';
import './Home.css';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';

function Home() {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const [storedSearchTerm, setStoredSearchTerm] = useLocalStorage(
    SEARCH_TERM_STORAGE_KEY
  );
  const currentSearchTerm = getSearchTermFromSearchParameters(
    searchParameters,
    storedSearchTerm
  );

  useEffect(() => {
    const normalizedSearchParameters =
      getNormalizedSearchParameters(searchParameters);

    if (!normalizedSearchParameters) {
      return;
    }

    setSearchParameters(normalizedSearchParameters, { replace: true });
  }, [searchParameters, setSearchParameters]);

  const handleSearch = useCallback(
    (searchTerm: string): void => {
      setSearchParameters((currentSearchParameters) => {
        return getSearchParametersWithSearchTerm(
          currentSearchParameters,
          searchTerm
        );
      });
      setStoredSearchTerm(searchTerm);
    },
    [setSearchParameters, setStoredSearchTerm]
  );

  return (
    <Layout>
      <main className="application-page">
        <SearchSection
          handleSearch={handleSearch}
          storedSearchTerm={currentSearchTerm}
        />
        <PokemonResultsLayout>
          <ResultsSection />
        </PokemonResultsLayout>
        <ErrorTestButton />
        <Flyout />
      </main>
    </Layout>
  );
}

export default Home;
