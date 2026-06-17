import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import ErrorTestButton from '../components/ErrorTestButton/ErrorTestButton';
import Flyout from '../components/Flyout/Flyout';
import Layout from '../components/Layout/Layout';
import PokemonResultsLayout from '../components/PokemonResultsLayout/PokemonResultsLayout';
import ResultsSection from '../components/ResultsSection/ResultsSection';
import SearchSection from '../components/SearchSection/SearchSection';
import useLocalStorage from '../hooks/useLocalStorage';
import { parsePositiveInteger } from '../utils/parsePositiveInteger';
import './Home.css';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';

const getPageFromSearchParameters = (
  searchParameters: URLSearchParams
): number => {
  return parsePositiveInteger(searchParameters.get('page')) ?? 1;
};

const getSearchParametersWithPage = (
  currentSearchParameters: URLSearchParams,
  page: number
): URLSearchParams => {
  const nextSearchParameters = new URLSearchParams(currentSearchParameters);
  nextSearchParameters.set('page', String(page));
  return nextSearchParameters;
};

const getFirstPageSearchParameters = (
  currentSearchParameters: URLSearchParams
): URLSearchParams => {
  return getSearchParametersWithPage(currentSearchParameters, 1);
};

function Home() {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const [storedSearchTerm, setStoredSearchTerm] = useLocalStorage(
    SEARCH_TERM_STORAGE_KEY
  );
  const currentPage = getPageFromSearchParameters(searchParameters);

  useEffect(() => {
    if (searchParameters.get('page') === String(currentPage)) {
      return;
    }

    setSearchParameters(
      (currentSearchParameters) => {
        return getSearchParametersWithPage(
          currentSearchParameters,
          currentPage
        );
      },
      { replace: true }
    );
  }, [currentPage, searchParameters, setSearchParameters]);

  const handleSearch = useCallback(
    (searchTerm: string): void => {
      setStoredSearchTerm(searchTerm);
      setSearchParameters(getFirstPageSearchParameters);
    },
    [setSearchParameters, setStoredSearchTerm]
  );

  return (
    <Layout>
      <main className="application-page">
        <SearchSection
          handleSearch={handleSearch}
          storedSearchTerm={storedSearchTerm}
        />
        <PokemonResultsLayout>
          <ResultsSection
            currentPage={currentPage}
            searchTerm={storedSearchTerm}
          />
        </PokemonResultsLayout>
        <ErrorTestButton />
        <Flyout />
      </main>
    </Layout>
  );
}

export default Home;
