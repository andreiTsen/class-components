import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import PokemonDetails from '../../../../components/PokemonDetails/PokemonDetails';
import Home from '../../../../pages-components/Home';
import {
  loadPokemonByIdOnServer,
  loadPokemonPageOnServer,
} from '../../../../services/pokemonServerLoaders';
import { isQueryError } from '../../../../services/queryHelpers';
import {
  getPageFromSearchParameters,
  getSearchTermFromSearchParameters,
} from '../../../../utils/pokemonSearchParameters';
import { parsePositiveInteger } from '../../../../utils/parsePositiveInteger';

type DetailsPageProperties = {
  params: Promise<{
    lang: string;
    pokemonId: string;
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

export default async function DetailsPage({
  params,
  searchParams,
}: DetailsPageProperties) {
  const { lang, pokemonId } = await params;
  const resolvedSearchParams = await searchParams;
  const currentSearchParameters = getSearchParameters(resolvedSearchParams);
  const currentPage = getPageFromSearchParameters(currentSearchParameters);
  const searchTerm = getSearchTermFromSearchParameters(currentSearchParameters);
  const pokemonPage = await loadPokemonPageOnServer(
    searchTerm.trim(),
    currentPage
  );
  const selectedPokemon = await loadPokemonByIdOnServer(pokemonId);
  const hasResultsError = isQueryError(pokemonPage);
  const hasDetailsError = isQueryError(selectedPokemon);
  setRequestLocale(lang);

  return (
    <Suspense>
      <Home
        currentPage={currentPage}
        currentSearchParameters={currentSearchParameters}
        details={
          <PokemonDetails
            error={hasDetailsError}
            pokemon={hasDetailsError ? undefined : selectedPokemon}
          />
        }
        initialSearchTerm={searchTerm}
        pokemonPage={
          hasResultsError ? { pokemons: [], totalPages: 0 } : pokemonPage
        }
        resultsError={hasResultsError}
        selectedPokemonId={parsePositiveInteger(pokemonId)}
      />
    </Suspense>
  );
}
