'use client';

import { useMemo, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import ClientPokemonDetails from './components/PokemonDetails/ClientPokemonDetails';
import { getPathnameWithoutLocale } from './i18n/pathname';
import { parsePositiveInteger } from './utils/parsePositiveInteger';
import About from './pages-components/About';
import Home from './pages-components/Home';
import Page404 from './pages-components/Page404';
import { useGetPokemonsQuery } from './services/pokemonApi';
import useLocalStorage from './hooks/useLocalStorage';
import {
  getPageFromSearchParameters,
  getSearchTermFromSearchParameters,
} from './utils/pokemonSearchParameters';

const SEARCH_TERM_STORAGE_KEY = 'pokemon-search-term';

type AppHomeProperties = {
  details?: ReactNode;
  selectedPokemonId?: number | null;
};

function AppHome({ details, selectedPokemonId = null }: AppHomeProperties) {
  const searchParameters = useSearchParams();
  const search = searchParameters.toString();
  const currentSearchParameters = useMemo(
    () => new URLSearchParams(search),
    [search]
  );
  const [storedSearchTerm] = useLocalStorage(SEARCH_TERM_STORAGE_KEY);
  const currentPage = getPageFromSearchParameters(currentSearchParameters);
  const searchTerm = getSearchTermFromSearchParameters(
    currentSearchParameters,
    storedSearchTerm
  );
  const { data, isError, isLoading, refetch } = useGetPokemonsQuery(
    {
      page: currentPage,
      searchTerm: searchTerm.trim(),
    },
    {
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );

  return (
    <Home
      currentPage={currentPage}
      currentSearchParameters={currentSearchParameters}
      details={details}
      initialSearchTerm={searchTerm}
      isResultsLoading={isLoading}
      onRefreshResults={(): void => {
        void refetch();
      }}
      pokemonPage={data}
      resultsError={isError}
      selectedPokemonId={selectedPokemonId}
    />
  );
}

function App() {
  const pathname = usePathname();
  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);
  const selectedPokemonId = /^\/details\/(\d+)$/.exec(
    pathnameWithoutLocale
  )?.[1];

  if (pathnameWithoutLocale === '/') {
    return <AppHome />;
  }

  if (pathnameWithoutLocale === '/about') {
    return <About />;
  }

  if (
    selectedPokemonId !== undefined &&
    parsePositiveInteger(selectedPokemonId)
  ) {
    return (
      <AppHome
        details={<ClientPokemonDetails pokemonId={selectedPokemonId} />}
        selectedPokemonId={parsePositiveInteger(selectedPokemonId)}
      />
    );
  }

  return <Page404 />;
}

export default App;
