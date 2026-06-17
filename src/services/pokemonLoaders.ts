import type {
  Pokemon,
  PokemonDetailsResponse,
  PokemonListItem,
  PokemonListResponse,
  PokemonPage,
  PokemonSpeciesResponse,
} from '../types';
import { parsePositiveInteger } from '../utils/parsePositiveInteger';
import {
  isPokemonDetailsResponse,
  isPokemonListResponse,
  isPokemonSpeciesResponse,
} from '../utils/typeGuards';
import { mapPokemonDetailsToPokemon } from './mapPokemonDetailsToPokemon';
import type { FetchWithBaseQuery } from './pokemonBaseQuery';
import {
  getPagedPokemonList,
  getPokemonPage,
  getPokemonPageRequest,
} from './pokemonPageMapper';
import {
  getQueryError,
  getValidatedQueryData,
  isQueryError,
  type QueryError,
} from './queryHelpers';

const NO_DESCRIPTION = 'No description for this Pokemon';

const getPokemonDescription = async (
  fetchWithBaseQuery: FetchWithBaseQuery,
  speciesName: string
): Promise<string | QueryError> => {
  const species = await getValidatedQueryData<PokemonSpeciesResponse>(
    fetchWithBaseQuery,
    `pokemon-species/${speciesName}`,
    isPokemonSpeciesResponse,
    'Failed to load Pokemon description.'
  );

  if (isQueryError(species)) {
    return species;
  }

  const englishEntry = species.flavor_text_entries.find(
    (entry) => entry.language.name === 'en'
  );

  return englishEntry?.flavor_text ?? NO_DESCRIPTION;
};

const loadPokemon = async (
  fetchWithBaseQuery: FetchWithBaseQuery,
  nameOrId: string | number
): Promise<Pokemon | QueryError> => {
  const pokemon = await getValidatedQueryData<PokemonDetailsResponse>(
    fetchWithBaseQuery,
    `pokemon/${String(nameOrId)}`,
    isPokemonDetailsResponse,
    'Failed to load Pokemon.'
  );

  if (isQueryError(pokemon)) {
    return pokemon;
  }

  const rawDescription = await getPokemonDescription(
    fetchWithBaseQuery,
    pokemon.species.name
  );

  if (isQueryError(rawDescription)) {
    return rawDescription;
  }

  return mapPokemonDetailsToPokemon(
    pokemon,
    rawDescription.replaceAll(/\s+/g, ' ')
  );
};

const loadPokemonListItems = async (
  fetchWithBaseQuery: FetchWithBaseQuery,
  pageResults: PokemonListItem[]
): Promise<Pokemon[] | QueryError> => {
  const pokemons: Pokemon[] = [];

  for (const pokemonListItem of pageResults) {
    const pokemon = await loadPokemon(fetchWithBaseQuery, pokemonListItem.name);

    if (isQueryError(pokemon)) {
      return pokemon;
    }

    pokemons.push(pokemon);
  }

  return pokemons;
};

export const loadPokemonPage = async (
  fetchWithBaseQuery: FetchWithBaseQuery,
  term = '',
  page = 1
): Promise<PokemonPage | QueryError> => {
  const pageRequest = getPokemonPageRequest(term, page);
  const queryParameters = new URLSearchParams({
    limit: String(pageRequest.limit),
    offset: String(pageRequest.offset),
  });
  const data = await getValidatedQueryData<PokemonListResponse>(
    fetchWithBaseQuery,
    `pokemon?${queryParameters}`,
    isPokemonListResponse,
    'Failed to load Pokemon list.'
  );

  if (isQueryError(data)) {
    return data;
  }

  const { pageResults, totalItems } = getPagedPokemonList(data, pageRequest);
  const pokemons = await loadPokemonListItems(fetchWithBaseQuery, pageResults);

  return isQueryError(pokemons)
    ? pokemons
    : getPokemonPage(pokemons, totalItems);
};

export const loadPokemonById = async (
  fetchWithBaseQuery: FetchWithBaseQuery,
  id: string | number
): Promise<Pokemon | QueryError> => {
  const pokemonId = parsePositiveInteger(id);

  if (pokemonId === null) {
    return getQueryError('Invalid Pokemon id.');
  }

  return loadPokemon(fetchWithBaseQuery, pokemonId);
};
