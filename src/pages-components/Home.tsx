'use client';

import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ErrorTestButton from '../components/ErrorTestButton/ErrorTestButton';
import Flyout from '../components/Flyout/Flyout';
import Layout from '../components/Layout/Layout';
import PokemonResultsLayout from '../components/PokemonResultsLayout/PokemonResultsLayout';
import ResultsSection from '../components/ResultsSection/ResultsSection';
import SearchSection from '../components/SearchSection/SearchSection';
import useLocalStorage from '../hooks/useLocalStorage';
import { pokemonApi } from '../services/pokemonApi';
import { useAppDispatch } from '../store/hooks';
import './Home.css';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';

const getFirstPageSearchParameters = (
  currentSearchParameters: URLSearchParams
): URLSearchParams => {
  const nextSearchParameters = new URLSearchParams(currentSearchParameters);
  nextSearchParameters.set('page', '1');
  return nextSearchParameters;
};

type HomeProperties = {
  details?: ReactNode;
};

function Home({ details }: HomeProperties) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParameters = useSearchParams();
  const search = searchParameters.toString();
  const [storedSearchTerm, setStoredSearchTerm] = useLocalStorage(
    SEARCH_TERM_STORAGE_KEY
  );
  const dispatch = useAppDispatch();

  const handleSearch = useCallback(
    (searchTerm: string): void => {
      setStoredSearchTerm(searchTerm);
      const nextSearchParameters = getFirstPageSearchParameters(
        new URLSearchParams(search)
      );

      router.push(`${pathname}?${nextSearchParameters.toString()}`);
    },
    [pathname, router, search, setStoredSearchTerm]
  );

  const handleRefreshResults = useCallback((): void => {
    dispatch(
      pokemonApi.util.invalidateTags([{ type: 'PokemonList', id: 'LIST' }])
    );
  }, [dispatch]);

  return (
    <Layout>
      <main className="application-page">
        <SearchSection
          handleSearch={handleSearch}
          storedSearchTerm={storedSearchTerm}
        />
        <PokemonResultsLayout details={details}>
          <ResultsSection
            handleRefresh={handleRefreshResults}
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
