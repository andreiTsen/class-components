import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import Home from '../../pages-components/Home';
import { loadPokemonPageOnServer } from '../../services/pokemonServerLoaders';
import { isQueryError } from '../../services/queryHelpers';
import {
  getPageFromSearchParameters,
  getSearchTermFromSearchParameters,
} from '../../utils/pokemonSearchParameters';

type PageProperties = {
  params: Promise<{
    lang: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getSearchParameters = (
  searchParams: Record<string, string | string[] | undefined>
): URLSearchParams => {
  const currentSearchParameters = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') {
      currentSearchParameters.set(key, value);
    }
  }

  return currentSearchParameters;
};

export default async function Page({ params, searchParams }: PageProperties) {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;
  const currentSearchParameters = getSearchParameters(resolvedSearchParams);
  const currentPage = getPageFromSearchParameters(currentSearchParameters);
  const searchTerm = getSearchTermFromSearchParameters(currentSearchParameters);
  const pokemonPage = await loadPokemonPageOnServer(
    searchTerm.trim(),
    currentPage
  );
  const hasResultsError = isQueryError(pokemonPage);
  setRequestLocale(lang);

  return (
    <Suspense>
      <Home
        currentPage={currentPage}
        currentSearchParameters={currentSearchParameters}
        initialSearchTerm={searchTerm}
        pokemonPage={
          hasResultsError ? { pokemons: [], totalPages: 0 } : pokemonPage
        }
        resultsError={hasResultsError}
      />
    </Suspense>
  );
}
