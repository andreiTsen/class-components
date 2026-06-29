import { setRequestLocale } from 'next-intl/server';
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
    <Home
      details={
        <PokemonDetails
          error={hasDetailsError}
          pokemon={hasDetailsError ? undefined : selectedPokemon}
        />
      }
      pokemonPage={
        hasResultsError ? { pokemons: [], totalPages: 0 } : pokemonPage
      }
      resultsError={hasResultsError}
    />
  );
}
