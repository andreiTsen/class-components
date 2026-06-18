'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ErrorTestButton from '../components/ErrorTestButton/ErrorTestButton';
import Flyout from '../components/Flyout/Flyout';
import Layout from '../components/Layout/Layout';
import PokemonResultsLayout from '../components/PokemonResultsLayout/PokemonResultsLayout';
import ResultsSection from '../components/ResultsSection/ResultsSection';
import SearchSection from '../components/SearchSection/SearchSection';
import useLocalStorage from '../hooks/useLocalStorage';
import { usePathname, useRouter } from '../i18n/navigation';
import {
  getNormalizedSearchParameters,
  getSearchParametersWithSearchTerm,
  getSearchTermFromSearchParameters,
} from '../utils/pokemonSearchParameters';
import './Home.css';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';

type HomeProperties = {
  details?: ReactNode;
};

function Home({ details }: HomeProperties) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParameters = useSearchParams();
  const search = searchParameters.toString();
  const currentSearchParameters = useMemo(
    () => new URLSearchParams(search),
    [search]
  );
  const [storedSearchTerm, setStoredSearchTerm] = useLocalStorage(
    SEARCH_TERM_STORAGE_KEY
  );
  const currentSearchTerm = getSearchTermFromSearchParameters(
    currentSearchParameters,
    storedSearchTerm
  );

  useEffect(() => {
    const normalizedSearchParameters = getNormalizedSearchParameters(
      currentSearchParameters
    );

    if (!normalizedSearchParameters) {
      return;
    }

    router.replace(`${pathname}?${normalizedSearchParameters.toString()}`);
  }, [currentSearchParameters, pathname, router]);

  const handleSearch = useCallback(
    (searchTerm: string): void => {
      const nextSearchParameters = getSearchParametersWithSearchTerm(
        currentSearchParameters,
        searchTerm
      );

      router.push(`${pathname}?${nextSearchParameters.toString()}`);
      setStoredSearchTerm(searchTerm);
    },
    [currentSearchParameters, pathname, router, setStoredSearchTerm]
  );

  return (
    <Layout>
      <main className="application-page">
        <SearchSection
          handleSearch={handleSearch}
          storedSearchTerm={currentSearchTerm}
        />
        <PokemonResultsLayout details={details}>
          <ResultsSection />
        </PokemonResultsLayout>
        <ErrorTestButton />
        <Flyout />
      </main>
    </Layout>
  );
}

export default Home;
